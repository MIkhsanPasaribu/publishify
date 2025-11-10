import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function checkIndexes() {
  console.log('\n🔍 Checking Database Indexes...\n');

  try {
    // Query untuk check indexes di PostgreSQL
    const indexes = await prisma.$queryRaw<
      Array<{
        tablename: string;
        indexname: string;
        indexdef: string;
      }>
    >`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('naskah', 'review_naskah', 'pesanan_cetak', 'pembayaran')
      ORDER BY tablename, indexname;
    `;

    console.log(`Found ${indexes.length} indexes in total\n`);

    // Group by table
    const grouped = indexes.reduce(
      (acc, idx) => {
        if (!acc[idx.tablename]) {
          acc[idx.tablename] = [];
        }
        acc[idx.tablename].push(idx);
        return acc;
      },
      {} as Record<string, typeof indexes>,
    );

    // Display by table
    for (const [tableName, tableIndexes] of Object.entries(grouped)) {
      console.log(`📋 Table: ${tableName}`);
      console.log(`   Indexes: ${tableIndexes.length}`);

      tableIndexes.forEach((idx, i) => {
        const isPrimary = idx.indexname.includes('pkey');
        const isUnique = idx.indexdef.includes('UNIQUE');
        const isComposite =
          (idx.indexdef.match(/\(/g) || []).length > 0 && idx.indexdef.split(',').length > 1;

        let badge = '';
        if (isPrimary) badge = '[PRIMARY]';
        else if (isUnique) badge = '[UNIQUE]';
        else if (isComposite) badge = '[COMPOSITE]';
        else badge = '[INDEX]';

        console.log(`   ${i + 1}. ${idx.indexname} ${badge}`);
      });
      console.log('');
    }

    // Check for our new composite indexes
    console.log('🔎 Checking for New Composite Indexes:\n');

    const expectedIndexes = [
      { table: 'naskah', pattern: 'idPenulis_status', display: 'id_penulis + status' },
      { table: 'naskah', pattern: 'status_dibuatPada', display: 'status + dibuat_pada' },
      { table: 'naskah', pattern: 'idKategori_status', display: 'id_kategori + status' },
      { table: 'naskah', pattern: 'publik_diterbitkanPada', display: 'publik + diterbitkan_pada' },
      { table: 'naskah', pattern: 'dibuatPada_idx', display: 'dibuat_pada' },
      { table: 'review_naskah', pattern: 'idEditor_status', display: 'id_editor + status' },
      {
        table: 'review_naskah',
        pattern: 'status_ditugaskanPada',
        display: 'status + ditugaskan_pada',
      },
      { table: 'pesanan_cetak', pattern: 'idPemesan_status', display: 'id_pemesan + status' },
      { table: 'pesanan_cetak', pattern: 'status_tanggalPesan', display: 'status + tanggal_pesan' },
      { table: 'pesanan_cetak', pattern: 'tanggalPesan_idx', display: 'tanggal_pesan' },
      { table: 'pembayaran', pattern: 'idPengguna_status', display: 'id_pengguna + status' },
      { table: 'pembayaran', pattern: 'status_dibuatPada', display: 'status + dibuat_pada' },
    ];

    let foundCount = 0;
    expectedIndexes.forEach((expected) => {
      const tableIndexes = indexes.filter((idx) => idx.tablename === expected.table);
      const found = tableIndexes.find((idx) => idx.indexname.includes(expected.pattern));

      const status = found ? '✅' : '❌';
      const indexName = found ? ` (${found.indexname})` : '';
      console.log(`${status} ${expected.table} [${expected.display}]${indexName}`);
      if (found) foundCount++;
    });

    console.log(`\n📊 Summary: ${foundCount}/${expectedIndexes.length} composite indexes found`);

    if (foundCount === expectedIndexes.length) {
      console.log('\n🎉 All composite indexes are already created!');
      console.log('   No migration needed - indexes are active.\n');
    } else {
      console.log('\n⚠️  Some indexes are missing. Need to run migration.\n');
      console.log('💡 Solution: Use direct database connection for migration');
      console.log('   Command: bunx prisma db push --accept-data-loss\n');
    }
  } catch (error) {
    console.error('❌ Error checking indexes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIndexes();
