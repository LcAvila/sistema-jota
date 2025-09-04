import { Request, Response } from 'express';

export const getRecentOrdersPublic = async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  try {
    // Mock data - replace with Supabase integration
    const mockOrders = [
      {
        id: 1,
        cliente: 'Cliente Exemplo 1',
        vendedor: 'Vendedor Exemplo',
        total: 59.98,
        createdAt: new Date().toISOString(),
        itens: ['Produto A', 'Produto B']
      },
      {
        id: 2,
        cliente: 'Cliente Exemplo 2',
        vendedor: 'Vendedor Exemplo',
        total: 29.99,
        createdAt: new Date().toISOString(),
        itens: ['Produto C']
      }
    ].slice(0, limit);

    res.json({ data: mockOrders });
  } catch (e) {
    console.error('getRecentOrdersPublic error', e);
    res.status(500).json({ message: 'Falha ao obter pedidos' });
  }
};

export const getPublicStats = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with Supabase integration
    const mockStats = {
      totalOrders: 150,
      totalRevenue: 25000.50,
      totalProducts: 25,
      averageOrderValue: 166.67
    };

    res.json(mockStats);
  } catch (e) {
    console.error('getPublicStats error', e);
    res.status(500).json({ message: 'Falha ao obter estatísticas' });
  }
};

export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    
    // Mock data - replace with Supabase integration
    const mockProducts = [
      {
        id: 1,
        name: 'Produto A',
        price: 29.99,
        imageUrl: null,
        sku: 'PROD-001'
      },
      {
        id: 2,
        name: 'Produto B',
        price: 39.99,
        imageUrl: null,
        sku: 'PROD-002'
      }
    ].slice(0, limit);

    res.json({ data: mockProducts });
  } catch (e) {
    console.error('getPublicProducts error', e);
    res.status(500).json({ message: 'Falha ao obter produtos' });
  }
};