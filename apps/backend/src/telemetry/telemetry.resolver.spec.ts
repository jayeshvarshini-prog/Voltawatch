import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryResolver } from './telemetry.resolver';
import { TelemetryService } from './telemetry.service';
import { PUB_SUB } from '../pubsub/pubsub.module';

describe('TelemetryResolver', () => {
  let resolver: TelemetryResolver;
  let telemetryService: TelemetryService;

  const mockTelemetry = {
    id: '1',
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
    chargingPowerKw: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryResolver,
        {
          provide: TelemetryService,
          useValue: {
            findByCarId: jest.fn().mockResolvedValue([mockTelemetry]),
            findLatest: jest.fn().mockResolvedValue(mockTelemetry),
            upsert: jest.fn().mockResolvedValue(mockTelemetry),
            batchUpsert: jest.fn().mockResolvedValue({ accepted: 1, rejected: 0, errors: [] }),
          },
        },
        {
          provide: PUB_SUB,
          useValue: { asyncIterator: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<TelemetryResolver>(TelemetryResolver);
    telemetryService = module.get<TelemetryService>(TelemetryService);
  });

  it('should get telemetry by carId', async () => {
    const result = await resolver.getTelemetry('car-1', 100);
    expect(result).toHaveLength(1);
    expect(telemetryService.findByCarId).toHaveBeenCalledWith('car-1', 100);
  });

  it('should get latest reading', async () => {
    const result = await resolver.getLatestReading('car-1');
    expect(result).toEqual(mockTelemetry);
  });

  it('should upsert a reading', async () => {
    const input: any = { carId: 'car-1', timestamp: new Date() };
    const result = await resolver.upsertReading(input);
    expect(result).toEqual(mockTelemetry);
    expect(telemetryService.upsert).toHaveBeenCalledWith(input);
  });

  it('should batch upsert readings', async () => {
    const input: any = { readings: [{ carId: 'car-1' }] };
    const result = await resolver.batchUpsertReadings(input);
    expect(result.accepted).toBe(1);
    expect(telemetryService.batchUpsert).toHaveBeenCalledWith(input.readings);
  });
});
