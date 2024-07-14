# Projeto de pesquisa - Desafio back-end
Este projeto é uma aplicação para gerenciar pesquisas, permitindo a criação de pesquisas, perguntas e respostas, utilizando Node.js, Express e Prisma. Você pode encontrar as requisições do Postman no arquivo **api-collection.json**.

## Pré-requisitos

Antes de começar, você precisará ter o [Docker](https://www.docker.com/get-started) instalado em sua máquina.

## Instalação

Siga os passos abaixo para configurar o projeto:

1. **Clone o repositório:**

   ```bash
   https://github.com/lucas756/desafio-backend
   ```
2. **Instale as dependências:**

   ```bash
   yarn ou npm
   ```
3. **Configure o ambiente:**

   ```bash
   Altere o arquivo ".env.example" para ".env"
   ```
4. **Inicie os serviços com Docker:**

   ```bash
   docker-compose up
   ```
5. **Realize as migrações do Prisma:**

   ```bash
   yarn prisma migrate dev
   ```
6. **Execute a aplicação localmente:**

   ```bash
   yarn dev
   ```
## Testes
Para rodar os testes com Jest, utilize o comando:
   ```bash
   yarn test
   ```
