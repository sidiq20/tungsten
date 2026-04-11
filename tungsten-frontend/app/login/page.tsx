'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f6f8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: '2.5rem',
          textDecoration: 'none',
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#2111d4',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: '1.125rem',
          }}
        >
          T
        </span>
        <span
          style={{
            fontFamily: "'Lexend',sans-serif",
            fontWeight: 700,
            fontSize: '1.125rem',
            color: '#0d0d1f',
          }}
        >
          Tungsten<span style={{ color: '#2111d4' }}>Learn</span>
        </span>
      </Link>

      {/* Card */}
      <div
        className="card animate-fade-up"
        style={{ width: '100%', maxWidth: 420, padding: '2.5rem' }}
      >
        <h1
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: '1.75rem',
            letterSpacing: '-0.035em',
            color: '#0d0d1f',
            marginBottom: '0.375rem',
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontFamily: "'Lora',serif",
            fontSize: '0.9375rem',
            color: '#8888aa',
            marginBottom: '2rem',
          }}
        >
          Sign in to your Tungsten account
        </p>

        {error && (
          <div
            style={{
              background: 'rgba(225,29,72,0.08)',
              border: '1px solid rgba(225,29,72,0.25)',
              borderRadius: 10,
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontFamily: "'Lexend',sans-serif",
              fontSize: '0.875rem',
              color: '#e11d48',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: "'Lexend',sans-serif",
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: '#44446a',
                marginBottom: 6,
              }}
            >
              Email or Username
            </label>
            <input
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@university.edu"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: "'Lexend',sans-serif",
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: '#44446a',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8888aa',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontFamily: "'Lexend',sans-serif",
            fontSize: '0.875rem',
            color: '#8888aa',
          }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{ color: '#2111d4', fontWeight: 600, textDecoration: 'none' }}
          >
            Join Tungsten
          </Link>
        </p>
      </div>
    </div>
  );
}
