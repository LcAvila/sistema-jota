import { Request, Response } from 'express';

// POST /api/imports/orders
export const importOrders = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'Lista de pedidos é obrigatória' });
    }

    // Mock data - replace with Supabase integration
    const importedOrders = orders.map((order: any, index: number) => ({
      id: Math.floor(Math.random() * 1000) + index + 1,
      clientId: order.clientId || 1,
      sellerId: order.sellerId || 1,
      storeId: order.storeId || 1,
      total: order.total || 0,
      status: order.status || 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: order.items || []
    }));

    res.status(201).json({
      message: `${importedOrders.length} pedidos importados com sucesso`,
      orders: importedOrders
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao importar pedidos', details: err?.message });
  }
};

// POST /api/imports/products
export const importProducts = async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Lista de produtos é obrigatória' });
    }

    // Mock data - replace with Supabase integration
    const importedProducts = products.map((product: any, index: number) => ({
      id: Math.floor(Math.random() * 1000) + index + 1,
      name: product.name || `Produto ${index + 1}`,
      price: product.price || 0,
      cost: product.cost || 0,
      stock: product.stock || 0,
      sku: product.sku || `SKU-${index + 1}`,
      code: product.code || `CODE-${index + 1}`,
      imageUrl: product.imageUrl || null,
      categoryId: product.categoryId || 1,
      barcode: product.barcode || null,
      minStock: product.minStock || null,
      unit: product.unit || 'un',
      active: product.active !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    res.status(201).json({
      message: `${importedProducts.length} produtos importados com sucesso`,
      products: importedProducts
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao importar produtos', details: err?.message });
  }
};

// GET /api/imports/template/orders
export const getOrdersTemplate = async (req: Request, res: Response) => {
  try {
    // Mock template - replace with Supabase integration
    const template = {
      orders: [
        {
          clientId: 1,
          sellerId: 1,
          storeId: 1,
          total: 100.00,
          status: 'completed',
          items: [
            {
              productId: 1,
              qty: 2,
              unitPrice: 50.00
            }
          ]
        }
      ]
    };

    res.json(template);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao gerar template', details: err?.message });
  }
};

// GET /api/imports/template/products
export const getProductsTemplate = async (req: Request, res: Response) => {
  try {
    // Mock template - replace with Supabase integration
    const template = {
      products: [
        {
          name: 'Produto Exemplo',
          price: 29.99,
          cost: 20.99,
          stock: 10,
          sku: 'PROD-001',
          code: '001',
          imageUrl: null,
          categoryId: 1,
          barcode: '123456789',
          minStock: 5,
          unit: 'un',
          active: true
        }
      ]
    };

    res.json(template);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao gerar template', details: err?.message });
  }
};