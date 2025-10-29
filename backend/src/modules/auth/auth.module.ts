import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '@/prisma/prisma.module';

/**
 * Authentication Module
 * 
 * Module untuk handle semua fitur authentication:
 * - Registrasi pengguna baru
 * - Login dengan JWT
 * - Refresh token
 * - Verifikasi email
 * - Lupa password & reset password
 * - Logout
 * 
 * @module AuthModule
 */
@Module({
  imports: [
    // Import Prisma untuk database access
    PrismaModule,

    // Import Config untuk environment variables
    ConfigModule,

    // Import Passport untuk authentication strategies
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false, // Gunakan JWT, bukan session
    }),

    // Import JWT Module dengan async configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '1h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Service
    AuthService,

    // Strategies
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [
    // Export AuthService agar bisa digunakan module lain
    AuthService,

    // Export JwtModule untuk guards di module lain
    JwtModule,
  ],
})
export class AuthModule {}
