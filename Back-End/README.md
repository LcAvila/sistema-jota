# E-commerce Backend (Node.js + Express + PostgreSQL)

Backend para o projeto de e-commerce, feito em Node.js, Express, TypeScript e PostgreSQL usando Prisma ORM.

## Como usar

1. Copie `.env.example` para `.env` e configure o banco e JWT.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicialize o banco:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Rode o servidor:
   ```bash
   npm run dev
   ```

## Estrutura
- `src/` - Código-fonte
- `prisma/` - Schema do banco

## Endpoints principais
- `/api/health` - Teste de saúde
- `/api/products` - Produtos
- `/api/orders` - Pedidos
- `/api/users` - Usuários
- `/api/auth` - Login e registro
