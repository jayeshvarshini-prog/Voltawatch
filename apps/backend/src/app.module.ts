import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { HealthModule } from './health/health.module';
import { LoggingModule } from './common/logging/logging.module';

@Module({
  imports: [
    LoggingModule,
    DatabaseModule,
    PubSubModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    CarsModule,
    TelemetryModule,
    HealthModule,
  ],
})
export class AppModule {}
