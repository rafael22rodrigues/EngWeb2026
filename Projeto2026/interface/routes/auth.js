const express = require('express');
const axios = require('axios');

const router = express.Router();
const API_URL = process.env.API_URL || "http://localhost:7789";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:7791";

router.get('/login', (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const error = null;
    if (req.query.error) {
        error = 'Credenciais inválidas. Tente novamente.';
    }
    res.render('auth/login', { date: d, error });
});

router.get('/signup', (req, res) => {
    const d = new Date().toISOString().substring(0, 16);
    const error = null;
    if (req.query.error) {
        error = 'Erro ao registar. Tente novamente.';
    }
    res.render('auth/signup', { date: d });
});

router.get('/logout',  (req, res) => {
    axios.get(AUTH_URL + '/logout')
        .then(() => {
            res.clearCookie('token');
            res.redirect('/');
        })
        .catch(() => {
            res.clearCookie('token');
            res.redirect('/');
        });
});

router.post('/login', async (req, res) => {
    try {
        const {email,password } = req.body;
        console.log('Login attempt:', email, "password:", password);
        const response = await axios.post(AUTH_URL + '/login', { email, password });
        if (response.status !== 200) {
            res.redirect('/login?error=1');
            return;
        }
        res.cookie('token', response.data.token, { httpOnly: true });
        res.redirect('/'); // vai para home
    } catch (error) {
        res.render('auth/login', { error: error.response?.data?.message || 'Credenciais inválidas. Tente novamente.' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { nome, email, telefone, nif, password } = req.body;
        const response = await axios.post(AUTH_URL + '/users', {
            nome, email, telefone, nif, password, tipo: 'cliente'
        });
        if (response.status !== 201) {
            res.redirect('/signup?error=1');
            return;
        }
        res.redirect('/login'); // vai para login
    } catch (error) {
        res.render('auth/signup', { error: error.response?.data?.message || 'Erro ao registar. Tente novamente.' });
    }
});

module.exports = router;