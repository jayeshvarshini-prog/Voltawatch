import { Injectable } from '@nestjs/common';
import { CreateTelemetryInput } from '../dto/create-telemetry.input';

@Injectable()
export class AnomalyDetectionService {
  detectFaults(input: CreateTelemetryInput): string[] {
    const faults: string[] = [];

    if (input.batteryTempCelsius > 60) {
      faults.push('OVERHEAT');
    }

    if (input.motorTempCelsius > 150) {
      faults.push('MOTOR_FAULT');
    }

    if (input.batteryPercentage < 5) {
      faults.push('BATTERY_CRITICAL');
    } else if (input.batteryPercentage < 15) {
      faults.push('BATTERY_LOW');
    }

    if (input.chargingPowerKw && input.chargingPowerKw > 350) {
      faults.push('CHARGING_ERROR');
    }

    return faults;
  }

  mergeWithExisting(detected: string[], existing: string[] = []): string[] {
    const merged = new Set([...existing, ...detected]);
    return Array.from(merged);
  }
}
