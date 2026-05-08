const Carrinho = require('../models/carrinho');

const carrinhoController = {
    getCarrinhoById: async (req, res) => {
        try {
            const carrinho = await Carrinho.findById(req.params.id);
            if (!carrinho) {
                return res.status(404).json({message: 'Carrinho not found'})
            }
            if (!(req.user.tipo === 'cliente') || carrinho._id.toString() !== req.user.id) {
                return res.status(403).json({message: 'Acesso negado.'})
            }
            res.json(carrinho);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    addProdutoToCarrinho: async (req, res) => {
        try {
            const carrinho = await Carrinho.findById(req.params.id);
            if (!carrinho) {
                return res.status(404).json({message: 'Carrinho not found'})
            }
            if (!(req.user.tipo === 'cliente') || carrinho._id.toString() !== req.user.id) {
                return res.status(403).json({message: 'Acesso negado.'})
            }
            // ver se produto e sku existe no carrinho
            var produtoExiste = false;
            var skuExiste = false;
            for (const p of carrinho.produtos) {
                if (p.produtoId === req.body.produtoId) {
                    produtoExiste = true;
                    if (p.sku === req.body.sku) {
                        skuExiste = true;
                        p.quantidade = req.body.quantidade; // atualizar quantidade se sim
                        break;
                    }
                }
            }
            if (!produtoExiste || !skuExiste) {
                carrinho.produtos.push({ produtoId: req.body.produtoId, sku: req.body.sku, quantidade: req.body.quantidade});
            }
            await carrinho.save();
            res.json(carrinho);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    removeProdutoFromCarrinho: async (req, res) => {
        try {
            const carrinho = await Carrinho.findById(req.params.id);
            if (!carrinho) {
                return res.status(404).json({message: 'Carrinho not found'})
            }
            if (!(req.user.tipo === 'cliente') || carrinho._id.toString() !== req.user.id) {
                return res.status(403).json({message: 'Acesso negado.'})
            }
            carrinho.produtos = carrinho.produtos.filter(p => p.sku !== req.params.sku);
            await carrinho.save();
            res.json(carrinho);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

module.exports = carrinhoController;