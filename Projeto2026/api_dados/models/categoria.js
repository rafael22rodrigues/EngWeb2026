const mongoose = require('mongoose')

const categoriaSchema = new mongoose.Schema({
    _id: {type: String},
    label: {type: String, required: true}
})

const Categoria = mongoose.model('Categoria', categoriaSchema, 'categorias');

module.exports = Categoria;
