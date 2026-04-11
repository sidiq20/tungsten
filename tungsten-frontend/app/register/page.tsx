'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const perks = [
    'Share study notes with your peers',
    'Subscribe to your courses',
    'Vote and bookmark the best notes',
    'Build your academic reputation',
  ];

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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '2rem',
          width: '100%',
          maxWidth: 860,
          alignItems: 'start',
        }}
        className="register-grid"
      >
        {/* Left: perks */}
        <div className="hidden md:block animate-fade-up stagger-1">
          <h1
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: '2.25rem',
              letterSpacing: '-0.04em',
              color: '#0d0d1f',
              lineHeight: 1.05,
              marginBottom: '1rem',
            }}
          >
            Your academic
            <br />
            <span style={{ color: '#2111d4' }}>knowledge base</span>
          </h1>
          <p
            style={{
              fontFamily: "'Lora',serif",
              fontSize: '1rem',
              color: '#44446a',
              lineHeight: 1.7,
              marginBottom: '2rem',
              maxWidth: '42ch',
            }}
          >
            Join students who are sharing and discovering the best study notes on
            their campus.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {perks.map((p) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={17} style={{ color: '#2111d4', flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: "'Lexend',sans-serif",
                    fontSize: '0.9375rem',
                    color: '#44446a',
                  }}
                >
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="card animate-fade-up stagger-2" style={{ padding: '2.25rem' }}>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: '-0.03em',
              color: '#0d0d1f',
              marginBottom: '1.5rem',
            }}
          >
            Create your account
          </h2>

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

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {[
              { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Alex Johnson', required: false },
              { name: 'username', label: 'Username', type: 'text', placeholder: 'alexj', required: true },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'alex@university.edu', required: true },
            ].map((f) => (
              <div key={f.name}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: "'Lexend',sans-serif",
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#44446a',
                    marginBottom: 5,
                  }}
                >
                  {f.label}
                  {!f.required && (
                    <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 4, letterSpacing: 0 }}>
                      (optional)
                    </span>
                  )}
                </label>
                <input
                  className="input"
                  name={f.name}
                  type={f.type}
                  value={form[f.name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required={f.required}
                  autoComplete={f.name}
                />
              </div>
            ))}

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
                  marginBottom: 5,
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              style={{ width: '100%', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
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
            Already have an account?{' '}
            <Link
              href="/login"
              style={{ color: '#2111d4', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .register-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
