const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController'); 
const auth = require('../auth/auth');
const upload = require('../config/multer');
// Novo produto
router.post('/produtos', auth.verificaAcesso, auth.verificaAdmin, upload.any(), produtoController.createProduto);

// Listar produtos
router.get('/produtos', produtoController.getAllProdutos);

// Estatisticas
router.get('/produtos/stats', auth.verificaAcesso, auth.verificaAdmin, produtoController.getStats);

// Detalhes de um produto
router.get('/produtos/:id', produtoController.getProdutoById);

// Alterar um produto
router.put('/produtos/:id', auth.verificaAcesso, auth.verificaAdmin, upload.any(), produtoController.updateProduto);

// Apagar um produto
router.delete('/produtos/:id', auth.verificaAcesso, auth.verificaAdmin, produtoController.deleteProduto);

module.exports = router;

