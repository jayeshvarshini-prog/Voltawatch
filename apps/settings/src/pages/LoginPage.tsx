import React, { useState } from 'react';

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function LoginPage({ onLogin, onRegister, loading, error }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        if (!name.trim()) { setFormError('Name is required'); return; }
        await onRegister(email, password, name);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span style={{ fontSize: '36px' }}>⚡</span>
          <h1 className="login-title">VoltaWatch</h1>
          <p className="login-subtitle">EV Fleet Telemetry Platform</p>
        </div>

        <div className="tab-row">
          <button
            className={`tab-btn ${mode === 'login' ? 'tab-btn--active' : ''}`}
            onClick={() => setMode('login')}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${mode === 'register' ? 'tab-btn--active' : ''}`}
            onClick={() => setMode('register')}
            type="button"
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="field">
              <label className="field-label">Full Name</label>
              <input
                type="text"
                className="field-input"
                placeholder="Alice Johnson"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="field">
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {(formError || error) && (
            <div className="form-error">{formError || error}</div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="hint">
            Demo: alice.johnson@voltawatch.com / changeme123
          </p>
        )}
      </div>
    </div>
  );
}
