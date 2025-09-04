import { Request, Response } from 'express';

// GET /api/stock/overview
export const getOverview = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with Supabase integration
    const mockProducts = [
      {
        id: 1,
        sku: 'PROD-001',
        code: '001',
        name: 'Produto A',
        stock: 5,
        minStock: 10,
        unit: 'un',
        barcode: '123456789',
        belowMin: true
      },
      {
        id: 2,
        sku: 'PROD-002',
        code: '002',
        name: 'Produto B',
        stock: 25,
        minStock: 15,
        unit: 'un',
        barcode: '987654321',
        belowMin: false
      }
    ];

    const lowCount = mockProducts.filter(p => p.belowMin).length;
    const totalSkus = mockProducts.length;

    res.json({ data: mockProducts, meta: { lowCount, totalSkus } });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar visão de estoque', details: err?.message });
  }
};

// GET /api/stock/movements
export const listMovements = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with Supabase integration
    const mockMovements = [
      {
        id: 1,
        productId: 1,
        qty: 10,
        type: 'manual',
        referenceId: null,
        referenceType: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 1,
          name: 'Produto A',
          sku: 'PROD-001'
        }
      },
      {
        id: 2,
        productId: 2,
        qty: -5,
        type: 'order',
        referenceId: 1,
        referenceType: 'order',
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 2,
          name: 'Produto B',
          sku: 'PROD-002'
        }
      }
    ];

    res.json(mockMovements);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao listar movimentações', details: err?.message });
  }
};

// POST /api/stock/adjust
export const adjustStock = async (req: Request, res: Response) => {
  try {
    const { productId, qty, reason } = req.body;

    if (!productId || qty === undefined || qty === null) {
      return res.status(400).json({ error: 'productId e qty são obrigatórios' });
    }

    // Mock data - replace with Supabase integration
    const mockMovement = {
      id: Math.floor(Math.random() * 1000) + 1,
      productId: Number(productId),
      qty: Number(qty),
      type: 'manual',
      referenceId: null,
      referenceType: 'manual',
      reason: reason || 'Ajuste manual',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      message: 'Estoque ajustado com sucesso',
      movement: mockMovement
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao ajustar estoque', details: err?.message });
  }
};

// GET /api/stock/product/:id/movements
export const getProductMovements = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Mock data - replace with Supabase integration
    const mockMovements = [
      {
        id: 1,
        productId: Number(id),
        qty: 10,
        type: 'manual',
        referenceId: null,
        referenceType: 'manual',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        productId: Number(id),
        qty: -2,
        type: 'order',
        referenceId: 1,
        referenceType: 'order',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.json(mockMovements);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar movimentações do produto', details: err?.message });
  }
};