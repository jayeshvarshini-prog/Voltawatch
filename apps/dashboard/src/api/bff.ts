const BFF_URL = 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BFF_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
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
  lastServiceDate: string | null;
}

export interface TelemetryReading {
  id: string;
  carId: string;
  timestamp: string;
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
  faultCodes: string[];
  isCharging: boolean;
  chargingPowerKw: number | null;
}

export const api = {
  getCars: () => request<Car[]>('/api/cars'),
  getTelemetry: (carId: string, limit = 50) =>
    request<TelemetryReading[]>(`/api/telemetry/${carId}?limit=${limit}`),
  getLatestReading: (carId: string) =>
    request<TelemetryReading | null>(`/api/telemetry/${carId}/latest`),
};

export const WS_URL = 'ws://localhost:3000/ws/telemetry';
