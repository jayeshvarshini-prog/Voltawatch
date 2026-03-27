import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GqlRes = { body: { data: any; errors?: unknown[] } };

describe('App E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: '{ health { status database uptime timestamp } }' })
        .expect(200)
        .expect((res: GqlRes) => {
          expect(res.body.data.health.status).toBe('ok');
          expect(res.body.data.health.database).toBeDefined();
        });
    });
  });

  describe('Auth Flow', () => {
    const testEmail = `e2e-test-${Date.now()}@voltawatch.com`;

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            register(input: { email: "${testEmail}", password: "testpass123", name: "E2E Test" }) {
              accessToken
              refreshToken
              user { id email name }
            }
          }`,
        })
        .expect(200)
        .expect((res: GqlRes) => {
          expect(res.body.data.register.accessToken).toBeDefined();
          expect(res.body.data.register.user.email).toBe(testEmail);
          accessToken = res.body.data.register.accessToken;
        });
    });

    it('should login with registered user', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            login(input: { email: "${testEmail}", password: "testpass123" }) {
              accessToken
              user { email }
            }
          }`,
        })
        .expect(200)
        .expect((res: GqlRes) => {
          expect(res.body.data.login.accessToken).toBeDefined();
          expect(res.body.data.login.user.email).toBe(testEmail);
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            login(input: { email: "${testEmail}", password: "wrongpassword" }) {
              accessToken
            }
          }`,
        })
        .expect(200)
        .expect((res: GqlRes) => {
          expect(res.body.errors).toBeDefined();
        });
    });
  });

  describe('Cars CRUD', () => {
    let carId: string;

    it('should register a car (authenticated)', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation {
            registerCar(input: {
              vin: "1HGBH41JXMN109186"
              model: "Tesla Model 3"
              year: 2023
              currentMileage: 15000
              estimatedRangeKm: 450
            }) {
              id vin model year
            }
          }`,
        })
        .expect(200)
        .expect((res: GqlRes) => {
          expect(res.body.data.registerCar.vin).toBe('1HGBH41JXMN109186');
          carId = res.body.data.registerCar.id;
        });
    });

    it('should query all cars', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: '{ cars { id vin model } }' })
        .expect(200)
        .expect((res: GqlRes) => {
          expect(Array.isArray(res.body.data.cars)).toBe(true);
        });
    });

    it('should reject car registration without auth', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            registerCar(input: {
              vin: "2HGBH41JXMN109186"
              model: "Tesla Model Y"
              year: 2023
              currentMileage: 0
              estimatedRangeKm: 500
            }) { id }
          }`,
        })
        .expect(200)
        .expect((res: GqlRes) => {
          expect(res.body.errors).toBeDefined();
        });
    });
  });

  describe('Telemetry Validation', () => {
    it('should reject telemetry with invalid battery temp', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation {
            upsertReading(input: {
              carId: "00000000-0000-0000-0000-000000000000"
              timestamp: "${new Date().toISOString()}"
              batteryVoltage: 380
              batteryPercentage: 85
              batteryTempCelsius: 100
              motorTempCelsius: 65
              rpm: 3000
              cabinTempCelsius: 22
              currentMileage: 15000
              speedKmh: 80
              latitude: 37.7749
              longitude: -122.4194
              isCharging: false
            }) { id }
          }`,
        })
        .expect(200)
        .expect((res: GqlRes) => {
          expect(res.body.errors).toBeDefined();
        });
    });

    it('should reject speed above 300', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation {
            upsertReading(input: {
              carId: "00000000-0000-0000-0000-000000000000"
              timestamp: "${new Date().toISOString()}"
              batteryVoltage: 380
              batteryPercentage: 85
              batteryTempCelsius: 35
              motorTempCelsius: 65
              rpm: 3000
              cabinTempCelsius: 22
              currentMileage: 15000
              speedKmh: 350
              latitude: 37.7749
              longitude: -122.4194
              isCharging: false
            }) { id }
          }`,
        })
        .expect(200)
        .expect((res: GqlRes) => {
          expect(res.body.errors).toBeDefined();
        });
    });
  });
});
