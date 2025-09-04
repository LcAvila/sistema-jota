import { Request, Response } from 'express';

export const getDashboardFilterOptions = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with Supabase integration
    const sellers = [
      { id: 1, name: 'Vendedor 1' },
      { id: 2, name: 'Vendedor 2' }
    ];

    const paymentMethods = [
      { id: 1, name: 'Pix' },
      { id: 2, name: 'Cartão de Crédito' },
      { id: 3, name: 'Dinheiro' }
    ];

    const channels = [
      { id: 'online', name: 'Online' },
      { id: 'loja', name: 'Loja Física' },
      { id: 'delivery', name: 'Delivery' }
    ];

    res.json({
      sellers,
      paymentMethods,
      channels
    });
  } catch (error) {
    console.error('Erro ao buscar opções de filtro:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, sellerId, paymentMethodId, channel } = req.query;

    // Mock data - replace with Supabase integration
    const mockData = {
      totalSales: 15000.50,
      totalOrders: 45,
      averageOrderValue: 333.34,
      topProducts: [
        { id: 1, name: 'Produto A', quantity: 25, revenue: 2500.00 },
        { id: 2, name: 'Produto B', quantity: 20, revenue: 2000.00 },
        { id: 3, name: 'Produto C', quantity: 15, revenue: 1500.00 }
      ],
      salesByDay: [
        { date: '2024-01-01', sales: 500.00, orders: 2 },
        { date: '2024-01-02', sales: 750.00, orders: 3 },
        { date: '2024-01-03', sales: 1200.00, orders: 4 }
      ],
      salesBySeller: [
        { sellerId: 1, sellerName: 'Vendedor 1', sales: 8000.00, orders: 25 },
        { sellerId: 2, sellerName: 'Vendedor 2', sales: 7000.50, orders: 20 }
      ],
      paymentMethodBreakdown: [
        { method: 'Pix', amount: 6000.00, percentage: 40 },
        { method: 'Cartão de Crédito', amount: 4500.50, percentage: 30 },
        { method: 'Dinheiro', amount: 4500.00, percentage: 30 }
      ]
    };

    res.json(mockData);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Mock data - replace with Supabase integration
    const mockReport = {
      period: {
        startDate: startDate || '2024-01-01',
        endDate: endDate || '2024-01-31'
      },
      summary: {
        totalSales: 25000.00,
        totalOrders: 75,
        averageOrderValue: 333.33,
        uniqueCustomers: 50
      },
      dailyBreakdown: [
        { date: '2024-01-01', sales: 500.00, orders: 2, customers: 2 },
        { date: '2024-01-02', sales: 750.00, orders: 3, customers: 3 },
        { date: '2024-01-03', sales: 1200.00, orders: 4, customers: 4 }
      ],
      topProducts: [
        { productId: 1, productName: 'Produto A', quantity: 50, revenue: 5000.00 },
        { productId: 2, productName: 'Produto B', quantity: 40, revenue: 4000.00 },
        { productId: 3, productName: 'Produto C', quantity: 30, revenue: 3000.00 }
      ]
    };

    if (format === 'csv') {
      // In a real implementation, this would generate CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sales-report.csv"');
      res.send('Date,Sales,Orders,Customers\n2024-01-01,500.00,2,2\n');
    } else {
      res.json(mockReport);
    }
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};