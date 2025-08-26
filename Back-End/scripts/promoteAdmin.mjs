import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@jota.local';
  try {
    const user = await prisma.user.update({ where: { email }, data: { role: 'admin' } });
    console.log(`Promovido: ${user.email} -> role=admin`);
  } catch (err) {
    console.error('Falha ao promover admin:', err?.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
