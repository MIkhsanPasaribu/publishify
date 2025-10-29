/**
 * Global test setup
 * Dijalankan sebelum semua test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/publishify_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-12345';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Increase test timeout globally
jest.setTimeout(30000);

// Mock console untuk reduce noise di test output (optional)
global.console = {
  ...console,
  // Uncomment untuk mute logs di test
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep errors visible
};

beforeAll(async () => {
  console.log('🧪 Starting test suite...');
});

afterAll(async () => {
  console.log('✅ Test suite completed');
});
