# EngWeb2026
##  Filmes de Cinema
### Autor

<img src="rafael.jpg" alt="Foto do autor" width="120">

- **ID:** a96640
- **Nome:** Rafael Ferreira Rodrigues
- **UC:** Engenharia Web

### Resumo

Neste trabalho, criei uma API de dados minimalista sobre as 3 coleções que extraí do dataset cinema.json, isolei os serviços em conteiners docker, 
criei uma interface e o seu docker para usar a API e no final orquestrei tudo num docker compose;

### Resultados
Estando aberto na diretoria do TPC6, executar o programa em python jsonConvert.py , que cria as coleções filmes e, atores 
e generos que serão úteis para fazer as páginas dos mesmos

Depois de instalar o docker, num terminal executa:

docker compose up -d --build

O Resultado estará nos seguints links:

http://localhost:7790/filmes -> estarão os filmes listados com o id criado, o título, o ano, a quantidade de géneros e o número de atores no elenco

http://localhost:7790/filmes/:id -> A página do filme que lista todas as informações disponíveis o que ínclui os atores e os géneros

http://localhost:7790/atores -> estarão os atores listados com o id criado, o nome e a quantidade de filmes em que já atuaram

http://localhost:7790/atores/:id -> A página do ator que lista todos os filmes em que o mesmo atuou

http://localhost:7790/generos -> estarão listados os géneros presentes nos filmes, com o id criado, o nome, e a quantidade de filmes que existem desse mesmo género

http://localhost:7790/generos/:id -> A página do género que lista todos os filmes que são do determinado género

NOTA: As versões em JSON estão em http://localhost:7789/:(componente de url acima)