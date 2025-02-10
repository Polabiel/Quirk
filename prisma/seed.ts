/**
 * Adds seed data to your db
 *
 * @see https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Adicionando dados para teste... 🌱`);

  const existingUser = await prisma.user.findUnique({
    where: { number: '556699054430@s.whatsapp.net' },
  });

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        name: 'José',
        number: '556699054430@s.whatsapp.net',
      },
    });
    console.log(`Usuário criado: ${user.number}`);
  } else {
    console.log(`Usuário já existe: ${existingUser.number}`);
  }

  console.log(`🔥 Dados inseridos 🔥`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
