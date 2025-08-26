import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando!' });
});

import productsRoutes from './routes/products.routes';
import usersRoutes from './routes/users.routes';
import authRoutes from './routes/auth.routes';
import ordersRoutes from './routes/orders.routes';
import importsRoutes from './routes/imports.routes';
import publicRoutes from './routes/public.routes';
import stockRoutes from './routes/stock.routes';
import salesRoutes from './routes/sales.routes';
import dashboardRoutes from './routes/dashboardRoutes';

app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/imports', importsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
