"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getAllProducts = async (req, res) => {
    try {
        const rows = await prisma_1.default.product.findMany({
            orderBy: { name: 'asc' },
            include: { category: true }
        });
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ error: 'Falha ao listar produtos', details: e?.message });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const row = await prisma_1.default.product.findUnique({ where: { id: Number(id) }, include: { category: true } });
        if (!row)
            return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(row);
    }
    catch (e) {
        res.status(500).json({ error: 'Falha ao buscar produto', details: e?.message });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { name, price, categoryId, categoryName, sku, code, cost, stock, imageUrl, barcode, minStock, unit, active } = req.body || {};
        if (!name || typeof price !== 'number' || !code)
            return res.status(400).json({ error: 'Parâmetros inválidos: nome, preço e código são obrigatórios' });
        let catId = categoryId;
        if (!catId && categoryName) {
            const cat = await prisma_1.default.category.upsert({
                where: { name: String(categoryName) },
                update: {},
                create: { name: String(categoryName) }
            });
            catId = cat.id;
        }
        try {
            const created = await prisma_1.default.product.create({
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
                }
            });
            res.status(201).json(created);
        }
        catch (e) {
            if (e?.code === 'P2002') {
                return res.status(409).json({ error: 'Código ou SKU já existente' });
            }
            throw e;
        }
    }
    catch (e) {
        res.status(500).json({ error: 'Falha ao criar produto', details: e?.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, categoryId, categoryName, sku, code, cost, stock, imageUrl, barcode, minStock, unit, active } = req.body || {};
        let catId = categoryId;
        if (!catId && categoryName) {
            const cat = await prisma_1.default.category.upsert({ where: { name: String(categoryName) }, update: {}, create: { name: String(categoryName) } });
            catId = cat.id;
        }
        try {
            const data = {
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
            const updated = await prisma_1.default.product.update({
                where: { id: Number(id) },
                data,
            });
            res.json(updated);
        }
        catch (e) {
            if (e?.code === 'P2002') {
                return res.status(409).json({ error: 'Código ou SKU já existente' });
            }
            throw e;
        }
    }
    catch (e) {
        res.status(500).json({ error: 'Falha ao atualizar produto', details: e?.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.product.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (e) {
        res.status(500).json({ error: 'Falha ao deletar produto', details: e?.message });
    }
};
exports.deleteProduct = deleteProduct;
function slugify(str) {
    return String(str)
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 24);
}
function generateSku(name) {
    const s = slugify(name);
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${s ? s.toUpperCase() : 'SKU'}-${rnd}`;
}
const bulkImportProducts = async (req, res) => {
    try {
        const list = (req.body?.products || []);
        if (!Array.isArray(list) || list.length === 0)
            return res.status(400).json({ error: 'Lista vazia' });
        const catNames = Array.from(new Set(list.map(p => (p.category || '').trim()).filter(Boolean)));
        const cats = await Promise.all(catNames.map(async (name) => prisma_1.default.category.upsert({ where: { name }, update: {}, create: { name } })));
        const catMap = new Map(cats.map(c => [c.name, c.id]));
        const result = [];
        const errors = [];
        for (const p of list) {
            const catId = p.category ? catMap.get(p.category.trim()) : undefined;
            const data = {
                name: p.name,
                price: Number(p.price),
                cost: Number(typeof p.cost === 'number' ? p.cost : (Number(p.price) * 0.7).toFixed(2)),
                stock: Number.isInteger(p.stock) ? p.stock : 0,
                sku: p.sku || generateSku(p.name),
                code: p.code ? String(p.code) : undefined,
                imageUrl: p.image || null,
                categoryId: catId,
                barcode: p.barcode || null,
                minStock: typeof p.minStock === 'number' ? p.minStock : null,
                unit: p.unit || null,
                active: p.active !== false,
            };
            try {
                if (!data['code']) {
                    // exige code na importação também
                    throw new Error('Código ausente');
                }
                const created = await prisma_1.default.product.create({ data: data });
                result.push(created);
            }
            catch (e) {
                if (e?.code === 'P2002') {
                    errors.push({ index: result.length, error: 'Código ou SKU já existente' });
                }
                else {
                    errors.push({ index: result.length, error: e?.message || 'Falha ao criar' });
                }
            }
        }
        const status = errors.length ? 207 : 201; // 207 Multi-Status (parcial)
        res.status(status).json({ ok: true, count: result.length, products: result, errors });
    }
    catch (e) {
        res.status(500).json({ error: 'Falha ao importar produtos', details: e?.message });
    }
};
exports.bulkImportProducts = bulkImportProducts;
