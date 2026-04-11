'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function CreatePostFAB() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Link
      href="/posts/new"
      style={{
        position: 'fixed',
        bottom: '2.5rem',
        right: '2.5rem',
        zIndex: 100,
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2111d4 0%, #4a3aff 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(33, 17, 212, 0.35)',
        transition: 'all 300ms cubic-bezier(0.23, 1, 0.32, 1)',
        border: 'none',
        cursor: 'pointer',
      }}
      className="hover:scale-110 hover:-translate-y-1 active:scale-95 animate-fade-up"
    >
      <Plus size={32} />
    </Link>
  );
}
