"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderLogs = exports.changeOrderStatus = exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getAllOrders = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("@prisma/client");
const ga4_1 = require("../utils/ga4");
// GET /api/orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                items: { include: { product: true } },
                client: true,
                seller: true,
                store: true,
            },
        });
        res.json(orders);
    }
    catch (err) {
        console.error('getAllOrders error', err);
        res.status(500).json({ message: 'Erro ao listar pedidos' });
    }
};
exports.getAllOrders = getAllOrders;
// GET /api/orders/:id
const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await prisma_1.default.order.findUnique({
            where: { id: Number(id) },
            include: {
                items: { include: { product: true } },
                logs: { orderBy: { timestamp: 'desc' } },
                client: true,
                seller: true,
                store: true,
            },
        });
        if (!order)
            return res.status(404).json({ message: 'Pedido não encontrado' });
        res.json(order);
    }
    catch (err) {
        console.error('getOrderById error', err);
        res.status(500).json({ message: 'Erro ao buscar pedido' });
    }
};
exports.getOrderById = getOrderById;
// POST /api/orders
const createOrder = async (req, res) => {
    const { clientId, sellerId, storeId, items, status = 'pending' } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Itens do pedido são obrigatórios' });
    }
    try {
        const total = items.reduce((sum, it) => sum + Number(it.unitPrice) * it.qty, 0);
        const created = await prisma_1.default.$transaction(async (tx) => {
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
                            unitPrice: new client_1.Prisma.Decimal(it.unitPrice),
                            note: it.note ?? null,
                        })),
                    },
                },
                include: { items: true },
            });
            // log inicial
            // @ts-ignore
            const user = req.user;
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
    }
    catch (err) {
        console.error('createOrder error', err);
        res.status(500).json({ message: 'Erro ao criar pedido' });
    }
};
exports.createOrder = createOrder;
// PUT /api/orders/:id
const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { clientId, sellerId, storeId, items } = req.body;
    try {
        const updated = await prisma_1.default.$transaction(async (tx) => {
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
    }
    catch (err) {
        console.error('updateOrder error', err);
        res.status(500).json({ message: 'Erro ao atualizar pedido' });
    }
};
exports.updateOrder = updateOrder;
// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.default.order.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (err) {
        console.error('deleteOrder error', err);
        res.status(500).json({ message: 'Erro ao excluir pedido' });
    }
};
exports.deleteOrder = deleteOrder;
// POST /api/orders/:id/status - transição de status com log
const changeOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { toStatus } = req.body;
    if (!toStatus)
        return res.status(400).json({ message: 'toStatus é obrigatório' });
    try {
        const updated = await prisma_1.default.$transaction(async (tx) => {
            const current = await tx.order.findUnique({ where: { id: Number(id) } });
            if (!current)
                throw new Error('Pedido não encontrado');
            const order = await tx.order.update({
                where: { id: Number(id) },
                data: { status: toStatus },
            });
            // @ts-ignore
            const user = req.user;
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
                const full = await prisma_1.default.order.findUnique({
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
                    await (0, ga4_1.sendPurchaseEvent)({
                        clientId,
                        transaction_id: `ORDER-${full.id}`,
                        value: Number(full.total),
                        currency: 'BRL',
                        items,
                    });
                }
            }
            catch (gaErr) {
                console.error('GA4 purchase dispatch error', gaErr);
            }
        }
        res.json(updated);
    }
    catch (err) {
        console.error('changeOrderStatus error', err);
        const msg = err.message || 'Erro ao mudar status';
        res.status(msg.includes('não encontrado') ? 404 : 500).json({ message: msg });
    }
};
exports.changeOrderStatus = changeOrderStatus;
// GET /api/orders/:id/logs
const getOrderLogs = async (req, res) => {
    const { id } = req.params;
    try {
        const logs = await prisma_1.default.orderLog.findMany({
            where: { orderId: Number(id) },
            orderBy: { timestamp: 'desc' },
        });
        res.json(logs);
    }
    catch (err) {
        console.error('getOrderLogs error', err);
        res.status(500).json({ message: 'Erro ao listar logs do pedido' });
    }
};
exports.getOrderLogs = getOrderLogs;
