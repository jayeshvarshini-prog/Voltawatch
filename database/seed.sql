-- VoltaWatch Production Snapshot Seed Data
-- Real-world EV data for testing

-- Clear existing data
TRUNCATE telemetry_readings, cars, users CASCADE;

-- Insert users
INSERT INTO users (id, email, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'alice.johnson@voltawatch.com', 'Alice Johnson'),
  ('550e8400-e29b-41d4-a716-446655440001', 'bob.martinez@voltawatch.com', 'Bob Martinez'),
  ('550e8400-e29b-41d4-a716-446655440002', 'carol.chen@voltawatch.com', 'Carol Chen');

-- Insert cars (Production EV snapshot)
INSERT INTO cars (id, owner_id, vin, model, year, current_mileage, battery_health_percentage, estimated_range_km, last_service_date) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'VOLVO12345EX90001',
    'Volvo EX90',
    2024,
    15420,
    94.50,
    425,
    '2025-11-15'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'VOLVO98765C40R001',
    'Volvo C40 Recharge',
    2023,
    28750,
    88.20,
    380,
    '2025-10-20'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'TESLA12345MODEL3',
    'Tesla Model 3 Long Range',
    2024,
    12340,
    97.80,
    520,
    '2025-12-01'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'POLESTAR234567890',
    'Polestar 2',
    2023,
    45600,
    82.10,
    350,
    '2025-09-10'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    'RIVIAN12345R1T001',
    'Rivian R1T',
    2024,
    9870,
    99.20,
    480,
    '2025-12-15'
  );

-- Insert recent telemetry (last 24 hours for each car)
-- Volvo EX90 - Normal operation
INSERT INTO telemetry_readings (
  car_id, timestamp, battery_voltage, battery_percentage, battery_temp_celsius,
  motor_temp_celsius, rpm, cabin_temp_celsius, current_mileage, speed_kmh,
  latitude, longitude, fault_codes, is_charging, charging_power_kw
)
SELECT
  '650e8400-e29b-41d4-a716-446655440000'::uuid,
  NOW() - (seq * INTERVAL '10 minutes'),
  395.0 + (RANDOM() * 5),
  85.0 + (RANDOM() * 10),
  32.0 + (RANDOM() * 5),
  65.0 + (RANDOM() * 10),
  CASE WHEN seq % 6 = 0 THEN 0 ELSE 2500 + (RANDOM() * 2000)::int END,
  22.0 + (RANDOM() * 3),
  15420 + (seq * 2),
  CASE WHEN seq % 6 = 0 THEN 0 ELSE 60.0 + (RANDOM() * 20) END,
  37.7749 + ((RANDOM() - 0.5) * 0.05),
  -122.4194 + ((RANDOM() - 0.5) * 0.05),
  ARRAY[]::fault_code[],
  seq % 6 = 0,
  CASE WHEN seq % 6 = 0 THEN 150.0 ELSE 0.0 END
FROM generate_series(0, 143) AS seq;

-- Tesla Model 3 - With battery warning
INSERT INTO telemetry_readings (
  car_id, timestamp, battery_voltage, battery_percentage, battery_temp_celsius,
  motor_temp_celsius, rpm, cabin_temp_celsius, current_mileage, speed_kmh,
  latitude, longitude, fault_codes, is_charging, charging_power_kw
)
SELECT
  '650e8400-e29b-41d4-a716-446655440002'::uuid,
  NOW() - (seq * INTERVAL '15 minutes'),
  CASE WHEN seq = 45 THEN 245.0 ELSE 405.0 + (RANDOM() * 10) END,
  CASE WHEN seq > 40 THEN 15.0 + (RANDOM() * 5) ELSE 75.0 + (RANDOM() * 15) END,
  28.0 + (RANDOM() * 8),
  70.0 + (RANDOM() * 15),
  CASE WHEN seq % 5 = 0 THEN 0 ELSE 3000 + (RANDOM() * 3000)::int END,
  21.0 + (RANDOM() * 4),
  12340 + (seq * 3),
  CASE WHEN seq % 5 = 0 THEN 0 ELSE 70.0 + (RANDOM() * 30) END,
  34.0522 + ((RANDOM() - 0.5) * 0.08),
  -118.2437 + ((RANDOM() - 0.5) * 0.08),
  CASE WHEN seq = 45 THEN ARRAY['BATTERY_LOW']::fault_code[] ELSE ARRAY[]::fault_code[] END,
  seq % 5 = 0,
  CASE WHEN seq % 5 = 0 THEN 250.0 ELSE 0.0 END
FROM generate_series(0, 95) AS seq;

-- Polestar 2 - Motor overheat issue
INSERT INTO telemetry_readings (
  car_id, timestamp, battery_voltage, battery_percentage, battery_temp_celsius,
  motor_temp_celsius, rpm, cabin_temp_celsius, current_mileage, speed_kmh,
  latitude, longitude, fault_codes, is_charging, charging_power_kw
)
SELECT
  '650e8400-e29b-41d4-a716-446655440003'::uuid,
  NOW() - (seq * INTERVAL '20 minutes'),
  370.0 + (RANDOM() * 15),
  60.0 + (RANDOM() * 25),
  30.0 + (RANDOM() * 6),
  CASE WHEN seq = 30 THEN 95.0 ELSE 60.0 + (RANDOM() * 20) END,
  CASE WHEN seq % 8 = 0 THEN 0 ELSE 2200 + (RANDOM() * 2500)::int END,
  23.0 + (RANDOM() * 3),
  45600 + (seq * 4),
  CASE WHEN seq % 8 = 0 THEN 0 ELSE 50.0 + (RANDOM() * 30) END,
  47.6062 + ((RANDOM() - 0.5) * 0.06),
  -122.3321 + ((RANDOM() - 0.5) * 0.06),
  CASE WHEN seq = 30 THEN ARRAY['OVERHEAT', 'MOTOR_FAULT']::fault_code[] ELSE ARRAY[]::fault_code[] END,
  seq % 8 = 0,
  CASE WHEN seq % 8 = 0 THEN 22.0 ELSE 0.0 END
FROM generate_series(0, 71) AS seq;

-- Rivian R1T - Healthy, charging
INSERT INTO telemetry_readings (
  car_id, timestamp, battery_voltage, battery_percentage, battery_temp_celsius,
  motor_temp_celsius, rpm, cabin_temp_celsius, current_mileage, speed_kmh,
  latitude, longitude, fault_codes, is_charging, charging_power_kw
)
SELECT
  '650e8400-e29b-41d4-a716-446655440004'::uuid,
  NOW() - (seq * INTERVAL '5 minutes'),
  400.0 + (RANDOM() * 8),
  20.0 + (seq * 0.8),
  35.0 + (RANDOM() * 8),
  40.0 + (RANDOM() * 10),
  0,
  20.0 + (RANDOM() * 2),
  9870,
  0,
  39.7392 + ((RANDOM() - 0.5) * 0.02),
  -104.9903 + ((RANDOM() - 0.5) * 0.02),
  ARRAY[]::fault_code[],
  true,
  180.0 + (RANDOM() * 20)
FROM generate_series(0, 100) AS seq;

-- Summary
DO $$
DECLARE
  user_count INT;
  car_count INT;
  reading_count INT;
  fault_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO car_count FROM cars;
  SELECT COUNT(*) INTO reading_count FROM telemetry_readings;
  SELECT COUNT(*) INTO fault_count FROM telemetry_readings WHERE array_length(fault_codes, 1) > 0;

  RAISE NOTICE '=========================================';
  RAISE NOTICE 'VoltaWatch Production Snapshot Complete';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Cars: %', car_count;
  RAISE NOTICE 'Telemetry Readings: %', reading_count;
  RAISE NOTICE 'Fault Events: %', fault_count;
  RAISE NOTICE '=========================================';
END $$;
