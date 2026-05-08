const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { create } = require('domain');
const mongoose = require('mongoose');
const { validarNIF } = require('../services/nifService');

// Segredo para o JWT (deve estar no ficheiro .env)
const SEGREDO = process.env.JWT_SECRET || "EngWeb2026-jcr";


const userController = {
    createUser: async (req, res) => {
        try {
            if (!req.body || !req.body.password) {
                return res.status(400).json({ message: 'Dados inválidos.' });
            }

            const { password, ...userData } = req.body;
            if (userData.tipo && userData.tipo === 'admin') { // só um admin pode criar outro admin
                if (!req.user || req.user.tipo !== 'admin') {
                    return res.status(403).json({ 
                        message: 'Acesso negado. Apenas administradores podem criar contas de admin.' 
                    });
                }
            }

            const existe = await User.findOne({ email: req.body?.email });
            if (existe) {
                return res.status(400).json({ message: 'Utilizador com esse email já registado.' });
            }

            const validacaoNIF = await validarNIF(userData.nif);
            if (!validacaoNIF.valid) {
                return res.status(400).json({ message: validacaoNIF.message });
            }

            userData.nif = validacaoNIF.nif;
            
            const salt = await bcrypt.genSalt(10);
            userData.passwordHash = await bcrypt.hash(password, salt);

            const newUser = new User(userData);
            const savedUser = await newUser.save();
            const { passwordHash, ...userSemPswd } = savedUser.toObject();

            // criar carrinho e wishlist vazios para o novo user
            await mongoose.connection.collection('carrinhos').insertOne({_id: savedUser._id.toString(), produtos: []});
            await mongoose.connection.collection('wishlists').insertOne({id: savedUser._id.toString(), produtos: []});

            res.status(201).json({
                message: 'Utilizador criado com sucesso.',
                user: userSemPswd
            });
        } catch (error) {
            res.status(400).json({message: error.message})
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const {tipo, searchField, search, page, limit, sort} = req.query // ****ver page e limit para paginação

            let queryObj = {};

            if (tipo) queryObj.tipo = tipo

            const total = await User.countDocuments(queryObj); // para calcular total de páginas

            if (searchField && search) {
                queryObj[searchField] = {$regex: search.replace(/['"]+/g, '').trim(), $options: 'i'};
            }
            
            let query = User.find(queryObj, {passwordHash: 0}); // remover campo password da resposta
            
            if (sort)  query = query.sort(sort);
            else query = query.sort('nome');

            // paginação
            if (page && limit) {
                const p = Number(page);
                const l = Number(limit);
                query = query.skip((p - 1) * l).limit(l);
            }

            const users = await query.exec();

            const resposta = {
                users,
                total
            }
            res.json(resposta);
        } catch (error) {
            res.status(500).json({message: error.message}) 
        }
    },
    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id, {passwordHash: 0});
            if (!user) {
                return res.status(404).json({message: 'User not found'})
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    updateUser: async (req, res) => {
        try {
            const { tipo, password, ...updateData } = req.body;
            
            if (tipo === 'admin') { // só um admin pode atualizar outro user para admin
                if (!req.user || req.user.tipo !== 'admin') {
                    return res.status(403).json({ 
                        message: 'Acesso negado. Apenas administradores podem atribuir o tipo de admin.'
                    });
                }
            }

            if (updateData.nif) {
                const validacaoNIF = await validarNIF(updateData.nif);
                if (!validacaoNIF.valid) {
                    return res.status(400).json({ message: validacaoNIF.message });
                }
                updateData.nif = validacaoNIF.nif;
            }

            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateData.passwordHash = await bcrypt.hash(password, salt);
            }
            const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
            if (!user) {
                return res.status(404).json({message: 'User not found'})
            }
            else {
                const { passwordHash, ...userSemPswd } = user.toObject();
                res.json(userSemPswd);
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    },
    login: async (email, password) => {
        console.log('LOGIN attempt', { email, password });
        const user = await User.findOne({ email });
        if (!user) throw new Error('Utilizador não encontrado.');
        if (!user.ativo) throw new Error('Conta desativada.');

        const pwdOk = await bcrypt.compare(password, user.passwordHash);
        if (!pwdOk) throw new Error('Password incorreta.');

        const token = jwt.sign({
                id: user._id,
                tipo: user.tipo,
            },
            SEGREDO,
            { expiresIn: '1h' }
        );

        await User.updateOne({ _id: user._id }, { ultimo_acesso: new Date() });

        return {
            token,
            user: { nome: user.nome, tipo: user.tipo }
        };
    },
    deactivateUser: async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {ativo: false}, {new: true});
            if (!user) {
                return res.status(404).json({message: 'User not found'})
            }
            else {
                const { passwordHash, ...userSemPswd } = user.toObject();
                res.json({message: 'Utilizador desativado com sucesso.', user: userSemPswd});
            }
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
};

module.exports = userController;