'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  AlertCircle,
  History,
  Settings,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

const links = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/courses', label: 'Courses', icon: ShieldCheck },
  { href: '/admin/reports', label: 'Moderation', icon: AlertCircle },
  { href: '/admin/logs', label: 'Audit Logs', icon: History },
  { href: '/admin/settings', label: 'Admins', icon: ShieldCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '5.5rem' }}>
      <p style={{
        fontFamily: "'Lexend', sans-serif",
        fontSize: '0.72rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#8888aa',
        marginBottom: '1rem',
        padding: '0 0.75rem'
      }}>
        Administration
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontFamily: "'Lexend', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 200ms cubic-bezier(0.22, 1, 0.36, 1)',
                background: active ? 'rgba(33, 17, 212, 0.1)' : 'transparent',
                color: active ? '#2111d4' : '#44446a',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(33, 17, 212, 0.05)';
                  e.currentTarget.style.color = '#2111d4';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#44446a';
                }
              }}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
