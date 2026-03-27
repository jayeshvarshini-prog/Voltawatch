import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLClientModule } from './graphql-client/graphql-client.module';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { HealthModule } from './health/health.module';
import { LoggingModule } from './common/logging/logging.module';

@Module({
  imports: [
    LoggingModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    GraphQLClientModule,
    AuthModule,
    CarsModule,
    TelemetryModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
