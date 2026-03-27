import { Test, TestingModule } from '@nestjs/testing';
import { CarsService } from './cars.service';
import { DATABASE_POOL } from '../database/database.module';

describe('CarsService', () => {
  let service: CarsService;
  let mockPool: any;

  const mockCarRow = {
    id: 'car-1',
    owner_id: 'user-1',
    vin: '1HGBH41JXMN109186',
    model: 'Tesla Model 3',
    year: 2023,
    current_mileage: 15000,
    battery_health_percentage: '98.50',
    estimated_range_km: 450,
    last_service_date: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        { provide: DATABASE_POOL, useValue: mockPool },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
  });

  describe('findAll', () => {
    it('should return all cars', async () => {
      mockPool.query.mockResolvedValue({ rows: [mockCarRow] });

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('car-1');
      expect(result[0].batteryHealthPercentage).toBe(98.5);
    });
  });

  describe('findOne', () => {
    it('should return a car by id', async () => {
      mockPool.query.mockResolvedValue({ rows: [mockCarRow] });

      const result = await service.findOne('car-1');

      expect(result).toBeDefined();
      expect(result!.vin).toBe('1HGBH41JXMN109186');
    });

    it('should return null if car not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a car', async () => {
      mockPool.query.mockResolvedValue({ rows: [mockCarRow] });

      const result = await service.create({
        ownerId: 'user-1',
        vin: '1HGBH41JXMN109186',
        model: 'Tesla Model 3',
        year: 2023,
        currentMileage: 15000,
        estimatedRangeKm: 450,
      });

      expect(result.id).toBe('car-1');
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update car fields', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ ...mockCarRow, current_mileage: 16000 }] });

      const result = await service.update('car-1', { currentMileage: 16000 } as any);

      expect(result).toBeDefined();
      expect(mockPool.query).toHaveBeenCalled();
    });

    it('should return existing car if no fields to update', async () => {
      mockPool.query.mockResolvedValue({ rows: [mockCarRow] });

      const result = await service.update('car-1', {} as any);

      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a car and return true', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1 });

      const result = await service.delete('car-1');

      expect(result).toBe(true);
    });

    it('should return false if car not found', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0 });

      const result = await service.delete('nonexistent');

      expect(result).toBe(false);
    });
  });
});
