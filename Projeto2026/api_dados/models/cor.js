const mongoose = require('mongoose')

const corSchema = new mongoose.Schema({
    _id: {type: String},
    label: {type: String, required: true}
})

const Cor = mongoose.model('Cor', corSchema, 'cores');

module.exports = Cor;

