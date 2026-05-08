const express = require('express');
const router = express.Router();
const encomendaController = require('../controllers/encomendaController'); 
const auth = require('../auth/auth');

// Nova encomenda
router.post('/encomendas', auth.verificaAcesso, encomendaController.createEncomenda);

// Listar encomendas
router.get('/encomendas', auth.verificaAcesso, encomendaController.getAllEncomendas);

// Estatisticas
router.get('/encomendas/stats', auth.verificaAcesso, auth.verificaAdmin,  encomendaController.getStats);

// Detalhes de uma encomenda
router.get('/encomendas/:id', auth.verificaAcesso, encomendaController.getEncomendaById);

// Alterar uma encomenda
router.put('/encomendas/:id',  auth.verificaAcesso, auth.verificaAdmin, encomendaController.updateEncomenda);

// Apagar uma encomenda
router.delete('/encomendas/:id', auth.verificaAcesso, auth.verificaAdmin, encomendaController.deleteEncomenda);

// concluir encomenda
router.post('/encomendas/:id/concluir', auth.verificaAcesso, auth.verificaAdmin, encomendaController.concluirEncomenda);

// cancelar encomenda
router.post('/encomendas/:id/cancelar', auth.verificaAcesso, auth.verificaAdmin, encomendaController.cancelarEncomenda);

module.exports = router;

