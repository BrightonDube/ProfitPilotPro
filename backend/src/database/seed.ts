import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@bizpilot.dev';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'BizPilot Admin';
const BUSINESS_NAME = process.env.SEED_BUSINESS_NAME ?? 'BizPilot Demo Business';

async function main() {
  console.log('🌱 Starting database seed...');

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: hashedPassword,
      emailVerified: true,
    },
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      provider: 'email',
      emailVerified: true,
      profile: {
        create: {
          email: ADMIN_EMAIL,
          fullName: ADMIN_NAME,
          provider: 'email',
          emailVerified: true,
        },
      },
      settings: {
        create: {
          businessName: BUSINESS_NAME,
          hourlyRate: 25,
          defaultMargin: 35,
        },
      },
    },
    include: {
      profile: true,
      settings: true,
    },
  });

  console.log(`✅ Upserted admin user: ${adminUser.email}`);

  const existingBusiness = await prisma.business.findFirst({
    where: { name: BUSINESS_NAME },
  });

  const business = existingBusiness
    ? await prisma.business.update({
        where: { id: existingBusiness.id },
        data: {
          description: 'Demo business created via seed script',
        },
      })
    : await prisma.business.create({
        data: {
          name: BUSINESS_NAME,
          description: 'Demo business created via seed script',
          createdBy: adminUser.id,
        },
      });

  console.log(`🏢 Upserted business: ${business.name}`);

  await prisma.businessUser.upsert({
    where: {
      businessId_userId: {
        businessId: business.id,
        userId: adminUser.id,
      },
    },
    update: {
      role: 'admin',
      isActive: true,
    },
    create: {
      businessId: business.id,
      userId: adminUser.id,
      role: 'admin',
      isActive: true,
    },
  });

  console.log('👥 Linked admin user to business as admin');

  const existingAdminRole = await prisma.userRole.findFirst({
    where: {
      businessId: business.id,
      name: 'admin',
    },
  });

  if (existingAdminRole) {
    await prisma.userRole.update({
      where: { id: existingAdminRole.id },
      data: {
        description: 'Full access role (seeded)',
        isDefault: true,
      },
    });
  } else {
    await prisma.userRole.create({
      data: {
        businessId: business.id,
        name: 'admin',
        description: 'Full access role (seeded)',
        isDefault: true,
      },
    });
  }

  console.log('🔐 Seeded default admin role');

  console.log('🌱 Database seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
