const jwt = require('jsonwebtoken');
const SEGREDO = process.env.JWT_SECRET || "EngWeb2026-jcr";

/**
 * Middleware para verificar o acesso via JWT.
 * Ordem de precedência: Header -> Cookie -> Query String
 */
module.exports.verificaAcesso = (req, res, next) => {
    let token = null;

    // 1. Tenta extrair do Header "Authorization: Bearer <token>"
    if (req.headers['authorization']) {
        token = req.headers['authorization'].split(' ')[1];
    } 
    // 2. Tenta extrair dos Cookies (se o cookie-parser estiver ativo)
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 
    // 3. Tenta extrair da Query String (?token=<token>)
    else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ 
            erro: "Acesso negado. Token não fornecido (Header, Cookie ou Query String)." 
        });
    }
    else{
        try {
            const payload = jwt.verify(token, SEGREDO);
            req.user = payload; // Disponibiliza os dados do user (id, role, nivel) para as rotas seguintes
            next();
        } catch (err) {
            res.status(401).json({ erro: "Token inválido ou expirado." });
        }
    }
};

// Middleware para verificar se o user é do tipo "admin"
module.exports.verificaAdmin = (req, res, next) => {
    if (req.user && req.user.tipo === 'admin') {
        next(); // O usuário é admin, pode acessar a rota
    } else {
        res.status(403).json({ erro: "Acesso negado. Requer permissão de administrador." });
    }
};

// Verifica se o user é do tipo "cliente"
module.exports.verificaCliente = (req, res, next) => {
    if (req.user && req.user.tipo === 'cliente') {
        next(); // O usuário é cliente, pode acessar a rota
    } else {
        res.status(403).json({ erro: "Acesso negado. Requer permissão de cliente." });
    }
};

// Middleware para verificar se o user é o próprio ou um admin
module.exports.verificaSelfOrAdmin = (req, res, next) => {
    const idToken = req.user.id;
    const idRota = req.params.id;
    const userTipo = req.user.tipo;

    if (userTipo === 'admin' || idToken === idRota) {
        next();
    } else {
        res.status(403).json({ 
            erro: "Acesso negado. Não tem permissão para alterar os dados de outro utilizador." 
        });
    }
};