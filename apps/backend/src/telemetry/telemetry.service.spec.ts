import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryService } from './telemetry.service';
import { AnomalyDetectionService } from './validators/anomaly-detection.service';
import { DATABASE_POOL } from '../database/database.module';
import { PUB_SUB } from '../pubsub/pubsub.module';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let mockPool: any;
  let mockPubSub: any;

  const mockTelemetryRow = {
    id: 1,
    car_id: 'car-1',
    timestamp: new Date(),
    battery_voltage: '380.50',
    battery_percentage: '85.00',
    battery_temp_celsius: '35.00',
    motor_temp_celsius: '65.00',
    rpm: 3000,
    cabin_temp_celsius: '22.00',
    current_mileage: 15000,
    speed_kmh: '80.00',
    latitude: '37.77490000',
    longitude: '-122.41940000',
    fault_codes: [],
    is_charging: false,
    charging_power_kw: null,
    created_at: new Date(),
  };

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
    };
    mockPubSub = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        AnomalyDetectionService,
        { provide: DATABASE_POOL, useValue: mockPool },
        { provide: PUB_SUB, useValue: mockPubSub },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
  });

  describe('findByCarId', () => {
    it('should return telemetry readings for a car', async () => {
      mockPool.query.mockResolvedValue({ rows: [mockTelemetryRow] });

      const result = await service.findByCarId('car-1', 100);

      expect(result).toHaveLength(1);
      expect(result[0].carId).toBe('car-1');
      expect(result[0].batteryVoltage).toBe(380.5);
    });
  });

  describe('findLatest', () => {
    it('should return the latest reading', async () => {
      mockPool.query.mockResolvedValue({ rows: [mockTelemetryRow] });

      const result = await service.findLatest('car-1');

      expect(result).toBeDefined();
      expect(result!.carId).toBe('car-1');
    });

    it('should return null if no readings', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await service.findLatest('car-1');

      expect(result).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should upsert a reading and publish event', async () => {
      mockPool.query.mockResolvedValue({ rows: [mockTelemetryRow] });

      const input = {
        carId: 'car-1',
        timestamp: new Date(),
        batteryVoltage: 380.5,
        batteryPercentage: 85,
        batteryTempCelsius: 35,
        motorTempCelsius: 65,
        rpm: 3000,
        cabinTempCelsius: 22,
        currentMileage: 15000,
        speedKmh: 80,
        latitude: 37.7749,
        longitude: -122.4194,
        faultCodes: [],
        isCharging: false,
      };

      const result = await service.upsert(input);

      expect(result.carId).toBe('car-1');
      expect(mockPubSub.publish).toHaveBeenCalled();
    });

    it('should auto-inject fault codes for anomalies', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ ...mockTelemetryRow, fault_codes: ['OVERHEAT'] }],
      });

      const input = {
        carId: 'car-1',
        timestamp: new Date(),
        batteryVoltage: 380.5,
        batteryPercentage: 85,
        batteryTempCelsius: 65, // > 60, triggers OVERHEAT
        motorTempCelsius: 65,
        rpm: 3000,
        cabinTempCelsius: 22,
        currentMileage: 15000,
        speedKmh: 80,
        latitude: 37.7749,
        longitude: -122.4194,
        faultCodes: [],
        isCharging: false,
      };

      await service.upsert(input);

      // Verify fault codes were merged before insert
      expect(input.faultCodes).toContain('OVERHEAT');
    });
  });

  describe('batchUpsert', () => {
    it('should batch upsert readings', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [mockTelemetryRow] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const readings = [
        {
          carId: 'car-1',
          timestamp: new Date(),
          batteryVoltage: 380.5,
          batteryPercentage: 85,
          batteryTempCelsius: 35,
          motorTempCelsius: 65,
          rpm: 3000,
          cabinTempCelsius: 22,
          currentMileage: 15000,
          speedKmh: 80,
          latitude: 37.7749,
          longitude: -122.4194,
          faultCodes: [],
          isCharging: false,
        },
      ];

      const result = await service.batchUpsert(readings);

      expect(result.accepted).toBe(1);
      expect(result.rejected).toBe(0);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
