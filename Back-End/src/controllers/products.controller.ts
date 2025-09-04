import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';

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
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return res.status(500).json({ error: 'Falha ao listar produtos', details: error.message });
    }

    res.json(products);
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao listar produtos', details: e?.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('id', Number(id))
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao buscar produto', details: e?.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, categoryId, categoryName, sku, code, cost, stock, imageUrl, barcode, minStock, unit, active } = req.body || {};
    if (!name || typeof price !== 'number' || !code) return res.status(400).json({ error: 'Parâmetros inválidos: nome, preço e código são obrigatórios' });
    
    let finalCategoryId = categoryId;
    
    // Se não tem categoryId mas tem categoryName, buscar ou criar categoria
    if (!finalCategoryId && categoryName) {
      const { data: existingCategory } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();
      
      if (existingCategory) {
        finalCategoryId = existingCategory.id;
      } else {
        const { data: newCategory } = await supabaseAdmin
          .from('categories')
          .insert({ name: categoryName })
          .select('id')
          .single();
        finalCategoryId = newCategory?.id;
      }
    }
    
    // Inserir produto no Supabase
    const { data: created, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        price,
        cost: typeof cost === 'number' ? cost : Number((price * 0.7).toFixed(2)),
        stock: Number.isInteger(stock) ? stock : 0,
        sku: sku || generateSku(name),
        code: String(code).trim(),
        image_url: imageUrl || null,
        category_id: finalCategoryId,
        barcode: barcode || null,
        min_stock: typeof minStock === 'number' ? minStock : null,
        unit: unit || null,
        active: active !== false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar produto:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Código ou SKU já existente' });
      }
      return res.status(500).json({ error: 'Falha ao criar produto', details: error.message });
    }
    
    res.status(201).json(created);
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao criar produto', details: e?.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, categoryId, categoryName, sku, code, cost, stock, imageUrl, barcode, minStock, unit, active } = req.body || {};
    
    let finalCategoryId = categoryId;
    
    // Se não tem categoryId mas tem categoryName, buscar ou criar categoria
    if (!finalCategoryId && categoryName) {
      const { data: existingCategory } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();
      
      if (existingCategory) {
        finalCategoryId = existingCategory.id;
      } else {
        const { data: newCategory } = await supabaseAdmin
          .from('categories')
          .insert({ name: categoryName })
          .select('id')
          .single();
        finalCategoryId = newCategory?.id;
      }
    }
    
    // Preparar dados para atualização
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (cost !== undefined) updateData.cost = cost;
    if (stock !== undefined) updateData.stock = stock;
    if (sku !== undefined) updateData.sku = sku;
    if (code !== undefined) updateData.code = code;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (finalCategoryId !== undefined) updateData.category_id = finalCategoryId;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (minStock !== undefined) updateData.min_stock = minStock;
    if (unit !== undefined) updateData.unit = unit;
    if (active !== undefined) updateData.active = active;
    
    // Atualizar produto no Supabase
    const { data: updated, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar produto:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Código ou SKU já existente' });
      }
      return res.status(500).json({ error: 'Falha ao atualizar produto', details: error.message });
    }
    
    if (!updated) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao atualizar produto', details: e?.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', Number(id));
    
    if (error) {
      console.error('Erro ao deletar produto:', error);
      return res.status(500).json({ error: 'Falha ao deletar produto', details: error.message });
    }
    
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

    const result = [] as any[];
    const errors: Array<{ index: number; error: string }> = [];
    
    // Primeiro, criar todas as categorias necessárias
    const categoryNames = Array.from(new Set(list.map(p => (p.category || '').trim()).filter(Boolean)));
    const categoryMap = new Map<string, number>();
    
    for (const categoryName of categoryNames) {
      const { data: existingCategory } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();
      
      if (existingCategory) {
        categoryMap.set(categoryName, existingCategory.id);
      } else {
        const { data: newCategory } = await supabaseAdmin
          .from('categories')
          .insert({ name: categoryName })
          .select('id')
          .single();
        if (newCategory) {
          categoryMap.set(categoryName, newCategory.id);
        }
      }
    }
    
    // Agora processar cada produto
    for (const p of list) {
      try {
        if (!p.name || typeof p.price !== 'number') {
          throw new Error('Nome e preço são obrigatórios');
        }

        const categoryId = p.category ? categoryMap.get(p.category.trim()) : null;
        
        const { data: created, error } = await supabaseAdmin
          .from('products')
          .insert({
            name: p.name,
            price: Number(p.price),
            cost: Number(typeof p.cost === 'number' ? p.cost : (Number(p.price) * 0.7).toFixed(2)),
            stock: Number.isInteger(p.stock) ? (p.stock as number) : 0,
            sku: p.sku || generateSku(p.name),
            code: (p as any).code ? String((p as any).code) : generateSku(p.name),
            image_url: p.image || null,
            category_id: categoryId,
            barcode: p.barcode || null,
            min_stock: typeof p.minStock === 'number' ? p.minStock : null,
            unit: p.unit || null,
            active: p.active !== false
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            errors.push({ index: result.length, error: 'Código ou SKU já existente' });
          } else {
            errors.push({ index: result.length, error: error.message });
          }
        } else {
          result.push(created);
        }
      } catch (e: any) {
        errors.push({ index: result.length, error: e?.message || 'Falha ao criar' });
      }
    }

    const status = errors.length ? 207 : 201; // 207 Multi-Status (parcial)
    res.status(status).json({ ok: true, count: result.length, products: result, errors });
  } catch (e: any) {
    res.status(500).json({ error: 'Falha ao importar produtos', details: e?.message });
  }
};
