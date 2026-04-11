'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subValue?: string;
  trend?: 'up' | 'down';
  color?: string;
}

export function StatCard({ label, value, icon: Icon, subValue, trend, color = '#2111d4' }: StatCardProps) {
  return (
    <div className="card" style={{ padding: '1.5rem', flex: 1, minWidth: '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.625rem',
          borderRadius: '10px',
          background: `${color}10`,
          color: color
        }}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className="badge" style={{
            background: trend === 'up' ? 'rgba(5, 150, 69, 0.1)' : 'rgba(225, 29, 72, 0.1)',
            color: trend === 'up' ? '#059645' : '#e11d48',
            borderColor: trend === 'up' ? 'rgba(5, 150, 69, 0.2)' : 'rgba(225, 29, 72, 0.2)',
          }}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <div>
        <p style={{
          fontFamily: "'Lexend', sans-serif",
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: '#8888aa',
          marginBottom: '0.25rem'
        }}>
          {label}
        </p>
        <h3 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.75rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: '#0d0d1f',
          lineHeight: 1
        }}>
          {value}
        </h3>
        {subValue && (
          <p style={{
            fontFamily: "'Lexend', sans-serif",
            fontSize: '0.8125rem',
            color: '#8888aa',
            marginTop: '0.5rem'
          }}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

export function AdminStats({ stats }: { stats: StatCardProps[] }) {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}
