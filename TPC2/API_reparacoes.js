const axios = require('axios');
const http = require('http');

function contarIntervencao(codigo, listaIntervencoes) {
    if (listaIntervencoes.length === 0) {return 0;}
    return listaIntervencoes.filter(interv => interv.codigo === codigo).length;
}

function contarIntervencoes(modelo,reparacoes) {
    if (reparacoes.length === 0) {return 0;}
    var resultado = 0;
    reparacoes.forEach(r => {
        if (r.viatura.modelo === modelo) resultado += r.nr_intervencoes;
    });
    return resultado;
}

http.createServer(function (req, res) {
    if (req.url === '/reparacoes') {
        axios.get('http://localhost:3000/reparacoes')
            .then(resp => {
                let html = '<table border = "1">' +
                    '<tr><th colspan="9">Reparações</th></tr>' +
                    '<tr>' +
                    '<th rowspan="2">Data</th>' +
                    '<th rowspan="2">NIF</th>' +
                    '<th rowspan="2">Nome</th>' +
                    '<th colspan="3">Viatura</th>' +
                    '<th colspan="3">Intervenções</th>' +
                    '</tr>' +
                    '<tr>' +
                    '<th>Marca</th>\n' +
                    '<th>Modelo</th>\n' +
                    '<th>Matricula</th>' +
                    '<th>Código</th>\n' +
                    '<th>Nome</th>\n' +
                    '<th>Descrição</th>'
                    '</tr>';

                const dados = resp.data;
                dados.forEach(r => {
                    space = r.nr_intervencoes;
                    html += `
                     <tr>
                        <td rowspan="${space}">${r.data}</td>
                        <td rowspan="${space}"">${r.nif}</td>
                        <td rowspan="${space}"">${r.nome}</td>
                        <td rowspan="${space}"">${r.viatura.marca}</td>
                        <td rowspan="${space}"">${r.viatura.modelo}</td>
                        <td rowspan="${space}"">${r.viatura.matricula}</td>
                    `;
                    dados_intervencoes = r.intervencoes;
                    inicio = true
                    dados_intervencoes.forEach(i => {
                        if(inicio == false) {
                            html += `<tr>
                            <td>${i.codigo}</td>
                            <td>${i.nome}</td>
                            <td>${i.descricao}</td>
                            </tr>`;
                        }
                        else {
                            html += `
                            <td>${i.codigo}</td>
                            <td>${i.nome}</td>
                            <td>${i.descricao}</td>
                            </tr>`;
                            inicio = false;
                        }
                    });
                });

                html += '</table>';

                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(html);
            })
            .catch(error => {
                res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
                res.end("<pre>" + JSON.stringify(error, null, 2) + "</pre>");
                console.log(error);
            });
    } else if (req.url === '/intervencoes') {
            axios.get('http://localhost:3000/reparacoes?')
            .then(resp => {
                let html = '<table border = "1">' +
                    '<tr><th colspan="4">Intervenções</th></tr>' +
                    '<tr>' +
                    '<th>Código</th>' +
                    '<th>Nome</th>' +
                    '<th>Descrição</th>' +
                    '<th>Vezes que foi efetuada</th>' +
                    '</tr>';
                const dados = resp.data;
                let intervencoes_todas = [];
                const intervencoes = [];

                dados.forEach(r => {
                    interv = r.intervencoes;
                    interv.forEach(i => {
                        intervencoes_todas.push(i);
                    })
                });
                const codigos_vistos = new Set();
                intervencoes_todas.forEach(i => {
                    if (!codigos_vistos.has(i.codigo)) {
                        codigos_vistos.add(i.codigo);
                        intervencoes.push(i);
                    }
                });
                intervencoes.sort((a, b) => a.codigo.localeCompare(b.codigo));
                intervencoes.forEach(i => {
                    html += `
                    <tr>
                        <td>${i.codigo}</td>
                        <td>${i.nome}</td>
                        <td>${i.descricao}</td>
                        <td>${contarIntervencao(i.codigo,intervencoes_todas)}</td>
                    </tr> 
                    `
                });
                html += '</table>';
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(html);
            }).catch(error => {
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            res.end("<pre>" + JSON.stringify(error, null, 2) + "</pre>");
            console.log(error);
        });
    } else if (req.url === '/viaturas') {
            axios.get('http://localhost:3000/reparacoes')
            .then(resp => {
                let html = '<table border = "1">' +
                    '<tr><th colspan="3">Viaturas</th></tr>' +
                    '<tr>' +
                    '<th>Marca</th>' +
                    '<th>Modelo</th>' +
                    '<th>Intervenções realizadas</th>' +
                    '</tr>';
                const dados = resp.data;
                let veiculos_todos = [];
                const veiculos = [];
                dados.forEach(r => {
                    veiculos_todos.push(r.viatura)
                });
                const viaturas_vistas = new Set();
                veiculos_todos.forEach(vt => {
                    if (!viaturas_vistas.has(vt)) {
                        viaturas_vistas.add(vt);
                        veiculos.push(vt);
                    }
                });
                veiculos.sort((a,b) => a.marca.localeCompare(b.marca) || a.modelo.localeCompare(b.modelo))
                veiculos.forEach(v => {
                    html += `<tr>
                                <td>${v.marca}</td>
                                <td>${v.modelo}</td>
                                <td>${contarIntervencoes(v.modelo,dados)}</td>
                            </tr>`
                });
                html += '</table>';
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(html);
        }).catch(error => {
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            res.end("<pre>" + JSON.stringify(error, null, 2) + "</pre>");
            console.log(error);
        });
    } else {
        res.writeHead(520, {'Content-Type': 'text/html; charset=utf-8'});
        res.end("<pre>Pedido Não Suportado! Tente Novamente....</pre>");
    }

}).listen(7777, () => {
    console.log('Servidor rodando em http://localhost:7777');
});