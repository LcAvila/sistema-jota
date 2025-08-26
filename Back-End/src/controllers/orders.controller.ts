import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { sendPurchaseEvent } from '../utils/ga4';

// GET /api/orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        client: true,
        seller: true,
        store: true,
      },
    });
    res.json(orders);
  } catch (err) {
    console.error('getAllOrders error', err);
    res.status(500).json({ message: 'Erro ao listar pedidos' });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: { include: { product: true } },
        logs: { orderBy: { timestamp: 'desc' } },
        client: true,
        seller: true,
        store: true,
      },
    });
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json(order);
  } catch (err) {
    console.error('getOrderById error', err);
    res.status(500).json({ message: 'Erro ao buscar pedido' });
  }
};

// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
  const { clientId, sellerId, storeId, items, status = 'pending' } = req.body as {
    clientId: number; sellerId: number; storeId: number; items: Array<{ productId: number; qty: number; unitPrice: string; note?: string }>; status?: string;
  };
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Itens do pedido são obrigatórios' });
  }
  try {
    const total = items.reduce((sum, it) => sum + Number(it.unitPrice) * it.qty, 0);
    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          clientId,
          sellerId,
          storeId,
          status,
          total,
          items: {
            create: items.map((it) => ({
              product: { connect: { id: it.productId } },
              qty: it.qty,
              unitPrice: new Prisma.Decimal(it.unitPrice),
              note: it.note ?? null,
            })),
          },
        },
        include: { items: true },
      });
      // log inicial
      // @ts-ignore
      const user = req.user as { id: number; role: string } | undefined;
      await tx.orderLog.create({
        data: {
          orderId: order.id,
          action: 'create',
          byUserId: user?.id ?? sellerId,
          toStatus: status,
        },
      });
      return order;
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('createOrder error', err);
    res.status(500).json({ message: 'Erro ao criar pedido' });
  }
};

// PUT /api/orders/:id
export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { clientId, sellerId, storeId, items } = req.body as {
    clientId?: number; sellerId?: number; storeId?: number; items?: Array<{ id?: number; productId: number; qty: number; unitPrice: string; note?: string }>;
  };
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: Number(id) },
        data: { clientId, sellerId, storeId },
      });
      if (Array.isArray(items)) {
        // estratégia simples: apaga e recria itens
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        await tx.orderItem.createMany({
          data: items.map((it) => ({
            orderId: order.id,
            productId: it.productId,
            qty: it.qty,
            unitPrice: Number(it.unitPrice),
            note: it.note ?? null,
          })),
        });
        const total = items.reduce((sum, it) => sum + Number(it.unitPrice) * it.qty, 0);
        await tx.order.update({ where: { id: order.id }, data: { total } });
      }
      return tx.order.findUnique({
        where: { id: Number(id) },
        include: { items: true },
      });
    });
    res.json(updated);
  } catch (err) {
    console.error('updateOrder error', err);
    res.status(500).json({ message: 'Erro ao atualizar pedido' });
  }
};

// DELETE /api/orders/:id
export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.order.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    console.error('deleteOrder error', err);
    res.status(500).json({ message: 'Erro ao excluir pedido' });
  }
};

// POST /api/orders/:id/status - transição de status com log
export const changeOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { toStatus } = req.body as { toStatus: string };
  if (!toStatus) return res.status(400).json({ message: 'toStatus é obrigatório' });
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: Number(id) } });
      if (!current) throw new Error('Pedido não encontrado');
      const order = await tx.order.update({
        where: { id: Number(id) },
        data: { status: toStatus },
      });
      // @ts-ignore
      const user = req.user as { id: number; role: string } | undefined;
      await tx.orderLog.create({
        data: {
          orderId: order.id,
          action: 'status_change',
          byUserId: user?.id ?? current.sellerId,
          fromStatus: current.status,
          toStatus,
        },
      });
      return order;
    });

    // Dispara GA4 purchase quando o pedido é concluído/entregue
    const finalStatuses = ['completed', 'concluded', 'delivered', 'finalizado', 'entregue'];
    if (finalStatuses.includes(toStatus.toLowerCase())) {
      try {
        const full = await prisma.order.findUnique({
          where: { id: updated.id },
          include: {
            items: { include: { product: { include: { category: true } } } },
            client: true,
          },
        });
        if (full) {
          const items = full.items.map((it) => ({
            item_id: it.productId,
            item_name: it.product?.name ?? `Produto ${it.productId}`,
            item_category: it.product?.category?.name ?? undefined,
            price: Number(it.unitPrice),
            quantity: it.qty,
          }));
          const clientId = `${full.clientId || '0'}.${full.id}`;
          await sendPurchaseEvent({
            clientId,
            transaction_id: `ORDER-${full.id}`,
            value: Number(full.total),
            currency: 'BRL',
            items,
          });
        }
      } catch (gaErr) {
        console.error('GA4 purchase dispatch error', gaErr);
      }
    }
    res.json(updated);
  } catch (err) {
    console.error('changeOrderStatus error', err);
    const msg = (err as Error).message || 'Erro ao mudar status';
    res.status(msg.includes('não encontrado') ? 404 : 500).json({ message: msg });
  }
};

// GET /api/orders/:id/logs
export const getOrderLogs = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const logs = await prisma.orderLog.findMany({
      where: { orderId: Number(id) },
      orderBy: { timestamp: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    console.error('getOrderLogs error', err);
    res.status(500).json({ message: 'Erro ao listar logs do pedido' });
  }
};
