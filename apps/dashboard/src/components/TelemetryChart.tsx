import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TelemetryReading } from '../api/bff';

interface Props {
  history: TelemetryReading[];
}

export function TelemetryChart({ history }: Props) {
  const data = history.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    battery: Math.round(r.batteryPercentage * 10) / 10,
    speed: Math.round(r.speedKmh),
    motorTemp: Math.round(r.motorTempCelsius),
  }));

  return (
    <div className="chart-container">
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
        Historical Data (Last 50 readings)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#718096', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: '#718096', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #2d3748', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="battery" name="Battery %" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="speed" name="Speed km/h" stroke="#60a5fa" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="motorTemp" name="Motor °C" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
