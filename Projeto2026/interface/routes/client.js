const express = require('express');
const axios = require('axios');
const { verificaCliente, getPaginationObject, buildQuery, extrairOpcoesFiltro } = require('../utils/logic');

const router = express.Router();
const API_URL = process.env.API_URL || "http://localhost:7789";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:7791";

const POR_PAGINA = 12;

// --------------- GET's ----------------------

// HOMEPAGE
router.get(['/', '/home'], async (req, res) => {
    try {
        const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
        const [produtosResp, categoriasResp] = await Promise.all([
            axios.get(API_URL + '/produtos'),
            axios.get(API_URL + '/categorias')
        ]);
        const produtos = produtosResp.data.produtos;
        const categoriasRaw = categoriasResp.data;
        const categorias = categoriasRaw.map(cat => {
            const prod = produtos.find(p => p.categoriaId === cat._id);
            return {
                slug: cat._id,
                nome: cat.label,
                imagem: prod ? prod.imagemBase : '',
                total: produtos.filter(p => p.categoriaId === cat._id).length
            };
        });
        const produtos_filtrados = produtos.map(p => ({
            ...p,
            precoMin: Math.min(...p.variantes.map(v => v.preco))
        })).slice(0, 8);
        const wishlist = req.user
            ? await axios.get(`${API_URL}/wishlists/${req.user.id}`, headers).then(r => r.data).catch(() => ({ produtos: [] }))
            : { produtos: [] };
        res.render('client/home', { produtos: produtos_filtrados, categorias, favoritosIds: wishlist.produtos.map(p => p.produtoId) });
    } catch (err) {
        res.render('error', { error: err, message: "Erro ao obter dados da API" });
    }
});

// PESQUISA
router.get('/pesquisa', async (req, res) => {
    try {
        const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
        const termo = (req.query.q || '').trim();
        const paginaAtual = parseInt(req.query.page) || 1;
        if (!termo) return res.redirect('/produtos');

        const apiParams = new URLSearchParams({ search: termo, page: paginaAtual, limit: POR_PAGINA });
        const [resultadosResp, categoriasResp] = await Promise.all([
            axios.get(`${API_URL}/produtos?${apiParams}`),
            axios.get(`${API_URL}/categorias`)
        ]);

        const produtos = resultadosResp.data.produtos.map(p => ({
            ...p,
            precoMin: Math.min(...p.variantes.map(v => v.preco)),
            precoMax: Math.max(...p.variantes.map(v => v.preco))
        }));

        const totalProdutos = resultadosResp.data.total;
        const totalPaginas  = Math.ceil(totalProdutos / POR_PAGINA);
        const categorias = categoriasResp.data.map(cat => ({ slug: cat._id, nome: cat.label }));
        const wishlist = req.user
            ? await axios.get(`${API_URL}/wishlists/${req.user.id}`, headers).then(r => r.data).catch(() => ({ produtos: [] }))
            : { produtos: [] };

        res.render('client/search', {
            produtos, categorias, termo, totalProdutos,
            favoritosIds: wishlist.produtos.map(p => p.produtoId),
            pagination: getPaginationObject(paginaAtual, totalPaginas, { q: termo })
        });
    } catch (err) {
        res.render('error', { error: err, message: "Erro na pesquisa" });
    }
});

// TODOS OS PRODUTOS
router.get('/produtos', async (req, res) => {
    try {
        const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
        const paginaAtual = parseInt(req.query.page) || 1;
        const { cor, tamanho, minPreco, maxPreco, sort } = req.query;
        const apiParams = new URLSearchParams({ page: paginaAtual, limit: POR_PAGINA });
        if (cor)      apiParams.set('cor', cor);
        if (tamanho)  apiParams.set('tamanho', tamanho);
        if (minPreco) apiParams.set('minPreco', minPreco);
        if (maxPreco) apiParams.set('maxPreco', maxPreco);
        if (sort)     apiParams.set('sort', sort);

        const [filtradosResp, todosResp, categoriasResp, coresResp] = await Promise.all([
            axios.get(`${API_URL}/produtos?${apiParams}`),
            axios.get(`${API_URL}/produtos`),
            axios.get(`${API_URL}/categorias`),
            axios.get(`${API_URL}/cores`)
        ]);

        const todosProdutos = todosResp.data.produtos.map(p => ({
            ...p,
            precoMin: Math.min(...p.variantes.map(v => v.preco)),
            precoMax: Math.max(...p.variantes.map(v => v.preco))
        }));
        const produtos = filtradosResp.data.produtos.map(p => ({
            ...p,
            precoMin: Math.min(...p.variantes.map(v => v.preco)),
            precoMax: Math.max(...p.variantes.map(v => v.preco))
        }));
        const totalProdutos = filtradosResp.data.total;
        const totalPaginas  = Math.ceil(totalProdutos / POR_PAGINA);
        const categorias = categoriasResp.data.map(cat => ({
            slug: cat._id,
            nome: cat.label,
            total: todosProdutos.filter(p => p.categoriaId === cat._id).length
        }));
        const opcoesFiltro = extrairOpcoesFiltro(todosProdutos, coresResp.data);
        console.log('precoAbsolutoMax:', opcoesFiltro.precoAbsolutoMax);
        //console.log('precos dos produtos:', todosProdutos.map(p => ({ nome: p.nome, precoMax: p.precoMax })));
        const urlRest = '/produtos?' + buildQuery({ cor, tamanho, minPreco, maxPreco, sort });
        const baseParams = {};
        if (cor)      baseParams.cor = cor;
        if (tamanho)  baseParams.tamanho = tamanho;
        if (minPreco) baseParams.minPreco = minPreco;
        if (maxPreco) baseParams.maxPreco = maxPreco;
        if (sort)     baseParams.sort = sort;
        const wishlist = req.user
            ? await axios.get(`${API_URL}/wishlists/${req.user.id}`, headers).then(r => r.data).catch(() => ({ produtos: [] }))
            : { produtos: [] };

        res.render('client/shop', {
            buildQuery, produtos, categorias, totalProdutos,
            favoritosIds: wishlist.produtos.map(p => p.produtoId),
            filtrosAtivos: { cor, tamanho, minPreco, maxPreco, sort },
            pagination: getPaginationObject(paginaAtual, totalPaginas, urlRest),
            ...opcoesFiltro
        });
    } catch (err) {
        res.render('error', { error: err, message: "Erro ao obter produtos" });
    }
});

// PÁGINA DE UM PRODUTO
router.get('/produtos/:id', async (req, res) => {
    try {
        const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
        const [produtoResp, produtosResp, categoriasResp] = await Promise.all([
            axios.get(API_URL + '/produtos/' + req.params.id),
            axios.get(API_URL + '/produtos'),
            axios.get(API_URL + '/categorias')
        ]);
        const produto = {
            ...produtoResp.data,
            precoMin: Math.min(...produtoResp.data.variantes.map(v => v.preco))
        };
        const todosProdutos = produtosResp.data.produtos;
        const produtosRelacionados = todosProdutos
            .filter(p => p.categoriaId === produto.categoriaId && p._id !== produto._id)
            .map(p => ({
                ...p,
                precoMin: Math.min(...p.variantes.map(v => v.preco)),
                precoMax: Math.max(...p.variantes.map(v => v.preco))
            }))
            .slice(0, 3);
        const categorias = categoriasResp.data.map(cat => ({
            slug: cat._id,
            nome: cat.label,
            total: todosProdutos.filter(p => p.categoriaId === cat._id).length
        }));
        const wishlist = req.user
            ? await axios.get(`${API_URL}/wishlists/${req.user.id}`, headers).then(r => r.data).catch(() => ({ produtos: [] }))
            : { produtos: [] };

        res.render('client/productpage', { produto, produtosRelacionados, categorias, favoritosIds: wishlist.produtos.map(p => p.produtoId) });
    } catch (err) {
        res.render('error', { error: err, message: "Produto não encontrado" });
    }
});

// CATEGORIA
router.get('/categoria/:id', async (req, res) => {
    try {
        const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
        const paginaAtual = parseInt(req.query.page) || 1;
        const { cor, tamanho, minPreco, maxPreco, sort } = req.query;
        const apiParams = new URLSearchParams({ categoria: req.params.id, page: paginaAtual, limit: POR_PAGINA });
        if (cor)      apiParams.set('cor', cor);
        if (tamanho)  apiParams.set('tamanho', tamanho);
        if (minPreco) apiParams.set('minPreco', minPreco);
        if (maxPreco) apiParams.set('maxPreco', maxPreco);
        if (sort)     apiParams.set('sort', sort);
        const catParams = new URLSearchParams({ categoria: req.params.id });

        const [filtradosResp, catTodosResp, categoriasResp, coresResp] = await Promise.all([
            axios.get(`${API_URL}/produtos?${apiParams}`),
            axios.get(`${API_URL}/produtos?${catParams}`),
            axios.get(`${API_URL}/categorias`),
            axios.get(`${API_URL}/cores`)
        ]);

        const categoriaAtual = categoriasResp.data.find(c => c._id === req.params.id);
        if (!categoriaAtual) return res.render('error', { error: {}, message: "Categoria não encontrada" });

        const todosDaCategoria = catTodosResp.data.produtos.map(p => ({
            ...p,
            precoMin: Math.min(...p.variantes.map(v => v.preco)),
            precoMax: Math.max(...p.variantes.map(v => v.preco))
        }));
        const produtos = filtradosResp.data.produtos.map(p => ({
            ...p,
            precoMin: Math.min(...p.variantes.map(v => v.preco)),
            precoMax: Math.max(...p.variantes.map(v => v.preco))
        }));
        const totalProdutos = filtradosResp.data.total;
        const totalPaginas  = Math.ceil(totalProdutos / POR_PAGINA);
        const categorias = categoriasResp.data.map(cat => ({
            slug: cat._id,
            nome: cat.label,
            total: catTodosResp.data.total || todosDaCategoria.length
        }));
        const opcoesFiltro = extrairOpcoesFiltro(todosDaCategoria, coresResp.data);
        const baseParams = {};
        if (cor)      baseParams.cor = cor;
        if (tamanho)  baseParams.tamanho = tamanho;
        if (minPreco) baseParams.minPreco = minPreco;
        if (maxPreco) baseParams.maxPreco = maxPreco;
        if (sort)     baseParams.sort = sort;
        const wishlist = req.user
            ? await axios.get(`${API_URL}/wishlists/${req.user.id}`, headers).then(r => r.data).catch(() => ({ produtos: [] }))
            : { produtos: [] };

        res.render('client/category', {
            buildQuery, produtos, categorias,
            categoriaAtual: { slug: categoriaAtual._id, nome: categoriaAtual.label },
            totalProdutos,
            favoritosIds: wishlist.produtos.map(p => p.produtoId),
            filtrosAtivos: { cor, tamanho, minPreco, maxPreco, sort },
            pagination: getPaginationObject(paginaAtual, totalPaginas, baseParams),
            ...opcoesFiltro
        });
    } catch (err) {
        res.render('error', { error: err, message: "Erro ao obter produtos" });
    }
});

// PÁGINA CLIENTE 
router.get('/perfil', verificaCliente, async (req, res) => {
    const id = req.user.id
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };

    try {
        const filtros = req.query;
        filtros.page = Number(filtros.page) || 1;
        filtros.limit = 4;

        const [userResp, encomendasResp] = await Promise.all([
            axios.get(AUTH_URL + '/users/' + id, headers),
            axios.get(API_URL + '/encomendas', { params: filtros, ...headers })
        ]);

        const compras = encomendasResp.data.encomendas || [];
        const totalCompras = encomendasResp.data.total || 0;

        const totalPaginas = Math.ceil(totalCompras / filtros.limit);

        const params = new URLSearchParams(filtros);
        params.delete('page');

        const urlRest = '/perfil?' + params.toString();

        const comprasPagination = getPaginationObject(filtros.page, totalPaginas, { page: filtros.page });

        res.render('client/clientPage', {
            user: userResp.data,
            compras,
            comprasPagination
        });

    } catch (err) {
        res.render('error', {
            error: err,
            message: "Erro ao obter dados do utilizador"
        });
    }
});

// PAGINA DA COMPRA INDIVIDUAL
router.get('/perfil/compras/:id', verificaCliente, async (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const id = req.user.id;
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };

    try {
        const [encomendaResp, produtosResp, userResp] = await Promise.all([
            axios.get(API_URL + '/encomendas/' + req.params.id, headers),
            axios.get(API_URL + '/produtos', headers),
            axios.get(AUTH_URL + '/users/' + id, headers)
        ]);

        const encomenda = encomendaResp.data;
        if (!encomenda) {
            return res.render('error', {
                error: {},
                message: 'Encomenda não encontrada'
            });
        }

        // impedir um cliente de ver encomendas de outro cliente
        if (encomenda.userId !== id) {
            return res.render('error', {
                error: {},
                message: 'Não tens permissão para ver esta encomenda'
            });
        }

        const cliente = userResp.data;
        const produtos = produtosResp.data.produtos || [];

        const rows = encomenda.produtos.map(ep => {
            const row = [];
            const produto = produtos.find(p => p._id === ep.produtoId);
            if (produto) {
                const variante = produto.variantes.find(v => v.sku === ep.varianteSku);
                if (variante) {
                    const cor = variante.atributos.cor;
                    const imagemCor = produto.opcoes.cores.find(c => c._id === cor)?.imagem || produto.imagemBase;
                    row.push({ img: imagemCor });
                    row.push({ text: produto.nome });
                    row.push({ cores: [variante.atributos.cor] });
                    row.push({ text: variante.atributos.tamanho || '—' });
                    row.push({ text: variante.atributos.tampa || '—' });
                    row.push({ text: ep.quantidade.toString() });
                    row.push({ text: (Number(variante.preco) * Number(ep.quantidade)).toFixed(2) + '€' });
                }
            }
            return row;
        });

        res.render('client/Order', {
            rows,
            date: d,
            encomenda,
            cliente
        });
    } catch (err) {
        res.render('error', {
            error: err,
            message: 'Erro ao obter detalhes da encomenda'
        });
    }
});

// SOBRE NÓS
router.get('/sobre', (req, res) => {
    res.render('client/AboutUs');
});

// CONTACTOS
router.get('/contactos', (req, res) => {
    res.render('client/Contact');
});

// CARRINHO
router.get('/carrinho', verificaCliente, (req, res) => {
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
    const id = req.user.id;
    Promise.all([
        axios.get(`${API_URL}/carrinhos/${id}`, headers),
        axios.get(`${API_URL}/produtos`)
    ]).then(resp => {
            const carrinho = resp[0].data;
            const produtos = resp[1].data.produtos;
            var total = 0, produto_variante = [];
            var totalProdutos = 0;

            carrinho.produtos.forEach(p => {
                const prod = produtos.find(pr => pr._id === p.produtoId);
                if (prod) {
                    const variante = prod.variantes.find(v => v.sku === p.sku);
                    if (variante) {
                        const cor = variante.atributos.cor;
                        const imagemCor = prod.opcoes.cores.find(c => c._id === cor)?.imagem || prod.imagemBase;
                        produto_variante.push({
                            produto: prod,
                            variante,
                            quantidade: p.quantidade,
                            imagem: imagemCor
                        });
                        total += variante.preco * p.quantidade;
                        totalProdutos += p.quantidade;
                    }
                }
            });
            res.render('client/Cart', { carrinho, produtos: produto_variante, total, totalProdutos });
        })
        .catch(err => res.render('error', { error: err }));
});

// WISHLIST (LISTA DE FAVORITOS)
router.get('/wishlist', verificaCliente, (req, res) =>{
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
    const id = req.user.id;
    Promise.all([
        axios.get(`${API_URL}/wishlists/${id}`, headers),
        axios.get(`${API_URL}/produtos`)
    ]).then(resp => {
            const favoritos = resp[0].data;
            const produtos = resp[1].data.produtos;
            produtos_favoritos = [];
            console.log('favoritos:', favoritos.produtos);
            console.log('primeiro produto _id:', produtos[0]?._id, typeof produtos[0]?._id);
            favoritos.produtos.forEach(p => {
                const prod = produtos.find(pr => pr._id === p.produtoId);
                if(prod){
                    let variantes = true;
                    precoMin = Math.min(...prod.variantes.map(v => v.preco));
                    precoMax = Math.max(...prod.variantes.map(v => v.preco));
                    if(precoMin === precoMax){
                        variantes = false;
                    }
                    produtos_favoritos.push({
                        produtoId: prod._id,
                        produtoNome: prod.nome,
                        imagemBase: prod.imagemBase,
                        precoBase: precoMin,
                        variantes
                    });
                }
            });
            res.render('client/wishlist', {favoritos: produtos_favoritos})
    }).catch(err => res.render('error', {error: err}));
});

// PAGAMENTO
router.get('/pagamento', verificaCliente, (req, res) => {
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
    const id = req.user.id;
    Promise.all([
        axios.get(`${API_URL}/carrinhos/${id}`, headers),
        axios.get(`${API_URL}/produtos`)
    ]).then(resp => {
            const carrinho = resp[0].data;
            const produtos = resp[1].data.produtos;
            var total = 0, produto_variante = [];
            var totalProdutos = 0;

            if (carrinho.produtos.length === 0) {
                return res.redirect('/carrinho');
            }
            
            carrinho.produtos.forEach(p => {
                const prod = produtos.find(pr => pr._id === p.produtoId);
                if (prod) {
                    const variante = prod.variantes.find(v => v.sku === p.sku);
                    if (variante) {
                        produto_variante.push({
                            produto: prod,
                            variante,
                            quantidade: p.quantidade
                        });
                        total += variante.preco * p.quantidade;
                        totalProdutos += p.quantidade;
                    }
                }
            });
            res.render('client/Payment', { carrinho, produtos: produto_variante, total, totalProdutos });
        })
        .catch(err => res.render('error', { error: err }));
});

//----------- POST's-------------------

// EDITAR CLIENTE 
router.post('/perfil/editar', verificaCliente, async (req, res) => {
    const id = req.user.id;
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
    const dadosAtualizados = {
        nome: req.body.nome,
        email: req.body.email,
        telefone: req.body.telefone,
        nif: req.body.nif
    };

    axios.put(AUTH_URL + '/users/' + id, dadosAtualizados, headers)
        .then(() => {
            res.redirect('/perfil');
        })
        .catch(err => {
            res.render('error', {
                error: err,
                message: "Erro ao atualizar dados do utilizador"
            });
        });
});

// ADICIONAR À WISHLIST (LISTA DE FAVORITOS)
router.post('/wishlist/adicionar', verificaCliente, async(req, res) => {
    const userId = req.user.id;
    console.log(req.body);
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
    try {
        const response = await axios.post(`${API_URL}/wishlists/${userId}/produtos`, req.body, headers);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// REMOVER WISHLIST (LISTA DE FAVORITOS)
router.post('/wishlist/remover', verificaCliente, async (req, res) => {
    const userId = req.user.id;
    const produtoId = req.body.produtoId;
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
    try {
        await axios.delete(`${API_URL}/wishlists/${userId}/produtos/${produtoId}`, headers);
        res.redirect('/wishlist'); // estava em falta
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ADICIONAR AO CARRINHO
router.post('/carrinho/adicionar', verificaCliente, async (req, res) => {
    const userId = req.user.id;
    console.log(req.body);
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
    try {
        const response = await axios.post(`${API_URL}/carrinhos/${userId}/produtos`, req.body, headers);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// REMOVER DO CARRINHO
router.post('/carrinho/remover', verificaCliente, async (req, res) => {
    const userId = req.user.id;
    const sku = req.body.sku;
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
    try {
        const response = await axios.delete(`${API_URL}/carrinhos/${userId}/produtos/${sku}`, headers);
        res.redirect('/carrinho');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// FINALIZAR PAGAMENTO
router.post('/pagamento/finalizar', verificaCliente, async (req, res) => {
    const userId = req.user.id;
    const headers = { headers: { Authorization: 'Bearer ' + (req.token || '') } };
    try {
        const encResp = await axios.post(`${API_URL}/encomendas`, { userId }, headers);

        const encomendaCriada = encResp.data;

        res.redirect(`/perfil/compras/${encomendaCriada._id}`);

    } catch (err) {
        res.render('error', {
            error: err,
            message: "Erro ao finalizar pagamento"
        }); 
    }
});

module.exports = router;
