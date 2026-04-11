'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  MoreVertical,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { coursesApi } from '@/lib/api';
import type { CourseResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { courseColor } from '@/lib/utils';

export default function AdminCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await coursesApi.list({ search: search || undefined, limit: 100 });
      setCourses(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchCourses();
  }, [user, search]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? All associated posts will be affected.`)) {
      try {
        await coursesApi.delete(id);
        setCourses(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert('Failed to delete course');
      }
    }
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <main className="container-page" style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem', alignItems: 'start' }}>
          
          <AdminSidebar />

          <section className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <BookOpen size={24} style={{ color: '#2111d4' }} />
                  <h1 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '2.25rem',
                    letterSpacing: '-0.04em',
                    color: '#0d0d1f'
                  }}>
                    Courses
                  </h1>
                </div>
                <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.9375rem', color: '#8888aa' }}>
                  Manage academic departments and subject streams.
                </p>
              </div>

              <button 
                onClick={() => router.push('/admin/courses/new')}
                className="btn btn-primary" 
                style={{ gap: 8, padding: '0.75rem 1.5rem', borderRadius: 16 }}
              >
                <Plus size={20} />
                Create Course
              </button>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#8888aa' }} />
                <input 
                  type="text" 
                  placeholder="Search by code or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3.5rem',
                    borderRadius: 16,
                    border: 'none',
                    background: '#f8f8fc',
                    fontFamily: "'Lexend', sans-serif",
                    fontSize: '0.9375rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 20 }} />)
              ) : courses.length === 0 ? (
                <div className="card" style={{ padding: '5rem', textAlign: 'center' }}>
                  <GraduationCap size={48} style={{ color: '#8888aa', marginBottom: '1.5rem', opacity: 0.3 }} />
                  <p style={{ fontFamily: "'Lexend', sans-serif", color: '#44446a' }}>No courses match your search.</p>
                </div>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="card" style={{ 
                    padding: '1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.5rem',
                    transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)'
                  }}>
                    <div style={{ 
                      width: 56, 
                      height: 56, 
                      borderRadius: 18, 
                      background: `${courseColor(course.code)}12`, 
                      color: courseColor(course.code),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <BookOpen size={24} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ 
                          fontFamily: "'Lexend', sans-serif", 
                          fontWeight: 800, 
                          fontSize: '0.75rem', 
                          color: courseColor(course.code),
                          background: `${courseColor(course.code)}10`,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 8,
                          letterSpacing: '0.05em'
                        }}>
                          {course.code}
                        </span>
                        <h3 style={{ 
                          fontFamily: "'Syne', sans-serif", 
                          fontWeight: 800, 
                          fontSize: '1.125rem', 
                          color: '#0d0d1f',
                          letterSpacing: '-0.02em'
                        }}>
                          {course.name}
                        </h3>
                      </div>
                      <p style={{ 
                        fontFamily: "'Lexend', sans-serif", 
                        fontSize: '0.875rem', 
                        color: '#8888aa',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {course.department} — {course.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                        className="btn btn-ghost" 
                        style={{ width: 44, height: 44, padding: 0, borderRadius: 14 }}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id, course.name)}
                        className="btn btn-ghost" 
                        style={{ width: 44, height: 44, padding: 0, borderRadius: 14, color: '#e11d48' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
