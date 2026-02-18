const axios = require('axios');
const http = require('http');
const {get} = require("axios");

/* --------------Utils--------------*/

function pagina(titulo, corpo){
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8"/>
        <title>${titulo}</title>
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"/>
    </head>
    <body class="w3-light-grey">

        <div class="w3-container w3-teal">
            <h1>${titulo}</h1>
        </div>

        <div class="w3-container w3-margin-top">
            ${corpo}
        </div>

    </body>
    </html>
    `
}

function link(href, texto){
    return `<a href="${href}">${texto}</a>`
}

function card(titulo, conteudo){
    return `
    <div class="w3-card-4 w3-white w3-margin-bottom">
        <header class="w3-container w3-teal">
            <h3>${titulo}</h3>
        </header>
        <div class="w3-container w3-padding">
            ${conteudo}
        </div>
    </div>
    `
}

function lista(items){
    if(items.length === 0)
        return `<p><i>Sem registos.</i></p>`

    return `
      <ul class="w3-ul w3-hoverable">
        ${items.map(i => `<li>${i}</li>`).join("")}
      </ul>
    `
}

function botaoVoltar(){
    return `<a class="w3-button w3-teal w3-margin-top" href="/">Voltar</a>`
}

async function getAlunos(){
    const response = await axios.get('http://localhost:25000/alunos');
    return response.data;
}

async function getCursos(){
    const response = await axios.get('http://localhost:25000/cursos');
    return response.data;
}

async function getDesignacaoCurso(idCurso){
    const response = await axios.get('http://localhost:25000/cursos/'+idCurso);
    return response.data.designacao;
}
async function getAlunosEmCurso(idCurso){
    const response = await axios.get('http://localhost:25000/alunos?curso='+idCurso);
    return response.data.length;
}

async function getAlunosqueTocam(instrumento){
    const response = await axios.get('http://localhost:25000/alunos?instrumento='+instrumento);
    return response.data.length;
}

async function getInstrumento(){
    const response = await axios.get('http://localhost:25000/instrumentos');
    return response.data;
}

async function gerarLinhasAlunos(alunos) {
    const linhas = (await Promise.all(
        //----Filtragem dos alunos que estão em cursos que não existem--------
        alunos.map(async (aluno) => {
            const designacaoCurso = await getDesignacaoCurso(aluno.curso);
            return `
                <tr>
                    <td>${aluno.id}</td>
                    <td>${aluno.nome}</td>
                    <td>${aluno.data_nascimento}</td>
                    <td>${designacaoCurso}</td>
                    <td>${aluno.instrumento}</td>
                </tr>
            `;
        })
    )).join('\n');

    return linhas;
}

async function gerarlinhasCursos(cursos){
    const linhas = (await Promise.all(

        cursos.map(async (curso) => {
            const nr_alunos = await getAlunosEmCurso(curso.id);
            return `
                <tr>
                    <td>${curso.id}</td>
                    <td>${curso.designacao}</td>
                    <td>${curso.duracao}</td>
                    <td>${curso.instrumento["#text"]}</td>
                    <td>${nr_alunos}</td>
                </tr>
            `;
        })
    )).join('\n');

    return linhas;
}

async function gerarLinhasInstrumento(instrumentos){
    const linhas = (await Promise.all(

        instrumentos.map(async (instrumento) => {
            const nr_alunos = await getAlunosqueTocam(instrumento.nome);
            return `
                <tr>
                    <td>${instrumento.id}</td>
                    <td>${instrumento.nome}</td>
                    <td>${nr_alunos}</td>
                </tr>
            `;
        })
    )).join('\n');

    return linhas;
}

/*--------------Servidor Aplicacional---------------------*/
http.createServer(async function(req, res){
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)
    switch (req.method){
        case 'GET':
            if (req.url ==="/"){

                var corpo = card("Informação permitida:", `
                        <table class= "w3-table w3-striped w3-bordered w3-hoverable">
                            <tr class="w3-light-blue">
                                <th>${link("/alunos","Alunos")}</th>
                                <th>${link("/cursos","Cursos")}</th>
                                <th>${link("/instrumentos","Instrumentos")}</th>
                            </tr>
                        </table>
                    `)
                res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' })
                res.end(pagina("Escolha uma opção para aceder:", corpo))
            }
            else if(req.url === "/alunos"){
                try{
                    const alunos = await getAlunos();
                    var linhas = await gerarLinhasAlunos(alunos);

                    var corpo = card("Tabela de Alunos", `
                        <table class= "w3-table w3-striped w3-bordered w3-hoverable">
                            <tr class="w3-light-blue">
                                <th>Id</th>
                                <th>Nome</th>
                                <th>Data de Nascimento</th>
                                <th>Curso</th>
                                <th>Instrumento</th>
                            </tr>
                            ${linhas}
                        </table>
                        ${botaoVoltar()}
                    `)
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' })
                    res.end(pagina("Alunos", corpo))
                }
                catch(error){
                    res.writeHead(405, { 'Content-Type': 'text/html; charset=UTF-8' })
                    res.end(`<p>Erro no servidor de dados: ${error}</p>`)
                }
            }
            else if (req.url === "/cursos"){
                try {
                    const cursos = await getCursos();
                    var linhas = await gerarlinhasCursos(cursos);

                    var corpo = card("Tabela de Cursos", `
                        <table class= "w3-table w3-striped w3-bordered w3-hoverable">
                            <tr class="w3-light-blue">
                                <th>Id</th>
                                <th>Designação</th>
                                <th>Duração</th>
                                <th>Instrumento</th>
                                <th>Número de Alunos</th>
                            </tr>
                            ${linhas}
                        </table>
                        ${botaoVoltar()}
                    `)
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' })
                    res.end(pagina("Cursos", corpo))

                }
                catch (error){
                    res.writeHead(405, { 'Content-Type': 'text/html; charset=UTF-8' })
                    res.end(`<p>Erro no servidor de dados: ${error}</p>`)
                }
            }
            else if (req.url === "/instrumentos"){
                try{
                    const instrumentos = await getInstrumento();
                    var linhas = await gerarLinhasInstrumento(instrumentos);
                    var corpo = card("Tabela de Cursos", `
                        <table class= "w3-table w3-striped w3-bordered w3-hoverable">
                            <tr class="w3-light-blue">
                                <th>Id</th>
                                <th>Designação</th>
                                <th>Número de Alunos que Tocam</th>
                            </tr>
                            ${linhas}
                        </table>
                        ${botaoVoltar()}
                `);
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' })
                    res.end(pagina("Instrumentos", corpo))

                }catch (error){
                    res.writeHead(405, { 'Content-Type': 'text/html; charset=UTF-8' })
                    res.end(`<p>Erro no servidor de dados: ${error}</p>`)
                }
            }
            break;
        default:
            res.writeHead(405, { 'Content-Type': 'text/html; charset=UTF-8' })
            res.end(`<p>Método não suportado:${req.method}.</p>`)
            break;
    }

}).listen(7777);

console.log("Servidor à escuta na porta 7777...")
