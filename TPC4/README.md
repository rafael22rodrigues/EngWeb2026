# EngWeb2026
##  Exames Médicos Desportivos 
### Autor

<img src="rafael.jpg" alt="Foto do autor" width="120">

- **ID:** a96640 
- **Nome:** Rafael Ferreira Rodrigues
- **UC:** Engenharia Web

### Resumo

Neste trabalho, aprendi a listar, inserir e a editar registos numa API de dados através dos métodos GET e POST

### Resultados
Estando aberto na diretoria do TPC4, executar o programa em python jsonConvert.py , que deixa o dataset mais legível para trabalhar, que junta o primeiro e último nome, e altera os registos de federado para "Sim" ou "Não" e os resultados para "Aprovado" ou "Rejeitado"

Depois de instalar o json-server, num terminal da diretoria transformar o ficheiro .json (dataset) num servidor json-server, através do comando:

json-server --watch novo_emd.json

Para o executar, num outro terminal na pasta onde está o código, inserir o comando:

npm i

Depois de acabada a instalação, no terminal execute o ficheiro emdAPI.js:

node emdAPI.js

O Resultado estará nos seguints links:

http://localhost:7777/
http://localhost:7777/emd -> responde com uma página principal onde consta uma tabela com os EMD; a tabela apresenta os campos: nome do atleta, data, modalidade,resultado;
Da tabela é possível saltar para a página de um EMD clicando na respetiva linha;
Na parte superior da tabela existem 3 botões, um para ordenar os registos por data de forma decrescente, outro para os ordenar por nome de forma crescente e outro que acede às distribuições por: sexo, modalidade, clube, resultado, federado;

http://localhost:7777/emd/:id -> responde com uma página composta por um card com toda a informação do EMD;
A página do EMD tem um botão "Voltar" no seu rodapé;


http://localhost:7777/emd/stats -> responde com uma página com as distribuições dos registos por: sexo, modalidade, clube, resultado, federado;
http://localhost:7777/emd/registo -> responde com o formulário para recolha dos dados do novo EMD;
http://localhost:7777/emd/editar/:id -> responde com o formulário para edição dos dados do registo selecionado;
http://localhost:7777/emd/apagar/:id -> apaga o registo selecionado e redireciona para a página principal;

Além disso, o servidor tem suporte para as rotas:

POST /emd     -> insere o registo na base de dados e redireciona para a página principal
POST /emd/:id -> altera o registo na base de dados e redireciona para a página principal




