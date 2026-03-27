import { Test, TestingModule } from '@nestjs/testing';
import { CarsResolver } from './cars.resolver';
import { CarsService } from './cars.service';

describe('CarsResolver', () => {
  let resolver: CarsResolver;
  let carsService: CarsService;

  const mockCar = {
    id: 'car-1',
    ownerId: 'user-1',
    vin: '1HGBH41JXMN109186',
    model: 'Tesla Model 3',
    year: 2023,
    currentMileage: 15000,
    batteryHealthPercentage: 98.5,
    estimatedRangeKm: 450,
    lastServiceDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsResolver,
        {
          provide: CarsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockCar]),
            findOne: jest.fn().mockResolvedValue(mockCar),
            create: jest.fn().mockResolvedValue(mockCar),
            update: jest.fn().mockResolvedValue(mockCar),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    resolver = module.get<CarsResolver>(CarsResolver);
    carsService = module.get<CarsService>(CarsService);
  });

  it('should return all cars', async () => {
    const result = await resolver.getCars();
    expect(result).toHaveLength(1);
    expect(carsService.findAll).toHaveBeenCalled();
  });

  it('should return a single car', async () => {
    const result = await resolver.getCar('car-1');
    expect(result).toEqual(mockCar);
    expect(carsService.findOne).toHaveBeenCalledWith('car-1');
  });

  it('should register a car with current user', async () => {
    const input = {
      ownerId: '',
      vin: '1HGBH41JXMN109186',
      model: 'Tesla Model 3',
      year: 2023,
      currentMileage: 15000,
      estimatedRangeKm: 450,
    };
    const result = await resolver.registerCar(input, { userId: 'user-1' });
    expect(result).toEqual(mockCar);
    expect(input.ownerId).toBe('user-1');
  });

  it('should delete a car', async () => {
    const result = await resolver.deleteCar('car-1');
    expect(result).toBe(true);
    expect(carsService.delete).toHaveBeenCalledWith('car-1');
  });
});
