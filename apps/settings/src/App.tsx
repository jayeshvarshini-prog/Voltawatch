import React from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const { user, loading, error, login, register, logout } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} onRegister={register} loading={loading} error={error} />;
  }

  return <SettingsPage user={user} onLogout={logout} />;
}
