import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardFilterOptions = async (req: Request, res: Response) => {
  try {
    const sellers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // O canal de venda ainda não está no banco, então será uma lista estática por enquanto.
    const channels = [
      { id: 'app', name: 'App' },
      { id: 'pos', name: 'Balcão' },
      { id: 'delivery', name: 'Delivery' },
    ];

    res.json({ sellers, paymentMethods, channels });
  } catch (error) {
    console.error('Failed to fetch dashboard filter options:', error);
    res.status(500).json({ message: 'Failed to fetch filter options' });
  }
};

export const getDashboardMetrics = async (req: Request, res: Response) => {
  const { from, to, sellerId, paymentMethod } = req.query;

  const where: Prisma.OrderWhereInput = {};
  const dateFilter: Prisma.DateTimeFilter = {};

  if (from) {
    dateFilter.gte = new Date(from as string);
  }
  if (to) {
    dateFilter.lte = new Date(to as string);
  }
  if (from || to) {
    where.createdAt = dateFilter;
  }
  if (sellerId) {
    where.sellerId = parseInt(sellerId as string, 10);
  }

  // Filtro específico para formas de pagamento
  const paymentWhere: Prisma.OrderPaymentWhereInput = {};
  if (paymentMethod) {
    paymentWhere.paymentMethod = { name: paymentMethod as string };
    where.orderPayments = {
      some: paymentWhere,
    };
  }

  try {
    // 1. KPIs Principais
    const completedOrdersWhere = { ...where, status: 'Concluído' };
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: completedOrdersWhere,
    });
    const totalOrders = await prisma.order.count({ where: completedOrdersWhere });
    const canceledOrders = await prisma.order.count({ where: { ...where, status: 'Cancelado' } });

    const totalRevenue = totalRevenueResult._sum.total?.toNumber() || 0;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Top 5 Produtos
    const topProductsResult = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { qty: true },
      where: { order: completedOrdersWhere },
      orderBy: { _sum: { qty: 'desc' } },
      take: 5,
    });
    const productIds = topProductsResult.map(p => p.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const topProducts = topProductsResult.map(item => {
      const product = products.find(p => p.id === item.productId);
      return { key: product?.name || 'Produto não encontrado', value: item._sum.qty || 0 };
    });

    // 3. Formas de Pagamento
    const paymentMethodsResult = await prisma.orderPayment.groupBy({
        by: ['paymentMethodId'],
        _count: { id: true },
        where: { order: completedOrdersWhere },
    });
    const paymentMethodIds = paymentMethodsResult.map(p => p.paymentMethodId);
    const paymentMethods = await prisma.paymentMethod.findMany({ where: { id: { in: paymentMethodIds } } });
    const paymentMethodData = paymentMethodsResult.map(item => {
        const paymentMethod = paymentMethods.find(p => p.id === item.paymentMethodId);
        return { key: paymentMethod?.name || 'Não identificado', value: item._count.id };
    });

    // 4. Ranking de Vendedores
    const sellerRankingResult = await prisma.order.groupBy({
      by: ['sellerId'],
      _sum: { total: true },
      where: completedOrdersWhere,
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });
    const sellerIds = sellerRankingResult.map(s => s.sellerId);
    const sellers = await prisma.user.findMany({ where: { id: { in: sellerIds } } });
    const sellerRankingData = sellerRankingResult.map(item => {
      const seller = sellers.find(s => s.id === item.sellerId);
      return { key: seller?.name || 'Vendedor não encontrado', value: item._sum.total?.toNumber() || 0 };
    });

    // 5. Vendas Recentes
    const recentSales = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        client: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        orderPayments: { include: { paymentMethod: true } },
      },
    });

    res.status(200).json({
      totalRevenue,
      totalOrders,
      averageTicket,
      canceledOrders,
      topProducts,
      paymentMethodData,
      sellerRankingData,
      recentSales: recentSales.map(sale => ({
        ...sale,
        // O campo 'channel' não existe no schema.prisma atual.
        channel: 'N/A',
        payments: sale.orderPayments.map(p => ({ method: p.paymentMethod.name, amount: p.amount.toNumber() }))
      })),
      // O gráfico de evolução de vendas e vendas por canal precisam ser implementados.
      salesChart: [], 
      salesChannelData: [],
    });

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ message: 'Erro ao buscar métricas do dashboard' });
  }
};
