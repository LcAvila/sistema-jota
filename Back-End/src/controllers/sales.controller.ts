import { Request, Response } from 'express';

// Criar nova venda
export const createSale = async (req: Request, res: Response) => {
  try {
    const { clientId, sellerId, items, paymentMethodId, notes } = req.body;

    // Validar dados obrigatórios
    if (!clientId || !sellerId || !items || !Array.isArray(items) || items.length === 0 || !paymentMethodId) {
      return res.status(400).json({ 
        message: 'Dados obrigatórios: clientId, sellerId, items (array não vazio), paymentMethodId' 
      });
    }

    // Calcular total
    let total = 0;
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.unitPrice) {
        return res.status(400).json({ 
          message: 'Cada item deve ter productId, quantity e unitPrice' 
        });
      }
      total += item.quantity * item.unitPrice;
    }

    // Mock data - replace with Supabase integration
    const mockSale = {
      id: Math.floor(Math.random() * 1000) + 1,
      clientId,
      sellerId,
      items,
      paymentMethodId,
      notes: notes || null,
      total,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      message: 'Venda criada com sucesso',
      sale: mockSale
    });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao criar venda',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Listar vendas
export const getSales = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with Supabase integration
    const mockSales = [
      {
        id: 1,
        clientId: 1,
        sellerId: 1,
        total: 59.98,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            productId: 1,
            quantity: 2,
            unitPrice: 29.99
          }
        ],
        paymentMethodId: 1,
        notes: null
      }
    ];

    res.json(mockSales);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao listar vendas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Obter venda por ID
export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Mock data - replace with Supabase integration
    const mockSale = {
      id: Number(id),
      clientId: 1,
      sellerId: 1,
      total: 59.98,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          productId: 1,
          quantity: 2,
          unitPrice: 29.99
        }
      ],
      paymentMethodId: 1,
      notes: null
    };

    res.json(mockSale);
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao buscar venda',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Atualizar venda
export const updateSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Mock data - replace with Supabase integration
    const mockSale = {
      id: Number(id),
      ...updateData,
      updatedAt: new Date()
    };

    res.json({
      message: 'Venda atualizada com sucesso',
      sale: mockSale
    });
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao atualizar venda',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Deletar venda
export const deleteSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Mock data - replace with Supabase integration
    // In a real implementation, this would delete the sale from the database

    res.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao deletar venda',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};