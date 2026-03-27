// Shared TypeScript types for VoltaWatch

export enum FaultCode {
  P0001 = 'P0001',
  P0002 = 'P0002',
  BATTERY_LOW = 'BATTERY_LOW',
  BATTERY_CRITICAL = 'BATTERY_CRITICAL',
  OVERHEAT = 'OVERHEAT',
  MOTOR_FAULT = 'MOTOR_FAULT',
  SENSOR_FAIL = 'SENSOR_FAIL',
  CHARGING_ERROR = 'CHARGING_ERROR',
  BRAKE_SYSTEM = 'BRAKE_SYSTEM',
  COOLANT_LOW = 'COOLANT_LOW',
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Car {
  id: string;
  ownerId: string;
  vin: string;
  model: string;
  year: number;
  currentMileage: number;
  batteryHealthPercentage: number;
  estimatedRangeKm: number;
  lastServiceDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TelemetryReading {
  id: string;
  carId: string;
  timestamp: Date;
  batteryVoltage: number;
  batteryPercentage: number;
  batteryTempCelsius: number;
  motorTempCelsius: number;
  rpm: number;
  cabinTempCelsius: number;
  currentMileage: number;
  speedKmh: number;
  latitude: number;
  longitude: number;
  faultCodes: FaultCode[];
  isCharging: boolean;
  chargingPowerKw: number | null;
  createdAt: Date;
}

export interface CreateTelemetryInput {
  carId: string;
  timestamp: Date;
  batteryVoltage: number;
  batteryPercentage: number;
  batteryTempCelsius: number;
  motorTempCelsius: number;
  rpm: number;
  cabinTempCelsius: number;
  currentMileage: number;
  speedKmh: number;
  latitude: number;
  longitude: number;
  faultCodes?: FaultCode[];
  isCharging: boolean;
  chargingPowerKw?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'name'>;
}

export interface CreateCarInput {
  vin: string;
  model: string;
  year: number;
  currentMileage: number;
  batteryHealthPercentage?: number;
  estimatedRangeKm: number;
}

export interface UpdateCarInput {
  vin?: string;
  model?: string;
  year?: number;
  currentMileage?: number;
  batteryHealthPercentage?: number;
  estimatedRangeKm?: number;
  lastServiceDate?: Date;
}
