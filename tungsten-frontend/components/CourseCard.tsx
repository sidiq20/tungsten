'use client';

import { useState } from 'react';
import { BookOpen, Users, Check, Plus } from 'lucide-react';
import { coursesApi } from '@/lib/api';
import type { CourseResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';

const DEPT_COLORS: Record<string, string> = {
  Mathematics: '#2111d4',
  Science: '#059669',
  Engineering: '#7c3aed',
  Arts: '#d97706',
  Medicine: '#e11d48',
  Law: '#0284c7',
};

function getCourseColor(dept?: string | null): string {
  if (!dept) return '#2111d4';
  for (const [key, val] of Object.entries(DEPT_COLORS)) {
    if (dept.toLowerCase().includes(key.toLowerCase())) return val;
  }
  let hash = 0;
  for (let i = 0; i < dept.length; i++) hash += dept.charCodeAt(i);
  const palette = Object.values(DEPT_COLORS);
  return palette[hash % palette.length];
}

interface CourseCardProps {
  course: CourseResponse;
  subscribed?: boolean;
  onSubscribeChange?: (id: string, subscribed: boolean) => void;
}

export function CourseCard({
  course,
  subscribed: initialSub = false,
  onSubscribeChange,
}: CourseCardProps) {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(initialSub);
  const [loading, setLoading] = useState(false);
  const color = getCourseColor(course.department);

  async function handleToggle() {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (subscribed) {
        await coursesApi.unsubscribe(course.id);
        setSubscribed(false);
        onSubscribeChange?.(course.id, false);
      } else {
        await coursesApi.subscribe(course.id);
        setSubscribed(true);
        onSubscribeChange?.(course.id, true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="card animate-fade-up"
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
    >
      {/* Icon + code */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}
        >
          <BookOpen size={20} />
        </div>
        <span
          className="badge"
          style={{ borderColor: `${color}40`, background: `${color}12`, color }}
        >
          {course.code}
        </span>
      </div>

      {/* Name + dept */}
      <div>
        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: '0.975rem',
            letterSpacing: '-0.02em',
            color: '#0d0d1f',
            lineHeight: 1.3,
            marginBottom: '0.25rem',
          }}
        >
          {course.name}
        </h3>
        {course.department && (
          <p
            style={{
              fontFamily: "'Lexend', sans-serif",
              fontSize: '0.78rem',
              color: '#8888aa',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Users size={11} />
            {course.department}
          </p>
        )}
        {course.description && (
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: '0.875rem',
              color: '#44446a',
              lineHeight: 1.55,
              marginTop: '0.5rem',
            }}
          >
            {course.description.length > 90
              ? course.description.slice(0, 90) + '…'
              : course.description}
          </p>
        )}
      </div>

      {/* Subscribe button */}
      {user && (
        <button
          onClick={handleToggle}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '0.5rem',
            borderRadius: 10,
            border: '1.5px solid',
            borderColor: subscribed ? color : '#e2e4ed',
            background: subscribed ? `${color}12` : 'transparent',
            color: subscribed ? color : '#44446a',
            fontFamily: "'Lexend', sans-serif",
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {subscribed ? (
            <>
              <Check size={13} />
              Subscribed
            </>
          ) : (
            <>
              <Plus size={13} />
              Subscribe
            </>
          )}
        </button>
      )}
    </div>
  );
}
