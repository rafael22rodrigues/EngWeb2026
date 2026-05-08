# Dianadecor: Plataforma Web de Gestão Comercial e Venda Online

## Trabalho Prático Engenharia Web 2025/2026

## Autores

- Soraia Filipa RIbeiro Pereira - a106806
- Juliana Sofia Vaz da Silva - a105572
- Rafael Ferreira Rodrigues - a96640

## Setup

### Pré-requisitos / Dependências
- Docker

O projeto corre em containers (Node.js + MongoDB) conforme definido em `docker-compose.yml`.

### Variáveis de ambiente
As variáveis são lidas a partir de ficheiros `.env` (via `env_file` no `docker-compose.yml`).

- `NIF_API_KEY` -> definir em `api_auth/.env`
- `JWT_SECRET` -> definir em `api_auth/.env`, `api_dados/.env` e `interface/.env`

Nota: recomenda-se que o valor de `JWT_SECRET` seja o mesmo nos 3 serviços para que a validação de tokens seja consistente.

### Executar com Docker
Na pasta do projeto (onde está o `docker-compose.yml`), correr:

```
docker compose up --build -d
```

Comandos úteis:

```
# Ver logs
docker compose logs -f

# Parar serviços
docker compose down
```
