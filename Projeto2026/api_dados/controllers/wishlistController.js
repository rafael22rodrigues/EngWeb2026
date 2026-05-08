const Wishlist = require('../models/wishlist');

const wishlistController = {
    getWishlistById: async (req, res) => {
    try {
        let wishlist = await Wishlist.findById(req.params.id);
        if (!wishlist) {
            wishlist = await Wishlist.create({ _id: req.params.id, produtos: [] });
        }
        if (req.user.tipo !== 'cliente' || wishlist._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
},

addProdutoToWishlist: async (req, res) => {
    try {
        let wishlist = await Wishlist.findById(req.params.id);
        if (!wishlist) {
            wishlist = await Wishlist.create({ _id: req.params.id, produtos: [] });
        }
        if (req.user.tipo !== 'cliente' || wishlist._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }
        const produtoExiste = wishlist.produtos.some(p => p.produtoId === req.body.produtoId);
        if (!produtoExiste) {
            wishlist.produtos.push({ produtoId: req.body.produtoId });
            await wishlist.save();
        }
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
},
    removeProdutoFromWishlist: async (req, res) => {
        try {
            const wishlist = await Wishlist.findById(req.params.id);
            if (!wishlist) {
                return res.status(404).json({message: 'Wishlist not found'})
            }
            if (!(req.user.tipo === 'cliente') || wishlist._id.toString() !== req.user.id) {
                return res.status(403).json({message: 'Acesso negado.'})
            }
            wishlist.produtos = wishlist.produtos.filter(p => p.produtoId !== req.params.produtoId);
            await wishlist.save();
            res.json(wishlist);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

module.exports = wishlistController;