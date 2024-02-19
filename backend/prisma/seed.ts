import { PrismaClient, Role, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { faker } from '@faker-js/faker';

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
  const users: Omit<User, 'id'>[] = [];

  await prisma.user.deleteMany({
    where: {
      OR: [
        { username: { startsWith: 'user' } },
        { username: { startsWith: 'admin' } },
      ],
    },
  });

  // Generate 30 random users
  for (let i = 0; i < 30; i++) {
    const user: Omit<User, 'id'> = {
      username: `user${i}`,
      password: await argon2.hash('password'),
      role: Role.USER,
    };

    users.push(user);
  }

  // Generate 10 random admin
  for (let i = 0; i < 10; i++) {
    const user: Omit<User, 'id'> = {
      username: `admin${i}`,
      password: await argon2.hash('password'),
      role: Role.ADMIN,
    };

    users.push(user);
  }

  await prisma.user.createMany({ data: users });
  console.log('Random users created');
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
