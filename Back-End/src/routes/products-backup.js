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
    description: "Alho descascado fresco, prático e de qualidade superior",
    active: true,
    stock: 50,
    isOnSale: true,
    discount: 16
  },
  {
    id: 2,
    name: "Alho Frito Granulado",
    price: 12.50,
    category: { name: "Temperos" },
    description: "Alho frito granulado crocante, ideal para finalizar pratos",
    active: true,
    stock: 30
  },
  {
    id: 3,
    name: "Azeite Extra Virgem",
    price: 19.90,
    originalPrice: 24.90,
    category: { name: "Temperos" },
    description: "Azeite extra virgem premium, sabor e qualidade excepcionais",
    active: true,
    stock: 25,
    isOnSale: true,
    discount: 20
  },
  {
    id: 4,
    name: "Ajinomoto Realçador de Sabor",
    price: 8.90,
    category: { name: "Temperos" },
    description: "Realçador de sabor Ajinomoto, traz o melhor dos seus pratos",
    active: true,
    stock: 40
  },
  {
    id: 5,
    name: "Açafrão em Pó",
    price: 12.90,
    originalPrice: 15.90,
    category: { name: "Temperos" },
    description: "Açafrão puro, cor e sabor únicos para suas receitas",
    active: true,
    stock: 20,
    isOnSale: true,
    discount: 19
  },
  {
    id: 6,
    name: "Colorau Premium",
    price: 6.90,
    category: { name: "Temperos" },
    description: "Colorau de primeira qualidade para temperar e colorir",
    active: true,
    stock: 35
  },
  {
    id: 7,
    name: "Cominho Moído",
    price: 9.50,
    category: { name: "Temperos" },
    description: "Cominho moído aromático, ideal para carnes e feijão",
    active: true,
    stock: 28
  },
  {
    id: 8,
    name: "Lemon Pepper",
    price: 7.90,
    category: { name: "Temperos" },
    description: "Tempero lemon pepper para carnes e aves",
    active: true,
    stock: 45
  },
  {
    id: 9,
    name: "Pimenta do Reino Moída 1kg",
    price: 12.90,
    category: { name: "Temperos" },
    description: "Pimenta do reino moída na hora, aroma intenso",
    active: true,
    stock: 22
  },
  {
    id: 10,
    name: "Tempero do Chef",
    price: 8.50,
    category: { name: "Temperos" },
    description: "Tempero completo com ervas selecionadas",
    active: true,
    stock: 38
  },

  // Conservas
  {
    id: 11,
    name: "Azeitona Verde Especial",
    price: 7.80,
    category: { name: "Conservas" },
    description: "Azeitonas verdes selecionadas, conservadas em salmoura",
    active: true,
    stock: 60
  },
  {
    id: 12,
    name: "Alcaparras Importadas",
    price: 18.90,
    category: { name: "Conservas" },
    description: "Alcaparras importadas de primeira qualidade",
    active: true,
    stock: 15
  },
  {
    id: 13,
    name: "Pimenta Biquinho",
    price: 11.50,
    category: { name: "Conservas" },
    description: "Pimenta biquinho doce, perfeita para petiscos",
    active: true,
    stock: 32
  },
  {
    id: 14,
    name: "Cogumelo Fatiado",
    price: 13.90,
    category: { name: "Conservas" },
    description: "Cogumelos fatiados em conserva, prontos para usar",
    active: true,
    stock: 18
  },

  // Carnes
  {
    id: 15,
    name: "Carne Seca 5kg",
    price: 89.90,
    category: { name: "Carnes" },
    description: "Carne seca de primeira qualidade, ideal para feijoada",
    active: true,
    stock: 8
  },
  {
    id: 16,
    name: "Linguiça Calabresa 5kg",
    price: 45.90,
    category: { name: "Carnes" },
    description: "Linguiça calabresa defumada, perfeita para churrascos",
    active: true,
    stock: 12
  },
  {
    id: 17,
    name: "Linguiça Mineira",
    price: 28.90,
    category: { name: "Carnes" },
    description: "Linguiça mineira tradicional com tempero caseiro",
    active: true,
    stock: 20
  },
  {
    id: 18,
    name: "Linguiça Suína Artesanal",
    price: 32.50,
    category: { name: "Carnes" },
    description: "Linguiça suína artesanal com tempero especial",
    active: true,
    stock: 15
  },

  // Massas
  {
    id: 19,
    name: "Massa de Lasanha 2kg",
    price: 16.90,
    category: { name: "Massas" },
    description: "Massa de lasanha fresca, ideal para pratos especiais",
    active: true,
    stock: 25
  },
  {
    id: 20,
    name: "Nhoque Artesanal 1kg",
    price: 12.90,
    category: { name: "Massas" },
    description: "Nhoque artesanal feito com batata selecionada",
    active: true,
    stock: 30
  },
  {
    id: 21,
    name: "Massa de Pastel Disco",
    price: 8.90,
    category: { name: "Massas" },
    description: "Massa de pastel em disco, pronta para rechear",
    active: true,
    stock: 40
  },
  {
    id: 22,
    name: "Massa de Lasanha",
    price: 14.90,
    category: { name: "Massas" },
    description: "Massa de lasanha tradicional",
    active: true,
    stock: 35
  },
  {
    id: 23,
    name: "Massa de Nhoque",
    price: 11.90,
    category: { name: "Massas" },
    description: "Massa de nhoque pronta para cozinhar",
    active: true,
    stock: 28
  },
  {
    id: 24,
    name: "Massa de Pastel",
    price: 7.90,
    category: { name: "Massas" },
    description: "Massa de pastel fina e crocante",
    active: true,
    stock: 45
  },

  // Farinhas
  {
    id: 25,
    name: "Farinha de Rosca 10kg",
    price: 35.90,
    category: { name: "Farinhas" },
    description: "Farinha de rosca fina para empanados e frituras",
    active: true,
    stock: 10
  },
  {
    id: 26,
    name: "Farinha de Rosca",
    price: 8.90,
    category: { name: "Farinhas" },
    description: "Farinha de rosca tradicional",
    active: true,
    stock: 50
  },

  // Vegetais
  {
    id: 27,
    name: "Aipim Descascado 10kg",
    price: 25.90,
    category: { name: "Vegetais" },
    description: "Aipim descascado e higienizado, pronto para preparo",
    active: true,
    stock: 15
  },
  {
    id: 28,
    name: "Alho Descascado 1kg",
    price: 18.90,
    category: { name: "Vegetais" },
    description: "Alho descascado e selecionado, economia de tempo",
    active: true,
    stock: 25
  },
  {
    id: 29,
    name: "Alho Descascado Premium",
    price: 12.90,
    category: { name: "Vegetais" },
    description: "Alho descascado premium",
    active: true,
    stock: 30
  },
  {
    id: 30,
    name: "Alho Frito 1kg",
    price: 22.90,
    category: { name: "Vegetais" },
    description: "Alho frito crocante, pronto para usar",
    active: true,
    stock: 18
  },

  // Ovos
  {
    id: 31,
    name: "Ovos de Codorna 700g",
    price: 15.90,
    category: { name: "Ovos" },
    description: "Ovos de codorna frescos, ricos em proteínas",
    active: true,
    stock: 22
  },
  {
    id: 32,
    name: "Ovos de Codorna",
    price: 13.90,
    category: { name: "Ovos" },
    description: "Ovos de codorna selecionados",
    active: true,
    stock: 28
  },

  // Caldos
  {
    id: 33,
    name: "Caldo de Galinha Concentrado",
    price: 4.90,
    category: { name: "Caldos" },
    description: "Caldo de galinha concentrado para sopas e risotos",
    active: true,
    stock: 60
  },

  // Ingredientes
  {
    id: 34,
    name: "Bicarbonato de Sódio",
    price: 3.90,
    category: { name: "Ingredientes" },
    description: "Bicarbonato de sódio puro para diversos usos",
    active: true,
    stock: 80
  },
  {
    id: 35,
    name: "Uvas Passas",
    price: 8.90,
    category: { name: "Ingredientes" },
    description: "Uvas passas doces para sobremesas e pratos especiais",
    active: true,
    stock: 35
  },

  // Pratos Prontos
  {
    id: 36,
    name: "Bolinho de Bacalhau",
    price: 19.90,
    category: { name: "Pratos Prontos" },
    description: "Bolinhos de bacalhau congelados, prontos para fritar",
    active: true,
    stock: 12
  },
  {
    id: 37,
    name: "Carne Seca Premium",
    price: 65.90,
    category: { name: "Pratos Prontos" },
    description: "Carne seca de primeira qualidade",
    active: true,
    stock: 8
  }
];

// GET /api/products - Listar produtos do banco de dados
router.get('/', async (req, res) => {
  try {
    // Tentar buscar do banco de dados primeiro
    try {
      const result = await client.query(`
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
      
      const products = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price) || 0,
        category: { name: row.category_name || 'Sem categoria' },
        description: row.description || '',
        active: row.active,
        stock: row.stock || 0,
        image: row.image,
        imageUrl: row.image
      }));
      
      console.log(`✅ ${products.length} produtos carregados do banco de dados`);
      res.json(products);
      
    } catch (dbError) {
      console.error('Erro ao buscar produtos do banco:', dbError);
      // Fallback para produtos do arquivo
      const activeProducts = fallbackProducts.filter(p => p.active);
      console.log(`⚠️ Usando ${activeProducts.length} produtos de fallback`);
      res.json(activeProducts);
    }
    
  } catch (error) {
    console.error('Erro geral ao buscar produtos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
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

    if (result.rows.length === 0) {
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
    
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
