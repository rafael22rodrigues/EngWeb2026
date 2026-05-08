const path = require('path');
const fs = require('fs');
const Produto = require('../models/produto');

const produtoController = {
    createProduto: async (req, res) => {
        try {
            const produtoData = JSON.parse(req.body.produto);

            for (const file of req.files || []) {
                const match = file.fieldname.match(/^cores\[(\d+)\]\[imagem\]$/);
                if (!match) continue;

                const index = Number(match[1]);
                const imagem = produtoData.opcoes.cores[index].imagem;

                if (!imagem) continue;

                const destino = path.join(__dirname, '..', 'public', imagem);

                fs.mkdirSync(path.dirname(destino), { recursive: true });
                fs.writeFileSync(destino, file.buffer);
            }

            const newProduto = new Produto(produtoData);
            await newProduto.save();

            res.status(201).json(newProduto);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    getAllProdutos: async (req, res) => {
        try {
            const {categoria, cor, tamanho, minPreco, maxPreco, sort, search, page, limit} = req.query

            let queryObj = {};

            if (categoria) {
                const formatado = categoria.toLowerCase().replace(/\s+/g, '-');
                queryObj.categoriaId = formatado;
            }

            // cor: hex armazenado em opcoes.cores._id
            if (cor) queryObj['opcoes.cores._id'] = cor;

            // tamanho: opcoes.tamanhos é [String]
            if (tamanho) queryObj['opcoes.tamanhos'] = { $in: [tamanho] };

            if (minPreco || maxPreco) {
                queryObj['variantes.preco'] = {};
                if (minPreco) queryObj['variantes.preco'].$gte = Number(minPreco);
                if (maxPreco) queryObj['variantes.preco'].$lte = Number(maxPreco);
            }

            if (search) queryObj.nome = {$regex: search, $options: 'i'};

            let query = Produto.find(queryObj);

            if (sort) {
                switch (sort) {
                    case 'preco_asc':
                        query = query.sort({ 'variantes.preco': 1 });
                        break;
                    case 'preco_desc':
                        query = query.sort({ 'variantes.preco': -1 });
                        break;
                    case 'nome_asc':
                        query = query.sort({ nome: 1 });
                        break;
                    case 'nome_desc':
                        query = query.sort({ nome: -1 });
                        break;
                }
            }

            const total = await Produto.countDocuments(queryObj);

            if (page && limit) {
                const p = Number(page);
                const l = Number(limit);
                query = query.skip((p - 1) * l).limit(l);
            }

            const produtos = await query.exec();
            res.json({ produtos, total });
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    getProdutoById: async (req, res) => {
        try {
            const produto = await Produto.findById(req.params.id);
            if (!produto) {
                return res.status(404).json({message: 'Produto not found'})
            }
            res.json(produto);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    updateProduto: async (req, res) => {
        try {
            const produtoData = JSON.parse(req.body.produto);

            for (const file of req.files || []) {
                const match = file.fieldname.match(/^cores\[(\d+)\]\[imagem\]$/);
                if (!match) continue;

                const index = Number(match[1]);
                const imagem = produtoData.opcoes.cores[index].imagem;

                if (!imagem) continue;

                const destino = path.join(__dirname, '..', 'public', imagem);

                fs.mkdirSync(path.dirname(destino), { recursive: true });
                fs.writeFileSync(destino, file.buffer);
            }
            
            const produto = await Produto.findByIdAndUpdate(req.params.id, produtoData, { new: true });
            if (!produto) {
                return res.status(404).json({message: 'Produto not found'})
            }
            else {
                res.json(produto);
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    deleteProduto: async (req, res) => {
        try {
            const produto = await Produto.findByIdAndDelete(req.params.id);
            if (!produto) {
                return res.status(404).json({message: 'Produto not found'})
            }
            else {
                res.json({message: 'Produto deleted successfully'});
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    getStats: async (req, res) => {
        try {
            const produtos = await Produto.find().lean();

            const numProdutos = produtos.length;
            if (numProdutos === 0) {
                return res.json({ numProdutos: 0, vendas: 0, precoMedio: 0, faturacao: 0 });
            }

            const vendas = produtos.reduce((sum, p) => {
                return sum + p.variantes.reduce((s, v) => s + (v.vendidos || 0), 0);
            }, 0);

            const precoMedio = produtos.reduce((sum, p) => {
                return sum + p.variantes.reduce((s, v) => s + (Number(v.preco) || 0), 0) / (p.variantes.length || 1);
            }, 0) / numProdutos;

            const faturacao = produtos.reduce((sum, p) => {
                return sum + p.variantes.reduce((s, v) => {
                    return s + (v.preco && v.vendidos ? v.preco * v.vendidos : 0);
                }, 0);
            }, 0);

            res.json({
                numProdutos,
                vendas,
                precoMedio: precoMedio.toFixed(2),
                faturacao: faturacao.toFixed(2)
            });
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

module.exports = produtoController;
