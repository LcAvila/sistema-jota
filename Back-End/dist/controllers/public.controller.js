"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKpisPublic = exports.getRecentOrdersPublic = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getRecentOrdersPublic = async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    try {
        const orders = await prisma_1.default.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                client: true,
                seller: true,
                items: { include: { product: true } },
            },
        });
        const rows = orders.map(o => ({
            id: o.id,
            cliente: o.client?.name || 'Cliente',
            vendedor: o.seller?.name || 'Vendedor',
            total: Number(o.total || 0),
            createdAt: o.createdAt?.toISOString?.() || new Date().toISOString(),
            itens: (o.items || []).map(i => i.product?.name || i.note || 'Item').filter(Boolean),
        }));
        res.json({ data: rows });
    }
    catch (e) {
        console.error('getRecentOrdersPublic error', e);
        res.status(500).json({ message: 'Falha ao obter pedidos' });
    }
};
exports.getRecentOrdersPublic = getRecentOrdersPublic;
const getKpisPublic = async (req, res) => {
    try {
        const now = new Date();
        const fromParam = typeof req.query.from === 'string' ? req.query.from : undefined;
        const toParam = typeof req.query.to === 'string' ? req.query.to : undefined;
        const start = fromParam ? new Date(fromParam + 'T00:00:00Z') : new Date(now.toISOString().slice(0, 10) + 'T00:00:00Z');
        const end = toParam ? new Date(toParam + 'T23:59:59Z') : new Date(now.toISOString().slice(0, 10) + 'T23:59:59Z');
        const orders = await prisma_1.default.order.findMany({
            where: { createdAt: { gte: start, lte: end } },
            include: { seller: true },
        });
        const total = orders.reduce((s, o) => s + Number(o.total || 0), 0);
        const pedidos = orders.length;
        const ticket = pedidos ? total / pedidos : 0;
        const topSellersMap = new Map();
        orders.forEach(o => {
            const k = o.seller?.name || '(sem)';
            const cur = topSellersMap.get(k) || { total: 0, pedidos: 0 };
            cur.total += Number(o.total || 0);
            cur.pedidos += 1;
            topSellersMap.set(k, cur);
        });
        const topVendedores = Array.from(topSellersMap.entries())
            .map(([nome, x]) => ({ nome, total: x.total, pedidos: x.pedidos }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
        res.json({ total, pedidos, ticket, topVendedores });
    }
    catch (e) {
        console.error('getKpisPublic error', e);
        res.status(500).json({ message: 'Falha ao obter KPIs' });
    }
};
exports.getKpisPublic = getKpisPublic;
