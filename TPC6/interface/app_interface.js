const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Configurações do Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));


app.get('/filmes', (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const API_HOST = process.env.API_HOST || "http://localhost:7789";
    // Faz o pedido à API de dados
    axios.get(`${API_HOST}/filmes`)
        .then(response => {
            res.render('filmes', {
                list: response.data,
                date: d
            });
        })
        .catch(err => {
            res.render('error', {
                error: err,
                message: `Erro ao obter dados da API no link ${API_HOST}/filmes`
            });
        });
});

app.get('/filmes/:id', (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const API_HOST = process.env.API_HOST || "http://localhost:7789";
    // Faz o pedido à API de dados
    axios.get(`${API_HOST}/filmes/${req.params.id}`)
        .then(response => {
            res.render('filme', {
                filme: response.data,
                date: d
            });
        })
        .catch(err => {
            res.render('error', {
                error: err,
                message: `Erro ao obter dados da API no link ${API_HOST}/filmes/${req.params.id}`
            });
        });
});

app.get('/atores', (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const API_HOST = process.env.API_HOST || "http://localhost:7789";
    // Faz o pedido à API de dados
    axios.get(`${API_HOST}/atores`)
        .then(response => {
            res.render('atores', {
                atores: response.data,
                date: d
            });
        })
        .catch(err => {
            res.render('error', {
                error: err,
                message: `Erro ao obter dados da API no link ${API_HOST}/atores`
            });
        });
});

app.get('/atores/:id', (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const API_HOST = process.env.API_HOST || "http://localhost:7789";
    // Faz o pedido à API de dados
    axios.get(`${API_HOST}/atores/${req.params.id}`)
        .then(response => {
            res.render('ator', {
                ator: response.data,
                date: d
            });
        })
        .catch(err => {
            res.render('error', {
                error: err,
                message: `Erro ao obter dados da API no link ${API_HOST}/atores/${req.params.id}`
            });
        });
});

app.get('/generos', (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const API_HOST = process.env.API_HOST || "http://localhost:7789";
    // Faz o pedido à API de dados
    axios.get(`${API_HOST}/generos`)
        .then(response => {
            res.render('generos', {
                generos: response.data,
                date: d
            });
        })
        .catch(err => {
            res.render('error', {
                error: err,
                message: `Erro ao obter dados da API no link ${API_HOST}/generos`
            });
        });
});

app.get('/generos/:id', (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const API_HOST = process.env.API_HOST || "http://localhost:7789";
    // Faz o pedido à API de dados
    axios.get(`${API_HOST}/generos/${req.params.id}`)
        .then(response => {
            res.render('genero', {
                genero: response.data,
                date: d
            });
        })
        .catch(err => {
            res.render('error', {
                error: err,
                message: `Erro ao obter dados da API no link ${API_HOST}/generos/${req.params.id}`
            });
        });
});





const PORT = 7790;
app.listen(PORT, () => {
    console.log(`Servidor de Interface em http://localhost:${PORT}/filmes`);
});