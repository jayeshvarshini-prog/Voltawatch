import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { CarEntity } from './entities/car.entity';
import { CreateCarInput } from './dto/create-car.input';
import { UpdateCarInput } from './dto/update-car.input';
import { DATABASE_POOL } from '../database/database.module';

@Injectable()
export class CarsService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<CarEntity[]> {
    const result = await this.pool.query(
      'SELECT * FROM cars ORDER BY created_at DESC'
    );
    return result.rows.map(row => this.mapToCar(row));
  }

  async findOne(id: string): Promise<CarEntity | null> {
    const result = await this.pool.query(
      'SELECT * FROM cars WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.mapToCar(result.rows[0]) : null;
  }

  async create(input: CreateCarInput): Promise<CarEntity> {
    const result = await this.pool.query(
      `INSERT INTO cars (owner_id, vin, model, year, current_mileage, battery_health_percentage, estimated_range_km)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [input.ownerId, input.vin, input.model, input.year, input.currentMileage,
       input.batteryHealthPercentage ?? 100, input.estimatedRangeKm]
    );
    return this.mapToCar(result.rows[0]);
  }

  async update(id: string, input: UpdateCarInput): Promise<CarEntity | null> {
    const fieldMap: Record<string, string> = {
      vin: 'vin',
      model: 'model',
      year: 'year',
      currentMileage: 'current_mileage',
      batteryHealthPercentage: 'battery_health_percentage',
      estimatedRangeKm: 'estimated_range_km',
      lastServiceDate: 'last_service_date',
    };

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, column] of Object.entries(fieldMap)) {
      if ((input as any)[key] !== undefined) {
        fields.push(`${column} = $${paramIndex++}`);
        values.push((input as any)[key]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE cars SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] ? this.mapToCar(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM cars WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
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
