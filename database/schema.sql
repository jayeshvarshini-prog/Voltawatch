-- VoltaWatch Database Schema - Production EV Snapshot
-- PostgreSQL 14+

-- Drop existing tables if needed
DROP TABLE IF EXISTS telemetry_readings CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS fault_code CASCADE;

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cars - Production EV snapshot
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vin VARCHAR(17) UNIQUE NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,

  -- Current state (production snapshot)
  current_mileage INTEGER NOT NULL,
  battery_health_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  estimated_range_km INTEGER NOT NULL,
  last_service_date DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fault code enum
CREATE TYPE fault_code AS ENUM (
  'P0001',
  'P0002',
  'BATTERY_LOW',
  'BATTERY_CRITICAL',
  'OVERHEAT',
  'MOTOR_FAULT',
  'SENSOR_FAIL',
  'CHARGING_ERROR',
  'BRAKE_SYSTEM',
  'COOLANT_LOW'
);

-- Telemetry readings
CREATE TABLE telemetry_readings (
  id BIGSERIAL PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Battery metrics
  battery_voltage DECIMAL(5,2),
  battery_percentage DECIMAL(5,2),
  battery_temp_celsius DECIMAL(5,2),

  -- Motor metrics
  motor_temp_celsius DECIMAL(5,2),
  rpm INTEGER,

  -- Cabin metrics
  cabin_temp_celsius DECIMAL(5,2),

  -- Location & speed
  current_mileage INTEGER,
  speed_kmh DECIMAL(5,2),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Faults
  fault_codes fault_code[],

  -- Charging
  is_charging BOOLEAN DEFAULT false,
  charging_power_kw DECIMAL(6,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(car_id, timestamp)
);

-- Indexes for performance (as requested: battery and range)
CREATE INDEX idx_cars_battery_health ON cars(battery_health_percentage);
CREATE INDEX idx_cars_range ON cars(estimated_range_km);
CREATE INDEX idx_cars_owner ON cars(owner_id);
CREATE INDEX idx_cars_mileage ON cars(current_mileage);

CREATE INDEX idx_telemetry_car_timestamp ON telemetry_readings(car_id, timestamp DESC);
CREATE INDEX idx_telemetry_timestamp ON telemetry_readings(timestamp DESC);
CREATE INDEX idx_telemetry_faults ON telemetry_readings USING GIN(fault_codes);

-- Row-level security
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_cars_policy ON cars
  FOR ALL
  USING (owner_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY user_telemetry_policy ON telemetry_readings
  FOR ALL
  USING (car_id IN (
    SELECT id FROM cars
    WHERE owner_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  ));

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
