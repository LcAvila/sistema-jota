const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔌 Testando conexão com o banco de dados Neon Tech...');
    
    // Testar conexão básica
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar uma query simples
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('⏰ Hora atual do banco:', result[0].current_time);
    
    // Verificar se a tabela de usuários existe
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📋 Tabelas disponíveis:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Testar busca de usuário
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true
      }
    });
    
    if (user) {
      console.log('👤 Usuário encontrado:', user);
    } else {
      console.log('❌ Nenhum usuário encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão fechada');
  }
}

testConnection();
