import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

/**
 * Test Database Helper
 * Utility untuk manage test database
 */

/**
 * Setup test database - Run migrations
 */
export async function setupTestDatabase() {
  try {
    console.log('🔄 Setting up test database...');

    // Run migrations
    execSync('bun prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL,
      },
      stdio: 'inherit',
    });

    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
}

/**
 * Clean test database - Truncate all tables
 */
export async function cleanTestDatabase() {
  try {
    // Truncate tables dalam urutan yang benar (hindari foreign key constraints)
    const tables = [
      'LogAktivitas',
      'Notifikasi',
      'TokenResetPassword',
      'TokenVerifikasiEmail',
      'FeedbackReview',
      'ReviewNaskah',
      'Pembayaran',
      'Pengiriman',
      'PesananCetak',
      'RevisiNaskah',
      'Naskah',
      'ProfilPenulis',
      'PeranPengguna',
      'ProfilPengguna',
      'Pengguna',
      'Genre',
      'Kategori',
    ];

    // Execute truncate
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tables.map((t) => `"${t}"`).join(', ')} CASCADE`,
    );

    console.log('🧹 Test database cleaned');
  } catch (error) {
    console.error('❌ Test database clean failed:', error);
    throw error;
  }
}

/**
 * Teardown test database - Close connection
 */
export async function teardownTestDatabase() {
  await prisma.$disconnect();
  console.log('🔌 Test database connection closed');
}

/**
 * Seed minimal test data
 */
export async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // Create test kategori
    const kategori = await prisma.kategori.create({
      data: {
        nama: 'Fiksi',
        slug: 'fiksi',
        deskripsi: 'Kategori fiksi untuk testing',
        aktif: true,
      },
    });

    // Create test genre
    const genre = await prisma.genre.create({
      data: {
        nama: 'Novel',
        slug: 'novel',
        deskripsi: 'Genre novel untuk testing',
        aktif: true,
      },
    });

    console.log('✅ Test data seeded');

    return { kategori, genre };
  } catch (error) {
    console.error('❌ Test data seeding failed:', error);
    throw error;
  }
}

export { prisma };
