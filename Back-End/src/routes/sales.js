const express = require('express');
const router = express.Router();

// Simulação de banco de dados em memória para vendas (usando produtos reais)
let sales = [
  {
    id: 1,
    cliente: 'João Silva',
    total: 150.50,
    data: '15/01/2024',
    createdAt: '2024-01-15T10:30:00Z',
    forma: 'Cartão de Crédito',
    vendedor: 'Maria Santos',
    itens: ['2x Alho Descascado 1kg', '1x Azeite Extra Virgem']
  },
  {
    id: 2,
    cliente: 'Ana Costa',
    total: 89.99,
    data: '14/01/2024',
    createdAt: '2024-01-14T14:20:00Z',
    forma: 'PIX',
    vendedor: 'João Oliveira',
    itens: ['1x Carne Seca 5kg', '3x Caldo de Galinha Concentrado']
  },
  {
    id: 3,
    cliente: 'Carlos Lima',
    total: 234.75,
    data: '13/01/2024',
    createdAt: '2024-01-13T16:45:00Z',
    forma: 'Cartão de Débito',
    vendedor: 'Maria Santos',
    itens: ['1x Linguiça Calabresa 5kg', '2x Massa de Lasanha 2kg', '1x Azeitona Verde Especial']
  }
];

// GET /api/sales - Listar todas as vendas
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: sales,
      total: sales.length
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// GET /api/public/recent-orders - Endpoint público para relatórios
router.get('/public/recent-orders', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const recentSales = sales
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    
    res.json({
      success: true,
      data: recentSales,
      total: recentSales.length
    });
  } catch (error) {
    console.error('Erro ao buscar vendas recentes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// POST /api/sales - Criar nova venda
router.post('/', (req, res) => {
  try {
    const { cliente, items, paymentMethodId, notes, vendedor } = req.body;
    
    if (!cliente || !cliente.name) {
      return res.status(400).json({
        success: false,
        message: 'Nome do cliente é obrigatório'
      });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pelo menos um item é obrigatório'
      });
    }
    
    // Calcular total
    const total = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    // Mapear forma de pagamento
    const formasPagamento = {
      1: 'PIX',
      2: 'Dinheiro', 
      3: 'Cartão de Crédito',
      4: 'Cartão de Débito'
    };
    
    // Criar nova venda
    const newSale = {
      id: Date.now(), // Usar timestamp para ID único
      cliente: cliente.name,
      total: total,
      data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      forma: formasPagamento[paymentMethodId] || 'PIX',
      vendedor: vendedor || 'Admin Sistema',
      itens: items.map(item => {
        const productName = item.productName || `Produto ID ${item.productId}`;
        return `${item.quantity}x ${productName}`;
      }),
      notes: notes || null
    };
    
    // Adicionar à lista
    sales.unshift(newSale);
    
    // Manter apenas as últimas 1000 vendas
    if (sales.length > 1000) {
      sales = sales.slice(0, 1000);
    }
    
    console.log(`✅ Nova venda criada: ${newSale.cliente} - R$ ${newSale.total.toFixed(2)} - ${newSale.vendedor}`);
    
    res.status(201).json({
      success: true,
      message: 'Venda criada com sucesso',
      sale: newSale
    });
    
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// GET /api/dashboard - Dados para o dashboard
router.get('/dashboard', (req, res) => {
  try {
    const { from, to, sellerId, paymentMethod } = req.query;
    
    let filteredSales = [...sales];
    
    // Aplicar filtros se fornecidos
    if (from) {
      const fromDate = new Date(from);
      filteredSales = filteredSales.filter(sale => 
        new Date(sale.createdAt) >= fromDate
      );
    }
    
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999); // Incluir o dia todo
      filteredSales = filteredSales.filter(sale => 
        new Date(sale.createdAt) <= toDate
      );
    }
    
    if (sellerId) {
      filteredSales = filteredSales.filter(sale => 
        sale.vendedor.toLowerCase().includes(sellerId.toLowerCase())
      );
    }
    
    if (paymentMethod) {
      filteredSales = filteredSales.filter(sale => 
        sale.forma.toLowerCase().includes(paymentMethod.toLowerCase())
      );
    }
    
    // Calcular métricas
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = filteredSales.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const canceledOrders = 0; // Por enquanto zero, implementar depois
    
    // Top produtos (baseado nos itens das vendas)
    const productCount = {};
    filteredSales.forEach(sale => {
      sale.itens.forEach(item => {
        // Extrair nome do produto do formato "2x Nome do Produto"
        const productName = item.replace(/^\d+x\s*/, '');
        productCount[productName] = (productCount[productName] || 0) + 1;
      });
    });
    
    // Top vendedores (ranking por faturamento)
    const sellerStats = {};
    filteredSales.forEach(sale => {
      const vendedor = sale.vendedor;
      if (!sellerStats[vendedor]) {
        sellerStats[vendedor] = { total: 0, vendas: 0 };
      }
      sellerStats[vendedor].total += sale.total;
      sellerStats[vendedor].vendas += 1;
    });
    
    const topProducts = Object.entries(productCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([key, value]) => ({ key, value }));
    
    // Dados por forma de pagamento
    const paymentMethodCount = {};
    filteredSales.forEach(sale => {
      paymentMethodCount[sale.forma] = (paymentMethodCount[sale.forma] || 0) + 1;
    });
    
    const paymentMethodData = Object.entries(paymentMethodCount)
      .map(([key, value]) => ({ key, value }));
    
    // Ranking de vendedores (usar dados já calculados)
    const sellerRankingData = Object.entries(sellerStats)
      .sort(([,a], [,b]) => b.total - a.total)
      .map(([key, stats]) => ({ 
        key, 
        value: Math.round(stats.total),
        vendas: stats.vendas,
        ticketMedio: Math.round(stats.total / stats.vendas)
      }));
    
    // Vendas recentes (últimas 10)
    const recentSales = filteredSales
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(sale => ({
        id: sale.id,
        cliente: sale.cliente,
        total: sale.total,
        forma: sale.forma,
        data: sale.data,
        vendedor: sale.vendedor
      }));
    
    // Gráfico de vendas por dia (últimos 7 dias)
    const salesChart = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTotal = filteredSales
        .filter(sale => sale.createdAt.startsWith(dateStr))
        .reduce((sum, sale) => sum + sale.total, 0);
      
      salesChart.push({
        name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        value: Math.round(dayTotal)
      });
    }
    
    // Canais de venda (simulado)
    const salesChannelData = [
      { key: 'WhatsApp', value: Math.round(totalRevenue * 0.6) },
      { key: 'Presencial', value: Math.round(totalRevenue * 0.3) },
      { key: 'Online', value: Math.round(totalRevenue * 0.1) }
    ];
    
    res.json({
      totalRevenue,
      totalOrders,
      averageTicket,
      canceledOrders,
      topProducts,
      paymentMethodData,
      sellerRankingData,
      recentSales,
      salesChart,
      salesChannelData
    });
    
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// GET /api/dashboard/filters - Opções para filtros
router.get('/dashboard/filters', (req, res) => {
  try {
    // Extrair vendedores únicos
    const sellers = [...new Set(sales.map(sale => sale.vendedor))]
      .map((name, index) => ({ id: index + 1, name }));
    
    // Formas de pagamento
    const paymentMethods = [
      { id: 1, name: 'PIX' },
      { id: 2, name: 'Dinheiro' },
      { id: 3, name: 'Cartão de Crédito' },
      { id: 4, name: 'Cartão de Débito' }
    ];
    
    // Canais (simulado)
    const channels = [
      { id: 'whatsapp', name: 'WhatsApp' },
      { id: 'presencial', name: 'Presencial' },
      { id: 'online', name: 'Online' }
    ];
    
    res.json({
      sellers,
      paymentMethods,
      channels
    });
    
  } catch (error) {
    console.error('Erro ao buscar opções de filtro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
