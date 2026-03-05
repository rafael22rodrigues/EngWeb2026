const { connectToDatabase } = require('../public/javascripts/db');
var express = require('express');
var router = express.Router();
var axios = require('axios')
var d = new Date().toISOString().substring(0, 16)

/* GET home page. */
router.get('/', async function(req, res, next) {
    try {
        // Conecta ao banco de dados (reutiliza a conexão se já existir)
        const db = await connectToDatabase();
        const collection = db.collection('cinema');

        // Busca todos os documentos
        var filmes = await collection.find({}).toArray();

        res.render('filmes', {list: filmes, date: d})
    } catch (erro) {
        next(erro);
    }
});

router.get('/filmes', async function(req, res, next) {
    try {
        // Conecta ao banco de dados (reutiliza a conexão se já existir)
        const db = await connectToDatabase();
        const collection = db.collection('cinema');

        // Busca todos os documentos
        var filmes = await collection.find({}).toArray();

        res.render('filmes', {list: filmes, date: d})
    } catch (erro) {
        next(erro);
    }
});
module.exports = router;

router.get('/filmes/:id', async function(req, res, next) {
    try {
        // Conecta ao banco de dados (reutiliza a conexão se já existir)
        const db = await connectToDatabase();
        const collection = db.collection('cinema');

        // Busca todos os documentos
        var filme = await collection.findOne({_id: parseInt(req.params.id)});
        res.render('filme', {filme: filme, date: d})
    } catch (erro) {
        next(erro);
    }
});

router.get('/atores', async function(req, res, next) {
    try {
        // Conecta ao banco de dados (reutiliza a conexão se já existir)
        const db = await connectToDatabase();
        const collection = db.collection('cinema');

        // Busca todos os documentos
        var atores = await collection.aggregate([
            // Passo 1: Desestruturar o array atores (cria um documento para cada ator)
            { $unwind: "$cast" },

            // Passo 2: Agrupar por ator
            {
                $group: {
                    _id: "$cast",  // O nome do ator único
                    filmes_ids: { $addToSet: "$_id" },  // Array de _ids únicos
                    contagem_filmes: { $sum: 1 },  // Contagem de filmes
                    filmes_titulos: { $addToSet: "$title" } // Títulos únicos
                }
            },
            // Passo 3: Ordenar por gênero
            { $sort: { _id: 1 } }
        ]).toArray();
        res.render('atores', {atores: atores, date: d})
    } catch (erro) {
        next(erro);
    }
});

router.get('/atores/:id', async function(req, res, next) {
    try {
        // Conecta ao banco de dados (reutiliza a conexão se já existir)
        const db = await connectToDatabase();
        const collection = db.collection('cinema');

        const nomeAtor = decodeURIComponent(req.params.id);

        var ator = await collection.aggregate([
            // Filtrar filmes do ator
            { $match: { cast: nomeAtor } },

            // Agrupar diretamente
            {
                $group: {
                    _id: nomeAtor,  // Nome fixo já que é um único ator
                    total_filmes: { $sum: 1 },
                    filmes_ids: { $addToSet: "$_id" },
                    filmes: {
                        $push: {
                            id: "$_id",
                            titulo: "$title",
                            ano: "$year"
                        }
                    }
                }
            },

            // Ordenar filmes
            {
                $addFields: {
                    filmes: {
                        $sortArray: {
                            input: "$filmes",
                            sortBy: { ano: -1 }
                        }
                    }
                }
            }
        ]).toArray();
        res.render('ator', {ator: ator[0], date: d})
    } catch (erro) {
        next(erro);
    }
});

router.get('/generos', async function(req, res, next) {
    try {
        // Conecta ao banco de dados (reutiliza a conexão se já existir)
        const db = await connectToDatabase();
        const collection = db.collection('cinema');

        // Busca todos os documentos
        var generos = await collection.aggregate([
            // Passo 1: Desestruturar o array atores (cria um documento para cada ator)
            { $unwind: "$genres" },

            // Passo 2: Agrupar por ator
            {
                $group: {
                    _id: "$genres",  // O gênero único
                    filmes_ids: { $addToSet: "$_id" },  // Array de _ids únicos
                    contagem_filmes: { $sum: 1 },  // Contagem de filmes
                    filmes_titulos: { $addToSet: "$title" } // Títulos únicos
                }
            },
            // Passo 3: Ordenar por ordem alfabética de nome
            { $sort: { _id: 1 } }
        ]).toArray();
        res.render('generos', {generos: generos, date: d})
    } catch (erro) {
        next(erro);
    }
});

router.get('/generos/:id', async function(req, res, next) {
    try {
        // Conecta ao banco de dados (reutiliza a conexão se já existir)
        const db = await connectToDatabase();
        const collection = db.collection('cinema');

        const nomegenero = decodeURIComponent(req.params.id);

        var genero = await collection.aggregate([
            // Filtrar filmes de genero
            { $match: { genres: nomegenero } },

            // Agrupar diretamente
            {
                $group: {
                    _id: nomegenero,  // Nome fixo já que é um único genero
                    total_filmes: { $sum: 1 },
                    filmes_ids: { $addToSet: "$_id" },
                    filmes: {
                        $push: {
                            id: "$_id",
                            titulo: "$title",
                            ano: "$year"
                        }
                    }
                }
            },

            // Ordenar filmes por ano
            {
                $addFields: {
                    filmes: {
                        $sortArray: {
                            input: "$filmes",
                            sortBy: { ano: -1 }
                        }
                    }
                }
            }
        ]).toArray();
        res.render('genero', {genero: genero[0], date: d})
    } catch (erro) {
        next(erro);
    }
});

