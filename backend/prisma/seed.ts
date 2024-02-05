import { PrismaClient, Role, User } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminUser: Omit<User, 'id'> = {
    username: 'admin',
    password: await argon2.hash('admin'),
    role: Role.SUPERADMIN,
  };

  await prisma.user.upsert({
    where: { username: adminUser.username },
    update: {},
    create: adminUser,
  });

  console.log('Admin user created');
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
