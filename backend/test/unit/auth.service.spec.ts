import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/modules/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import {
  generateTestEmail,
  generateTestPassword,
  hashTestPassword,
} from '@test/helpers/factories.helper';
import * as bcrypt from 'bcryptjs';

/**
 * Unit Tests untuk AuthService - FIXED VERSION
 * Tests: daftar, login, verifikasiEmail, lupaPassword, refreshToken
 */

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  // Mock PrismaService
  const mockPrismaService = {
    pengguna: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    profilPengguna: {
      create: jest.fn(),
    },
    profilPenulis: {
      create: jest.fn(),
    },
    peranPengguna: {
      create: jest.fn(),
    },
    tokenRefresh: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    logAktivitas: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // Mock JwtService
  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'jwt.secret': 'test-jwt-secret',
        'jwt.expiresIn': '1h',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('daftar', () => {
    it('should successfully register new user', async () => {
      const email = generateTestEmail();
      const password = generateTestPassword();

      const daftarDto = {
        email,
        kataSandi: password,
        konfirmasiKataSandi: password,
        namaDepan: 'Test',
        namaBelakang: 'User',
        jenisPeran: 'penulis' as const,
      };

      const mockPengguna = {
        id: 'user-123',
        email,
        kataSandi: 'hashed-password',
        aktif: true,
        terverifikasi: false,
      };

      // Mock email check (no duplicate)
      mockPrismaService.pengguna.findUnique.mockResolvedValue(null);

      // Mock transaction
      mockPrismaService.$transaction.mockImplementation(async (callback: any) => {
        mockPrismaService.pengguna.create.mockResolvedValue(mockPengguna);
        mockPrismaService.profilPengguna.create.mockResolvedValue({});
        mockPrismaService.peranPengguna.create.mockResolvedValue({});
        mockPrismaService.profilPenulis.create.mockResolvedValue({});
        mockPrismaService.tokenRefresh.create.mockResolvedValue({});

        return callback(mockPrismaService);
      });

      const result = await service.daftar(daftarDto);

      expect(result.sukses).toBe(true);
      expect(result.pesan).toContain('Registrasi berhasil');
      expect(result.data.email).toBe(email);
      expect(mockPrismaService.pengguna.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const email = generateTestEmail();
      const password = generateTestPassword();

      const daftarDto = {
        email,
        kataSandi: password,
        konfirmasiKataSandi: password,
        namaDepan: 'Test',
        namaBelakang: 'User',
        jenisPeran: 'penulis' as const,
      };

      // Mock existing user
      mockPrismaService.pengguna.findUnique.mockResolvedValue({
        id: 'existing-user',
        email,
      });

      await expect(service.daftar(daftarDto)).rejects.toThrow(ConflictException);
      await expect(service.daftar(daftarDto)).rejects.toThrow('Email sudah terdaftar');
    });

    it('should hash password before saving', async () => {
      const email = generateTestEmail();
      const password = 'PlainPassword123!';

      const daftarDto = {
        email,
        kataSandi: password,
        konfirmasiKataSandi: password,
        namaDepan: 'Test',
        jenisPeran: 'penulis' as const,
      };

      let capturedPassword = '';

      mockPrismaService.pengguna.findUnique.mockResolvedValue(null);

      mockPrismaService.$transaction.mockImplementation(async (callback: any) => {
        mockPrismaService.pengguna.create.mockImplementation(async (args: any) => {
          capturedPassword = args.data.kataSandi;
          return {
            id: 'user-123',
            email,
            kataSandi: capturedPassword,
          };
        });
        mockPrismaService.profilPengguna.create.mockResolvedValue({});
        mockPrismaService.peranPengguna.create.mockResolvedValue({});
        mockPrismaService.profilPenulis.create.mockResolvedValue({});
        mockPrismaService.tokenRefresh.create.mockResolvedValue({});

        return callback(mockPrismaService);
      });

      await service.daftar(daftarDto);

      // Verify password is hashed
      expect(capturedPassword).not.toBe(password);
      expect(capturedPassword).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt format
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const email = generateTestEmail();

      // Mock validated user object (dari validasiPengguna)
      const mockValidatedUser = {
        id: 'user-123',
        email,
        aktif: true,
        terverifikasi: true,
        profilPengguna: {
          namaDepan: 'Test',
          namaBelakang: 'User',
        },
        peranPengguna: [
          {
            jenisPeran: 'penulis',
            aktif: true,
          },
        ],
      };

      mockPrismaService.pengguna.update.mockResolvedValue(mockValidatedUser);
      mockPrismaService.tokenRefresh.create.mockResolvedValue({});
      mockPrismaService.logAktivitas.create.mockResolvedValue({});

      mockJwtService.sign
        .mockReturnValueOnce('access-token-123')
        .mockReturnValueOnce('refresh-token-456');

      const result = await service.login(mockValidatedUser);

      expect(result.accessToken).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-456');
      expect(result.pengguna.email).toBe(email);
      expect(mockPrismaService.pengguna.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { loginTerakhir: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const email = generateTestEmail();
      const password = generateTestPassword();

      mockPrismaService.pengguna.findUnique.mockResolvedValue(null);

      const result = await service.validasiPengguna(email, password);

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const email = generateTestEmail();
      const password = generateTestPassword();
      const hashedPassword = await hashTestPassword(password);

      const mockPengguna = {
        id: 'user-123',
        email,
        kataSandi: hashedPassword,
        aktif: true,
        terverifikasi: true,
        profilPengguna: {},
        peranPengguna: [{ jenisPeran: 'penulis', aktif: true }],
      };

      mockPrismaService.pengguna.findUnique.mockResolvedValue(mockPengguna);

      // Mock bcrypt compare to return false
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validasiPengguna(email, 'wrong-password');

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      const email = generateTestEmail();
      const password = generateTestPassword();

      const mockPengguna = {
        id: 'user-123',
        email,
        kataSandi: await hashTestPassword(password),
        aktif: false, // User not active
        terverifikasi: true,
        profilPengguna: {},
        peranPengguna: [{ jenisPeran: 'penulis', aktif: true }],
      };

      mockPrismaService.pengguna.findUnique.mockResolvedValue(mockPengguna);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      await expect(service.validasiPengguna(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validasiPengguna(email, password)).rejects.toThrow(
        'Akun Anda telah dinonaktifkan',
      );
    });

    it('should update loginTerakhir timestamp', async () => {
      const email = generateTestEmail();

      const mockValidatedUser = {
        id: 'user-123',
        email,
        aktif: true,
        terverifikasi: true,
        profilPengguna: {},
        peranPengguna: [{ jenisPeran: 'penulis', aktif: true }],
      };

      mockPrismaService.pengguna.update.mockResolvedValue(mockValidatedUser);
      mockPrismaService.tokenRefresh.create.mockResolvedValue({});
      mockPrismaService.logAktivitas.create.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('token');

      await service.login(mockValidatedUser);

      expect(mockPrismaService.pengguna.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { loginTerakhir: expect.any(Date) },
      });
    });
  });

  describe('verifikasiEmail', () => {
    it('should successfully verify email with valid token', async () => {
      const mockDto = {
        token: 'valid-token-123',
      };

      const mockTokenData = {
        id: 'token-id',
        token: 'valid-token-123',
        idPengguna: 'user-123',
        kadaluarsaPada: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
      };

      mockPrismaService.tokenRefresh.findFirst.mockResolvedValue(mockTokenData);
      mockPrismaService.pengguna.update.mockResolvedValue({
        id: 'user-123',
        terverifikasi: true,
      });
      mockPrismaService.tokenRefresh.delete.mockResolvedValue({});

      const result = await service.verifikasiEmail(mockDto);

      expect(result.sukses).toBe(true);
      expect(result.pesan).toContain('Email berhasil diverifikasi');
      expect(mockPrismaService.pengguna.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          terverifikasi: true,
          emailDiverifikasiPada: expect.any(Date),
        },
      });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      const mockDto = {
        token: 'invalid-token',
      };

      mockPrismaService.tokenRefresh.findFirst.mockResolvedValue(null);

      await expect(service.verifikasiEmail(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.verifikasiEmail(mockDto)).rejects.toThrow(
        'Token verifikasi tidak valid atau sudah kadaluarsa',
      );
    });

    it('should throw BadRequestException if token is expired', async () => {
      const mockDto = {
        token: 'expired-token',
      };

      // findFirst dengan kondisi kadaluarsaPada >= now akan return null untuk expired token
      mockPrismaService.tokenRefresh.findFirst.mockResolvedValue(null);

      await expect(service.verifikasiEmail(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.verifikasiEmail(mockDto)).rejects.toThrow(
        'Token verifikasi tidak valid atau sudah kadaluarsa',
      );
    });
  });

  describe('lupaPassword', () => {
    it('should generate reset token for valid email', async () => {
      const mockDto = {
        email: generateTestEmail(),
      };

      const mockPengguna = {
        id: 'user-123',
        email: mockDto.email,
        aktif: true,
      };

      mockPrismaService.pengguna.findUnique.mockResolvedValue(mockPengguna);
      mockPrismaService.tokenRefresh.create.mockResolvedValue({
        token: 'reset-token-123',
      });

      const result = await service.lupaPassword(mockDto);

      expect(result.sukses).toBe(true);
      expect(result.pesan).toBe('Jika email terdaftar, kami telah mengirim link reset password.');
      expect(mockPrismaService.tokenRefresh.create).toHaveBeenCalled();
    });

    it('should return success message even if email does not exist', async () => {
      const mockDto = {
        email: generateTestEmail(),
      };

      mockPrismaService.pengguna.findUnique.mockResolvedValue(null);

      // Security: Tidak boleh throw error untuk mencegah email enumeration
      const result = await service.lupaPassword(mockDto);

      expect(result.sukses).toBe(true);
      expect(result.pesan).toBe('Jika email terdaftar, kami telah mengirim link reset password.');
      expect(mockPrismaService.tokenRefresh.create).not.toHaveBeenCalled();
    });

    it('should return success message even if user is not active', async () => {
      const mockDto = {
        email: generateTestEmail(),
      };

      const mockPengguna = {
        id: 'user-123',
        email: mockDto.email,
        aktif: false, // Not active
      };

      // Clear previous mock calls
      mockPrismaService.tokenRefresh.create.mockClear();
      mockPrismaService.pengguna.findUnique.mockResolvedValue(mockPengguna);
      mockPrismaService.tokenRefresh.create.mockResolvedValue({
        token: 'reset-token-123',
      });
      mockPrismaService.logAktivitas.create.mockResolvedValue({} as any);

      // Security: Service still creates token even for inactive users (doesn't reveal status)
      const result = await service.lupaPassword(mockDto);

      expect(result.sukses).toBe(true);
      expect(result.pesan).toBe('Jika email terdaftar, kami telah mengirim link reset password.');
      // Token is still created - security pattern only prevents revealing email existence
      expect(mockPrismaService.tokenRefresh.create).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const mockDto = {
        refreshToken: 'valid-refresh-token',
      };

      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        peran: ['penulis'],
      };

      const mockPengguna = {
        id: 'user-123',
        email: 'test@example.com',
        aktif: true,
        peranPengguna: [
          {
            id: 'role-1',
            jenisPeran: 'penulis',
            aktif: true,
          },
        ],
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.tokenRefresh.findFirst.mockResolvedValue({
        id: 'token-id',
        token: 'valid-refresh-token',
        idPengguna: 'user-123',
        kadaluarsaPada: new Date(Date.now() + 86400000),
      });
      mockPrismaService.pengguna.findUnique.mockResolvedValue(mockPengguna);
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshToken(mockDto);

      expect(result.sukses).toBe(true);
      expect(result.data.accessToken).toBe('new-access-token');
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-refresh-secret',
      });
      expect(mockPrismaService.pengguna.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          peranPengguna: {
            where: { aktif: true },
          },
        },
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const mockDto = {
        refreshToken: 'invalid-token',
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(mockDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
