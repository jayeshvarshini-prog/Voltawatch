import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { TelemetryGateway } from './telemetry.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'voltawatch-dev-secret',
    }),
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService, TelemetryGateway],
})
export class TelemetryModule {}
