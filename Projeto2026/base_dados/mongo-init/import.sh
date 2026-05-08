#!/bin/bash
mongoimport --host localhost --db dianadecor --collection produtos --file /docker-entrypoint-initdb.d/produtos.json --jsonArray
mongoimport --host localhost --db dianadecor --collection categorias --file /docker-entrypoint-initdb.d/categorias.json --jsonArray
mongoimport --host localhost --db dianadecor --collection cores --file /docker-entrypoint-initdb.d/cores.json --jsonArray
mongoimport --host localhost --db dianadecor --collection users --file /docker-entrypoint-initdb.d/users.json --jsonArray
mongoimport --host localhost --db dianadecor --collection encomendas --file /docker-entrypoint-initdb.d/encomendas.json --jsonArray

mongosh --quiet dianadecor --eval '
db.encomendas.updateMany({ data: { $type: "string" } }, [ { $set: { data: { $toDate: "$data" } } } ] );
db.createCollection("carrinhos");
db.createCollection("wishlists");
'