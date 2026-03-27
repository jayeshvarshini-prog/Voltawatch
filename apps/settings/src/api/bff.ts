const BFF_URL = 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.headers) Object.assign(headers, options.headers);

  const res = await fetch(`${BFF_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let message = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text) as { message?: string };
      message = json.message || message;
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }
  const text = await res.text();
  return text ? JSON.parse(text) as T : undefined as unknown as T;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
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

export interface CreateCarInput {
  vin: string;
  model: string;
  year: number;
  currentMileage: number;
  batteryHealthPercentage: number;
  estimatedRangeKm: number;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
};

export const carsApi = {
  getAll: () => request<Car[]>('/api/cars'),
  create: (input: CreateCarInput) =>
    request<Car>('/api/cars', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Partial<CreateCarInput>) =>
    request<Car>(`/api/cars/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: string) =>
    request<void>(`/api/cars/${id}`, { method: 'DELETE' }),
};
