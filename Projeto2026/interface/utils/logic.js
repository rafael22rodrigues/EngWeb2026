const jwt = require('jsonwebtoken');
const SEGREDO = process.env.JWT_SECRET || "EngWeb2026-jcr";
const axios = require('axios');

function getPaginationObject(page, totalPages, urlRest) {
    const urlBase = urlRest + '&page=';
    let prevUrl = null;
    let nextUrl = null;
    if (totalPages === 0) totalPages = 1; 
    if (page > 1) 
        prevUrl = urlBase + (page - 1);
    if (page < totalPages)
        nextUrl = urlBase + (page + 1);
    return {
        page,
        totalPages,
        prevUrl,
        nextUrl,
        pages: Array.from({length: totalPages}, (v, i) => {
            const n = i + 1;
            return { n, url: urlBase + n, isCurrent: n === page };
        })
    };
}

// middleware adicional de proteção de rotas na interface, v
function verificaAdmin(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    
    req.token = token; 
    try {
        const payload = jwt.verify(token, SEGREDO);
        req.user = payload; 

        if (req.user.tipo === 'admin') {
            req.api = axios.create({
                headers: { Authorization: `Bearer ${token}` }
            });
            next();
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.redirect('/login');
    }

}

// middleware para verificar se o user é do tipo "cliente"
function verificaCliente(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    
    req.token = token; 
    try {
        const payload = jwt.verify(token, SEGREDO);
        req.user = payload; 

        if (req.user.tipo === 'cliente') {
            req.api = axios.create({
                headers: { Authorization: `Bearer ${token}` }
            });
            next();
        } else {
            res.redirect('/perfil');
        }
    } catch (err) {
        console.log('Erro: ' + err);
        res.redirect('/login');
    }
}

// Extrai as cores e tamanhos únicos de todos os produtos para preencher a sidebar
// Modelo: cores[].{ _id: hex, label }  |  tamanhos: [String]
function extrairOpcoesFiltro(todosProdutos, todasCores) {

    // A partir do Array com todas cores extrai todas as cores disponíveis
    const coresDisponiveis = todasCores.map(({ _id, label }) => ({ hex: _id, nome: label }));
    const precoAbsolutoMin = todosProdutos.length ? Math.min(...todosProdutos.map(p => p.precoMin)) : 0;
    let precoAbsolutoMax = todosProdutos.length ? Math.max(...todosProdutos.map(p => p.precoMax)) : 1000;

    return { coresDisponiveis, precoAbsolutoMin, precoAbsolutoMax };
}

function gerarIds(nome) {
    return String(nome || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function buildQuery(base, overrides = {}) {
            return new URLSearchParams(
                Object.entries({ ...base, ...overrides })
                    .filter(([, v]) => v != null && v !== '')
                ).toString();
}

module.exports = {
    getPaginationObject,
    verificaAdmin,
    verificaCliente,
    gerarIds,
    buildQuery,
    extrairOpcoesFiltro
};
