import React, { useState, useEffect, useCallback } from 'react';
import { carsApi, Car, CreateCarInput, AuthUser } from '../api/bff';

interface CarFormData {
  vin: string;
  model: string;
  year: string;
  currentMileage: string;
  batteryHealthPercentage: string;
  estimatedRangeKm: string;
}

const emptyForm: CarFormData = {
  vin: '',
  model: '',
  year: new Date().getFullYear().toString(),
  currentMileage: '0',
  batteryHealthPercentage: '100',
  estimatedRangeKm: '400',
};

function CarForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: CarFormData;
  onSave: (data: CreateCarInput) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CarFormData>(initial || emptyForm);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CarFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSave({
        vin: form.vin.trim().toUpperCase(),
        model: form.model.trim(),
        year: parseInt(form.year, 10),
        currentMileage: parseInt(form.currentMileage, 10),
        batteryHealthPercentage: parseFloat(form.batteryHealthPercentage),
        estimatedRangeKm: parseInt(form.estimatedRangeKm, 10),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="car-form">
      <div className="form-grid">
        <div className="field">
          <label className="field-label">VIN *</label>
          <input className="field-input" value={form.vin} onChange={set('vin')} placeholder="1HGCM82633A123456" required />
        </div>
        <div className="field">
          <label className="field-label">Model *</label>
          <input className="field-input" value={form.model} onChange={set('model')} placeholder="Volvo EX90" required />
        </div>
        <div className="field">
          <label className="field-label">Year *</label>
          <input className="field-input" type="number" value={form.year} onChange={set('year')} min="2000" max="2030" required />
        </div>
        <div className="field">
          <label className="field-label">Current Mileage (km)</label>
          <input className="field-input" type="number" value={form.currentMileage} onChange={set('currentMileage')} min="0" />
        </div>
        <div className="field">
          <label className="field-label">Battery Health (%)</label>
          <input className="field-input" type="number" value={form.batteryHealthPercentage} onChange={set('batteryHealthPercentage')} min="0" max="100" step="0.1" />
        </div>
        <div className="field">
          <label className="field-label">Est. Range (km)</label>
          <input className="field-input" type="number" value={form.estimatedRangeKm} onChange={set('estimatedRangeKm')} min="0" />
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>
    </form>
  );
}

function CarsTab() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await carsApi.getAll();
      setCars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCars(); }, [loadCars]);

  const handleCreate = async (input: CreateCarInput) => {
    setSaving(true);
    try {
      await carsApi.create(input);
      setShowForm(false);
      await loadCars();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (input: CreateCarInput) => {
    if (!editingCar) return;
    setSaving(true);
    try {
      await carsApi.update(editingCar.id, input);
      setEditingCar(null);
      await loadCars();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await carsApi.delete(id);
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const carToFormData = (car: Car): CarFormData => ({
    vin: car.vin,
    model: car.model,
    year: car.year.toString(),
    currentMileage: car.currentMileage.toString(),
    batteryHealthPercentage: car.batteryHealthPercentage.toString(),
    estimatedRangeKm: car.estimatedRangeKm.toString(),
  });

  if (loading) return <div className="tab-loading"><div className="spinner" /> Loading vehicles...</div>;
  if (error) return <div className="form-error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="section-title">My Vehicles ({cars.length})</h2>
        {!showForm && !editingCar && (
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>+ Add Vehicle</button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Register New Vehicle</h3>
          <CarForm onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} />
        </div>
      )}

      {cars.length === 0 && !showForm && (
        <div className="empty-state">
          <div style={{ fontSize: '48px' }}>🚗</div>
          <p>No vehicles registered yet.</p>
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>Register Your First Vehicle</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cars.map(car => (
          <div key={car.id} className="car-card">
            {editingCar?.id === car.id ? (
              <div>
                <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>Edit {car.year} {car.model}</h3>
                <CarForm
                  initial={carToFormData(car)}
                  onSave={handleUpdate}
                  onCancel={() => setEditingCar(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <>
                <div className="car-card-header">
                  <div>
                    <div className="car-card-title">{car.year} {car.model}</div>
                    <div className="car-card-vin">VIN: {car.vin}</div>
                  </div>
                  <div className="car-card-actions">
                    <button className="btn btn--secondary btn--sm" onClick={() => setEditingCar(car)}>Edit</button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDelete(car.id)}
                      disabled={deletingId === car.id}
                    >
                      {deletingId === car.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="car-card-stats">
                  <div className="stat">
                    <span className="stat-label">Battery Health</span>
                    <span className="stat-value" style={{ color: car.batteryHealthPercentage > 80 ? '#22c55e' : car.batteryHealthPercentage > 60 ? '#f59e0b' : '#ef4444' }}>
                      {car.batteryHealthPercentage}%
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Est. Range</span>
                    <span className="stat-value">{car.estimatedRangeKm} km</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Mileage</span>
                    <span className="stat-value">{car.currentMileage?.toLocaleString()} km</span>
                  </div>
                  {car.lastServiceDate && (
                    <div className="stat">
                      <span className="stat-label">Last Service</span>
                      <span className="stat-value">{new Date(car.lastServiceDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ user }: { user: AuthUser }) {
  return (
    <div>
      <h2 className="section-title">Profile</h2>
      <div className="card" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div className="avatar">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: '14px', color: '#a0aec0', marginTop: '4px' }}>{user.email}</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2d3748', paddingTop: '16px' }}>
          <div className="profile-row">
            <span className="profile-label">User ID</span>
            <span className="profile-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{user.id}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Name</span>
            <span className="profile-value">{user.name}</span>
          </div>
        </div>
        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '8px', fontSize: '13px', color: '#93c5fd' }}>
          💡 To change your password or email, contact your administrator.
        </div>
      </div>
    </div>
  );
}

type Tab = 'cars' | 'profile';

interface Props {
  user: AuthUser;
  onLogout: () => void;
}

export function SettingsPage({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('cars');

  return (
    <div className="settings-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span>VoltaWatch</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'cars' ? 'nav-item--active' : ''}`}
            onClick={() => setActiveTab('cars')}
          >
            <span>🚗</span> Vehicles
          </button>
          <button
            className={`nav-item ${activeTab === 'profile' ? 'nav-item--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span>👤</span> Profile
          </button>
          <a href="http://localhost:8080" className="nav-item" style={{ textDecoration: 'none' }}>
            <span>📊</span> Dashboard
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar avatar--sm">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#a0aec0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <button className="btn btn--secondary btn--sm" style={{ width: '100%', marginTop: '8px' }} onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="settings-main">
        {activeTab === 'cars' && <CarsTab />}
        {activeTab === 'profile' && <ProfileTab user={user} />}
      </main>
    </div>
  );
}
