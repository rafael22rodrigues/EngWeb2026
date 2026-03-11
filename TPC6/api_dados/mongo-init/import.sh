#!/bin/bash
# Importa o JSON para a base de dados pubs2, coleção pubs

mongoimport --host localhost --db cinema --collection filmes --type json --file /docker-entrypoint-initdb.d/filmes.json --jsonArray
mongoimport --host localhost --db cinema --collection atores --type json --file /docker-entrypoint-initdb.d/atores.json --jsonArray
mongoimport --host localhost --db cinema --collection generos --type json --file /docker-entrypoint-initdb.d/generos.json --jsonArray

# Cria o índice de texto necessário para o parâmetro ?q= funcionar

mongosh cinema --eval 'db.filmes.createIndex({title: "text", cast: "text", genres: "text"})'
mongosh cinema --eval 'db.atores.createIndex({nome: "text", filmes: "text"})'
mongosh cinema --eval 'db.generos.createIndex({nome: "text", filmes: "text"})'