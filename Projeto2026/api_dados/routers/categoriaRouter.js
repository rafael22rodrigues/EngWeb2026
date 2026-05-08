const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController'); 
const auth = require('../auth/auth');

// Novo categoria
router.post('/categorias', auth.verificaAcesso, auth.verificaAdmin, categoriaController.createCategoria);

// Listar categorias
router.get('/categorias', categoriaController.getAllCategorias);

// Apagar um categoria
router.delete('/categorias/:id', auth.verificaAcesso, auth.verificaAdmin, categoriaController.deleteCategoria);

module.exports = router;

