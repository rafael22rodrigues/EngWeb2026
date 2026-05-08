const express = require('express');
const router = express.Router();
const corController = require('../controllers/corController'); 
const auth = require('../auth/auth');

// Novo cor
router.post('/cores', auth.verificaAcesso, auth.verificaAdmin, corController.createCor);

// Listar cors
router.get('/cores', corController.getAllCores);

// Apagar um cor
router.delete('/cores/:id', auth.verificaAcesso, auth.verificaAdmin, corController.deleteCor);

module.exports = router;

