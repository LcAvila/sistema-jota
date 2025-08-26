import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

// Helper: get or create product used for imported orders (idempotente)
async function getImportProduct(tx: Prisma.TransactionClient) {
  const sku = 'IMPORT';
  const product = await tx.product.upsert({
    where: { sku },
    create: {
      sku,
      name: 'Venda Importada',
      price: new Prisma.Decimal(0),
      cost: new Prisma.Decimal(0),
      stock: 0,
    },
    update: {},
  });
  return product;
}

// Helper: get or create user by name and role, tolerante a corrida (P2002)
async function getOrCreateUserByName(tx: Prisma.TransactionClient, name: string, role: string, storeId: number) {
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@import.local`;
  let user = await tx.user.findUnique({ where: { email } });
  if (user) return user;
  try {
    user = await tx.user.create({
      data: {
        name,
        email,
        password: 'imported',
        role,
        storeId,
        active: true,
      },
    });
    return user;
  } catch (e: any) {
    if (e?.code === 'P2002') {
      // Conflito de único: outro processo criou. Buscar novamente.
      const again = await tx.user.findUnique({ where: { email } });
      if (again) return again;
    }
    throw e;
  }
}

export const importSales = async (req: Request, res: Response) => {
  const { mode, rows } = req.body as {
    mode: 'append' | 'replace';
    rows: Array<{
      cliente: string;
      vendedor: string;
      forma?: string;
      itens: string[];
      total: number;
      createdAt?: string | number;
    }>;
  };

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: 'rows é obrigatório' });
  }
  // Validação básica de conteúdo por linha
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] || ({} as any);
    const totalNum = Number(r.total);
    if (!Number.isFinite(totalNum)) {
      return res.status(400).json({ message: `Linha ${i + 1}: total inválido` });
    }
  }

  const storeId = 1; // padrão por enquanto

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const importProduct = await getImportProduct(tx);

      if (mode === 'replace') {
        // remove apenas pedidos importados previamente (que possuem item do produto IMPORT)
        const importedOrders = await tx.orderItem.findMany({
          where: { productId: importProduct.id },
          select: { orderId: true },
        });
        const ids = [...new Set(importedOrders.map((o) => o.orderId))];
        if (ids.length) {
          await tx.order.deleteMany({ where: { id: { in: ids } } });
        }
      }

      let inserted = 0;
      for (const rRaw of rows) {
        const r = rRaw || ({} as any);
        const clienteName = String(r.cliente || '').trim() || 'CLIENTE';
        const vendedorName = String(r.vendedor || '').trim() || 'VENDEDOR';
        const totalNum = Number(r.total || 0);
        const createdAtDate = r.createdAt ? new Date(r.createdAt) : undefined;
        const createdAtValid = createdAtDate && !isNaN(createdAtDate.getTime()) ? createdAtDate : undefined;

        const client = await getOrCreateUserByName(tx, clienteName, 'client', storeId);
        const seller = await getOrCreateUserByName(tx, vendedorName, 'seller', storeId);
        const created = await tx.order.create({
          data: {
            clientId: client.id,
            sellerId: seller.id,
            storeId,
            status: 'delivered',
            total: new Prisma.Decimal(totalNum),
            createdAt: createdAtValid,
            items: {
              create: [
                {
                  productId: importProduct.id,
                  qty: 1,
                  unitPrice: new Prisma.Decimal(totalNum),
                  note: Array.isArray(r.itens) && r.itens.length ? r.itens.join('; ') : null,
                },
              ],
            },
          },
        });
        await tx.orderLog.create({
          data: {
            orderId: created.id,
            action: 'import',
            byUserId: seller.id,
            toStatus: 'delivered',
          },
        });
        inserted++;
      }
      return { inserted };
    });

    res.json({ ...result, ignored: 0, importId: Date.now().toString() });
  } catch (err: any) {
    // Log detalhado no servidor
    console.error('importSales error', err?.message || err);
    // Resposta com mais detalhes para facilitar diagnóstico em desenvolvimento
    // Evitar vazar detalhes sensíveis em produção, mas aqui incluímos código/metadata do Prisma se houver
    const payload: any = { message: 'Erro ao importar vendas' };
    if (err?.code) payload.code = err.code; // código Prisma (ex: P2002)
    if (err?.meta) payload.meta = err.meta;
    if (err?.message) payload.detail = err.message;
    res.status(500).json(payload);
  }
};
