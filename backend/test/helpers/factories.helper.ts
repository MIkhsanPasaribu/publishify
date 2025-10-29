import { JenisPeran } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

/**
 * Test Data Factories
 * Generate fake data untuk testing
 */

/**
 * Generate valid email untuk testing
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}@test.com`;
}

/**
 * Generate strong password
 */
export function generateTestPassword(): string {
  return 'Test@Password123!';
}

/**
 * Hash password untuk testing
 */
export async function hashTestPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Create test user data
 */
export async function createTestUserData(overrides: any = {}) {
  const password = generateTestPassword();

  return {
    email: generateTestEmail(),
    kataSandi: await hashTestPassword(password),
    telepon: '081234567890',
    aktif: true,
    terverifikasi: true,
    plainPassword: password, // For login testing
    ...overrides,
  };
}

/**
 * Create test profil pengguna data
 */
export function createTestProfilPenggunaData(idPengguna: string, overrides: any = {}) {
  return {
    idPengguna,
    namaDepan: 'Test',
    namaBelakang: 'User',
    namaTampilan: 'testuser',
    bio: 'Test bio untuk testing',
    jenisKelamin: 'laki-laki',
    ...overrides,
  };
}

/**
 * Create test peran pengguna data
 */
export function createTestPeranPenggunaData(
  idPengguna: string,
  jenisPeran: JenisPeran = 'penulis',
) {
  return {
    idPengguna,
    jenisPeran,
    aktif: true,
  };
}

/**
 * Create test naskah data
 */
export function createTestNaskahData(
  idPenulis: string,
  idKategori: string,
  idGenre: string,
  overrides: any = {},
) {
  const timestamp = Date.now();

  return {
    idPenulis,
    judul: `Test Naskah ${timestamp}`,
    subJudul: 'Subtitle Test',
    sinopsis:
      'Ini adalah sinopsis test untuk naskah yang dibuat dalam proses testing. Minimal 50 karakter untuk memenuhi validasi.',
    idKategori,
    idGenre,
    bahasaTulis: 'id',
    jumlahHalaman: 200,
    jumlahKata: 50000,
    status: 'draft',
    publik: false,
    ...overrides,
  };
}

/**
 * Create test review data
 */
export function createTestReviewData(idNaskah: string, idEditor: string, overrides: any = {}) {
  return {
    idNaskah,
    idEditor,
    status: 'ditugaskan',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    ...overrides,
  };
}

/**
 * Create test pesanan cetak data
 */
export function createTestPesananCetakData(
  idPemesan: string,
  idNaskah: string,
  idPercetakan: string,
  overrides: any = {},
) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    idPemesan,
    idNaskah,
    idPercetakan,
    nomorPesanan: `PO-${timestamp}-${random}`,
    jumlah: 100,
    jenisCover: 'soft_cover',
    jenisKertas: 'hvs_70gsm',
    finishing: [],
    hargaSatuan: 50000,
    hargaTotal: 5000000,
    status: 'tertunda',
    ...overrides,
  };
}

/**
 * Create test pembayaran data
 */
export function createTestPembayaranData(
  idPengguna: string,
  idPesanan: string,
  jumlah: number,
  overrides: any = {},
) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    idPengguna,
    idPesanan,
    nomorTransaksi: `TRX-${timestamp}-${random}`,
    jumlah,
    metodePembayaran: 'transfer_bank',
    status: 'tertunda',
    ...overrides,
  };
}

/**
 * Create test notifikasi data
 */
export function createTestNotifikasiData(idPengguna: string, overrides: any = {}) {
  return {
    idPengguna,
    judul: 'Test Notification',
    pesan: 'This is a test notification message',
    tipe: 'info',
    dibaca: false,
    ...overrides,
  };
}

/**
 * Generate random string
 */
export function generateRandomString(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate UUID v4 (for testing)
 */
export function generateTestUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Wait/delay untuk testing async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Assert error message contains substring
 */
export function assertErrorMessage(error: any, expectedMessage: string) {
  expect(error.message).toContain(expectedMessage);
}

/**
 * Assert HTTP exception status
 */
export function assertHttpStatus(error: any, expectedStatus: number) {
  expect(error.status).toBe(expectedStatus);
}
