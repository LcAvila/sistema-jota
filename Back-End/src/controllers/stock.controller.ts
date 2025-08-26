import { Request, Response } from 'express';
import { PrismaClient, ReferenceType } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/stock/overview
export const getOverview = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: ({ id: true, sku: true, code: true, name: true, stock: true, minStock: true, unit: true, barcode: true } as any)
    });

    const enriched = products.map(p => ({
      ...p,
      belowMin: p.minStock != null ? p.stock < p.minStock : false,
    }));

    const lowCount = enriched.filter(p => p.belowMin).length;
    const totalSkus = enriched.length;

    res.json({ data: enriched, meta: { lowCount, totalSkus } });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar visão de estoque', details: err?.message });
  }
};

// GET /api/stock/movements
export const listMovements = async (req: Request, res: Response) => {
  try {
    const { productId, type, referenceType, from, to, limit } = req.query as Record<string, string>;
    const take = Math.min(Number(limit) || 100, 500);

    const where: any = {};
    if (productId) where.productId = Number(productId);
    if (type) where.type = String(type);
    if (referenceType) where.referenceType = referenceType as ReferenceType;
    if (from || to) {
      where.createdAt = {} as any;
      if (from) (where.createdAt as any).gte = new Date(from);
      if (to) (where.createdAt as any).lte = new Date(to);
    }

    const rows = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: { product: { select: { id: true, sku: true, name: true, unit: true } } },
    });

    res.json({ data: rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao listar movimentações', details: err?.message });
  }
};

// POST /api/stock/movements
// body: { productId: number, qty: number, kind: 'in' | 'out', referenceType?: 'manual'|'adjustment'|'order', note?: string, referenceId?: number }
export const createMovement = async (req: Request, res: Response) => {
  try {
    const { productId, qty, kind, referenceType, note, referenceId } = req.body || {};
    if (!productId || typeof qty !== 'number' || !kind) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }
    if (!['in', 'out'].includes(kind)) return res.status(400).json({ error: 'kind deve ser in ou out' });

    const delta = kind === 'in' ? qty : -Math.abs(qty);

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: Number(productId) } });
      if (!product) throw new Error('Produto não encontrado');

      const newStock = product.stock + delta;
      if (newStock < 0) throw new Error('Estoque insuficiente para a saída');

      const movement = await tx.stockMovement.create({
        data: {
          productId: Number(productId),
          qty: Math.abs(qty),
          type: kind,
          referenceId: referenceId ? Number(referenceId) : null,
          referenceType: referenceType as ReferenceType | undefined,
          // opcionalmente poderíamos gravar note em outra tabela; aqui somente payload simples
        }
      });

      await tx.product.update({
        where: { id: Number(productId) },
        data: { stock: newStock }
      });

      return { movement, newStock };
    });

    res.status(201).json({ ok: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Falha ao criar movimentação' });
  }
};
