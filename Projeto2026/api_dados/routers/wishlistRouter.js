const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController'); 
const auth = require('../auth/auth');

// Detalhes de um wishlist
router.get('/wishlists/:id', auth.verificaAcesso, wishlistController.getWishlistById);

// Adicionar produto ao wishlist
router.post('/wishlists/:id/produtos', auth.verificaAcesso, wishlistController.addProdutoToWishlist);

// Remover produto do wishlist
router.delete('/wishlists/:id/produtos/:produtoId', auth.verificaAcesso, wishlistController.removeProdutoFromWishlist);

module.exports = router;

