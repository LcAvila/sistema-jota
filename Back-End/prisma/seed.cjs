require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding: criando Store e Admin...');

  // 1) Criar/garantir Store padrão
  const store = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Matriz',
      address: 'Endereco padrao',
      timezone: 'America/Sao_Paulo',
    },
  });

  // 2) Criar/garantir usuário admin
  const email = 'admin@jota.local';
  const password = 'admin123'; // troque depois em produção
  const hash = bcrypt.hashSync(password, 8);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Jonatas',
      lastName: 'Charon',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      email,
      password: hash,
      role: 'admin',
      storeId: store.id,
      active: true,
    },
  });

  console.log('Seed concluído:');
  console.log({ store, admin: { id: admin.id, email: admin.email, role: admin.role } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
