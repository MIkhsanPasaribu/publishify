import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding database...');

  // Hash password default
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Buat admin user
  const admin = await prisma.pengguna.upsert({
    where: { email: 'admin@publishify.com' },
    update: {},
    create: {
      email: 'admin@publishify.com',
      kataSandi: hashedPassword,
      telepon: '081234567890',
      aktif: true,
      terverifikasi: true,
      emailDiverifikasiPada: new Date(),
      profilPengguna: {
        create: {
          namaDepan: 'Admin',
          namaBelakang: 'Publishify',
          namaTampilan: 'Admin System',
          bio: 'Administrator sistem Publishify',
        },
      },
      peranPengguna: {
        create: {
          jenisPeran: 'admin',
          aktif: true,
        },
      },
    },
  });
  console.log('✅ Admin user dibuat:', admin.email);

  // 2. Buat editor user
  const editor = await prisma.pengguna.upsert({
    where: { email: 'editor@publishify.com' },
    update: {},
    create: {
      email: 'editor@publishify.com',
      kataSandi: hashedPassword,
      telepon: '081234567891',
      aktif: true,
      terverifikasi: true,
      emailDiverifikasiPada: new Date(),
      profilPengguna: {
        create: {
          namaDepan: 'Editor',
          namaBelakang: 'Publishify',
          namaTampilan: 'Editor Professional',
          bio: 'Editor profesional dengan pengalaman 10 tahun',
        },
      },
      peranPengguna: {
        create: {
          jenisPeran: 'editor',
          aktif: true,
        },
      },
    },
  });
  console.log('✅ Editor user dibuat:', editor.email);

  // 3. Buat penulis user dengan profil lengkap
  const penulis = await prisma.pengguna.upsert({
    where: { email: 'penulis@publishify.com' },
    update: {},
    create: {
      email: 'penulis@publishify.com',
      kataSandi: hashedPassword,
      telepon: '081234567892',
      aktif: true,
      terverifikasi: true,
      emailDiverifikasiPada: new Date(),
      profilPengguna: {
        create: {
          namaDepan: 'Penulis',
          namaBelakang: 'Demo',
          namaTampilan: 'Penulis Hebat',
          bio: 'Penulis novel dan cerita fiksi',
          kota: 'Jakarta',
          provinsi: 'DKI Jakarta',
        },
      },
      peranPengguna: {
        create: {
          jenisPeran: 'penulis',
          aktif: true,
        },
      },
      profilPenulis: {
        create: {
          namaPena: 'P. Demo',
          biografi: 'Penulis dengan passion dalam storytelling',
          spesialisasi: ['Fiksi', 'Romance', 'Mystery'],
          totalBuku: 0,
          totalDibaca: 0,
          ratingRataRata: 0,
        },
      },
    },
  });
  console.log('✅ Penulis user dibuat:', penulis.email);

  // 4. Buat percetakan user
  const percetakan = await prisma.pengguna.upsert({
    where: { email: 'percetakan@publishify.com' },
    update: {},
    create: {
      email: 'percetakan@publishify.com',
      kataSandi: hashedPassword,
      telepon: '081234567893',
      aktif: true,
      terverifikasi: true,
      emailDiverifikasiPada: new Date(),
      profilPengguna: {
        create: {
          namaDepan: 'Percetakan',
          namaBelakang: 'Publishify',
          namaTampilan: 'Percetakan Partner',
          bio: 'Partner percetakan terpercaya',
          kota: 'Bandung',
          provinsi: 'Jawa Barat',
        },
      },
      peranPengguna: {
        create: {
          jenisPeran: 'percetakan',
          aktif: true,
        },
      },
    },
  });
  console.log('✅ Percetakan user dibuat:', percetakan.email);

  // 5. Buat kategori-kategori naskah
  const kategoriFiksi = await prisma.kategori.upsert({
    where: { slug: 'fiksi' },
    update: {},
    create: {
      nama: 'Fiksi',
      slug: 'fiksi',
      deskripsi: 'Karya fiksi dan imajinasi',
      aktif: true,
    },
  });

  const kategoriNonFiksi = await prisma.kategori.upsert({
    where: { slug: 'non-fiksi' },
    update: {},
    create: {
      nama: 'Non-Fiksi',
      slug: 'non-fiksi',
      deskripsi: 'Karya berdasarkan fakta dan kenyataan',
      aktif: true,
    },
  });

  console.log('✅ Kategori dibuat');

  // 6. Buat sub-kategori
  const subKategoriRomance = await prisma.kategori.upsert({
    where: { slug: 'romance' },
    update: {},
    create: {
      nama: 'Romance',
      slug: 'romance',
      deskripsi: 'Cerita percintaan',
      idInduk: kategoriFiksi.id,
      aktif: true,
    },
  });

  const subKategoriMystery = await prisma.kategori.upsert({
    where: { slug: 'mystery' },
    update: {},
    create: {
      nama: 'Mystery',
      slug: 'mystery',
      deskripsi: 'Cerita misteri dan detektif',
      idInduk: kategoriFiksi.id,
      aktif: true,
    },
  });

  console.log('✅ Sub-kategori dibuat');

  // 7. Buat genre-genre
  const genres = [
    { nama: 'Drama', slug: 'drama', deskripsi: 'Genre drama' },
    { nama: 'Comedy', slug: 'comedy', deskripsi: 'Genre komedi' },
    { nama: 'Thriller', slug: 'thriller', deskripsi: 'Genre thriller' },
    { nama: 'Fantasy', slug: 'fantasy', deskripsi: 'Genre fantasi' },
    { nama: 'Sci-Fi', slug: 'sci-fi', deskripsi: 'Genre fiksi ilmiah' },
    { nama: 'Horror', slug: 'horror', deskripsi: 'Genre horor' },
  ];

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: {
        ...genre,
        aktif: true,
      },
    });
  }
  console.log('✅ Genre dibuat');

  // 8. Buat beberapa tags
  const tags = [
    { nama: 'Inspiratif', slug: 'inspiratif' },
    { nama: 'Motivasi', slug: 'motivasi' },
    { nama: 'Petualangan', slug: 'petualangan' },
    { nama: 'Keluarga', slug: 'keluarga' },
    { nama: 'Persahabatan', slug: 'persahabatan' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log('✅ Tags dibuat');

  // 9. Buat sample naskah
  const genreDrama = await prisma.genre.findFirst({ where: { slug: 'drama' } });
  
  const naskahSample = await prisma.naskah.create({
    data: {
      idPenulis: penulis.id,
      judul: 'Perjalanan Hidup',
      subJudul: 'Sebuah Kisah Inspiratif',
      sinopsis:
        'Sebuah kisah tentang perjalanan hidup seseorang yang penuh dengan tantangan dan pembelajaran. Melalui berbagai pengalaman, tokoh utama belajar tentang arti kehidupan, cinta, dan persahabatan.',
      idKategori: kategoriFiksi.id,
      idGenre: genreDrama?.id || kategoriFiksi.id,
      bahasaTulis: 'id',
      jumlahHalaman: 250,
      jumlahKata: 75000,
      status: 'draft',
      publik: false,
    },
  });
  console.log('✅ Sample naskah dibuat:', naskahSample.judul);

  console.log('');
  console.log('🎉 Seeding selesai!');
  console.log('');
  console.log('📝 Informasi Login:');
  console.log('Admin     : admin@publishify.com / Password123!');
  console.log('Editor    : editor@publishify.com / Password123!');
  console.log('Penulis   : penulis@publishify.com / Password123!');
  console.log('Percetakan: percetakan@publishify.com / Password123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
