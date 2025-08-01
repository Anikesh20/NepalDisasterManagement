import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      if (!data.user?.is_admin) {
        setError('Not an admin account');
        setLoading(false);
        return;
      }
      login(data.token);
      navigate('/');
    } catch (err) {
      setError('Network or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
      fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: '40px 36px',
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          minWidth: 350,
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <h2 style={{ color: '#1a237e', marginBottom: 8, fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>Admin Login</h2>
        <p style={{ color: '#555', marginBottom: 18, fontSize: 15 }}>Sign in to access the admin dashboard</p>
        <label style={{ color: '#333', fontWeight: 500, fontSize: 15 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 12px',
            borderRadius: 8,
            border: '1.5px solid #c7d2fe',
            marginBottom: 2,
            fontSize: 16,
            outline: 'none',
            transition: 'border 0.2s',
          }}
          required
        />
        <label style={{ color: '#333', fontWeight: 500, fontSize: 15 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 12px',
            borderRadius: 8,
            border: '1.5px solid #c7d2fe',
            marginBottom: 2,
            fontSize: 16,
            outline: 'none',
            transition: 'border 0.2s',
          }}
          required
        />
        {error && <div style={{ color: 'red', marginBottom: 6, fontWeight: 500 }}>{error}</div>}
        <button
          type="submit"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #1a237e 60%, #3949ab 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '14px 0',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 10,
            boxShadow: '0 2px 8px #1a237e22',
            transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
} 