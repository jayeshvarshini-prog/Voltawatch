interface CarState {
  phase: 'driving' | 'charging' | 'parked';
  batteryPct: number;
  mileage: number;
  lat: number;
  lng: number;
  tickCount: number;
}

const carStates = new Map<string, CarState>();

const startLocations = [
  { lat: 37.7749, lng: -122.4194 }, // San Francisco
  { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  { lat: 40.7128, lng: -74.006 }, // New York
  { lat: 47.6062, lng: -122.3321 }, // Seattle
  { lat: 39.7392, lng: -104.9903 }, // Denver
];

function initState(carIndex: number): CarState {
  const loc = startLocations[carIndex % startLocations.length];
  return {
    phase: 'driving',
    batteryPct: 60 + Math.random() * 35,
    mileage: 10000 + Math.floor(Math.random() * 40000),
    lat: loc.lat,
    lng: loc.lng,
    tickCount: 0,
  };
}

export function generateReading(carId: string, carIndex: number) {
  let state = carStates.get(carId);
  if (!state) {
    state = initState(carIndex);
    carStates.set(carId, state);
  }

  state.tickCount++;

  // Phase transitions
  if (state.phase === 'driving') {
    state.batteryPct -= 0.3 + Math.random() * 0.5;
    state.mileage += Math.floor(5 + Math.random() * 10);
    state.lat += (Math.random() - 0.5) * 0.005;
    state.lng += (Math.random() - 0.5) * 0.005;
    if (state.batteryPct < 20) {
      state.phase = 'charging';
    } else if (Math.random() < 0.05) {
      state.phase = 'parked';
    }
  } else if (state.phase === 'charging') {
    state.batteryPct += 1.5 + Math.random() * 1.0;
    if (state.batteryPct > 90) {
      state.phase = 'driving';
    }
  } else if (state.phase === 'parked') {
    if (Math.random() < 0.2) {
      state.phase = 'driving';
    }
  }

  state.batteryPct = Math.max(0, Math.min(100, state.batteryPct));

  // Occasionally inject faults (2% chance)
  const faultCodes: string[] = [];
  if (Math.random() < 0.02) {
    const faults = ['BATTERY_LOW', 'OVERHEAT', 'SENSOR_FAIL', 'P0001', 'COOLANT_LOW'];
    faultCodes.push(faults[Math.floor(Math.random() * faults.length)]);
  }

  // Battery low fault when below 15%
  if (state.batteryPct < 15 && !faultCodes.includes('BATTERY_LOW')) {
    faultCodes.push('BATTERY_LOW');
  }

  const isDriving = state.phase === 'driving';
  const isCharging = state.phase === 'charging';

  const motorTemp = isDriving ? 55 + Math.random() * 30 : 25 + Math.random() * 10;

  return {
    carId,
    timestamp: new Date().toISOString(),
    batteryVoltage: 350 + Math.random() * 60,
    batteryPercentage: Math.round(state.batteryPct * 100) / 100,
    batteryTempCelsius: 22 + Math.random() * 15,
    motorTempCelsius: Math.round(motorTemp * 100) / 100,
    rpm: isDriving ? 1500 + Math.floor(Math.random() * 4500) : 0,
    cabinTempCelsius: 20 + Math.random() * 5,
    currentMileage: state.mileage,
    speedKmh: isDriving ? 30 + Math.random() * 90 : 0,
    latitude: state.lat,
    longitude: state.lng,
    faultCodes,
    isCharging,
    chargingPowerKw: isCharging ? 50 + Math.random() * 200 : 0,
  };
}
