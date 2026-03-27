import { Injectable, Inject, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { TelemetryEntity } from './entities/telemetry.entity';
import { TelemetryService } from './telemetry.service';

@Injectable({ scope: Scope.REQUEST })
export class TelemetryLoader {
  readonly latestByCarId: DataLoader<string, TelemetryEntity | null>;

  constructor(private readonly telemetryService: TelemetryService) {
    this.latestByCarId = new DataLoader<string, TelemetryEntity | null>(async (carIds) => {
      const map = await this.telemetryService.findLatestByCarIds(carIds as string[]);
      return carIds.map(id => map.get(id) ?? null);
    });
  }
}
