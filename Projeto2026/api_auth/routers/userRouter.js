const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../auth/auth');


/**
 * POST /users/login
 * Efetua o login, gera o JWT e guarda-o num Cookie
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const dados = await userController.login(email, password);

        // Guardar o token num cookie (HttpOnly por segurança)
        res.cookie('token', dados.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true em HTTPS
            maxAge: 3600000 // 1 hora
        });

        res.status(200).json({ 
            status: "Login efetuado com sucesso", 
            user: dados.user,
            token: dados.token
        });
    } catch (err) {
        res.status(401).jsonp({ erro: err.message });
    }
});

/**
 * GET /users/logout
 * Limpa o cookie da sessão
 */
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ status: "Sessão terminada" });
});

// --- ROTAS DE CRUD ---

/**
 * POST /users
 * Criar um novo utilizador
 */
router.post('/users', userController.createUser);

// --- ROTAS PROTEGIDAS ---
// --- a partir daqui as rotas só são atingidas se o pedido passar na verificação do token

/**
 * GET /users
 * Listar todos os utilizadores
 */
router.get('/users', auth.verificaAcesso, auth.verificaAdmin, userController.getAllUsers);

/**
 * GET /users/:id
 * Obter detalhes de um utilizador específico
 */
router.get('/users/:id', auth.verificaAcesso, auth.verificaSelfOrAdmin, userController.getUserById);

/**
 * PUT /users/:id
 * Atualizar dados do utilizador
 */
router.put('/users/:id', auth.verificaAcesso, auth.verificaSelfOrAdmin, userController.updateUser);


/**
 * POST /users/:id/deactivate (Admin)
 */
router.post('/users/:id/deactivate', auth.verificaAcesso, auth.verificaAdmin, userController.deactivateUser);

module.exports = router;

