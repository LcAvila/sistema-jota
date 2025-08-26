import { NextResponse } from 'next/server';

// Simula a busca de dados do banco de dados com base nos filtros
const getDashboardData = async (filters: any) => {
  console.log('Fetching data with filters:', filters);

  // Lógica de simulação de dados. Em um cenário real, você usaria os filtros
  // para consultar seu banco de dados.
  // Ex: const orders = await prisma.order.findMany({ where: { ... } });

  return {
    totalRevenue: 125430.50,
    totalOrders: 1890,
    averageTicket: 66.36,
    canceledOrders: 45,
    topProducts: [
      { key: 'Produto A', value: 1200 },
      { key: 'Produto B', value: 950 },
      { key: 'Produto C', value: 800 },
      { key: 'Produto D', value: 650 },
      { key: 'Produto E', value: 400 },
    ],
    paymentMethodData: [
      { key: 'PIX', value: 60000 },
      { key: 'Cartão de Crédito', value: 45430.50 },
      { key: 'Dinheiro', value: 20000 },
    ],
    sellerRankingData: [
      { key: 'Vendedor 1', value: 75000 },
      { key: 'Vendedor 2', value: 50430.50 },
    ],
    recentSales: [
      { id: '1', customerName: 'João Silva', amount: 150.00, paymentMethod: 'PIX', date: new Date() },
      { id: '2', customerName: 'Maria Oliveira', amount: 250.50, paymentMethod: 'Cartão de Crédito', date: new Date() },
      { id: '3', customerName: 'Carlos Pereira', amount: 80.00, paymentMethod: 'Dinheiro', date: new Date() },
    ],
    salesChart: [
      { name: 'Jan', value: 12000 },
      { name: 'Fev', value: 15000 },
      { name: 'Mar', value: 18000 },
      { name: 'Abr', value: 17500 },
      { name: 'Mai', value: 21000 },
      { name: 'Jun', value: 23000 },
    ],
    salesChannelData: [
      { key: 'Aplicativo', value: 95430.50 },
      { key: 'Venda Manual', value: 30000 },
    ],
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    sellerId: searchParams.get('sellerId'),
    paymentMethod: searchParams.get('paymentMethod'),
  };

  try {
    const data = await getDashboardData(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
