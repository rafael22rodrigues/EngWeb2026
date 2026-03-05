# EngWeb2026
##  Filmes de Cinema (Versão MongoDB)
### Autor

<img src="rafael.jpg" alt="Foto do autor" width="120">

- **ID:** a96640 
- **Nome:** Rafael Ferreira Rodrigues
- **UC:** Engenharia Web

### Resumo

Nesta versão extra do TPC5, aprendi a listar, registos numa API de dados através do módulo Express e também através do MongoDB

### Resultados
Estando aberto na diretoria do TPC5, executar o programa em python jsonConvert.py , que deixa o dataset mais legível para trabalhar, criando um _id para os filmes (que será útil no MongoDB)

Depois de instalar o mongoDB no computador importe o ficheiro .json gerado no programa python para base de dados json (a base de dados e a coleção chamam-se "cinema")

Para executar o site, num outro terminal na pasta TPC5_mongoDB, inserir o comando:

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

NOTA: Desta vez é possível através da página dos atores e dos géneros, ao clicar na linha de um filme, ir para a página desse filme, e o mesmo acontece se clicar num 
dos géneros ou atores do filme, que se é redirecionado para a página do mesmo género ou ator