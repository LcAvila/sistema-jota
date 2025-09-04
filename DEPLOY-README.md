# 🚀 Deploy na Vercel - Sistema Jota

## 📋 Pré-requisitos

1. **Conta na Vercel** - [vercel.com](https://vercel.com)
2. **Conta no Supabase** - [supabase.com](https://supabase.com)
3. **Repositório no GitHub** - Já configurado ✅

## 🔧 Configuração do Supabase

### 1. Criar Projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote as credenciais:
  - `Project URL`
  - `anon public key`
  - `service_role secret key`

### 2. Configurar Tabelas
Execute os seguintes comandos SQL no Supabase SQL Editor:

```sql
-- Tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'seller',
  store_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  category_id INTEGER,
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(100),
  sales_channel VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de lojas
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Políticas para produtos (público)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Políticas para categorias (público)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Políticas para pedidos
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email'));

-- Políticas para itens do pedido
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (order_id IN (
    SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

-- Políticas para lojas (público)
CREATE POLICY "Stores are viewable by everyone" ON stores
  FOR SELECT USING (true);
```

## 🚀 Deploy na Vercel

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Selecione o repositório "Jota-Distribuidora"

### 2. Configurar Variáveis de Ambiente
Na Vercel, vá em Settings > Environment Variables e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### 3. Configurar Build Settings
- **Framework Preset:** Next.js
- **Root Directory:** `Front-end`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### 4. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse a URL fornecida

## 🔐 Credenciais de Login

Após o deploy, use estas credenciais:

- **Administrador:** `admin@jota.com` / `admin123`
- **Vendedor:** `vendedor@jota.com` / `vendedor123`
- **Supervisor:** `supervisor@jota.com` / `supervisor123`

## 📱 Funcionalidades

### Admin (`/admin`)
- Dashboard completo
- Gerenciamento de produtos
- Controle de estoque
- Relatórios de vendas
- Configurações do sistema

### Painel Vendedor (`/painel`)
- Visualização de pedidos
- Gerenciamento de status
- Filtros e busca
- Estatísticas de vendas

## 🛠️ Troubleshooting

### Erro de Conexão com Supabase
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se o projeto Supabase está ativo
3. Verifique as políticas RLS

### Erro de Build
1. Verifique se todas as dependências estão instaladas
2. Confirme se o Node.js está na versão correta
3. Verifique os logs de build na Vercel

### Problemas de Autenticação
1. Limpe o localStorage do navegador
2. Verifique se as credenciais estão corretas
3. Confirme se o sistema de autenticação está funcionando

## 📞 Suporte

Para problemas ou dúvidas:
- Verifique os logs da Vercel
- Consulte a documentação do Supabase
- Verifique o console do navegador para erros

---

**Status:** ✅ Pronto para Deploy
**Última Atualização:** $(date)
