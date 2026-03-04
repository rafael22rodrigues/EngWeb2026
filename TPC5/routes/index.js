var express = require('express');
var router = express.Router();
var axios = require('axios')
var d = new Date().toISOString().substring(0, 16)

/* GET home page. */
router.get('/', function(req, res, next) {

  axios.get("http://localhost:3000/filmes")
    .then(resp => {
        var filmes = resp.data
        res.render('filmes', { list: filmes, date: d });
    })
  .catch(err => next(err))
});

router.get('/filmes', function(req, res, next) {
    axios.get("http://localhost:3000/filmes")
        .then(resp => {
            var filmes = resp.data
            res.render('filmes', { list: filmes, date: d });
        })
        .catch(err => next(err))
});

module.exports = router;

router.get('/filmes/:id', function(req, res, next) {
  axios.get("http://localhost:3000/filmes/" + req.params.id)
    .then(resp => {
        var filme = resp.data
        res.render('filme', { filme: filme, date: d });
    })
  .catch(err => next(err))
});

router.get('/atores', function(req, res, next) {
    axios.get("http://localhost:3000/atores")
        .then(resp => {
            var atores = resp.data
            res.render('atores', { atores: atores, date: d });
        })
        .catch(err => next(err))
});

router.get('/atores/:id', function(req, res, next) {
    axios.get("http://localhost:3000/atores/" + req.params.id)
        .then(resp => {
            var ator = resp.data
            res.render('ator', { ator: ator, date: d });
        })
        .catch(err => next(err))
});

router.get('/generos', function(req, res, next) {
    axios.get("http://localhost:3000/generos")
        .then(resp => {
            var generos = resp.data
            res.render('generos', { generos: generos, date: d });
        })
        .catch(err => next(err))
});

router.get('/generos/:id', function(req, res, next) {
    axios.get("http://localhost:3000/generos/" + req.params.id)
        .then(resp => {
            var genero = resp.data
            res.render('genero', { genero: genero, date: d });
        })
        .catch(err => next(err))
});

