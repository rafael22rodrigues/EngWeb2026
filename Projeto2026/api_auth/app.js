const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');


const nomeBD = "dianadecor";
const PORT = process.env.PORT || 7791;
const mongoHost = process.env.MONGO_URL || `mongodb://127.0.0.1:27017/${nomeBD}`;

const userRouter = require('./routers/userRouter');

app.use(express.json());

mongoose.connect(mongoHost)
    .then(() => console.log(`MongoDB: liguei-me à base de dados ${nomeBD}.`))
    .catch(err => console.error('Erro:', err));

app.use('/', userRouter);
app.use('/auth-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.listen(PORT, function() {
    console.log('Servidor à escuta na porta ' + PORT);
})