import { Module } from '@nestjs/common';
import { TelemetryResolver } from './telemetry.resolver';
import { TelemetryService } from './telemetry.service';
import { AnomalyDetectionService } from './validators/anomaly-detection.service';
import { TelemetryLoader } from './telemetry.loader';

@Module({
  providers: [TelemetryResolver, TelemetryService, AnomalyDetectionService, TelemetryLoader],
  exports: [TelemetryService, TelemetryLoader],
})
export class TelemetryModule {}
