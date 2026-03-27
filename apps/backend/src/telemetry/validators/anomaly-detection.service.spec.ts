import { AnomalyDetectionService } from './anomaly-detection.service';
import { CreateTelemetryInput } from '../dto/create-telemetry.input';

describe('AnomalyDetectionService', () => {
  let service: AnomalyDetectionService;

  const baseInput: Partial<CreateTelemetryInput> = {
    carId: 'car-1',
    timestamp: new Date(),
    batteryVoltage: 380,
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

  beforeEach(() => {
    service = new AnomalyDetectionService();
  });

  it('should detect no faults for normal readings', () => {
    const faults = service.detectFaults(baseInput as CreateTelemetryInput);
    expect(faults).toHaveLength(0);
  });

  it('should detect OVERHEAT when battery temp > 60', () => {
    const input = { ...baseInput, batteryTempCelsius: 65 } as CreateTelemetryInput;
    const faults = service.detectFaults(input);
    expect(faults).toContain('OVERHEAT');
  });

  it('should detect MOTOR_FAULT when motor temp > 150', () => {
    const input = { ...baseInput, motorTempCelsius: 155 } as CreateTelemetryInput;
    const faults = service.detectFaults(input);
    expect(faults).toContain('MOTOR_FAULT');
  });

  it('should detect BATTERY_CRITICAL when percentage < 5', () => {
    const input = { ...baseInput, batteryPercentage: 3 } as CreateTelemetryInput;
    const faults = service.detectFaults(input);
    expect(faults).toContain('BATTERY_CRITICAL');
    expect(faults).not.toContain('BATTERY_LOW');
  });

  it('should detect BATTERY_LOW when percentage < 15 but >= 5', () => {
    const input = { ...baseInput, batteryPercentage: 10 } as CreateTelemetryInput;
    const faults = service.detectFaults(input);
    expect(faults).toContain('BATTERY_LOW');
    expect(faults).not.toContain('BATTERY_CRITICAL');
  });

  it('should detect CHARGING_ERROR when charging power > 350kW', () => {
    const input = { ...baseInput, chargingPowerKw: 400 } as CreateTelemetryInput;
    const faults = service.detectFaults(input);
    expect(faults).toContain('CHARGING_ERROR');
  });

  it('should detect multiple faults simultaneously', () => {
    const input = {
      ...baseInput,
      batteryTempCelsius: 65,
      batteryPercentage: 3,
    } as CreateTelemetryInput;
    const faults = service.detectFaults(input);
    expect(faults).toContain('OVERHEAT');
    expect(faults).toContain('BATTERY_CRITICAL');
  });

  it('should merge detected faults with existing ones without duplicates', () => {
    const detected = ['OVERHEAT', 'BATTERY_LOW'];
    const existing = ['OVERHEAT', 'SENSOR_FAIL'];
    const merged = service.mergeWithExisting(detected, existing);
    expect(merged).toHaveLength(3);
    expect(merged).toContain('OVERHEAT');
    expect(merged).toContain('BATTERY_LOW');
    expect(merged).toContain('SENSOR_FAIL');
  });
});
