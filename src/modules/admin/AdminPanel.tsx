import React, { useState, useEffect } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import './admin.scss';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const storedToken = sessionStorage.getItem('admin:token');
    if (storedToken && isValidToken(storedToken)) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (password: string) => {
    // Simple password verification
    const ADMIN_PASSWORD = 'isaigcs2025'; // In production, use environment variable

    if (password === ADMIN_PASSWORD) {
      const token = generateToken();
      sessionStorage.setItem('admin:token', token);
      sessionStorage.setItem('admin:login-time', Date.now().toString());
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin:token');
    sessionStorage.removeItem('admin:login-time');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <Lock size={24} />
          <h1>Admin Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="admin-logout-btn"
          title="Logout"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <AdminDashboard />
    </div>
  );
};

function generateToken(): string {
  return `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isValidToken(token: string | null): boolean {
  if (!token) return false;
  const loginTime = Number(sessionStorage.getItem('admin:login-time') || '0');
  const sessionDuration = 1 * 60 * 60 * 1000; // 1 hour
  return Date.now() - loginTime < sessionDuration;
}
