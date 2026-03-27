import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { DATABASE_POOL } from '../database/database.module';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockPool: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DATABASE_POOL, useValue: mockPool },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // no existing user
        .mockResolvedValueOnce({
          rows: [{ id: 'user-1', email: 'test@test.com', name: 'Test' }],
        });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register('test@test.com', 'password123', 'Test');

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw ConflictException if email exists', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

      await expect(service.register('test@test.com', 'password123', 'Test')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login and return tokens', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', email: 'test@test.com', name: 'Test', password_hash: 'hashed' }],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'password123');

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', email: 'test@test.com', name: 'Test', password_hash: 'hashed' }],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 'user-1' });
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', email: 'test@test.com', name: 'Test' }],
      });

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
