import { SetMetadata } from '@nestjs/common';
import { JenisPeran } from '@prisma/client';

/**
 * Key untuk menyimpan metadata peran yang diizinkan
 */
export const PERAN_KEY = 'peran';

/**
 * Decorator untuk menentukan peran yang diizinkan mengakses route
 * 
 * Digunakan bersama dengan PeranGuard untuk role-based access control
 * 
 * @param peran - Satu atau lebih peran yang diizinkan
 * 
 * @example
 * // Hanya admin yang bisa akses
 * @Peran('admin')
 * @Get('admin-only')
 * async getAdminData() {
 *   return 'Data rahasia admin';
 * }
 * 
 * @example
 * // Penulis dan editor yang bisa akses
 * @Peran('penulis', 'editor')
 * @Post('naskah')
 * async buatNaskah() {
 *   return 'Naskah dibuat';
 * }
 * 
 * @example
 * // Semua peran bisa akses (tapi harus login)
 * @Peran('penulis', 'editor', 'percetakan', 'admin')
 * @Get('profile')
 * async getProfile() {
 *   return 'Profile data';
 * }
 */
export const Peran = (...peran: JenisPeran[]) => SetMetadata(PERAN_KEY, peran);
