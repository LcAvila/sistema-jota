// Teste simples para verificar se o servidor está funcionando
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Teste básico
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// Produtos de teste
app.get('/api/products', (req, res) => {
  const products = [
    {
      id: 1,
      name: "Alho Descascado 1kg",
      price: 15.90,
      category: { name: "Temperos" },
      active: true,
      stock: 50
    },
    {
      id: 2,
      name: "Azeite Extra Virgem",
      price: 19.90,
      category: { name: "Temperos" },
      active: true,
      stock: 25
    }
  ];
  
  console.log('✅ Produtos solicitados');
  res.json(products);
});

// Vendas de teste
let sales = [];

app.post('/api/sales', (req, res) => {
  console.log('📦 Recebendo venda:', req.body);
  
  const newSale = {
    id: Date.now(),
    cliente: req.body.cliente?.name || 'Cliente Teste',
    total: 100.00,
    data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
    forma: 'PIX',
    vendedor: 'Admin Sistema',
    itens: ['1x Produto Teste']
  };
  
  sales.unshift(newSale);
  console.log('✅ Venda salva:', newSale);
  
  res.status(201).json({
    success: true,
    message: 'Venda criada com sucesso',
    sale: newSale
  });
});

app.get('/api/public/recent-orders', (req, res) => {
  console.log('📊 Relatórios solicitados');
  res.json({
    success: true,
    data: sales,
    total: sales.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📍 Teste: http://localhost:${PORT}/api/health`);
});
