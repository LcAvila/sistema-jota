const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_M8VkiWQnr3BN@ep-falling-thunder-acjfd0ia-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Produtos de fallback caso o banco não esteja disponível
const fallbackProducts = [
  { id: 1, sku: 'ALH001', name: 'Alho Descascado 1kg', stock: 50, minStock: 10, unit: 'kg', barcode: '7891234567890' },
  { id: 2, sku: 'AZE001', name: 'Azeite Extra Virgem 500ml', stock: 25, minStock: 5, unit: 'un', barcode: '7891234567891' },
  { id: 3, sku: 'CAR001', name: 'Carne Seca 5kg', stock: 15, minStock: 3, unit: 'kg', barcode: '7891234567892' },
  { id: 4, sku: 'CAL001', name: 'Caldo de Galinha Concentrado', stock: 100, minStock: 20, unit: 'un', barcode: '7891234567893' },
  { id: 5, sku: 'LIN001', name: 'Linguiça Calabresa 5kg', stock: 8, minStock: 5, unit: 'kg', barcode: '7891234567894' }
];

// GET /api/stock/overview - Visão geral do estoque
router.get('/overview', async (req, res) => {
  try {
    console.log('🔄 Buscando dados de estoque...');
    
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
        p."minStock",
        p.unit,
        p.barcode,
        c.name as category_name,
        CASE 
          WHEN p."minStock" IS NOT NULL AND p.stock <= p."minStock" THEN true
          ELSE false
        END as "belowMin"
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p.active = true
      ORDER BY p.name
    `);

    console.log(`✅ ${result.rows.length} produtos encontrados no banco`);

    // Mapear dados para o formato esperado pelo frontend
    const stockData = result.rows.map(product => ({
      id: product.id,
      sku: `SKU${String(product.id).padStart(3, '0')}`, // Gerar SKU baseado no ID
      code: product.barcode || null,
      name: product.name,
      stock: product.stock || 0,
      minStock: product.minStock || null,
      unit: product.unit || 'un',
      barcode: product.barcode || null,
      belowMin: product.belowMin || false
    }));

    res.json({
      success: true,
      data: stockData,
      message: `${stockData.length} produtos carregados`
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estoque do banco:', error.message);
    
    // Fallback para produtos simulados
    console.log('🔄 Usando produtos de fallback...');
    
    const stockData = fallbackProducts.map(product => ({
      ...product,
      belowMin: product.minStock ? product.stock <= product.minStock : false
    }));

    res.json({
      success: true,
      data: stockData,
      message: `${stockData.length} produtos carregados (fallback)`,
      fallback: true
    });
  }
});

// GET /api/stock/product/:id - Detalhes de estoque de um produto específico
router.get('/product/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`🔄 Buscando produto ${id}...`);
    
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.stock,
        p.active,
        p."imageUrl" as image,
        p.description,
        p."minStock",
        p.unit,
        p.barcode,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p.id = $1 AND p.active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const product = result.rows[0];
    const stockData = {
      id: product.id,
      sku: `SKU${String(product.id).padStart(3, '0')}`,
      code: product.barcode || null,
      name: product.name,
      stock: product.stock || 0,
      minStock: product.minStock || null,
      unit: product.unit || 'un',
      barcode: product.barcode || null,
      belowMin: product.minStock ? product.stock <= product.minStock : false,
      price: product.price,
      category: product.category_name,
      image: product.image,
      description: product.description
    };

    res.json({
      success: true,
      data: stockData
    });

  } catch (error) {
    console.error('❌ Erro ao buscar produto:', error.message);
    
    // Fallback
    const fallbackProduct = fallbackProducts.find(p => p.id === parseInt(id));
    if (fallbackProduct) {
      res.json({
        success: true,
        data: {
          ...fallbackProduct,
          belowMin: fallbackProduct.minStock ? fallbackProduct.stock <= fallbackProduct.minStock : false
        },
        fallback: true
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
  }
});

// PUT /api/stock/adjust/:id - Ajustar estoque de um produto
router.put('/adjust/:id', async (req, res) => {
  const { id } = req.params;
  const { adjustment, reason } = req.body;

  if (!adjustment || typeof adjustment !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Ajuste de estoque é obrigatório e deve ser um número'
    });
  }

  try {
    console.log(`🔄 Ajustando estoque do produto ${id} em ${adjustment}...`);
    
    // Buscar estoque atual
    const currentResult = await client.query(
      'SELECT stock FROM products WHERE id = $1 AND active = true',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const currentStock = currentResult.rows[0].stock || 0;
    const newStock = currentStock + adjustment;

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Estoque não pode ficar negativo'
      });
    }

    // Atualizar estoque
    await client.query(
      'UPDATE products SET stock = $1 WHERE id = $2',
      [newStock, id]
    );

    console.log(`✅ Estoque atualizado: ${currentStock} → ${newStock}`);

    res.json({
      success: true,
      data: {
        productId: parseInt(id),
        previousStock: currentStock,
        adjustment: adjustment,
        newStock: newStock,
        reason: reason || 'Ajuste manual'
      },
      message: 'Estoque ajustado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao ajustar estoque:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
