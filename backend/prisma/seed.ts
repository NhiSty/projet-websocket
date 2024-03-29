import { PrismaClient, Role, User } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

type SeedUser = Omit<User, 'id' | 'globalPoints'>;

async function main() {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { username: { startsWith: 'user' } },
        { username: { startsWith: 'admin' } },
      ],
    },
  });
  const users: SeedUser[] = [];

  // Create super admin user
  const adminUser: SeedUser = {
    username: 'admin',
    password: await argon2.hash('admin'),
    role: Role.SUPERADMIN,
  };
  users.push(adminUser);

  // Generate 30 random users
  for (let i = 0; i < 30; i++) {
    const user: SeedUser = {
      username: `user${i}`,
      password: await argon2.hash('password'),
      role: Role.USER,
    };

    users.push(user);
  }

  // Generate 10 random admin
  for (let i = 0; i < 10; i++) {
    const user: SeedUser = {
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
