import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (onLogin(password)) {
        setPassword('');
      } else {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <Lock size={32} className="admin-lock-icon" />
          <h1>Admin Access</h1>
          <p>Requires Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <div className="admin-password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={isLoading}
                className="admin-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="admin-password-toggle"
                disabled={isLoading}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="admin-login-button"
          >
            {isLoading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p className="admin-login-hint">
            🔒 This page is password protected
          </p>
          <p className="admin-login-info">
            Only administrators can access statistics and management tools
          </p>
        </div>
      </div>
    </div>
  );
};
