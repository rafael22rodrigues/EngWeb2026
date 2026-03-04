# EngWeb2026
##  Filmes de Cinema 
### Autor

<img src="rafael.jpg" alt="Foto do autor" width="120">

- **ID:** a96640 
- **Nome:** Rafael Ferreira Rodrigues
- **UC:** Engenharia Web

### Resumo

Neste trabalho, aprendi a listar, registos numa API de dados através do módulo Express

### Resultados
Estando aberto na diretoria do TPC5, executar o programa em python jsonConvert.py , que deixa o dataset mais legível para trabalhar, criando um id para os filmes e
cria a coleção atores e generos que serão úteis para fazer as páginas dos mesmos

Depois de instalar o json-server, num terminal da diretoria transformar o ficheiro .json (dataset) num servidor json-server, através do comando:

json-server --watch novo_cinema.json

Para o executar, num outro terminal na pasta onde está o código, inserir o comando:

npm i

Depois de acabada a instalação, num outro terminal execute:

npm run start

O Resultado estará nos seguints links:

http://localhost:3007/ / http://localhost:3007/filmes -> estarão os filmes listados com o id criado, o título, o ano, a quantidade de géneros e o número de atores no elenco

http://localhost:3007/filmes/:id -> A página do filme que lista todas as informações disponíveis o que ínclui os atores e os géneros

http://localhost:3007/atores -> estarão os atores listados com o id criado, o nome e a quantidade de filmes em que já atuaram

http://localhost:3007/atores/:id -> A página do ator que lista todos os filmes em que o mesmo atuou

http://localhost:3007/generos -> estarão listados os géneros presentes nos filmes, com o id criado, o nome, e a quantidade de filmes que existem desse mesmo género

http://localhost:3007/generos/:id -> A página do género que lista todos os filmes que são do determinado género