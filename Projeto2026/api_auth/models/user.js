const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    _id: {type: String, default: () => new mongoose.Types.ObjectId().toString()},
    nome: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    telefone: {type: String, required: true},
    passwordHash: {type: String, required: true},
    nif: {type: String, required: true},
    tipo: {type: String, required: true, enum: ['admin', 'cliente']},
    ativo: {type: Boolean, default: true}
})

const User = mongoose.model('User', userSchema);

module.exports = User;

