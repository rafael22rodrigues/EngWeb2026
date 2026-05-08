const mongoose = require('mongoose')

const encomendaSchema = new mongoose.Schema({
    _id: {type: String},
    userId: {type: String, required: true},
    produtos: [{
        _id: false,
        produtoId: {type: String, required: true},
        varianteSku: {type: String, required: true},
        quantidade: {type: Number, required: true}
    }],
    precoTotal: {type: Number, required: true},
    data: {type: Date, default: Date.now},
    estado: {type: String, enum: ['pendente', 'concluida', 'cancelada'], default: 'pendente'}
})

const Encomenda = mongoose.model('Encomenda', encomendaSchema);

module.exports = Encomenda;
 