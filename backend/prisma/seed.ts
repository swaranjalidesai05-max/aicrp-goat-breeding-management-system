import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'Director', value: Role.DIRECTOR },
    { name: 'Head of Department', value: Role.HOD },
    { name: 'Senior Scientist', value: Role.SENIOR_SCIENTIST },
    { name: 'Co-PI', value: Role.CO_PI },
    { name: 'Data Enumerator', value: Role.DATA_ENUMERATOR },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name, value: role.value },
    });
  }

  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const adminEmail = 'admin@aicrp.gov.in';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      fullName: 'System Administrator',
      role: Role.DIRECTOR,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'System Administrator',
      role: Role.DIRECTOR,
      isActive: true,
    },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
