import { PrismaClient } from '../src/generated/prisma/client.ts';
import bcrypt from 'bcrypt';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


async function main() {
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.createMany({
    data: [
      { name: 'Adam Admin', email: 'admin@test.com', passwordHash: password, role: 'ADMIN' },
      { name: 'Saalih Manager', email: 'pm@test.com', passwordHash: password, role: 'PROJECT_MANAGER' },
      { name: 'Yusuf Member', email: 'member@test.com', passwordHash: password, role: 'TEAM_MEMBER' },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
