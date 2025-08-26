import { Request, Response } from 'express';
import prisma from '../utils/prisma';

type ImportProduct = {
  name: string;
  price: number;
  category?: string;
  image?: string;
  stock?: number;
  barcode?: string;
  minStock?: number | null;
  unit?: string | null;
  active?: boolean;
  cost?: number;
  sku?: string;
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const rows = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { category: true }
    });
    res.json(rows);
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao listar produtos', details: e?.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = await prisma.product.findUnique({ where: { id: Number(id) }, include: { category: true } });
    if (!row) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(row);
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao buscar produto', details: e?.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, categoryId, categoryName, sku, code, cost, stock, imageUrl, barcode, minStock, unit, active } = req.body || {};
    if (!name || typeof price !== 'number' || !code) return res.status(400).json({ error: 'Parâmetros inválidos: nome, preço e código são obrigatórios' });
    let catId: number | undefined = categoryId;
    if (!catId && categoryName) {
      const cat = await prisma.category.upsert({
        where: { name: String(categoryName) },
        update: {},
        create: { name: String(categoryName) }
      });
      catId = cat.id;
    }
    try {
      const created = await prisma.product.create({
        data: {
          name,
          price,
          cost: typeof cost === 'number' ? cost : Number((price * 0.7).toFixed(2)),
          stock: Number.isInteger(stock) ? stock : 0,
          sku: sku || generateSku(name),
          code: String(code).trim(),
          imageUrl: imageUrl || null,
          categoryId: catId,
          barcode: barcode || null,
          minStock: typeof minStock === 'number' ? minStock : null,
          unit: unit || null,
          active: active !== false,
        } as any
      });
      res.status(201).json(created);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        return res.status(409).json({ error: 'Código ou SKU já existente' });
      }
      throw e;
    }
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao criar produto', details: e?.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, categoryId, categoryName, sku, code, cost, stock, imageUrl, barcode, minStock, unit, active } = req.body || {};
    let catId: number | undefined = categoryId;
    if (!catId && categoryName) {
      const cat = await prisma.category.upsert({ where: { name: String(categoryName) }, update: {}, create: { name: String(categoryName) } });
      catId = cat.id;
    }
    try {
      const data: any = {
        name,
        price,
        cost,
        stock,
        sku,
        imageUrl,
        categoryId: catId,
        barcode,
        minStock,
        unit,
        active,
      };
      if (typeof code === 'string' && code.trim()) {
        data.code = String(code).trim();
      }
      const updated = await prisma.product.update({
        where: { id: Number(id) },
        data,
      });
      res.json(updated);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        return res.status(409).json({ error: 'Código ou SKU já existente' });
      }
      throw e;
    }
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao atualizar produto', details: e?.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao deletar produto', details: e?.message });
  }
};

function slugify(str: string) {
  return String(str)
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 24);
}

function generateSku(name: string) {
  const s = slugify(name);
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${s ? s.toUpperCase() : 'SKU'}-${rnd}`;
}

export const bulkImportProducts = async (req: Request, res: Response) => {
  try {
    const list = (req.body?.products || []) as ImportProduct[];
    if (!Array.isArray(list) || list.length === 0) return res.status(400).json({ error: 'Lista vazia' });

    const catNames = Array.from(new Set(list.map(p => (p.category || '').trim()).filter(Boolean)));
    const cats = await Promise.all(catNames.map(async (name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } })
    ));
    const catMap = new Map(cats.map(c => [c.name, c.id] as const));

    const result = [] as any[];
    const errors: Array<{ index: number; error: string }> = [];
    for (const p of list) {
      const catId = p.category ? catMap.get(p.category.trim()) : undefined;
      const data = {
        name: p.name,
        price: Number(p.price),
        cost: Number(typeof p.cost === 'number' ? p.cost : (Number(p.price) * 0.7).toFixed(2)),
        stock: Number.isInteger(p.stock) ? (p.stock as number) : 0,
        sku: p.sku || generateSku(p.name),
        code: (p as any).code ? String((p as any).code) : undefined,
        imageUrl: p.image || null,
        categoryId: catId,
        barcode: p.barcode || null,
        minStock: typeof p.minStock === 'number' ? p.minStock : null,
        unit: p.unit || null,
        active: p.active !== false,
      } as const;

      try {
        if (!data['code']) {
          // exige code na importação também
          throw new Error('Código ausente');
        }
        const created = await prisma.product.create({ data: data as any });
        result.push(created);
      } catch (e: any) {
        if (e?.code === 'P2002') {
          errors.push({ index: result.length, error: 'Código ou SKU já existente' });
        } else {
          errors.push({ index: result.length, error: e?.message || 'Falha ao criar' });
        }
      }
    }

    const status = errors.length ? 207 : 201; // 207 Multi-Status (parcial)
    res.status(status).json({ ok: true, count: result.length, products: result, errors });
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao importar produtos', details: e?.message });
  }
};
