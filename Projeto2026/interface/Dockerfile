# 1. Imagem base estável e leve
FROM node:22-alpine

# 2. Definir o diretório de trabalho no contentor
WORKDIR /interface

# 3. Copiar os ficheiros de dependências primeiro
# Isto permite aproveitar a cache do Docker se não mudares o package.json
COPY package*.json ./

# 4. Instalar as dependências do projeto
RUN npm install

# 5. Copiar o código fonte e pastas (views, public, etc.)
COPY . .

# 6. Expor a porta definida para o serviço aplicacional
EXPOSE 3002

# 7. Comando para iniciar o servidor
# O Node irá ler as variáveis de ambiente definidas no docker-compose
CMD ["node", "app_interface.js"]