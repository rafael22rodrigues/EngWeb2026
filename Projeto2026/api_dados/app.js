const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const nomeBD = "dianadecor";
const PORT = process.env.PORT || 7789;
const mongoHost = process.env.MONGO_URL || `mongodb://127.0.0.1:27017/${nomeBD}`;

const produtoRouter = require('./routers/produtoRouter');
const encomendaRouter = require('./routers/encomendaRouter');
const corRouter = require('./routers/corRouter');
const categoriaRouter = require('./routers/categoriaRouter');
const carrinhoRouter = require('./routers/carrinhoRouter');
const wishlistRouter = require('./routers/wishlistRouter');

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public')));

mongoose.connect(mongoHost)
    .then(() => console.log(`MongoDB: liguei-me à base de dados ${nomeBD}.`))
    .catch(err => console.error('Erro:', err));

app.use('/', produtoRouter);
app.use('/', encomendaRouter);
app.use('/', corRouter);
app.use('/', categoriaRouter);
app.use('/', carrinhoRouter);
app.use('/', wishlistRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.listen(PORT, function() {
    console.log('Servidor à escuta na porta ' + PORT);
})