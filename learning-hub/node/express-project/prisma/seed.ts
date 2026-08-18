import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@example.com';
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash }
  });

  console.log('Seeded demo user: demo@example.com / password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
