const mongoose = require('mongoose');

const carrinhoSchema = new mongoose.Schema({
    _id: { type: String }, // = ao userId
    produtos: [{
        produtoId: {type: String,required: true},
        sku: {type: String, required: true},
        quantidade: {type: Number, required: true},
        adicionadoEm: {type: Date, default: Date.now}
    }]
});

const Carrinho = mongoose.model('Carrinho', carrinhoSchema);
module.exports = Carrinho;