# EngWeb2026
##  Criação de API de dados 
### Autor

<img src="rafael.jpg" alt="Foto do autor" width="120">

- **ID:** a96640 
- **Nome:** Rafael Ferreira Rodrigues
- **UC:** Engenharia Web

### Resumo

Neste trabalho, o código que criei, cria um servidor HTTP em Node.js com tabelas html a partir de um outro servidor ao qual acede aos dados pelas rotas que foram definidas nesse outro servidor

### Resultados

Depois de instalar o json-server, transformar o ficheiro .json (dataset) num servidor json-server, através do comando:

json-server --watch db.json

Para o executar, no terminal na pasta onde está o código, inserir o comando:

npm i axios

Depois, num terminal execute o ficheiro serverUtil.js:

node serverUtil.js

E noutro terminal execute o ficheiro serverApp.js

node serverApp.js

O Resultado estará nos seguints links:

http://localhost:7777/
http://localhost:7777/alunos
http://localhost:7777/instrumentos
http://localhost:7777/cursos