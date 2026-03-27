import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { PubSub } from 'graphql-subscriptions';
import { TelemetryEntity } from './entities/telemetry.entity';
import { CreateTelemetryInput } from './dto/create-telemetry.input';
import { BatchResult } from './entities/batch-result.entity';
import { AnomalyDetectionService } from './validators/anomaly-detection.service';
import { DATABASE_POOL } from '../database/database.module';
import { PUB_SUB } from '../pubsub/pubsub.module';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
    private readonly anomalyDetection: AnomalyDetectionService,
  ) {}

  async findByCarId(carId: string, limit: number): Promise<TelemetryEntity[]> {
    const result = await this.pool.query(
      'SELECT * FROM telemetry_readings WHERE car_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [carId, limit],
    );
    return result.rows.map((row) => this.mapToTelemetry(row));
  }

  async findLatest(carId: string): Promise<TelemetryEntity | null> {
    const result = await this.pool.query(
      'SELECT * FROM telemetry_readings WHERE car_id = $1 ORDER BY timestamp DESC LIMIT 1',
      [carId],
    );
    return result.rows[0] ? this.mapToTelemetry(result.rows[0]) : null;
  }

  async findLatestByCarIds(carIds: string[]): Promise<Map<string, TelemetryEntity>> {
    const result = await this.pool.query(
      `SELECT DISTINCT ON (car_id) * FROM telemetry_readings
       WHERE car_id = ANY($1)
       ORDER BY car_id, timestamp DESC`,
      [carIds],
    );
    const map = new Map<string, TelemetryEntity>();
    for (const row of result.rows) {
      map.set(row.car_id, this.mapToTelemetry(row));
    }
    return map;
  }

  async upsert(input: CreateTelemetryInput): Promise<TelemetryEntity> {
    const detectedFaults = this.anomalyDetection.detectFaults(input);
    input.faultCodes = this.anomalyDetection.mergeWithExisting(detectedFaults, input.faultCodes);

    if (detectedFaults.length > 0) {
      this.logger.warn(`Anomalies detected for car ${input.carId}: ${detectedFaults.join(', ')}`);
    }

    const faultCodesArray =
      input.faultCodes && input.faultCodes.length > 0 ? `{${input.faultCodes.join(',')}}` : '{}';

    const result = await this.pool.query(
      `INSERT INTO telemetry_readings (
         car_id, timestamp, battery_voltage, battery_percentage, battery_temp_celsius,
         motor_temp_celsius, rpm, cabin_temp_celsius, current_mileage, speed_kmh,
         latitude, longitude, fault_codes, is_charging, charging_power_kw
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::fault_code[], $14, $15)
       ON CONFLICT (car_id, timestamp) DO UPDATE SET
         battery_voltage = EXCLUDED.battery_voltage,
         battery_percentage = EXCLUDED.battery_percentage,
         battery_temp_celsius = EXCLUDED.battery_temp_celsius,
         motor_temp_celsius = EXCLUDED.motor_temp_celsius,
         rpm = EXCLUDED.rpm,
         cabin_temp_celsius = EXCLUDED.cabin_temp_celsius,
         current_mileage = EXCLUDED.current_mileage,
         speed_kmh = EXCLUDED.speed_kmh,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         fault_codes = EXCLUDED.fault_codes,
         is_charging = EXCLUDED.is_charging,
         charging_power_kw = EXCLUDED.charging_power_kw
       RETURNING *`,
      [
        input.carId,
        input.timestamp,
        input.batteryVoltage,
        input.batteryPercentage,
        input.batteryTempCelsius,
        input.motorTempCelsius,
        input.rpm,
        input.cabinTempCelsius,
        input.currentMileage,
        input.speedKmh,
        input.latitude,
        input.longitude,
        faultCodesArray,
        input.isCharging,
        input.chargingPowerKw ?? null,
      ],
    );

    const entity = this.mapToTelemetry(result.rows[0]);

    await this.pubSub.publish(`liveTelemetry.${input.carId}`, {
      liveTelemetry: entity,
    });

    return entity;
  }

  async batchUpsert(readings: CreateTelemetryInput[]): Promise<BatchResult> {
    const result: BatchResult = { accepted: 0, rejected: 0, errors: [] };
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (let i = 0; i < readings.length; i++) {
        try {
          const input = readings[i];
          const detectedFaults = this.anomalyDetection.detectFaults(input);
          input.faultCodes = this.anomalyDetection.mergeWithExisting(
            detectedFaults,
            input.faultCodes,
          );

          const faultCodesArray =
            input.faultCodes && input.faultCodes.length > 0
              ? `{${input.faultCodes.join(',')}}`
              : '{}';

          await client.query(
            `INSERT INTO telemetry_readings (
               car_id, timestamp, battery_voltage, battery_percentage, battery_temp_celsius,
               motor_temp_celsius, rpm, cabin_temp_celsius, current_mileage, speed_kmh,
               latitude, longitude, fault_codes, is_charging, charging_power_kw
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::fault_code[], $14, $15)
             ON CONFLICT (car_id, timestamp) DO UPDATE SET
               battery_voltage = EXCLUDED.battery_voltage,
               battery_percentage = EXCLUDED.battery_percentage,
               battery_temp_celsius = EXCLUDED.battery_temp_celsius,
               motor_temp_celsius = EXCLUDED.motor_temp_celsius,
               rpm = EXCLUDED.rpm,
               cabin_temp_celsius = EXCLUDED.cabin_temp_celsius,
               current_mileage = EXCLUDED.current_mileage,
               speed_kmh = EXCLUDED.speed_kmh,
               latitude = EXCLUDED.latitude,
               longitude = EXCLUDED.longitude,
               fault_codes = EXCLUDED.fault_codes,
               is_charging = EXCLUDED.is_charging,
               charging_power_kw = EXCLUDED.charging_power_kw`,
            [
              input.carId,
              input.timestamp,
              input.batteryVoltage,
              input.batteryPercentage,
              input.batteryTempCelsius,
              input.motorTempCelsius,
              input.rpm,
              input.cabinTempCelsius,
              input.currentMileage,
              input.speedKmh,
              input.latitude,
              input.longitude,
              faultCodesArray,
              input.isCharging,
              input.chargingPowerKw ?? null,
            ],
          );

          result.accepted++;
        } catch (err) {
          result.rejected++;
          result.errors.push({
            index: i,
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      this.logger.error('Batch upsert transaction failed', err);
      throw err;
    } finally {
      client.release();
    }

    this.logger.log(`Batch upsert: ${result.accepted} accepted, ${result.rejected} rejected`);
    return result;
  }

  private mapToTelemetry(row: any): TelemetryEntity {
    return {
      id: row.id.toString(),
      carId: row.car_id,
      timestamp: row.timestamp,
      batteryVoltage: parseFloat(row.battery_voltage),
      batteryPercentage: parseFloat(row.battery_percentage),
      batteryTempCelsius: parseFloat(row.battery_temp_celsius),
      motorTempCelsius: parseFloat(row.motor_temp_celsius),
      rpm: row.rpm,
      cabinTempCelsius: parseFloat(row.cabin_temp_celsius),
      currentMileage: row.current_mileage,
      speedKmh: parseFloat(row.speed_kmh),
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      faultCodes: Array.isArray(row.fault_codes)
        ? row.fault_codes
        : typeof row.fault_codes === 'string'
          ? row.fault_codes
              .replace(/^\{|\}$/g, '')
              .split(',')
              .filter(Boolean)
          : [],
      isCharging: row.is_charging,
      chargingPowerKw: row.charging_power_kw ? parseFloat(row.charging_power_kw) : null,
      createdAt: row.created_at,
    };
  }
}
