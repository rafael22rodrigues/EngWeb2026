const axios = require('axios');
const http = require('http');

async function getAlunos(){
    const response = await axios.get('http://localhost:3000/alunos');
    return response.data;
}

async function getCursos(){
    const response = await axios.get('http://localhost:3000/cursos');
    return response.data;
}

async function getInstrumento(){
    const response = await axios.get('http://localhost:3000/instrumentos');
    return response.data;
}

function getCurso(idCurso,cursos){
    var curso_nome = {}
    for(c of cursos){
        if (idCurso === c.id){
            curso_nome = {
                id: c.id,
                designacao: c.designacao,
                duracao: c.duracao,
                instrumento: c.instrumento,
            }
            return curso_nome;
        }
    }
    return curso_nome;
}

function getAlunosCurso(dadosAlunos,idCurso){
    curso = []
    for (a of dadosAlunos){
        if (idCurso === a.curso){
            i = {id: a.id,
                 nome: a.nome,
                 data_nascimento: a.dataNasc,
                 curso: idCurso,
                instrumento: a.instrumento
            }
            curso.push(i);
        }
    }
    return curso;
}

function getAlunosInstrumentos(nome_instrumento,alunos){
    let instrumentos_a = []
    for (a of alunos){
        if (nome_instrumento === a.instrumento){
            i = {id: a.id,
                nome: a.nome,
                data_nascimento: a.dataNasc,
                curso: a.curso,
                instrumento: a.instrumento
            }
            instrumentos_a.push(i);
        }
    }
    return instrumentos_a;
}

http.createServer(async function (req, res) {
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)

    if (req.method === "GET") {

        if (req.url === "/alunos") {
            try {
                const dadosAlunos = await getAlunos();
                // Filtragem
                const resultado = dadosAlunos.map(e => ({
                    id: e.id,
                    nome: e.nome,
                    data_nascimento: e.dataNasc,
                    curso: e.curso,
                    instrumento: e.instrumento
                }))
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(resultado))

            } catch (error) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({
                    erro: "Erro ao contactar o servidor de dados",
                    detalhe: error.message
                }))
            }
        }
        else if (req.url.startsWith("/alunos?curso=")){
            try {
                let partes = req.url.split("=")[1];
                const dadosAlunos = await getAlunos();
                const resultado = getAlunosCurso(dadosAlunos,partes);

                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(resultado))
            }
            catch (error) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({
                    erro: "Erro ao contactar o servidor de dados",
                    detalhe: error.message
                }))
            }
        }
        else if (req.url.startsWith("/alunos?instrumento=")){
            try {
                let partes = decodeURIComponent(req.url.split("=")[1]);
                const dadosAlunos = await getAlunos();
                const resultado = getAlunosInstrumentos(partes,dadosAlunos);

                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(resultado))
            }
            catch (error) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({
                    erro: "Erro ao contactar o servidor de dados",
                    detalhe: error.message
                }))
            }
        }
        else if(req.url === "/cursos"){
            let partes = req.url.split('/')
            try {
                const dadosCursos = await getCursos();
                const resultado = dadosCursos.map(c => ({
                    id: c.id,
                    designacao: c.designacao,
                    duracao: c.duracao,
                    instrumento: c.instrumento
                }))
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(resultado))

            } catch (error) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({
                    erro: "Erro ao contactar o servidor de dados",
                    detalhe: error.message
                }))
            }
        }
        else if (req.url.startsWith("/cursos/C")) {
            try {
                let input = req.url.split("/")[2];
                const dadosCursos = await getCursos();
                const resultado = getCurso(input,dadosCursos);

                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(resultado))

            } catch (error) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({
                    erro: "Erro ao contactar o servidor de dados",
                    detalhe: error.message
                }))
            }
        }
        else if (req.url === "/instrumentos"){
            try {
                const dadosInstrumentos = await getInstrumento()
                const resultado = dadosInstrumentos.map(e => ({
                    id: e.id,
                    nome: e["#text"]
                }))
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(resultado))
            }catch (error) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({
                    erro: "Erro ao contactar o servidor de dados",
                    detalhe: error.message
                }))
            }
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
            erro: "Método não permitido",
            metodo: req.method
        }))
    }

}).listen(25000)

console.log("Servidor à escuta na porta 25000...")