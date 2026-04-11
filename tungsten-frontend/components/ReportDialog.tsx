'use client';

import { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { reportsApi } from '@/lib/api';

interface ReportDialogProps {
  targetId: string;
  targetType: 'post' | 'comment';
  onClose: () => void;
  onSuccess: () => void;
}

const REPORT_REASONS = [
  'Inaccurate or misleading information',
  'Poor quality or illegible content',
  'Spam or irrelevant academic material',
  'Harassment or inappropriate behavior',
  'Plagiarism or copyright violation',
  'Other',
];

export function ReportDialog({ targetId, targetType, onClose, onSuccess }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalReason = reason === 'Other' ? customReason : reason;
    if (!finalReason) {
      setError('Please select or provide a reason.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await reportsApi.create({
        target_id: targetId,
        target_type: targetType,
        reason: finalReason,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(13, 13, 31, 0.4)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: 450,
          background: '#fff',
          borderRadius: 24,
          padding: '2.5rem',
          boxShadow: '0 20px 80px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            padding: 8,
            borderRadius: 12,
            border: 'none',
            background: 'rgba(0, 0, 0, 0.05)',
            color: '#8888aa',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'rgba(225, 29, 72, 0.1)',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: '1.5rem',
            color: '#0d0d1f',
            letterSpacing: '-0.02em',
          }}>
            Report Content
          </h2>
          <p style={{
            fontFamily: "'Lexend', sans-serif",
            fontSize: '0.875rem',
            color: '#8888aa',
            marginTop: '0.5rem',
          }}>
            Help us maintain the integrity of our academic community.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {REPORT_REASONS.map((r) => (
              <label 
                key={r}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '1rem',
                  borderRadius: 14,
                  background: reason === r ? 'rgba(33, 17, 212, 0.05)' : '#f8f8fc',
                  border: reason === r ? '2px solid #2111d4' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
              >
                <input 
                  type="radio" 
                  name="reason" 
                  value={r}
                  checked={reason === r}
                  onChange={e => setReason(e.target.value)}
                  style={{ accentColor: '#2111d4' }}
                />
                <span style={{ 
                  fontFamily: "'Lexend', sans-serif",
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  color: reason === r ? '#2111d4' : '#44446a' 
                }}>
                  {r}
                </span>
              </label>
            ))}
          </div>

          {reason === 'Other' && (
            <textarea 
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder="Please describe the issue..."
              className="input"
              style={{ minHeight: 100, marginBottom: '1.5rem', resize: 'none' }}
              required
            />
          )}

          {error && (
            <div style={{
              padding: '1rem',
              borderRadius: 12,
              background: 'rgba(225, 29, 72, 0.1)',
              color: '#e11d48',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: '1.5rem',
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
