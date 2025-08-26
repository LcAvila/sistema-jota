const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_M8VkiWQnr3BN@ep-falling-thunder-acjfd0ia-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Produtos do arquivo products.ts como fallback
const fallbackProducts = [
  {
    id: 1,
    name: "Alho Descascado 1kg",
    price: 15.90,
    originalPrice: 18.90,
    category: { name: "Temperos" },
    image: "/products/alho-descascado.jpg",
    description: "Alho descascado de alta qualidade, pronto para uso",
    stock: 50,
    active: true
  },
  {
    id: 2,
    name: "Azeite Extra Virgem 500ml",
    price: 24.90,
    originalPrice: 29.90,
    category: { name: "Óleos e Vinagres" },
    image: "/products/azeite-extra-virgem.jpg",
    description: "Azeite extra virgem premium importado",
    stock: 30,
    active: true
  },
  {
    id: 3,
    name: "Carne Seca 5kg",
    price: 189.90,
    originalPrice: 219.90,
    category: { name: "Carnes" },
    image: "/products/carne-seca.jpg",
    description: "Carne seca de primeira qualidade",
    stock: 15,
    active: true
  }
];

// GET /api/products - Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    console.log('🔄 Buscando produtos do banco PostgreSQL...');
    
    // Tentar buscar do banco PostgreSQL
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.stock,
        p.active,
        p."imageUrl" as image,
        p.description,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p.active = true
      ORDER BY p.name
    `);

    console.log(`✅ ${result.rows.length} produtos encontrados no banco`);

    // Mapear dados para o formato esperado pelo frontend
    const products = result.rows.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      originalPrice: parseFloat(product.price) * 1.2 || 0,
      category: { name: product.category_name || 'Sem categoria' },
      image: product.image || '/placeholder-product.jpg',
      description: product.description || 'Produto sem descrição',
      stock: parseInt(product.stock) || 0,
      active: product.active
    }));

    res.json(products);

  } catch (error) {
    console.error('❌ Erro ao buscar produtos do banco:', error.message);
    
    // Fallback para produtos do arquivo
    console.log('🔄 Usando produtos de fallback...');
    res.json(fallbackProducts);
  }
});

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Tentar buscar do banco PostgreSQL
    const result = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.price,
          p.stock,
          p.active,
          p."imageUrl" as image,
          p.description,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p."categoryId" = c.id
        WHERE p.id = $1 AND p.active = true
      `, [id]);

    if (result.rows.length > 0) {
      const product = result.rows[0];
      
      // Mapear para o formato esperado pelo frontend
      const mappedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.price * 1.2,
        category: { name: product.category_name || 'Sem categoria' },
        image: product.image || '/placeholder-product.jpg',
        description: product.description || 'Produto sem descrição',
        stock: product.stock || 0,
        active: product.active
      };
      
      return res.json(mappedProduct);
    }

  } catch (dbError) {
    console.error('Erro ao buscar produto do banco:', dbError);
  }
  
  // Fallback para produtos do arquivo
  const product = fallbackProducts.find(p => p.id === id && p.active);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produto não encontrado'
    });
  }
  
  res.json(product);
});

module.exports = router;
