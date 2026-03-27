import { Resolver, Query } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { HealthStatus } from './entities/health-status.entity';
import { DATABASE_POOL } from '../database/database.module';

@Resolver()
export class HealthResolver {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  @Query(() => HealthStatus)
  async health(): Promise<HealthStatus> {
    let dbStatus = 'disconnected';
    try {
      await this.pool.query('SELECT 1');
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
      database: dbStatus,
    };
  }
}
