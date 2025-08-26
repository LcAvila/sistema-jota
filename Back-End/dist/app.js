"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API funcionando!' });
});
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const imports_routes_1 = __importDefault(require("./routes/imports.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const stock_routes_1 = __importDefault(require("./routes/stock.routes"));
const sales_routes_1 = __importDefault(require("./routes/sales.routes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
app.use('/api/products', products_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/imports', imports_routes_1.default);
app.use('/api/public', public_routes_1.default);
app.use('/api/stock', stock_routes_1.default);
app.use('/api/sales', sales_routes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
