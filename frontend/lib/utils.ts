import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan class names dengan Tailwind CSS merge
 * Menghindari konflik class Tailwind yang duplicate
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka ke format Rupiah
 * @param amount - Jumlah yang akan diformat
 * @returns String dengan format Rupiah (contoh: "Rp 1.000.000")
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke format Indonesia
 * @param date - Date object atau string ISO
 * @returns String dengan format "1 Januari 2024"
 */
export function formatTanggal(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

/**
 * Format tanggal dengan waktu
 * @param date - Date object atau string ISO
 * @returns String dengan format "1 Januari 2024, 14:30"
 */
export function formatTanggalWaktu(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Truncate text dengan ellipsis
 * @param text - Text yang akan dipotong
 * @param maxLength - Panjang maksimal karakter
 * @returns Text yang sudah dipotong dengan "..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
