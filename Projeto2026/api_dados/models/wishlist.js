const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    _id: { type: String}, // = ao userId
    produtos: [{
        produtoId: {type: String,required: true},
        adicionadoEm: {type: Date, default: Date.now}
    }]
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;