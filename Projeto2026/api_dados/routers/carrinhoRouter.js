const express = require('express');
const router = express.Router();
const carrinhoController = require('../controllers/carrinhoController'); 
const auth = require('../auth/auth');

// Detalhes de um carrinho
router.get('/carrinhos/:id', auth.verificaAcesso, carrinhoController.getCarrinhoById);

// adicionar produto ao carrinho
router.post('/carrinhos/:id/produtos', auth.verificaAcesso, carrinhoController.addProdutoToCarrinho);

// remover produto do carrinho
router.delete('/carrinhos/:id/produtos/:sku', auth.verificaAcesso, carrinhoController.removeProdutoFromCarrinho);

module.exports = router;

