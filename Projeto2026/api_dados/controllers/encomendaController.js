const Encomenda = require('../models/encomenda');
const Produto = require('../models/produto');
const Carrinho = require('../models/carrinho');

const encomendaController = {
    createEncomenda: async (req, res) => {
        try {
            const id = req.body.userId;
            const carrinho = await Carrinho.findById(id);
            if (!carrinho || carrinho.produtos.length === 0) {
                return res.status(400).json({
                    message: 'O carrinho está vazio.'
                });
            }

            const encomendas = await Encomenda.find();
            const idEncomenda = String(encomendas.length + 1);
            var precoTotal = 0;
            const produtosEncomenda = [];
            const produtosParaGuardar = [];

            for (const item of carrinho.produtos) {
                const produto = await Produto.findById(item.produtoId);
                if (!produto) {
                    return res.status(404).json({
                        message: `Produto ${item.produtoId} não encontrado.`
                    });
                }

                const variante = produto.variantes.find(v => v.sku === item.sku);
                if (!variante) {
                    return res.status(404).json({
                        message: `Variante ${item.sku} não encontrada.`
                    });
                }

                if (variante.stock < item.quantidade) { // ja nao ha no stock
                    return res.status(400).json({
                        message: `Stock insuficiente de ${produto.nome}.`
                    });
                }

                precoTotal += (variante.preco * item.quantidade);
                produtosEncomenda.push({
                    produtoId: item.produtoId,
                    varianteSku: item.sku,
                    quantidade: item.quantidade
                });

                variante.stock = variante.stock - item.quantidade;
                produtosParaGuardar.push(produto);
            }

            const novaEncomenda = new Encomenda({
                _id: idEncomenda,
                userId: id,
                produtos: produtosEncomenda,
                precoTotal,
                data: new Date(),
                estado: 'pendente'
            });

            await novaEncomenda.save();
            for (const produto of produtosParaGuardar) { // guardar produtos com o stock atualizado
                await produto.save();
            }
            carrinho.produtos = []; // limpar o carrinho
            await carrinho.save();
            res.status(201).json(novaEncomenda);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    getAllEncomendas: async (req, res) => {
        try {
            const {userId, estado, dataInicio, dataFim, page, limit, sort} = req.query // ****ver page e limit para paginação

            let queryObj = {};

            if (userId) queryObj.userId = userId;

            if(req.user.tipo === 'cliente') {
                queryObj.userId = req.user.id; // clientes só veem as suas encomendas
            }

            if (estado) queryObj.estado = estado;

            if (dataInicio || dataFim) {
                queryObj.data = {};
                if (dataInicio) {
                    queryObj.data.$gte = new Date(dataInicio);
                }
                if (dataFim) {
                    const fim = new Date(dataFim);
                    fim.setHours(23, 59, 59, 999); // para incluir o dia inteiro (input é só a data)
                    queryObj.data.$lte = fim;
                }
            }

            const total = await Encomenda.countDocuments(queryObj); // para calcular total de páginas

            let query = Encomenda.find(queryObj);

            if (sort)  query = query.sort(sort);
            else query = query.sort('-data');

            // paginação
            if (page && limit) {
                const p = Number(page);
                const l = Number(limit);
                query = query.skip((p - 1) * l).limit(l);
            }

            const encomendas = await query.exec();

            const resposta = {
                encomendas,
                total
            }
            res.json(resposta);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    getEncomendaById: async (req, res) => {
        try {
            const encomenda = await Encomenda.findById(req.params.id);
            if (!encomenda) {
                return res.status(404).json({message: 'Encomenda not found'})
            }

            if (req.user.tipo === 'cliente' && encomenda.userId.toString() !== req.user.id) {
                return res.status(403).json({message: 'Acesso negado.'})
            }
            res.json(encomenda);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    updateEncomenda: async (req, res) => {
        try {
            const encomenda = await Encomenda.findByIdAndUpdate(req.params.id, req.body, {new: true});
            if (!encomenda) {
                return res.status(404).json({message: 'Encomenda not found'})
            }
            else {
                res.json(encomenda);
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    deleteEncomenda: async (req, res) => {
        try {
            const encomenda = await Encomenda.findByIdAndDelete(req.params.id);
            if (!encomenda) {
                return res.status(404).json({message: 'Encomenda not found'})
            }
            else {
                res.json({message: 'Encomenda deleted successfully'});
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    getStats: async (req, res) => {
        try {
            const resp = await Encomenda.aggregate([{ $group: {_id: "$estado", count: { $sum: 1 }}}]);
            const stats = {
                concluidas: resp.find(r => r._id === 'concluida')?.count || 0,
                pendentes: resp.find(r => r._id === 'pendente')?.count || 0,
                canceladas: resp.find(r => r._id === 'cancelada')?.count || 0,
                total: 0
            }
            stats.total = stats.concluidas + stats.pendentes + stats.canceladas;
            res.json(stats);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    concluirEncomenda: async (req, res) => {
        try {
            const encomenda = await Encomenda.findById(req.params.id);
            if (!encomenda) {
                return res.status(404).json({message: 'Encomenda not found'})
            }
            if (encomenda.estado !== 'pendente') {
                return res.status(400).json({message: 'Encomenda não está pendente'})
            }
            encomenda.estado = 'concluida';
            await encomenda.save();
            res.json(encomenda);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    cancelarEncomenda: async (req, res) => {
        try {
            const encomenda = await Encomenda.findById(req.params.id);
            if (!encomenda) {
                return res.status(404).json({message: 'Encomenda not found'})
            }
            if (encomenda.estado !== 'pendente') {
                return res.status(400).json({message: 'Encomenda não está pendente'})
            }

            // reverter stock dos produtos da encomenda
            for (const item of encomenda.produtos) {
                const produto = await Produto.findById(item.produtoId);
                if (!produto) {
                    return res.status(404).json({message: `Produto ${item.produtoId} not found`})
                }

                const variante = produto.variantes.find(v => v.sku === item.varianteSku);
                if (!variante) {
                    return res.status(404).json({message: `Variante ${item.varianteSku} not found`})
                }

                variante.stock = (variante.stock || 0) + item.quantidade;
                await produto.save();
            }

            encomenda.estado = 'cancelada';
            await encomenda.save();
            res.json(encomenda);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

module.exports = encomendaController;