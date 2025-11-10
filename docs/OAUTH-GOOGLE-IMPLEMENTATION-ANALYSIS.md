# 🔐 OAuth Google Implementation - Complete Analysis & Implementation Plan

## Publishify - Enterprise-Grade Social Authentication

**Target Sprint**: Current  
**Priority**: Critical (P1)  
**Complexity**: Medium  
**Estimated Time**: 8-12 hours

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [OAuth 2.0 Fundamentals](#oauth-20-fundamentals)
3. [Google OAuth Flow Analysis](#google-oauth-flow-analysis)
4. [Database Schema Changes](#database-schema-changes)
5. [Backend Implementation Plan](#backend-implementation-plan)
6. [Security Considerations](#security-considerations)
7. [Implementation Checklist](#implementation-checklist)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Considerations](#deployment-considerations)

---

## 🎯 Executive Summary

### Why OAuth Google?

**Business Benefits**:

- ✅ **Frictionless Onboarding**: 1-click registration (no password needed)
- ✅ **Higher Conversion**: 30-50% increase in registration completion
- ✅ **Reduced Support**: No "forgot password" tickets for OAuth users
- ✅ **Trust Factor**: Users trust Google's security
- ✅ **Verified Emails**: Automatic email verification via Google

**Technical Benefits**:

- ✅ **Security**: Offload password management to Google
- ✅ **Compliance**: GDPR, OAuth 2.0 standard
- ✅ **Scalability**: Stateless authentication (JWT)
- ✅ **Maintainability**: Less password-related code

### Implementation Strategy

**Phase 1: Backend Implementation** (Current Focus)

1. Database schema update (add OAuth fields)
2. Install Passport Google OAuth 2.0
3. Implement GoogleStrategy
4. Create OAuth endpoints & service methods
5. Add security measures (CSRF, state validation)
6. Testing & documentation

**Phase 2: Frontend Integration** (Next Sprint)

1. Add "Sign in with Google" button
2. Handle OAuth callback
3. Store JWT tokens
4. Update UI flows

### Success Criteria

- ✅ Users dapat login dengan Google account
- ✅ User baru otomatis dibuat di database
- ✅ Existing user bisa link Google account
- ✅ Email verification otomatis untuk OAuth users
- ✅ Security measures terimplementasi (CSRF, state)
- ✅ Comprehensive logging untuk audit
- ✅ Zero TypeScript errors (`bunx tsc --noEmit`)

---

## 🔐 OAuth 2.0 Fundamentals

### OAuth 2.0 Flow Types

**1. Authorization Code Flow** (✅ **RECOMMENDED** - Most Secure)

```
User → Frontend → Backend → Google → Backend → Frontend → User
```

- Server-side token exchange
- Client secret never exposed
- Supports refresh tokens
- Best for web applications

**2. Implicit Flow** (❌ Not Recommended)

```
User → Frontend → Google → Frontend → User
```

- Token in URL (insecure)
- No refresh token
- Deprecated for security reasons

**3. Hybrid Flow** (⚠️ Complex)

```
User → Frontend/Backend → Google → Frontend/Backend → User
```

- Combines Code + Implicit
- More complex implementation

**Our Choice**: ✅ **Authorization Code Flow**

### OAuth 2.0 Key Concepts

```typescript
// 1. Client ID & Secret
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

// 2. Redirect URI (Callback URL)
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

// 3. Scopes (Data Permissions)
scopes: ['profile', 'email']

// 4. State Parameter (CSRF Protection)
state: random_string_generated_by_backend

// 5. Authorization Code (One-time use)
code: authorization_code_from_google

// 6. Access Token (API Access)
access_token: token_to_access_google_apis

// 7. ID Token (User Info - JWT)
id_token: jwt_with_user_profile
```

---

## 🌊 Google OAuth Flow Analysis

### Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│               GOOGLE OAUTH 2.0 FLOW                          │
└──────────────────────────────────────────────────────────────┘

1. USER INITIATES LOGIN
   ┌─────────┐
   │ User    │ Click "Sign in with Google"
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │Frontend │ GET /auth/google
   └────┬────┘
        │
        ▼

2. BACKEND GENERATES AUTH URL
   ┌─────────┐
   │Backend  │ 1. Generate state (CSRF token)
   │         │ 2. Store state in Redis/Session
   │         │ 3. Build Google Auth URL
   └────┬────┘
        │
        │ https://accounts.google.com/o/oauth2/v2/auth?
        │   client_id=xxx
        │   redirect_uri=http://localhost:4000/api/auth/google/callback
        │   response_type=code
        │   scope=profile email
        │   state=random_csrf_token
        │   access_type=offline
        │   prompt=consent
        ▼

3. USER AUTHENTICATES WITH GOOGLE
   ┌─────────┐
   │ Google  │ User logs in to Google
   │ Login   │ User grants permissions
   │ Page    │ Google validates user
   └────┬────┘
        │
        │ 302 Redirect to callback URL
        │ http://localhost:4000/api/auth/google/callback?
        │   code=authorization_code
        │   state=random_csrf_token
        ▼

4. BACKEND RECEIVES CALLBACK
   ┌─────────┐
   │Backend  │ 1. Validate state parameter
   │Callback │ 2. Exchange code for tokens
   │Handler  │ 3. Verify ID token
   └────┬────┘
        │
        │ POST https://oauth2.googleapis.com/token
        │ {
        │   code: authorization_code,
        │   client_id: xxx,
        │   client_secret: xxx,
        │   redirect_uri: callback_url,
        │   grant_type: authorization_code
        │ }
        ▼

5. GOOGLE RETURNS TOKENS
   ┌─────────┐
   │ Google  │ Response:
   │ OAuth   │ {
   │ Server  │   access_token: "ya29.xxx",
   │         │   id_token: "eyJhbGxxx" (JWT),
   │         │   refresh_token: "1//xxx",
   │         │   expires_in: 3599,
   │         │   token_type: "Bearer"
   │         │ }
   └────┬────┘
        │
        ▼

6. BACKEND DECODES ID TOKEN
   ┌─────────┐
   │Backend  │ Decode JWT id_token:
   │         │ {
   │         │   sub: "google_user_id",
   │         │   email: "user@gmail.com",
   │         │   email_verified: true,
   │         │   name: "John Doe",
   │         │   picture: "https://lh3.googleusercontent.com/xxx",
   │         │   given_name: "John",
   │         │   family_name: "Doe",
   │         │   locale: "id"
   │         │ }
   └────┬────┘
        │
        ▼

7. BACKEND PROCESSES USER
   ┌─────────────────────────────────────────────────┐
   │ Database Logic (Transaction)                    │
   ├─────────────────────────────────────────────────┤
   │                                                  │
   │ A. CHECK IF USER EXISTS (by email)              │
   │    ├─ YES: User exists                          │
   │    │   ├─ Has googleId? Link account            │
   │    │   │   └─ Update: googleId, avatarUrl       │
   │    │   └─ Already linked? Just login            │
   │    │                                             │
   │    └─ NO: Create new user                       │
   │        ├─ INSERT pengguna (email, googleId)     │
   │        ├─ INSERT profil_pengguna (nama, avatar) │
   │        ├─ INSERT peran_pengguna (default: penulis) │
   │        └─ INSERT profil_penulis (if penulis)    │
   │                                                  │
   │ B. VERIFY EMAIL AUTOMATICALLY                   │
   │    └─ Set terverifikasi = true                  │
   │                                                  │
   │ C. LOG ACTIVITY                                 │
   │    └─ INSERT log_aktivitas (login via Google)  │
   │                                                  │
   └─────────────────────────────────────────────────┘
        │
        ▼

8. BACKEND GENERATES JWT
   ┌─────────┐
   │Backend  │ 1. Create JWT payload
   │         │ 2. Generate access token
   │         │ 3. Generate refresh token
   │         │ 4. Store refresh token in DB
   └────┬────┘
        │
        │ JWT Payload:
        │ {
        │   sub: user_id,
        │   email: user@gmail.com,
        │   peran: ["penulis"],
        │   iat: timestamp,
        │   exp: timestamp + 1h
        │ }
        ▼

9. BACKEND REDIRECTS TO FRONTEND
   ┌─────────┐
   │Backend  │ 302 Redirect
   └────┬────┘
        │
        │ http://localhost:3000/auth/callback?
        │   token=jwt_access_token
        │   refresh=jwt_refresh_token
        ▼

10. FRONTEND STORES TOKENS
   ┌─────────┐
   │Frontend │ 1. Extract tokens from URL
   │         │ 2. Store in localStorage/cookies
   │         │ 3. Redirect to dashboard
   │         │ 4. Set Authorization header
   └────┬────┘
        │
        ▼

11. AUTHENTICATED REQUESTS
   ┌─────────┐
   │Frontend │ GET /api/naskah
   │         │ Headers: {
   │         │   Authorization: "Bearer jwt_token"
   │         │ }
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │Backend  │ 1. JwtStrategy validates token
   │         │ 2. Attach user to request
   │         │ 3. Execute controller
   │         │ 4. Return response
   └─────────┘
```

### Flow Sequence Breakdown

**Step 1-2: Initiation** (Frontend → Backend)

- User clicks "Sign in with Google"
- Frontend redirects to `GET /api/auth/google`
- Backend generates state token (CSRF protection)
- Backend redirects to Google OAuth page

**Step 3: Authentication** (User → Google)

- User logs in to Google account
- User grants permissions (profile, email)
- Google validates credentials

**Step 4-5: Authorization** (Google → Backend)

- Google redirects to callback URL with `code` & `state`
- Backend validates state (CSRF check)
- Backend exchanges code for tokens (server-to-server)
- Google returns access_token, id_token, refresh_token

**Step 6-7: User Processing** (Backend)

- Decode id_token (contains user profile)
- Check if user exists in database
- Create new user OR link existing user
- Set email as verified
- Log activity

**Step 8-9: JWT Generation** (Backend)

- Generate Publishify JWT tokens
- Redirect to frontend with tokens

**Step 10-11: Session Establishment** (Frontend)

- Store tokens
- Use tokens for authenticated requests

---

## 🗄️ Database Schema Changes

### 1. Add OAuth Fields to `pengguna` Table

```prisma
model Pengguna {
  id                    String    @id @default(uuid())
  email                 String    @unique
  kataSandi             String?   // ⚠️ Make OPTIONAL for OAuth users
  telepon               String?

  // ✅ NEW: OAuth fields
  googleId              String?   @unique  // Google user ID (sub claim)
  facebookId            String?   @unique  // Future: Facebook
  appleId               String?   @unique  // Future: Apple
  provider              String?              // "google", "facebook", "apple", "local"
  avatarUrl             String?              // Profile picture from OAuth
  emailVerifiedByProvider Boolean  @default(false)  // OAuth email pre-verified

  aktif                 Boolean   @default(true)
  terverifikasi         Boolean   @default(false)  // Manual verification
  emailDiverifikasiPada DateTime?
  loginTerakhir         DateTime?
  dibuatPada            DateTime  @default(now())
  diperbaruiPada        DateTime  @updatedAt

  // Relations (unchanged)
  profilPengguna   ProfilPengguna?
  peranPengguna    PeranPengguna[]
  // ... other relations

  @@map("pengguna")
}
```

**Migration Strategy**:

```sql
-- Step 1: Add nullable columns
ALTER TABLE pengguna ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE pengguna ADD COLUMN facebook_id VARCHAR(255) UNIQUE;
ALTER TABLE pengguna ADD COLUMN apple_id VARCHAR(255) UNIQUE;
ALTER TABLE pengguna ADD COLUMN provider VARCHAR(50);
ALTER TABLE pengguna ADD COLUMN avatar_url TEXT;
ALTER TABLE pengguna ADD COLUMN email_verified_by_provider BOOLEAN DEFAULT FALSE;

-- Step 2: Make kataSandi nullable (existing users keep passwords)
ALTER TABLE pengguna ALTER COLUMN kata_sandi DROP NOT NULL;

-- Step 3: Create indexes for OAuth lookups
CREATE INDEX idx_pengguna_google_id ON pengguna(google_id);
CREATE INDEX idx_pengguna_provider ON pengguna(provider);
```

### 2. Update `profil_pengguna` Table

```prisma
model ProfilPengguna {
  id             String    @id @default(uuid())
  idPengguna     String    @unique
  namaDepan      String?
  namaBelakang   String?
  namaTampilan   String?
  bio            String?
  urlAvatar      String?   // Can sync from pengguna.avatarUrl
  // ... other fields

  @@map("profil_pengguna")
}
```

**No changes needed**, but we'll sync `urlAvatar` from OAuth profile.

### 3. Add OAuth State Table (CSRF Protection)

```prisma
model OAuthState {
  id             String   @id @default(uuid())
  state          String   @unique  // Random CSRF token
  provider       String              // "google", "facebook"
  redirectUrl    String?             // Frontend callback URL
  kadaluarsaPada DateTime            // Expire after 5 minutes
  dibuatPada     DateTime @default(now())

  @@index([state])
  @@index([kadaluarsaPada])  // For cleanup job
  @@map("oauth_state")
}
```

**Purpose**: Store state tokens for CSRF validation (more secure than Redis)

### 4. Migration Files

**File 1**: `20250111_add_oauth_fields.sql`

```sql
-- Add OAuth support to pengguna table
BEGIN;

-- Add OAuth fields
ALTER TABLE pengguna
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS email_verified_by_provider BOOLEAN DEFAULT FALSE;

-- Make password optional (OAuth users don't need password)
ALTER TABLE pengguna
  ALTER COLUMN kata_sandi DROP NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_pengguna_google_id ON pengguna(google_id);
CREATE INDEX IF NOT EXISTS idx_pengguna_facebook_id ON pengguna(facebook_id);
CREATE INDEX IF NOT EXISTS idx_pengguna_apple_id ON pengguna(apple_id);
CREATE INDEX IF NOT EXISTS idx_pengguna_provider ON pengguna(provider);

-- Update existing users to use "local" provider
UPDATE pengguna
SET provider = 'local'
WHERE provider IS NULL AND kata_sandi IS NOT NULL;

COMMIT;
```

**File 2**: `20250111_create_oauth_state_table.sql`

```sql
-- Create OAuth state table for CSRF protection
BEGIN;

CREATE TABLE IF NOT EXISTS oauth_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  redirect_url TEXT,
  kadaluarsa_pada TIMESTAMP NOT NULL,
  dibuat_pada TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_oauth_state_state ON oauth_state(state);
CREATE INDEX idx_oauth_state_kadaluarsa ON oauth_state(kadaluarsa_pada);

-- Auto-cleanup expired states (PostgreSQL function)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_state WHERE kadaluarsa_pada < NOW();
END;
$$ LANGUAGE plpgsql;

COMMIT;
```

### 5. Prisma Schema Update

**File**: `backend/prisma/schema.prisma`

```prisma
// Add to existing schema

// OAuth State for CSRF protection
model OAuthState {
  id             String   @id @default(uuid())
  state          String   @unique
  provider       String
  redirectUrl    String?
  kadaluarsaPada DateTime
  dibuatPada     DateTime @default(now())

  @@index([state])
  @@index([kadaluarsaPada])
  @@map("oauth_state")
}

// Update Pengguna model (add OAuth fields)
model Pengguna {
  // ... existing fields ...

  // OAuth fields
  googleId              String?   @unique @map("google_id")
  facebookId            String?   @unique @map("facebook_id")
  appleId               String?   @unique @map("apple_id")
  provider              String?
  avatarUrl             String?   @map("avatar_url")
  emailVerifiedByProvider Boolean @default(false) @map("email_verified_by_provider")

  // ... rest of fields ...
}
```

---

## 🛠️ Backend Implementation Plan

### Phase 1: Dependencies & Configuration

#### 1.1 Install Required Packages

```bash
cd backend

# Install Passport Google OAuth 2.0
bun add passport-google-oauth20

# Install TypeScript types
bun add -D @types/passport-google-oauth20
```

#### 1.2 Environment Variables

**File**: `backend/.env`

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# Frontend callback (after successful OAuth)
FRONTEND_AUTH_CALLBACK=http://localhost:3000/auth/callback

# OAuth State expiry (in seconds)
OAUTH_STATE_EXPIRY=300  # 5 minutes
```

#### 1.3 Create Google OAuth Config

**File**: `backend/src/config/google-oauth.config.ts`

```typescript
import { registerAs } from "@nestjs/config";

export default registerAs("googleOAuth", () => ({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  frontendCallback:
    process.env.FRONTEND_AUTH_CALLBACK || "http://localhost:3000/auth/callback",
  scope: ["profile", "email"],
  stateExpiry: parseInt(process.env.OAUTH_STATE_EXPIRY || "300", 10),
}));
```

### Phase 2: Google OAuth Strategy

#### 2.1 Create Google Strategy

**File**: `backend/src/modules/auth/strategies/google.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";

/**
 * Google OAuth 2.0 Strategy
 *
 * Handles authentication via Google OAuth.
 * Called after successful Google authentication.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.get<string>("googleOAuth.clientID"),
      clientSecret: configService.get<string>("googleOAuth.clientSecret"),
      callbackURL: configService.get<string>("googleOAuth.callbackURL"),
      scope: configService.get<string[]>("googleOAuth.scope"),
      passReqToCallback: true, // ✅ Access request object for state validation
    });
  }

  /**
   * Validate method dipanggil setelah Google berhasil authenticate user
   *
   * @param request - Express request object
   * @param accessToken - Google access token
   * @param refreshToken - Google refresh token (optional)
   * @param profile - User profile from Google
   * @param done - Passport callback
   */
  async validate(
    request: Express.Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<any> {
    try {
      // Extract user info from Google profile
      const { id: googleId, emails, displayName, name, photos } = profile;

      // Validate email exists
      if (!emails || emails.length === 0) {
        throw new UnauthorizedException("Email tidak tersedia dari Google");
      }

      const email = emails[0].value;
      const emailVerified = emails[0].verified;

      // Validate state parameter (CSRF protection)
      const state = request.query.state as string;
      await this.authService.validateOAuthState(state, "google");

      // Find or create user
      const user = await this.authService.handleGoogleOAuth({
        googleId,
        email,
        emailVerified,
        namaDepan: name?.givenName || displayName.split(" ")[0] || "User",
        namaBelakang: name?.familyName || displayName.split(" ")[1] || "",
        avatarUrl: photos && photos.length > 0 ? photos[0].value : null,
        accessToken,
        refreshToken,
      });

      // Return user untuk di-attach ke request
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
```

**Assessment**:

- ✅ State validation (CSRF protection)
- ✅ Email verification check
- ✅ Profile data extraction
- ✅ Error handling

### Phase 3: Auth Service OAuth Methods

#### 3.1 Add OAuth Methods to AuthService

**File**: `backend/src/modules/auth/auth.service.ts`

```typescript
import * as crypto from 'crypto';

// ... existing code ...

/**
 * Generate OAuth state token untuk CSRF protection
 */
async generateOAuthState(provider: string, redirectUrl?: string): Promise<string> {
  // Generate secure random state
  const state = crypto.randomBytes(32).toString('hex');

  // Calculate expiry (5 minutes from now)
  const kadaluarsaPada = new Date(Date.now() + 5 * 60 * 1000);

  // Store in database
  await this.prisma.oAuthState.create({
    data: {
      state,
      provider,
      redirectUrl,
      kadaluarsaPada,
    },
  });

  return state;
}

/**
 * Validate OAuth state token (CSRF protection)
 */
async validateOAuthState(state: string, provider: string): Promise<void> {
  if (!state) {
    throw new UnauthorizedException('State parameter tidak ada');
  }

  // Find state in database
  const oauthState = await this.prisma.oAuthState.findUnique({
    where: { state },
  });

  if (!oauthState) {
    throw new UnauthorizedException('State tidak valid');
  }

  // Check provider
  if (oauthState.provider !== provider) {
    throw new UnauthorizedException('Provider tidak sesuai');
  }

  // Check expiry
  if (oauthState.kadaluarsaPada < new Date()) {
    await this.prisma.oAuthState.delete({ where: { state } });
    throw new UnauthorizedException('State sudah kadaluarsa');
  }

  // Delete state (one-time use)
  await this.prisma.oAuthState.delete({ where: { state } });
}

/**
 * Handle Google OAuth login/registration
 */
async handleGoogleOAuth(googleData: {
  googleId: string;
  email: string;
  emailVerified: boolean;
  namaDepan: string;
  namaBelakang: string;
  avatarUrl: string | null;
  accessToken: string;
  refreshToken: string;
}): Promise<any> {
  const {
    googleId,
    email,
    emailVerified,
    namaDepan,
    namaBelakang,
    avatarUrl,
  } = googleData;

  // Check if user already exists (by email OR googleId)
  let pengguna = await this.prisma.pengguna.findFirst({
    where: {
      OR: [
        { email },
        { googleId },
      ],
    },
    include: {
      profilPengguna: true,
      peranPengguna: {
        where: { aktif: true },
      },
    },
  });

  if (pengguna) {
    // ===== EXISTING USER =====

    // If user exists by email but doesn't have googleId, link account
    if (!pengguna.googleId) {
      pengguna = await this.prisma.pengguna.update({
        where: { id: pengguna.id },
        data: {
          googleId,
          provider: 'google',
          avatarUrl,
          emailVerifiedByProvider: emailVerified,
          terverifikasi: emailVerified ? true : pengguna.terverifikasi,
          loginTerakhir: new Date(),
        },
        include: {
          profilPengguna: true,
          peranPengguna: {
            where: { aktif: true },
          },
        },
      });

      // Update profile avatar if not set
      if (avatarUrl && !pengguna.profilPengguna?.urlAvatar) {
        await this.prisma.profilPengguna.update({
          where: { idPengguna: pengguna.id },
          data: { urlAvatar: avatarUrl },
        });
      }

      // Log activity
      await this.prisma.logAktivitas.create({
        data: {
          idPengguna: pengguna.id,
          jenis: 'oauth_link',
          aksi: 'Google account linked',
          deskripsi: `Google account berhasil di-link: ${email}`,
        },
      });
    } else {
      // User already linked, just update login time
      pengguna = await this.prisma.pengguna.update({
        where: { id: pengguna.id },
        data: {
          loginTerakhir: new Date(),
          avatarUrl: avatarUrl || pengguna.avatarUrl,  // Update avatar if changed
        },
        include: {
          profilPengguna: true,
          peranPengguna: {
            where: { aktif: true },
          },
        },
      });

      // Log activity
      await this.prisma.logAktivitas.create({
        data: {
          idPengguna: pengguna.id,
          jenis: 'login',
          aksi: 'Login via Google',
          deskripsi: `User login menggunakan Google OAuth: ${email}`,
        },
      });
    }
  } else {
    // ===== NEW USER - CREATE ACCOUNT =====

    pengguna = await this.prisma.$transaction(async (prisma) => {
      // 1. Create user
      const newPengguna = await prisma.pengguna.create({
        data: {
          email,
          googleId,
          provider: 'google',
          avatarUrl,
          aktif: true,
          terverifikasi: emailVerified,  // Auto-verify if Google verified
          emailVerifiedByProvider: emailVerified,
          emailDiverifikasiPada: emailVerified ? new Date() : null,
          loginTerakhir: new Date(),
        },
      });

      // 2. Create profile
      await prisma.profilPengguna.create({
        data: {
          idPengguna: newPengguna.id,
          namaDepan,
          namaBelakang,
          namaTampilan: `${namaDepan}${namaBelakang ? ' ' + namaBelakang : ''}`,
          urlAvatar: avatarUrl,
        },
      });

      // 3. Assign default role (penulis)
      await prisma.peranPengguna.create({
        data: {
          idPengguna: newPengguna.id,
          jenisPeran: 'penulis',
          aktif: true,
        },
      });

      // 4. Create profil penulis
      await prisma.profilPenulis.create({
        data: {
          idPengguna: newPengguna.id,
        },
      });

      // 5. Log activity
      await prisma.logAktivitas.create({
        data: {
          idPengguna: newPengguna.id,
          jenis: 'register',
          aksi: 'Register via Google',
          deskripsi: `User baru terdaftar melalui Google OAuth: ${email}`,
        },
      });

      // Return with relations
      return await prisma.pengguna.findUnique({
        where: { id: newPengguna.id },
        include: {
          profilPengguna: true,
          peranPengguna: {
            where: { aktif: true },
          },
        },
      });
    });
  }

  // Return user data for JWT generation
  return {
    id: pengguna.id,
    email: pengguna.email,
    peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
    terverifikasi: pengguna.terverifikasi,
    profilPengguna: pengguna.profilPengguna,
  };
}
```

**Assessment**:

- ✅ Create new user OR link existing user
- ✅ Auto email verification for OAuth users
- ✅ Transaction for data integrity
- ✅ Comprehensive logging
- ✅ Avatar sync from Google

### Phase 4: OAuth Controller Endpoints

#### 4.1 Add OAuth Endpoints

**File**: `backend/src/modules/auth/auth.controller.ts`

```typescript
import { Get, Req, Res, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Public } from '@/common/decorators/public.decorator';

// ... existing code ...

/**
 * Endpoint: GET /api/auth/google
 *
 * Initiate Google OAuth flow
 * Redirects to Google login page
 */
@Public()
@Get('google')
@ApiOperation({
  summary: 'Initiate Google OAuth',
  description: 'Redirect user ke halaman login Google',
})
@ApiQuery({
  name: 'redirect',
  required: false,
  description: 'Frontend callback URL after successful OAuth',
})
async googleAuth(
  @Query('redirect') redirect: string,
  @Req() request: Request,
  @Res() response: Response,
) {
  // Generate state token untuk CSRF protection
  const state = await this.authService.generateOAuthState('google', redirect);

  // Build Google OAuth URL
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: this.configService.get<string>('googleOAuth.clientID'),
    redirect_uri: this.configService.get<string>('googleOAuth.callbackURL'),
    response_type: 'code',
    scope: 'profile email',
    state,
    access_type: 'offline',  // Get refresh token
    prompt: 'consent',       // Always show consent screen
  })}`;

  // Redirect to Google
  return response.redirect(googleAuthUrl);
}

/**
 * Endpoint: GET /api/auth/google/callback
 *
 * Google OAuth callback endpoint
 * Called by Google after user authentication
 */
@Public()
@Get('google/callback')
@UseGuards(AuthGuard('google'))  // ✅ Passport Google Strategy
@ApiOperation({
  summary: 'Google OAuth callback',
  description: 'Endpoint yang dipanggil Google setelah user login',
})
async googleAuthCallback(
  @Req() request: Request & { user: any },
  @Res() response: Response,
) {
  try {
    // User sudah di-validate oleh GoogleStrategy
    const user = request.user;

    // Generate JWT tokens untuk Publishify
    const tokens = await this.authService.login(user, request);

    // Get frontend callback URL from state (if provided)
    const frontendCallback = this.configService.get<string>(
      'googleOAuth.frontendCallback',
    );

    // Redirect to frontend dengan tokens
    const redirectUrl = `${frontendCallback}?${new URLSearchParams({
      token: tokens.accessToken,
      refresh: tokens.refreshToken,
    })}`;

    return response.redirect(redirectUrl);
  } catch (error) {
    // Redirect to frontend dengan error
    const frontendCallback = this.configService.get<string>(
      'googleOAuth.frontendCallback',
    );

    const errorUrl = `${frontendCallback}?${new URLSearchParams({
      error: 'oauth_failed',
      message: error.message || 'Autentikasi Google gagal',
    })}`;

    return response.redirect(errorUrl);
  }
}

/**
 * Endpoint: POST /api/auth/google/link
 *
 * Link Google account to existing logged-in user
 */
@Post('google/link')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({
  summary: 'Link Google account',
  description: 'Link Google account ke user yang sudah login',
})
async linkGoogleAccount(
  @PenggunaSaatIni('id') userId: string,
  @Body() dto: LinkGoogleAccountDto,
) {
  return this.authService.linkGoogleAccount(userId, dto.googleId);
}

/**
 * Endpoint: DELETE /api/auth/google/unlink
 *
 * Unlink Google account from user
 */
@Delete('google/unlink')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({
  summary: 'Unlink Google account',
  description: 'Hapus link Google account dari user',
})
async unlinkGoogleAccount(@PenggunaSaatIni('id') userId: string) {
  return this.authService.unlinkGoogleAccount(userId);
}
```

### Phase 5: Update Auth Module

**File**: `backend/src/modules/auth/auth.module.ts`

```typescript
import { GoogleStrategy } from './strategies/google.strategy';
import googleOAuthConfig from '@/config/google-oauth.config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,

    // Load Google OAuth config
    ConfigModule.forFeature(googleOAuthConfig),

    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),

    JwtModule.registerAsync({...}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,  // ✅ Add Google Strategy
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

---

## 🔒 Security Considerations

### 1. CSRF Protection (State Parameter)

**Implementation**:

```typescript
// Generate state before redirect
const state = crypto.randomBytes(32).toString('hex');
await prisma.oAuthState.create({
  data: { state, provider: 'google', kadaluarsaPada: ... },
});

// Validate state in callback
const oauthState = await prisma.oAuthState.findUnique({ where: { state } });
if (!oauthState || oauthState.kadaluarsaPada < new Date()) {
  throw new UnauthorizedException('Invalid or expired state');
}
```

**Why**: Prevents CSRF attacks where attacker tricks user into linking attacker's Google account

### 2. Email Verification Bypass

**Issue**: OAuth users have pre-verified emails from Google
**Solution**: Set `emailVerifiedByProvider = true` and `terverifikasi = true`

```typescript
terverifikasi: emailVerified,  // Auto-verify if Google verified
emailVerifiedByProvider: emailVerified,
emailDiverifikasiPada: emailVerified ? new Date() : null,
```

### 3. Account Linking Security

**Scenario**: User has local account with email@gmail.com, then tries to login with Google using same email

**Strategy Options**:

**Option A: Automatic Linking** (✅ **RECOMMENDED** - Better UX)

```typescript
// If email matches but no googleId, automatically link
if (pengguna && !pengguna.googleId) {
  await prisma.pengguna.update({
    where: { id: pengguna.id },
    data: { googleId, provider: "google" },
  });
}
```

**Option B: Manual Linking** (More secure, but worse UX)

```typescript
// Require user to be logged in to link
@Post('google/link')
@UseGuards(JwtAuthGuard)
async linkGoogleAccount(@PenggunaSaatIni('id') userId, @Body() dto) {
  // Link googleId to userId
}
```

**Our Choice**: Option A with security measures:

- Only link if email is verified by Google
- Send notification email to user
- Log activity for audit

### 4. Token Security

**Access Token**: Short-lived (1h for web, 365d for mobile)
**Refresh Token**: Stored in database, can be revoked
**Google Tokens**: NOT stored (we only need profile data)

### 5. Error Handling

**Don't leak information**:

```typescript
// ❌ BAD - Reveals if email exists
if (userExists) {
  throw new Error("Email already registered");
}

// ✅ GOOD - Generic error
throw new UnauthorizedException("Autentikasi gagal");
```

### 6. Rate Limiting

**Apply to OAuth endpoints**:

```typescript
@Throttle({ default: { ttl: 60000, limit: 10 } })  // 10 requests per minute
@Get('google')
async googleAuth() { ... }
```

### 7. Redirect URL Validation

**Validate frontend callback URL**:

```typescript
const allowedCallbacks = [
  "http://localhost:3000/auth/callback",
  "https://publishify.com/auth/callback",
];

if (!allowedCallbacks.includes(redirectUrl)) {
  throw new BadRequestException("Invalid redirect URL");
}
```

---

## ✅ Implementation Checklist

### Phase 1: Setup (2 hours)

- [ ] Install dependencies (`passport-google-oauth20`, `@types/passport-google-oauth20`)
- [ ] Create Google Cloud project & OAuth credentials
- [ ] Add environment variables to `.env`
- [ ] Create `google-oauth.config.ts`
- [ ] Update Prisma schema dengan OAuth fields
- [ ] Generate Prisma migration
- [ ] Run migration: `bunx prisma migrate dev --name add_oauth_support`
- [ ] Generate Prisma client: `bunx prisma generate`

### Phase 2: Strategy Implementation (3 hours)

- [ ] Create `google.strategy.ts`
- [ ] Implement `GoogleStrategy` class
- [ ] Add `generateOAuthState()` method to AuthService
- [ ] Add `validateOAuthState()` method to AuthService
- [ ] Add `handleGoogleOAuth()` method to AuthService
- [ ] Type-check: `bunx tsc --noEmit` (✅ 0 errors)

### Phase 3: Controller & Endpoints (2 hours)

- [ ] Add `GET /auth/google` endpoint
- [ ] Add `GET /auth/google/callback` endpoint
- [ ] Add `POST /auth/google/link` endpoint (optional)
- [ ] Add `DELETE /auth/google/unlink` endpoint (optional)
- [ ] Update Swagger documentation
- [ ] Type-check: `bunx tsc --noEmit` (✅ 0 errors)

### Phase 4: Module Configuration (1 hour)

- [ ] Add `GoogleStrategy` to `auth.module.ts` providers
- [ ] Load `googleOAuthConfig` in module imports
- [ ] Export necessary services
- [ ] Type-check: `bunx tsc --noEmit` (✅ 0 errors)

### Phase 5: Security & Validation (2 hours)

- [ ] Implement state parameter validation
- [ ] Add rate limiting to OAuth endpoints
- [ ] Validate redirect URLs
- [ ] Add error handling
- [ ] Implement activity logging
- [ ] Type-check: `bunx tsc --noEmit` (✅ 0 errors)

### Phase 6: Testing (3 hours)

- [ ] Manual test: Google OAuth flow (happy path)
- [ ] Test: New user registration via Google
- [ ] Test: Existing user login via Google
- [ ] Test: Account linking (email match)
- [ ] Test: Avatar sync from Google
- [ ] Test: Email verification automatic
- [ ] Test: Error scenarios (invalid state, expired token)
- [ ] Test: Security measures (CSRF, rate limiting)

### Phase 7: Documentation (1 hour)

- [ ] Update API documentation (Swagger)
- [ ] Create developer guide untuk OAuth flow
- [ ] Update README dengan OAuth setup instructions
- [ ] Document environment variables
- [ ] Create migration guide untuk existing users

---

## 🧪 Testing Strategy

### Manual Testing Checklist

#### Test 1: New User Registration via Google

**Steps**:

1. Clear database: `DELETE FROM pengguna WHERE email = 'test@gmail.com'`
2. Frontend: Click "Sign in with Google"
3. Backend: Hit `GET /api/auth/google`
4. Google: Login dengan `test@gmail.com`
5. Google: Grant permissions
6. Backend: Receive callback `GET /api/auth/google/callback?code=xxx&state=xxx`
7. Backend: Validate state, exchange code, create user
8. Backend: Redirect to frontend dengan tokens

**Expected**:

- ✅ New user created in `pengguna` table
- ✅ `googleId` populated
- ✅ `provider` = 'google'
- ✅ `terverifikasi` = true (auto-verified)
- ✅ Profile created dengan Google data
- ✅ Default role 'penulis' assigned
- ✅ Activity logged
- ✅ JWT tokens generated
- ✅ Frontend receives tokens

**Verify Database**:

```sql
SELECT
  id, email, google_id, provider, terverifikasi,
  email_verified_by_provider, avatar_url
FROM pengguna
WHERE email = 'test@gmail.com';

SELECT * FROM profil_pengguna WHERE id_pengguna = '<user_id>';
SELECT * FROM peran_pengguna WHERE id_pengguna = '<user_id>';
SELECT * FROM log_aktivitas WHERE id_pengguna = '<user_id>' ORDER BY dibuat_pada DESC LIMIT 5;
```

#### Test 2: Existing User Login via Google

**Steps**:

1. Ensure user exists: `INSERT INTO pengguna (email, google_id, ...) ...`
2. Frontend: Click "Sign in with Google"
3. Follow OAuth flow
4. Backend: Recognize existing user, just login

**Expected**:

- ✅ Existing user found by `googleId`
- ✅ `loginTerakhir` updated
- ✅ Activity logged ('login via Google')
- ✅ JWT tokens generated
- ✅ NO new user created

#### Test 3: Account Linking (Email Match)

**Steps**:

1. Create user with email but NO googleId:
   ```sql
   INSERT INTO pengguna (email, kata_sandi, provider)
   VALUES ('test@gmail.com', 'hashed_password', 'local');
   ```
2. Frontend: Click "Sign in with Google" using same email
3. Follow OAuth flow
4. Backend: Match by email, link Google account

**Expected**:

- ✅ Existing user found by email
- ✅ `googleId` added to user
- ✅ `provider` changed to 'google'
- ✅ Avatar synced from Google
- ✅ Activity logged ('oauth_link')
- ✅ User can login dengan password OR Google

#### Test 4: Error Scenarios

**Test 4a: Invalid State Parameter**

```bash
# Try callback dengan state yang tidak ada
curl "http://localhost:4000/api/auth/google/callback?code=xxx&state=invalid"
# Expected: 401 Unauthorized - "State tidak valid"
```

**Test 4b: Expired State**

```sql
-- Manually expire state
UPDATE oauth_state SET kadaluarsa_pada = NOW() - INTERVAL '1 hour' WHERE state = 'xxx';
```

```bash
# Try callback dengan expired state
curl "http://localhost:4000/api/auth/google/callback?code=xxx&state=expired_state"
# Expected: 401 Unauthorized - "State sudah kadaluarsa"
```

**Test 4c: Rate Limiting**

```bash
# Hit endpoint 11 kali dalam 1 menit
for i in {1..11}; do
  curl "http://localhost:4000/api/auth/google"
done
# Expected: 11th request returns 429 Too Many Requests
```

#### Test 5: Security Validation

**Test 5a: CSRF Protection**

- Verify state generated dan validated
- Verify state deleted setelah digunakan (one-time use)
- Verify state tidak bisa digunakan ulang

**Test 5b: Email Verification**

- Verify OAuth users otomatis terverifikasi
- Verify `emailVerifiedByProvider` set to true
- Verify `emailDiverifikasiPada` timestamp set

**Test 5c: Avatar Sync**

- Verify avatar URL dari Google disimpan
- Verify avatar URL disync ke `profil_pengguna`

### Automated Tests (Future)

```typescript
// test/integration/auth/google-oauth.spec.ts
describe("Google OAuth", () => {
  describe("POST /auth/google", () => {
    it("should generate state and redirect to Google", async () => {
      const response = await request(app.getHttpServer())
        .get("/auth/google")
        .expect(302);

      expect(response.headers.location).toContain("accounts.google.com");
      expect(response.headers.location).toContain("state=");
    });
  });

  describe("GET /auth/google/callback", () => {
    it("should create new user for valid Google profile", async () => {
      // Mock Google OAuth response
      // ... test implementation
    });

    it("should link existing user by email", async () => {
      // ... test implementation
    });

    it("should reject invalid state parameter", async () => {
      // ... test implementation
    });
  });
});
```

---

## 🚀 Deployment Considerations

### Google Cloud Console Setup

1. **Create OAuth 2.0 Credentials**:

   - Go to: https://console.cloud.google.com/apis/credentials
   - Create project: "Publishify"
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Name: Publishify Backend

2. **Configure Authorized Origins**:

   ```
   Development:
   - http://localhost:4000

   Production:
   - https://api.publishify.com
   ```

3. **Configure Authorized Redirect URIs**:

   ```
   Development:
   - http://localhost:4000/api/auth/google/callback

   Production:
   - https://api.publishify.com/api/auth/google/callback
   ```

4. **Save Credentials**:
   - Client ID: `xxx.apps.googleusercontent.com`
   - Client Secret: `xxx`
   - Add to `.env` file

### Environment Variables per Environment

**Development** (`.env.development`):

```bash
GOOGLE_CLIENT_ID=dev-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dev-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_AUTH_CALLBACK=http://localhost:3000/auth/callback
```

**Staging** (`.env.staging`):

```bash
GOOGLE_CLIENT_ID=staging-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=staging-client-secret
GOOGLE_CALLBACK_URL=https://api-staging.publishify.com/api/auth/google/callback
FRONTEND_AUTH_CALLBACK=https://staging.publishify.com/auth/callback
```

**Production** (`.env.production`):

```bash
GOOGLE_CLIENT_ID=prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=prod-client-secret
GOOGLE_CALLBACK_URL=https://api.publishify.com/api/auth/google/callback
FRONTEND_AUTH_CALLBACK=https://publishify.com/auth/callback
```

### Database Migration

**Before Deployment**:

```bash
# Generate migration
bunx prisma migrate dev --name add_oauth_support

# Review migration SQL
cat prisma/migrations/*/migration.sql

# Test migration on staging
bunx prisma migrate deploy --preview-feature
```

**Production Deployment**:

```bash
# Run migration
bunx prisma migrate deploy

# Verify tables
bunx prisma studio
```

### Monitoring & Logging

**Log OAuth Events**:

- OAuth initiation
- Callback received
- State validation
- User creation/linking
- Token generation
- Errors

**Metrics to Track**:

- OAuth success rate
- OAuth failure rate
- New user registrations via OAuth
- Account linking rate
- Average OAuth completion time

---

## 📚 References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google OAuth 2.0 Strategy](https://www.passportjs.org/packages/passport-google-oauth20/)
- [NestJS Passport Integration](https://docs.nestjs.com/security/authentication#implementing-passport-strategies)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

---

**Prepared By**: AI Assistant  
**Date**: November 11, 2025  
**Status**: Ready for Implementation  
**Next Review**: After implementation & testing
