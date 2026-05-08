const mongoose = require('mongoose')
const API_URL = process.env.API_URL || "http://localhost:7789";

const produtoSchema = new mongoose.Schema({
    _id: {type: String},
    nome: {type: String, required: true},
    categoriaId: {type: String, required: true},
    imagemBase: {type: String, required: true},
    opcoes: {
        cores: [{ 
            _id: String, // Hex
            label: String, 
            imagem: String 
        }],
        tamanhos: [String],
        tampas: [String]
    },
    variantes:[{
        sku: String,
        preco: Number,
        stock: Number,
        vendidos: {type: Number, default: 0},
        atributos: {
            cor: String,
            tamanho: String,
            tampa: String
        }
    }]
})


// adicionar URL da API para as imagens
produtoSchema.set('toJSON', {
  transform: function (doc, ret) {
    if (ret.imagemBase && !ret.imagemBase.startsWith(API_URL)) {
      ret.imagemBase = `${API_URL}/images/${ret.imagemBase}`;
    }

    if (ret.opcoes && Array.isArray(ret.opcoes.cores)) {
      ret.opcoes.cores = ret.opcoes.cores.map((c) => {
        if (c.imagem && !c.imagem.startsWith(API_URL)) {
            c.imagem = `${API_URL}/images/${c.imagem}`;
        }
        return c;
      });
    }

    return ret;
  }
});

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;

