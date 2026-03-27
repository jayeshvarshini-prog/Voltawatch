import React from 'react';

const FAULT_DESCRIPTIONS: Record<string, string> = {
  P0001: 'Fuel Volume Regulator Control',
  P0002: 'Fuel Volume Regulator Control Range',
  BATTERY_LOW: 'Battery level critically low',
  BATTERY_CRITICAL: 'Battery at critical level — charge immediately',
  OVERHEAT: 'Thermal management system warning',
  MOTOR_FAULT: 'Electric motor fault detected',
  SENSOR_FAIL: 'Sensor failure — check diagnostics',
  CHARGING_ERROR: 'Charging system malfunction',
  BRAKE_SYSTEM: 'Brake system warning',
  COOLANT_LOW: 'Coolant level low',
};

interface Props {
  faultCodes: string[];
}

export function FaultPanel({ faultCodes }: Props) {
  if (faultCodes.length === 0) {
    return (
      <div className="fault-panel fault-panel--ok">
        <span style={{ fontSize: '20px' }}>✅</span>
        <span>No active fault codes</span>
      </div>
    );
  }

  return (
    <div>
      {faultCodes.map(code => (
        <div key={code} className="fault-panel fault-panel--error">
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>{code}</div>
            <div style={{ fontSize: '12px', color: '#fed7d7', marginTop: '2px' }}>
              {FAULT_DESCRIPTIONS[code] || 'Unknown fault'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
