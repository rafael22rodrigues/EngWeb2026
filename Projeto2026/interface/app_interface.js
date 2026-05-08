const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const cookies = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

const API_URL = process.env.API_URL || "http://localhost:7789";
const SEGREDO = process.env.JWT_SECRET || "EngWeb2026-jcr";

// Configurações do Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookies());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/assets', express.static(path.join(__dirname, '/assets')));

// Middleware global — injeta categorias em todas as views (usado pela sidebar)
app.use((req, res, next) => {
    axios.get(API_URL + '/categorias')
        .then(resp => {
            res.locals.sidebarCategorias = resp.data.map(cat => ({
                slug: cat._id,
                nome: cat.label
            }));
            next();
        })
        .catch(() => {
            res.locals.sidebarCategorias = [];
            next();
        });
});

// para renderizar a navbar (e outras pags) condicionalmente (caso o token de auth seja válido)
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.locals.user = null;
        return next();
    }
    try {
        const payload = jwt.verify(token, SEGREDO);
        res.locals.user = payload;
        req.user = payload;
        req.token = token;
        req.api = axios.create({headers: {Authorization: `Bearer ${token}`}});
    } catch (err) {
        res.locals.user = null;
    }
    next();
});

// Rotas
app.use('/', clientRoutes);
app.use('/', adminRoutes);
app.use('/', authRoutes);

// Erro 404
app.use((req, res) => {
    res.status(404).render('error', {
        error: {},
        message: "Página não encontrada"
    });
});

const PORT = 7790;
app.listen(PORT, () => {
    console.log(`Servidor de Interface em http://localhost:${PORT}`);
});