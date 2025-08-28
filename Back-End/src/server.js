const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

// Importar configurações e middlewares
const logger = require('./config/logger');
const { connectRedis } = require('./config/redis');
const rateLimiters = require('./middleware/rateLimit');
const { validate } = require('./middleware/validation');
const monitoring = require('./middleware/monitoring');
const cacheMiddleware = require('./middleware/cache');

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

// Middleware de segurança e performance
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// CORS configurado
app.use(cors({
  origin: [
    'https://jota-psi.vercel.app',
    'https://jota-gt92w3zjf-lucas-avilas-projects.vercel.app',
    'https://jota-b2anh3yi5-lucas-avilas-projects.vercel.app',
    'https://jota-aqh6qz64m-lucas-avilas-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de monitoramento
app.use(monitoring.requestLogger);
app.use(monitoring.performanceMonitor);
app.use(monitoring.memoryMonitor);

// Rate limiting
app.use('/api/auth/', rateLimiters.auth);
app.use('/api/', rateLimiters.api);
app.use('/api/products', rateLimiters.create);
app.use('/api/orders', rateLimiters.create);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Conexão com banco de dados Neon Tech

// Rota de login com validação e rate limiting
app.post('/api/auth/login', validate('login'), async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info('Tentativa de login', { email, ip: req.ip });

    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { store: true }
    });

    if (!user) {
      logger.warn('Tentativa de login com email inexistente', { email, ip: req.ip });
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar se o usuário está ativo
    if (!user.active) {
      logger.warn('Tentativa de login com usuário inativo', { email, ip: req.ip });
      return res.status(401).json({ message: 'Usuário inativo' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Tentativa de login com senha incorreta', { email, ip: req.ip });
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;
    
    logger.info('Login realizado com sucesso', { 
      email, 
      userId: user.id, 
      role: user.role,
      ip: req.ip 
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId
      }
    });

  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Importar rotas
const salesRoutes = require('./routes/sales');
const productsRoutes = require('./routes/products');
const stockRoutes = require('./routes/stock');

// Usar as rotas
app.use('/api/sales', salesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/public', salesRoutes);
app.use('/api/dashboard', salesRoutes);

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rota protegida de exemplo
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { store: true }
    });
    
    if (!user) {
      logger.warn('Perfil de usuário não encontrado', { userId: req.user.userId });
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    logger.info('Perfil de usuário consultado', { 
      userId: req.user.userId, 
      email: req.user.email 
    });
    
    res.json(userWithoutPassword);
  } catch (error) {
    logger.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Importar rotas de health check
const healthRoutes = require('./routes/health');

// Usar as rotas de health check
app.use('/api/health', healthRoutes);

// Função de inicialização
async function startServer() {
  try {
    // Conectar ao Redis (opcional)
    if (process.env.REDIS_HOST) {
      await connectRedis();
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info('🚀 Servidor iniciado com sucesso', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🔒 Segurança: Helmet, Rate Limiting, CORS configurado`);
      console.log(`📊 Monitoramento: Winston Logger, Performance Monitor`);
      console.log(`🗄️ Cache: Redis configurado`);
      console.log(`✅ Validação: Joi schemas implementados`);
      console.log(`\n👤 Conectado ao banco de dados Neon Tech`);
      console.log(`   Use as credenciais do banco de dados`);
    });
    
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Middleware de tratamento de erros (deve ser o último)
app.use(monitoring.errorHandler);

// Iniciar servidor
startServer();
