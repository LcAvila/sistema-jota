const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_M8VkiWQnr3BN@ep-falling-thunder-acjfd0ia-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Conectando ao Neon Tech...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    // Testar query de produtos
    const result = await client.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.stock,
        p.active,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p.active = true
      ORDER BY p.name
      LIMIT 5
    `);
    
    console.log(`📦 ${result.rows.length} produtos encontrados:`);
    result.rows.forEach(product => {
      console.log(`- ${product.name} (R$ ${product.price}) - ${product.category_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();
