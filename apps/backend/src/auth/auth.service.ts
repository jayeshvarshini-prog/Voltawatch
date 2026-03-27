import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { DATABASE_POOL } from '../database/database.module';
import { AuthResponse } from './entities/auth-response.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const existing = await this.pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new ConflictException('Email already registered');
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await this.pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hash, name],
    );
    return this.generateTokens(result.rows[0]);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens({ id: user.id, email: user.email, name: user.name });
  }

  async refresh(token: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'voltawatch-refresh-secret',
      });
      const result = await this.pool.query('SELECT id, email, name FROM users WHERE id = $1', [
        payload.sub,
      ]);
      if (!result.rows[0]) {
        throw new UnauthorizedException('User not found');
      }
      return this.generateTokens(result.rows[0]);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: { id: string; email: string; name: string }): AuthResponse {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'voltawatch-refresh-secret',
        expiresIn: '7d',
      }),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
