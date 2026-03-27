import { Injectable, Inject, Scope } from '@nestjs/common';
import { Pool } from 'pg';
import DataLoader from 'dataloader';
import { CarEntity } from './entities/car.entity';
import { DATABASE_POOL } from '../database/database.module';

@Injectable({ scope: Scope.REQUEST })
export class CarsLoader {
  readonly byId: DataLoader<string, CarEntity | null>;
  readonly byOwnerId: DataLoader<string, CarEntity[]>;

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {
    this.byId = new DataLoader<string, CarEntity | null>(async (ids) => {
      const result = await this.pool.query(
        'SELECT * FROM cars WHERE id = ANY($1)',
        [ids as string[]]
      );
      const map = new Map<string, CarEntity>();
      for (const row of result.rows) {
        map.set(row.id, this.mapToCar(row));
      }
      return ids.map(id => map.get(id) ?? null);
    });

    this.byOwnerId = new DataLoader<string, CarEntity[]>(async (ownerIds) => {
      const result = await this.pool.query(
        'SELECT * FROM cars WHERE owner_id = ANY($1) ORDER BY created_at DESC',
        [ownerIds as string[]]
      );
      const map = new Map<string, CarEntity[]>();
      for (const row of result.rows) {
        const cars = map.get(row.owner_id) || [];
        cars.push(this.mapToCar(row));
        map.set(row.owner_id, cars);
      }
      return ownerIds.map(id => map.get(id) ?? []);
    });
  }

  private mapToCar(row: any): CarEntity {
    return {
      id: row.id,
      ownerId: row.owner_id,
      vin: row.vin,
      model: row.model,
      year: row.year,
      currentMileage: row.current_mileage,
      batteryHealthPercentage: parseFloat(row.battery_health_percentage),
      estimatedRangeKm: row.estimated_range_km,
      lastServiceDate: row.last_service_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
