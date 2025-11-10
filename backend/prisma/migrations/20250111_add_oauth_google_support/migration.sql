-- CreateTable: oauth_state untuk CSRF protection
-- AlterTable: pengguna untuk OAuth support

BEGIN;

-- ============================================
-- 1. ALTER TABLE pengguna - Add OAuth fields
-- ============================================

-- Add OAuth provider fields
ALTER TABLE pengguna 
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS email_verified_by_provider BOOLEAN DEFAULT FALSE;

-- Make password optional for OAuth users
ALTER TABLE pengguna 
  ALTER COLUMN kata_sandi DROP NOT NULL;

-- Add indexes for OAuth lookups (performance)
CREATE INDEX IF NOT EXISTS idx_pengguna_google_id ON pengguna(google_id);
CREATE INDEX IF NOT EXISTS idx_pengguna_facebook_id ON pengguna(facebook_id);
CREATE INDEX IF NOT EXISTS idx_pengguna_apple_id ON pengguna(apple_id);
CREATE INDEX IF NOT EXISTS idx_pengguna_provider ON pengguna(provider);

-- Update existing users to use "local" provider
UPDATE pengguna 
SET provider = 'local' 
WHERE provider IS NULL AND kata_sandi IS NOT NULL;

-- ============================================
-- 2. CREATE TABLE oauth_state - CSRF protection
-- ============================================

CREATE TABLE IF NOT EXISTS oauth_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  redirect_url TEXT,
  kadaluarsa_pada TIMESTAMP NOT NULL,
  dibuat_pada TIMESTAMP DEFAULT NOW()
);

-- Indexes for oauth_state
CREATE INDEX IF NOT EXISTS idx_oauth_state_state ON oauth_state(state);
CREATE INDEX IF NOT EXISTS idx_oauth_state_expiry ON oauth_state(kadaluarsa_pada);

-- ============================================
-- 3. CREATE FUNCTION - Auto-cleanup expired states
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void 
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM oauth_state WHERE kadaluarsa_pada < NOW();
END;
$$;

-- Schedule cleanup job (optional - can be done via cron job)
-- COMMENT: Run `SELECT cleanup_expired_oauth_states();` periodically

COMMIT;

-- ============================================
-- MIGRATION SUMMARY
-- ============================================
-- Changes:
-- 1. Added OAuth fields to pengguna table:
--    - google_id (nullable, unique)
--    - facebook_id (nullable, unique) 
--    - apple_id (nullable, unique)
--    - provider (nullable)
--    - avatar_url (nullable)
--    - email_verified_by_provider (default: false)
--
-- 2. Made kata_sandi nullable (OAuth users don't need password)
--
-- 3. Created oauth_state table for CSRF protection
--
-- 4. Added indexes for performance
--
-- 5. Created cleanup function for expired OAuth states
--
-- Backward Compatibility:
-- - Existing users get provider = 'local'
-- - Existing passwords remain intact
-- - No breaking changes
-- ============================================
