const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const router = express.Router();
const API_URL = process.env.API_URL || "http://localhost:7789";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:7790";

// utils
const { getPaginationObject, verificaAdmin, gerarIds } = require('../utils/logic');

// multer
const upload = multer({ storage: multer.memoryStorage() });

// INVENTARIO
router.get('/admin/inventario', verificaAdmin, async (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};

    try {
        const filtros = req.query;
        filtros.page = Number(filtros.page) || 1;
        filtros.limit = 6;
        
        const [prodResp, catResp, coresResp, statsResp] = await Promise.all([
            axios.get(API_URL + '/produtos', { params: filtros, ...headers }),
            axios.get(API_URL + '/categorias', headers),
            axios.get(API_URL + '/cores', headers),
            axios.get(API_URL + '/produtos/stats', headers)
        ]);

        const produtos = prodResp.data.produtos || [];
        const totalProdutos = prodResp.data.total || 0;
        const categorias = catResp.data || [];
        const cores = coresResp.data || [];
        const catMap = Object.fromEntries(categorias.map(c => [c._id, c.label]));
        const stats = statsResp.data || {
            numProdutos: 0,
            vendas: 0,
            precoMedio: 0,
            faturacao: 0
        };
        
        const totalPaginas = Math.ceil(totalProdutos / filtros.limit);
        const params = new URLSearchParams(filtros);
        params.delete('page');
        const urlRest = '/admin/inventario?' + params.toString(); // url base para paginação, mantendo outros filtros
        const pagination = getPaginationObject(filtros.page, totalPaginas, urlRest);

        const rows = produtos.map(p => { // formatação dos produtos para a tabela
            const row = []
            row.push({ img: p.imagemBase });
            row.push({ text: p.nome });
            const precos = (p.variantes || []).map(v => Number(v.preco ?? v.preco)).filter(Number.isFinite);
            const intervalo = precos.length? Math.min(...precos).toFixed(2) + '€ - ' + Math.max(...precos).toFixed(2) + '€': '—';
            row.push({ text: intervalo });
            row.push({ text: catMap[p.categoriaId] || '—' });
            if(p.opcoes.cores) row.push({ cores: p.opcoes.cores.map(c => c._id) });
            else row.push({ text: '—' });
            if(p.opcoes.tamanhos) row.push({ text: p.opcoes.tamanhos });
            else row.push({ text: '—' });
            row.push({ text: p.variantes.reduce((c, v) => c + v.stock, 0).toString()});
            row.push({ text: p.variantes.reduce((c, v) => c + (v.vendidos ?? 0), 0).toString() });
            row.push({ acoes: [{acao: 'edit', link: '/admin/produtos/' + p._id + '/editar' },
                     { acao: 'delete', link: '/admin/produtos/' + p._id + '/eliminar' }] });
            return row;
        });

        const opcoesFiltro = {categorias: categorias, cores: cores};

        res.render('admin/StockManagement', { rows, date: d , filtros: filtros, stats: stats, pagination: pagination, opcoesFiltro: opcoesFiltro });
    } catch(err) {
        res.render('error', {
            error: err,
            message: "Erro ao obter inventário"
        });
    }
});

// Página adicionar produto
router.get('/admin/produtos/novo', verificaAdmin, async (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};

    Promise.all([
        axios.get(API_URL + '/cores', headers),
        axios.get(API_URL + '/categorias', headers)
    ])
        .then(([coresResp, categoriasResp]) => {
            const cores = coresResp.data || [];

            const categorias = (categoriasResp.data || []).map(categoria => ({
                id: categoria._id,
                nome: categoria.label
            }));

            res.render('admin/EditProduct', {
                modo: 'novo',
                date: d,
                produto: {},
                cores,
                categorias
            });
        })
        .catch(err => {
            res.render('error', {
                error: err,
                message: "Erro ao abrir formulário de novo produto"
            });
        });
});

// enviar novo produto para a API
router.post('/admin/produtos/novo', verificaAdmin, upload.any(), async (req, res) => {
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};
    try {
        const produtoId = gerarIds(req.body.nome);
        const categoriaId = req.body.categoria === 'outra' ? gerarIds(req.body.novaCategoria) : req.body.categoria;
        const cores = (req.body.cores || []).map((cor, index) => {
            const corId = cor.source === 'outra' ? cor.id : cor.source;
            const label = cor.nome || corId;
            const ficheiro = (req.files || []).find(
                file => file.fieldname === `cores[${index}][imagem]`
            );
            const ext = ficheiro ? ficheiro.originalname.substring(ficheiro.originalname.lastIndexOf('.')).toLowerCase() : '';
            return {
                _id: corId,
                label,
                imagem: ext ? `${categoriaId}/${produtoId}-${gerarIds(label)}${ext}` : ''
            };
        });
        const variantes = (req.body.variantes || []).filter(Boolean).map(variante => ({
            sku: variante.sku,
            preco: Number(variante.preco),
            vendidos: 0,
            stock: Number(variante.stock),
            atributos: {
                cor: variante.corId,
                tamanho: variante.tamanho,
                tampa: variante.tampa
            }
        }));
        const tamanhos = [...new Set(
            variantes.map(v => v.atributos.tamanho).filter(Boolean)
        )];
        const tampas = [...new Set(
            variantes.map(v => v.atributos.tampa).filter(Boolean)
        )];
        const imagemBaseIndex = Number(req.body.imagemBase) || 0;
        const produto = {
            _id: produtoId,
            nome: req.body.nome,
            categoriaId,
            imagemBase: cores[imagemBaseIndex]?.imagem || '',
            opcoes: {
                cores,
                tamanhos,
                tampas
            },
            variantes
        };

        if (req.body.categoria === 'outra' && req.body.novaCategoria) {
            await axios.post(API_URL + '/categorias', {
                _id: categoriaId,
                label: req.body.novaCategoria
            }, headers);
        }

        for (const cor of (req.body.cores || []).filter(Boolean)) {
            if (cor.source === 'outra') {
                await axios.post(API_URL + '/cores', {
                    _id: cor.id,
                    label: cor.nome || cor.id
                }, headers);
            }
        }

        const form = new FormData();
        form.append('produto', JSON.stringify(produto));

        for (const file of req.files || []) {
            form.append(file.fieldname, file.buffer, file.originalname);
        }

        await axios.post(API_URL + '/produtos', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: 'Bearer ' + (req.cookies.token || '')
            }
        });

        res.redirect('/admin/inventario');

    } catch (err) {
        res.render('error', {
            error: err,
            message: "Erro ao criar produto"
        });
    }
});

// editar produto - get do produto
router.get('/admin/produtos/:id/editar', verificaAdmin, async (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};

    try {
        const [produtoResp, coresResp, categoriasResp] = await Promise.all([
            axios.get(API_URL + '/produtos/' + req.params.id, headers),
            axios.get(API_URL + '/cores', headers),
            axios.get(API_URL + '/categorias', headers)
        ]);

        const produto = produtoResp.data || {};
        const cores = coresResp.data || [];
        const categorias = (categoriasResp.data || []).map(categoria => ({
            id: categoria._id,
            nome: categoria.label
        }));

        res.render('admin/EditProduct', {
            modo: 'editar',
            date: d,
            produto,
            cores,
            categorias
        });
    } catch(err) {
        res.render('error', {
            error: err,
            message: "Produto não encontrado"
        });
    }
});

// editar produto - enviar alterações para a API
router.post('/admin/produtos/:id/editar', verificaAdmin, upload.any(), async (req, res) => {
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};
    try {
        const produtoId = req.params.id;
        const categoriaId = req.body.categoria === 'outra' ? gerarIds(req.body.novaCategoria) : req.body.categoria;
        const cores = (req.body.cores || []).map((cor, index) => {
            const corId = cor.source === 'outra' ? cor.id : cor.source;
            const label = cor.nome || corId;
            const ficheiro = (req.files || []).find(
                file => file.fieldname === `cores[${index}][imagem]`
            );
            let imagem = cor.imagemAtual || '';
            if (ficheiro) {
                const ext = ficheiro.originalname
                    .substring(ficheiro.originalname.lastIndexOf('.'))
                    .toLowerCase();
                imagem = `${categoriaId}/${produtoId}-${gerarIds(label)}${ext}`;
            }
            return {
                _id: corId,
                label,
                imagem
            };
        });
        const variantes = (req.body.variantes || []).filter(Boolean).map(variante => ({
            sku: variante.sku,
            preco: Number(variante.preco),
            vendidos: Number(variante.vendidos || 0),
            stock: Number(variante.stock),
            atributos: {
                cor: variante.corId,
                tamanho: variante.tamanho,
                tampa: variante.tampa
            }
        }));
        const tamanhos = [...new Set(
            variantes.map(v => v.atributos.tamanho).filter(Boolean)
        )];
        const tampas = [...new Set(
            variantes.map(v => v.atributos.tampa).filter(Boolean)
        )];
        const imagemBaseIndex = Number(req.body.imagemBase) || 0;
        const produto = {
            _id: produtoId,
            nome: req.body.nome,
            categoriaId,
            imagemBase: cores[imagemBaseIndex]?.imagem || '',
            opcoes: {
                cores,
                tamanhos,
                tampas
            },
            variantes
        };

        if (req.body.categoria === 'outra' && req.body.novaCategoria) {
            await axios.post(API_URL + '/categorias', {
                _id: categoriaId,
                label: req.body.novaCategoria
            }, headers);
        }

        for (const cor of (req.body.cores || []).filter(Boolean)) {
            if (cor.source === 'outra') {
                await axios.post(API_URL + '/cores', {
                    _id: cor.id,
                    label: cor.nome || cor.id
                }, headers);
            }
        }

        const form = new FormData();
        form.append('produto', JSON.stringify(produto));
        for (const file of req.files || []) {
            form.append(file.fieldname, file.buffer, file.originalname);
        }

        await axios.put(API_URL + '/produtos/' + produtoId, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: 'Bearer ' + (req.cookies.token || '')
            }
        });

        res.redirect('/admin/inventario');
    } catch (err) {
        res.render('error', {
            error: err,
            message: "Erro ao guardar alterações",
        });
    }
});
// apagar produto
router.post('/admin/produtos/:id/eliminar', verificaAdmin, async (req, res) => {
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};
    try {
        await axios.delete(API_URL + '/produtos/' + req.params.id, headers);
        res.redirect('/admin/inventario');

    } catch (err) {
        res.render('error', {
            error: err,
            message: "Erro ao eliminar produto"
        });
    }
});

// encomendas
router.get('/admin/encomendas', verificaAdmin,async (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};

    try {
        const filtros = req.query;
        filtros.page = Number(filtros.page) || 1;
        filtros.limit = 6;

        const [encResp, statsResp, userResp] = await Promise.all([
            axios.get(API_URL + '/encomendas', { params: filtros , ...headers }),
            axios.get(API_URL + '/encomendas/stats', headers),
            axios.get(AUTH_URL + '/users', headers)
        ]);

        const encomendas = encResp.data.encomendas || [];
        const totalEncomendas = encResp.data.total || 0;
        const users = userResp.data.users || [];
        const userMap = Object.fromEntries(users.map(u => [u._id, u]));
        const stats = statsResp.data || {
            concluidas: 0,
            pendentes: 0,
            canceladas: 0,
            total: 0
        };

        const totalPaginas = Math.ceil(totalEncomendas / filtros.limit);
        const params = new URLSearchParams(filtros);
        params.delete('page');
        const urlRest = '/admin/encomendas?' + params.toString(); // url base para paginação, mantendo outros filtros
        const pagination = getPaginationObject(filtros.page, totalPaginas, urlRest);

        const rows = encomendas.map(e => { // formatação das encomendas para a tabela
            // 'Encomenda Nr', 'Cliente', 'Data', 'Estado', 'Valor', 'Produtos', 'Ações'(Ver)
            const row = []
            row.push({ text: e._id });
            const cliente = userMap[e.userId];
            if(cliente) row.push({ text: [cliente.nome, cliente.email, cliente.telefone], link: '/admin/users/' + cliente._id });
            else row.push({ text: '—' });
            row.push({ text: new Date(e.data).toLocaleString() });
            row.push({ text: e.estado });
            row.push({ text: e.precoTotal.toFixed(2) + '€' });
            row.push({ text: e.produtos.length.toString() });
            var acoes = [{ acao: 'view', link: '/admin/encomendas/' + e._id }];
            if(e.estado === 'pendente') {
                acoes.push({ acao: 'check', link: '/admin/encomendas/' + e._id + '/concluir' });
                acoes.push({ acao: 'cancel', link: '/admin/encomendas/' + e._id + '/cancelar' });
            }
            row.push({ acoes: acoes });
            return row;
        });
        res.render('admin/OrderManagement', { rows, date: d , filtros: filtros, stats: stats, pagination: pagination });
    } catch(err) {
        res.render('error', {
            error: err,
            message: "Erro ao obter encomendas"
        });
    }
});

// concluir encomenda
router.post('/admin/encomendas/:id/concluir', verificaAdmin, async (req, res) => {
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};
    try {
        await axios.post(API_URL + '/encomendas/' + req.params.id + '/concluir', {}, headers);
        res.redirect('/admin/encomendas');
    } catch(err) {
        res.render('error', {error: err, message: "Erro ao concluir encomenda"});
    }
});

// cancelar encomenda
router.post('/admin/encomendas/:id/cancelar', verificaAdmin, async (req, res) => {
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};
    try {
        await axios.post(API_URL + '/encomendas/' + req.params.id + '/cancelar', {}, headers);
        res.redirect('/admin/encomendas');
    } catch(err) {
        res.render('error', {error: err, message: "Erro ao cancelar encomenda"});
    }
});

//pagina da encomenda
router.get('/admin/encomendas/:id', verificaAdmin, async (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};

    try {
        const [encomendaResp, produtosResp] = await Promise.all([
            axios.get(API_URL + '/encomendas/' + req.params.id, headers),
            axios.get(API_URL + '/produtos', headers)
        ]);
        const encomenda = encomendaResp.data;
        if (!encomenda) {
            return res.render('error', { error: {}, message: "Encomenda não encontrada" });
        } 
        const userResp = await axios.get(AUTH_URL + '/users/' + encomendaResp.data.userId, headers);
        
        if(!userResp.data) {
            return res.render('error', { error: {}, message: "Cliente não encontrado" });
        }
        const user = userResp.data;
        
        const produtos = produtosResp.data.produtos || [];
        
        const rows = encomenda.produtos.map(ep => {
            const row = [];
            const produto = produtos.find(p => p._id === ep.produtoId);
            if(produto) { // Imagem', 'Produto', 'Cor', 'Tamanho' 'Quantidade', 'Subtotal'
                const variante = produto.variantes.find(v => v.sku === ep.varianteSku);
                row.push({ img: produto.imagemBase });
                row.push({ text: produto.nome });
                if (variante) {
                    row.push({ cores: [variante.atributos.cor] });
                    row.push({ text: variante.atributos.tamanho || '—' });
                    row.push({ text: variante.atributos.tampa || '—' });
                    row.push({ text: ep.quantidade.toString() });
                    row.push({ text: (Number(variante.preco) * Number(ep.quantidade)).toFixed(2) + '€' });
                }
            }
            return row;
        });

        res.render('client/Order', { rows, date: d, encomenda, cliente: user });
    } catch(err) {
        res.render('error', {
            error: err,
            message: "Erro ao obter encomendas"
        });
    }
});

module.exports = router;

// gestão de utilizadores
router.get('/admin/users', verificaAdmin, async (req, res) => {
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};

    const filtros = {...req.query, page: Number(req.query.page) || 1, limit: 6 };

    axios.get(AUTH_URL + '/users', { params: filtros, ...headers })
        .then(resp => {
            const { users, total } = resp.data;
            const d = new Date().toISOString().substring(0, 16);

            const totalPaginas = Math.ceil(total / filtros.limit);
            const params = new URLSearchParams(filtros);
            params.delete('page');
            const urlRest = '/admin/users?' + params.toString();
            const pagination = getPaginationObject(filtros.page, totalPaginas, urlRest);

            // +table(['ID', 'Nome', 'Email', 'NIF', 'Telefone', 'Tipo', 'Estado' 'Ações'], rows)
            const rows = users.map(u => {
                const row = [];
                row.push({ text: u._id });
                row.push({ text: u.nome });
                row.push({ text: u.email });
                row.push({ text: u.nif || '—' });
                row.push({ text: u.telefone || '—' });
                row.push({ text: u.tipo });
                if (u.ativo) row.push({ text: 'Ativo' });
                else row.push({ text: 'Desativado' });
                var acoes = [];
                if (u.tipo !== 'admin') 
                    acoes.push({ acao: 'view', link: '/admin/users/' + u._id });
                if(u.ativo) {
                    acoes.push({ acao: 'deactivate', link: '/admin/users/' + u._id + '/desativar' });
                }
                row.push({ acoes: acoes });
                return row;
            });

            res.render('admin/ClientManagement', { rows, total, date: d, filtros, pagination });
        })
        .catch(err => {
            res.render('error', {
                error: err,
                message: "Encomenda não encontrada"
            });
        });
});

// encomendas de um utilizador
router.get('/admin/users/:id', verificaAdmin, async (req, res) => {
    const headers = { headers: { Authorization: 'Bearer ' + (req.cookies.token || '') }};

    try {
        const [userResp, encResp] = await Promise.all([
            axios.get(AUTH_URL + '/users/' + req.params.id, headers),
            axios.get(API_URL + '/encomendas', { params: { userId: req.params.id }, ...headers })
        ]);

        const user_info = userResp.data;
        if (!user_info) {
            return res.render('error', { error: {}, message: "Utilizador não encontrado" });
        }

        const encomendas = encResp.data.encomendas || [];
        const rows = encomendas.map(e => { // formatação das encomendas para a tabela
            // 'Encomenda Nr', 'Data', 'Estado', 'Valor', 'Produtos', 'Ações'(Ver)
            const row = []
            row.push({ text: e._id });
            row.push({ text: new Date(e.data).toLocaleString() });
            row.push({ text: e.estado });
            row.push({ text: e.precoTotal.toFixed(2) + '€' });
            row.push({ text: e.produtos.length.toString() });
            var acoes = [{ acao: 'view', link: '/admin/encomendas/' + e._id }];
            if(e.estado === 'pendente') {
                acoes.push({ acao: 'check', link: '/admin/encomendas/' + e._id + '/concluir' });
                acoes.push({ acao: 'cancel', link: '/admin/encomendas/' + e._id + '/cancelar' });
            }
            row.push({ acoes: acoes });
            return row;
        });
        res.render('admin/ClientPage', { user_info, rows });
    } catch(err) {
        res.render('error', {
            error: err,
            message: "Erro ao obter utilizador ou encomendas"
        });
    }
});

// desativar utilizador
router.post('/admin/users/:id/desativar', verificaAdmin, async (req, res) => {
    const headers = {headers: {Authorization: 'Bearer ' + (req.cookies.token || '')}};
    try {
        await axios.post(AUTH_URL + '/users/' + req.params.id + '/deactivate', {}, headers);
        res.redirect('/admin/users');
    } catch(err) {
        res.render('error', {error: err, message: "Erro ao desativar utilizador"});
    }
});