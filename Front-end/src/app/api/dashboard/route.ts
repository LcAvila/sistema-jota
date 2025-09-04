import { NextRequest, NextResponse } from 'next/server';

// Função para calcular estatísticas com dados de exemplo
function calculateStats() {
  // Dados de exemplo para demonstração
  const vendas = [
    { id: 1, cliente: 'João Silva', total: 45.50, forma: 'PIX', vendedor: 'Maria', createdAt: '2024-01-15' },
    { id: 2, cliente: 'Ana Costa', total: 32.00, forma: 'Cartão', vendedor: 'Pedro', createdAt: '2024-01-15' },
    { id: 3, cliente: 'Carlos Lima', total: 78.90, forma: 'Dinheiro', vendedor: 'Maria', createdAt: '2024-01-14' },
    { id: 4, cliente: 'Fernanda Santos', total: 25.00, forma: 'PIX', vendedor: 'João', createdAt: '2024-01-14' },
    { id: 5, cliente: 'Roberto Alves', total: 120.00, forma: 'Cartão', vendedor: 'Pedro', createdAt: '2024-01-13' },
    { id: 6, cliente: 'Patrícia Oliveira', total: 67.80, forma: 'PIX', vendedor: 'Maria', createdAt: '2024-01-13' },
    { id: 7, cliente: 'Lucas Ferreira', total: 89.90, forma: 'Dinheiro', vendedor: 'João', createdAt: '2024-01-12' },
    { id: 8, cliente: 'Juliana Martins', total: 45.00, forma: 'Cartão', vendedor: 'Pedro', createdAt: '2024-01-12' },
    { id: 9, cliente: 'Ricardo Souza', total: 156.70, forma: 'PIX', vendedor: 'Maria', createdAt: '2024-01-11' },
    { id: 10, cliente: 'Camila Rodrigues', total: 34.50, forma: 'Dinheiro', vendedor: 'João', createdAt: '2024-01-11' }
  ];

  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Filtrar vendas por período
  const vendas7d = vendas.filter(v => new Date(v.createdAt) >= last7Days);
  const vendas30d = vendas.filter(v => new Date(v.createdAt) >= last30Days);
  
  // Calcular totais
  const totalRevenue = vendas.reduce((sum, v) => sum + (v.total || 0), 0);
  const totalOrders = vendas.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Análise por canal usando os novos campos
  const channelData = {
    web: vendas.filter(v => v.canal === 'Website').length,
    local: vendas.filter(v => v.canal === 'Local').length,
    whatsapp: vendas.filter(v => v.canal === 'WhatsApp').length
  };
  
  // Análise por forma de pagamento com as novas opções
  const paymentData = {
    pix: vendas.filter(v => v.forma === 'PIX').length,
    credit: vendas.filter(v => v.forma === 'Cartão de Crédito').length,
    debit: vendas.filter(v => v.forma === 'Cartão de Débito').length,
    cash: vendas.filter(v => v.forma === 'Dinheiro').length
  };
  
  // Top produtos (simulado)
  const topProducts = [
    { id: 1, name: "Pão de Queijo", category: "Pães", salesCount: 156, revenue: 2340.00 },
    { id: 2, name: "Brigadeiro", category: "Doces", salesCount: 134, revenue: 2010.00 },
    { id: 3, name: "Coxinha", category: "Salgados", salesCount: 98, revenue: 1470.00 }
  ];
  
  // Top vendedores
  const sellerStats = vendas.reduce((acc: any, v) => {
    const seller = v.vendedor || 'Não informado';
    if (!acc[seller]) {
      acc[seller] = { sales: 0, revenue: 0 };
    }
    acc[seller].sales += 1;
    acc[seller].revenue += v.total || 0;
    return acc;
  }, {});
  
  const topSellers = Object.entries(sellerStats)
    .map(([name, stats]: [string, any]) => ({
      id: name,
      name,
      sales: stats.sales,
      revenue: stats.revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  // Vendas diárias dos últimos 7 dias
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayVendas = vendas7d.filter(v => 
      v.createdAt && v.createdAt.startsWith(dateStr)
    );
    return {
      date: dateStr,
      total: dayVendas.reduce((sum, v) => sum + (v.total || 0), 0),
      orders: dayVendas.length
    };
  });
  
  // Análise regional (simulada baseada na região da loja)
  const regionalData = [
    { region: 'Jacutinga', sales: Math.floor(vendas.length * 0.4), revenue: totalRevenue * 0.4 },
    { region: 'Mesquita', sales: Math.floor(vendas.length * 0.35), revenue: totalRevenue * 0.35 },
    { region: 'Nova Iguaçu', sales: Math.floor(vendas.length * 0.25), revenue: totalRevenue * 0.25 }
  ];
  
  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    totalCustomers: new Set(vendas.map(v => v.cliente)).size,
    topProducts,
    topSellers,
    recentSales: vendas.slice(0, 10).map(v => ({
      id: v.id,
      date: v.createdAt,
      total: v.total,
      channel: v.canal === 'Website' ? 'web' : v.canal === 'WhatsApp' ? 'whatsapp' : 'local',
      paymentMethod: v.forma === 'PIX' ? 'pix' : v.forma === 'Cartão de Crédito' ? 'credit' : v.forma === 'Cartão de Débito' ? 'debit' : 'cash',
      customerRegion: v.endereco ? 'Jacutinga' : 'Não informado',
      vendedor: v.vendedor,
      cliente: v.cliente,
      telefone: v.telefone,
      cep: v.cep,
      endereco: v.endereco,
      itens: v.itens
    })),
    salesData: {
      daily: dailyData,
      weekly: [],
      monthly: [],
      yearly: []
    },
    channelData,
    paymentData,
    regionalData
  };
}

export async function GET(request: NextRequest) {
  try {
    // Usar dados de exemplo para demonstração
    const stats = calculateStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
