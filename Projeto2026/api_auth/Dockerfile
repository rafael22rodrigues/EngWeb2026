# 1. Imagem base ultra-leve (Node.js 22 sobre Alpine Linux)
FROM node:22-alpine

# 2. Definir o diretório de trabalho
WORKDIR /usr/src/app

# 3. Copiar os ficheiros de dependências
COPY package*.json ./

# 4. Instalar as dependências
# Usamos 'npm ci' para instalações mais rápidas e fiáveis em ambientes de CI/Docker
RUN npm install

# 5. Copiar o código fonte
COPY . .

# 6. Expor a porta definida no docker-compose (7791)
EXPOSE 7791

# 7. Iniciar a aplicação
CMD [ "node", "app.js" ]