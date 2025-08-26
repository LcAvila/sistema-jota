import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Verificar estoque dos produtos
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ 
          message: `Produto com ID ${item.productId} não encontrado` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}` 
        });
      }
    }

    // Criar a venda em uma transação
    const sale = await prisma.$transaction(async (tx) => {
      // Criar o pedido
      const order = await tx.order.create({
        data: {
          clientId,
          sellerId,
          storeId: 1, // Assumindo store ID 1 por padrão
          total,
          status: 'Concluído',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              qty: item.quantity,
              unitPrice: item.unitPrice,
              note: notes
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          client: true,
          seller: true
        }
      });

      // Criar o pagamento
      await tx.orderPayment.create({
        data: {
          orderId: order.id,
          paymentMethodId,
          amount: total
        }
      });

      // Atualizar estoque dos produtos
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        // Registrar movimento de estoque
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            qty: -item.quantity,
            type: 'SAIDA',
            referenceId: order.id,
            referenceType: 'order'
          }
        });
      }

      // Criar log da venda
      await tx.orderLog.create({
        data: {
          orderId: order.id,
          action: 'VENDA_CRIADA',
          byUserId: sellerId,
          toStatus: 'Concluído'
        }
      });

      return order;
    });

    res.status(201).json({
      message: 'Venda registrada com sucesso',
      sale
    });

  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Buscar todas as vendas
export const getAllSales = async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      startDate, 
      endDate, 
      sellerId, 
      clientId, 
      status = 'Concluído' 
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: Prisma.OrderWhereInput = {
      status: status as string
    };

    // Filtros opcionais
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    if (sellerId) {
      where.sellerId = parseInt(sellerId as string);
    }

    if (clientId) {
      where.clientId = parseInt(clientId as string);
    }

    const [sales, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          seller: {
            select: { id: true, name: true }
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true }
              }
            }
          },
          orderPayments: {
            include: {
              paymentMethod: {
                select: { id: true, name: true }
              }
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      sales,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar venda por ID
export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sale = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        seller: true,
        items: {
          include: {
            product: true
          }
        },
        orderPayments: {
          include: {
            paymentMethod: true
          }
        },
        logs: {
          include: {
            byUser: {
              select: { id: true, name: true }
            }
          },
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    res.json(sale);

  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar venda
export const updateSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const sale = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    const updatedSale = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        client: true,
        seller: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Criar log da atualização
    if (status && status !== sale.status) {
      await prisma.orderLog.create({
        data: {
          orderId: parseInt(id),
          action: 'STATUS_ALTERADO',
          byUserId: sale.sellerId, // Idealmente seria o usuário atual
          fromStatus: sale.status,
          toStatus: status
        }
      });
    }

    res.json({
      message: 'Venda atualizada com sucesso',
      sale: updatedSale
    });

  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Deletar venda (cancelar)
export const deleteSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sale = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true
      }
    });

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    if (sale.status === 'Cancelado') {
      return res.status(400).json({ message: 'Venda já está cancelada' });
    }

    // Cancelar venda e restaurar estoque
    await prisma.$transaction(async (tx) => {
      // Atualizar status para cancelado
      await tx.order.update({
        where: { id: parseInt(id) },
        data: {
          status: 'Cancelado',
          updatedAt: new Date()
        }
      });

      // Restaurar estoque
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.qty
            }
          }
        });

        // Registrar movimento de estoque
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            qty: item.qty,
            type: 'ENTRADA',
            referenceId: sale.id,
            referenceType: 'order'
          }
        });
      }

      // Criar log do cancelamento
      await tx.orderLog.create({
        data: {
          orderId: parseInt(id),
          action: 'VENDA_CANCELADA',
          byUserId: sale.sellerId, // Idealmente seria o usuário atual
          fromStatus: sale.status,
          toStatus: 'Cancelado'
        }
      });
    });

    res.json({ message: 'Venda cancelada com sucesso' });

  } catch (error) {
    console.error('Erro ao cancelar venda:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Relatórios de vendas
export const getSalesReports = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, sellerId, groupBy = 'day' } = req.query;

    const where: Prisma.OrderWhereInput = {
      status: 'Concluído'
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    if (sellerId) {
      where.sellerId = parseInt(sellerId as string);
    }

    // Vendas por período
    const salesByPeriod = await prisma.order.findMany({
      where,
      select: {
        id: true,
        total: true,
        createdAt: true,
        seller: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Produtos mais vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { qty: true },
      _count: { id: true },
      where: {
        order: where
      },
      orderBy: {
        _sum: { qty: 'desc' }
      },
      take: 10
    });

    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true }
    });

    const topProductsWithDetails = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || 'Produto não encontrado',
        totalQuantity: item._sum.qty || 0,
        totalSales: item._count.id,
        revenue: (item._sum.qty || 0) * (product?.price ? new Prisma.Decimal(product.price).toNumber() : 0)
      };
    });

    // Vendedores top
    const topSellers = await prisma.order.groupBy({
      by: ['sellerId'],
      _sum: { total: true },
      _count: { id: true },
      where,
      orderBy: {
        _sum: { total: 'desc' }
      },
      take: 10
    });

    const sellerIds = topSellers.map(s => s.sellerId);
    const sellers = await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, name: true }
    });

    const topSellersWithDetails = topSellers.map(item => {
      const seller = sellers.find(s => s.id === item.sellerId);
      return {
        sellerId: item.sellerId,
        sellerName: seller?.name || 'Vendedor não encontrado',
        totalRevenue: item._sum.total || 0,
        totalSales: item._count.id
      };
    });

    // Resumo geral
    const summary = await prisma.order.aggregate({
      _sum: { total: true },
      _count: { id: true },
      _avg: { total: true },
      where
    });

    res.json({
      summary: {
        totalRevenue: summary._sum.total || 0,
        totalSales: summary._count.id || 0,
        averageTicket: summary._avg.total || 0
      },
      salesByPeriod,
      topProducts: topProductsWithDetails,
      topSellers: topSellersWithDetails
    });

  } catch (error) {
    console.error('Erro ao gerar relatórios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Dados para dashboard
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: Prisma.OrderWhereInput = {
      status: 'Concluído',
      createdAt: {
        gte: startDate
      }
    };

    // Métricas principais
    const [totalRevenue, totalSales, avgTicket] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        _avg: { total: true },
        where
      })
    ]);

    // Vendas por dia (últimos 30 dias)
    const salesByDay = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as sales,
        SUM(total) as revenue
      FROM orders 
      WHERE status = 'Concluído' 
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Vendas recentes
    const recentSales = await prisma.order.findMany({
      where: { status: 'Concluído' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        client: { select: { name: true } },
        seller: { select: { name: true } }
      }
    });

    res.json({
      metrics: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalSales,
        averageTicket: avgTicket._avg.total || 0
      },
      salesByDay,
      recentSales
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
