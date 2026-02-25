var http = require('http')
var axios = require('axios')
const { parse } = require('querystring');

var templates = require('./templates.js')           // Necessario criar e colocar na mesma pasta
var static = require('./static.js')                 // Colocar na mesma pasta

// Aux functions
function collectRequestBodyData(request, callback) {
    if(request.headers['content-type'] === 'application/x-www-form-urlencoded') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

function getClubes(exames){
    let clubes = [];
    for(let e of exames){
        let contagem = {};
        if(!clubes.some(c => c.clube === e.clube)){
            contagem = {
                clube : e.clube,
                tamanho : exames.filter(m => m.clube === e.clube).length
            }
            clubes.push(contagem)
        }
    }
    return clubes;
}

function getModalidades(exames){
    let modalidades = [];
    for(let e of exames){
        let contagem = {};
        if(!modalidades.some(m => m.modalidade === e.modalidade)){
            contagem = {
                modalidade : e.modalidade,
                tamanho : exames.filter(m => m.modalidade === e.modalidade).length
            }
            modalidades.push(contagem)
        }
    }
    return modalidades;
}

var emdServer = http.createServer((req, res) => {
    // Logger: what was requested and when it was requested
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)

    // Handling request
    if(static.staticResource(req)){
        static.serveStaticResource(req, res)
    }
    else{
        switch(req.method){
            case "GET":
                // GET /emd ou /------------------------------------------------------------------
                if(req.url === '/' || req.url === '/emd'){
                    axios.get("http://localhost:3000/Exames")
                        .then(resp => {
                            var exames = resp.data
                            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                            res.end(templates.examesListPage(exames, d))
                        }).catch(err => {
                        res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                        res.write('<p>Não foi possível obter os registos dos exames médicos...</p>')
                        res.write('<p>' + err + '</p>')
                        res.end()
                    })
                }
                else if(req.url === '/emd?_sort=data&_ord=desc'){
                    axios.get("http://localhost:3000/Exames?_sort=data&_order=desc" + idExame).then(resp => {
                        var exame = resp.data
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end(templates.examesListPage(exame, d))
                    }).catch(err => {
                        res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end("<p>ERRO: Não foi possível obter a informação do Registo: ${err}</p>")
                    })
                }
                else if(req.url === '/emd?_nome=&_ord=asc'){
                    axios.get("http://localhost:3000/Exames?_sort=nome&_order=asc" + idExame).then(resp => {
                        var exames = resp.data
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end(templates.examesListPage(exames, d))
                    }).catch(err => {
                        res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end("<p>ERRO: Não foi possível obter a informação do Registo: ${err}</p>")
                    })
                }
                else if(req.url === '/emd/registo'){
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.end(templates.emdFormPage(d))
                }
                else if(req.url === '/emd/stats'){
                    // Buscar todos os exames
                    axios.get('http://localhost:3000/Exames')
                        .then(resp => {
                            const exames = resp.data;

                            // Calcular estatísticas
                            const stats = {
                                total: exames.length,

                                // Distribuição por Sexo
                                sexo: {
                                    masculino: exames.filter(e => e.genero === 'M' || e.genero === 'Masculino').length,
                                    feminino: exames.filter(e => e.genero === 'F' || e.genero === 'Feminino').length,
                                },

                                // Distribuição por Modalidade
                                modalidade: getModalidades(exames),

                                // Distribuição por Clube
                                clube: getClubes(exames),

                                // Distribuição por Resultado
                                resultado: {
                                    aprovado: exames.filter(e => e.resultado === 'aprovado' || e.resultado === 'Aprovado').length,
                                    reprovado: exames.filter(e => e.resultado === 'reprovado' || e.resultado === 'Rejeitado' || e.resultado === 'Reprovado').length,
                                },

                                // Distribuição por Federado
                                federado: {
                                    sim: exames.filter(e => e.federado === "Sim").length,
                                    nao: exames.filter(e => e.federado === "Não").length
                                }
                            };
                            // Renderizar página de estatísticas
                            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                            res.end(templates.statsPage(stats, d));

                        })
                        .catch(err => {
                            console.error('Erro ao buscar estatísticas:', err);
                            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                            res.end('<p>Erro: ${err}</p>')
                        });
                }
                else if (/\/emd\/editar\/[0-9a-z_A-Z]+$/.test(req.url)){
                    var idExame = req.url.split('/')[3]
                    axios.get('http://localhost:3000/Exames/' + idExame)
                        .then(resp => {
                            var exame = resp.data
                            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                            res.end(templates.emdEditFormPage(exame, d))
                        })
                        .catch(erro => {
                            res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write('<p>Não foi possível obter o registo...</p>')
                            res.write('<p>' + erro + '</p>')
                            res.end('<address><a href="/">Voltar</a></address>')
                        })
                }
                else if (/\/emd\/apagar\/[0-9a-z_A-Z]+$/.test(req.url)){
                    var idExame = req.url.split('/')[3]
                    axios.delete('http://localhost:3000/Exames/' + idExame)
                        .then(resp => {
                            res.writeHead(302, {'Location': '/'}) // Redireciona para a lista
                            res.end()
                        })
                        .catch(erro => {
                            res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write('<p>Não foi possível apagar o registo...</p>')
                            res.write('<p>' + erro + '</p>')
                            res.end('<address><a href="/">Voltar</a></address>')
                        })
                }

                // GET /emd/:id --------------------------------------------------------------
                else if(/\/emd\/[0-9a-z_A-Z]+$/.test(req.url)){
                    var idExame = req.url.split('/')[2]
                    axios.get("http://localhost:3000/Exames/" + idExame).then(resp => {
                        var exame = resp.data
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end(templates.emdIndividualPage(exame, d))
                    }).catch(err => {
                        res.writeHead(505, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end("<p>ERRO: Não foi possível obter a informação do Registo: ${err}</p>")
                    })
                }
                break
            case "POST":
                if(req.url === '/emd'){
                    collectRequestBodyData(req, result => {
                        if(result){
                            axios.post('http://localhost:3000/Exames', result)
                                .then(resp => {
                                    res.writeHead(201, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write('<p>Registo inserido com sucesso: ' + JSON.stringify(resp.data) + '</p>')
                                    res.end('<address><a href="/">Voltar</a></address>')
                                })
                                .catch(erro => {
                                    res.writeHead(503, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write('<p>Não foi possível insrir o registo...</p>')
                                    res.write('<p>' + erro + '</p>')
                                    res.end('<address><a href="/">Voltar</a></address>')
                                })
                        }
                        else{
                            res.writeHead(502, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write('<p>Não foi possível obter os dados do body...</p>')
                            res.end('<address><a href="/">Voltar</a></address>')
                        }
                    })
                }
                else if(/\/emd\/[0-9a-zA-Z_]+$/.test(req.url)){
                    collectRequestBodyData(req, result => {
                        if(result){
                            axios.put('http://localhost:3000/Exames/' + result.id, result)
                                .then(resp => {
                                    res.writeHead(201, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write('<p>Registo alterado com sucesso: ' + JSON.stringify(resp.data) + '</p>')
                                    res.end('<address><a href="/">Voltar</a></address>')
                                })
                                .catch(erro => {
                                    res.writeHead(503, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write('<p>Não foi possível alterar o registo...</p>')
                                    res.write('<p>' + erro + '</p>')
                                    res.end('<address><a href="/">Voltar</a></address>')
                                })
                        }
                        else{
                            res.writeHead(502, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write('<p>Não foi possível obter os dados do body...</p>')
                            res.end('<address><a href="/">Voltar</a></address>')
                        }
                    })
                }
                break;
            default:
                res.writeHead(405, { 'Content-Type': 'text/html; charset=UTF-8' })
                res.end(`<p>Método não suportado:${req.method}.</p>`)
                break;
        }
    }
})
emdServer.listen(7777, ()=>{
    console.log("Servidor à escuta na porta 7777...")
})