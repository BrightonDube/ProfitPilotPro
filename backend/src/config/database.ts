import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    console.error('\n⚠️  IMPORTANT: Your database is not reachable!');
    console.error('📋 Please follow these steps:');
    console.error('1. Open DATABASE_SETUP.md for instructions');
    console.error('2. Set up a free database at https://supabase.com');
    console.error('3. Update DATABASE_URL in backend/.env');
    console.error('4. The app will auto-restart when you save .env\n');
    // Don't exit, let the app run without database
    console.log('🔄 Running without database connection...');
  });

