import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTelemetry } from './hooks/useTelemetry';
import { api, Car } from './api/bff';
import { BatteryGauge } from './components/BatteryGauge';
import { MetricCard } from './components/MetricCard';
import { FaultPanel } from './components/FaultPanel';
import { TelemetryChart } from './components/TelemetryChart';

function CarSelector({ cars, selectedId, onSelect }: { cars: Car[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <select
      value={selectedId || ''}
      onChange={e => onSelect(e.target.value)}
      className="car-selector"
    >
      {cars.map(car => (
        <option key={car.id} value={car.id}>
          {car.year} {car.model} — {car.vin}
        </option>
      ))}
    </select>
  );
}

export default function App() {
  const { user, token, loading: authLoading } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [carsError, setCarsError] = useState<string | null>(null);

  useEffect(() => {
    api.getCars()
      .then(data => {
        setCars(data);
        if (data.length > 0) setSelectedCarId(data[0].id);
      })
      .catch(err => setCarsError(err.message));
  }, []);

  const { latest, history, loading: telemetryLoading, error: telemetryError, wsConnected } = useTelemetry(selectedCarId, token);
  const selectedCar = cars.find(c => c.id === selectedCarId);

  if (authLoading) {
    return <div className="loading-screen"><div className="spinner" />Loading...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="header-logo">⚡</span>
          <span className="header-title">VoltaWatch</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {cars.length > 0 && (
            <CarSelector cars={cars} selectedId={selectedCarId} onSelect={setSelectedCarId} />
          )}
          <div className={`ws-badge ${wsConnected ? 'ws-badge--connected' : 'ws-badge--disconnected'}`}>
            {wsConnected ? '● LIVE' : '○ OFFLINE'}
          </div>
          {user ? (
            <div className="user-chip">
              <span>{user.name.split(' ')[0]}</span>
            </div>
          ) : (
            <a href="http://localhost:8081" className="login-link">Sign in →</a>
          )}
        </div>
      </header>

      <main className="main">
        {carsError && (
          <div className="error-banner">⚠️ Failed to load vehicles: {carsError}</div>
        )}

        {!selectedCar && !carsError && (
          <div className="empty-state">
            <div style={{ fontSize: '48px' }}>🚗</div>
            <h2>No vehicles found</h2>
            <p>Register your first vehicle in <a href="http://localhost:8081">Settings</a>.</p>
          </div>
        )}

        {selectedCar && (
          <>
            <div className="car-info-bar">
              <span className="car-info-model">{selectedCar.year} {selectedCar.model}</span>
              <span className="car-info-detail">VIN: {selectedCar.vin}</span>
              <span className="car-info-detail">Health: {selectedCar.batteryHealthPercentage}%</span>
              <span className="car-info-detail">Est. Range: {selectedCar.estimatedRangeKm} km</span>
              <span className="car-info-detail">Mileage: {selectedCar.currentMileage?.toLocaleString()} km</span>
            </div>

            {telemetryLoading && !latest && (
              <div className="loading-screen"><div className="spinner" />Loading telemetry...</div>
            )}

            {telemetryError && (
              <div className="error-banner">⚠️ {telemetryError}</div>
            )}

            {latest && (
              <>
                <div className="dashboard-grid">
                  <div className="card card--battery">
                    <h3 className="card-title">Battery Status</h3>
                    <BatteryGauge percentage={latest.batteryPercentage} label="Charge Level" />
                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <MetricCard title="Voltage" value={latest.batteryVoltage.toFixed(1)} unit="V" color="#22c55e" />
                      <MetricCard title="Temp" value={latest.batteryTempCelsius.toFixed(1)} unit="°C" color={latest.batteryTempCelsius > 45 ? '#ef4444' : '#f59e0b'} />
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="card-title">Drive Metrics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <MetricCard title="Speed" value={latest.speedKmh.toFixed(1)} unit="km/h" icon="🏎️" color="#60a5fa" />
                      <MetricCard title="RPM" value={latest.rpm.toLocaleString()} icon="⚙️" color="#a78bfa" />
                      <MetricCard title="Motor Temp" value={latest.motorTempCelsius.toFixed(1)} unit="°C" icon="🌡️" color={latest.motorTempCelsius > 80 ? '#ef4444' : '#f59e0b'} />
                      <MetricCard title="Cabin Temp" value={latest.cabinTempCelsius.toFixed(1)} unit="°C" icon="🌡️" color="#34d399" />
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="card-title">Charging & Location</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <MetricCard
                        title="Charging"
                        value={latest.isCharging ? 'YES' : 'NO'}
                        icon={latest.isCharging ? '⚡' : '🔌'}
                        color={latest.isCharging ? '#22c55e' : '#718096'}
                        subtitle={latest.chargingPowerKw ? `${latest.chargingPowerKw.toFixed(1)} kW` : undefined}
                      />
                      <MetricCard title="Odometer" value={(latest.currentMileage || 0).toLocaleString()} unit="km" icon="📍" color="#60a5fa" />
                      <MetricCard title="Latitude" value={latest.latitude.toFixed(4)} icon="🗺️" color="#a0aec0" />
                      <MetricCard title="Longitude" value={latest.longitude.toFixed(4)} icon="🗺️" color="#a0aec0" />
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="card-title">Fault Codes</h3>
                    <FaultPanel faultCodes={latest.faultCodes || []} />
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#718096' }}>
                      Last updated: {new Date(latest.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {history.length > 1 && (
                  <TelemetryChart history={history} />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
