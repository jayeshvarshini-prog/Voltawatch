import { Module, Global, Logger } from '@nestjs/common';
import { Pool } from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL';

const logger = new Logger('DatabaseModule');

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: () => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 20,
        });
        logger.log('Database pool initialized');
        return pool;
      },
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule {}
