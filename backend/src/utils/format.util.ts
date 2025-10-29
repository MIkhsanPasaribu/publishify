import { format as formatDateFns, formatDistanceToNow, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Format tanggal ke format Indonesia
 */
export function formatTanggal(date: Date | string, formatStr: string = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDateFns(dateObj, formatStr, { locale: localeId });
}

/**
 * Format tanggal dan waktu lengkap
 */
export function formatTanggalWaktu(date: Date | string): string {
  return formatTanggal(date, 'dd MMMM yyyy, HH:mm');
}

/**
 * Format tanggal relatif (misal: "2 hari yang lalu")
 */
export function formatTanggalRelatif(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: localeId });
}

/**
 * Format angka dengan pemisah ribuan
 */
export function formatAngka(number: number): string {
  return new Intl.NumberFormat('id-ID').format(number);
}

/**
 * Format mata uang Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ukuran file (bytes ke KB, MB, GB)
 */
export function formatUkuranFile(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Slugify string (untuk URL-friendly)
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Truncate text dengan ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
