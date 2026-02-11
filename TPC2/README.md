# EngWeb2026
## Servidor Node.js que obtém dados de reparações via Axios e os apresenta em tabelas HTML com estatísticas. 
### Autor

<img src="rafael.jpg" alt="Foto do autor" width="120">

- **ID:** a96640 
- **Nome:** Rafael Ferreira Rodrigues
- **UC:** Engenharia Web

### Resumo

Neste trabalho, o código que criei, cria um servidor HTTP em Node.js que consome uma API de reparações e gera páginas HTML com tabelas de reparações, intervenções e viaturas, incluindo contagens e agregações dos dados.

### Resultados

Depois de instalar o json-server, transformar o ficheiro .json (dataset) num servidor json-server, através do comando:

json-server --watch dataset_reparacoes.json

Para o executar, no terminal na pasta onde está o código, inserir o comando:

npm i axios

Depois para executar o Script, inserir o comando:

node API_reparacoes.js

O Resultado estará nos seguints links:

http://localhost:7777/reparacoes
http://localhost:7777/intervencoes
http://localhost:7777/viaturas