import * as bcrypt from 'bcryptjs';

/**
 * Hash password menggunakan bcryptjs
 * bcryptjs adalah pure JavaScript implementation (tidak perlu native compilation)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifikasi password dengan hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
