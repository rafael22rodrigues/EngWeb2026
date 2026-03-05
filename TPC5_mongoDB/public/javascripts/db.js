const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';

// Nome do banco de dados que você vai usar
const dbName = 'cinema';

// Cria uma nova instância do MongoClient
const client = new MongoClient(uri);

let dbConnection;

async function connectToDatabase() {
    if (!dbConnection) {
        await client.connect();
        console.log('Conectado ao MongoDB');
        dbConnection = client.db(dbName);
    }
    return dbConnection;
}

module.exports = { connectToDatabase };