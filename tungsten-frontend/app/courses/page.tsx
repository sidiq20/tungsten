'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, BookOpen, Sigma, Microscope, FlaskConical, Globe, Calculator } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CourseCard } from '@/components/CourseCard';
import { coursesApi, usersApi } from '@/lib/api';
import type { CourseResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';

const LIMIT = 24;

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchCourses = useCallback(async (q = '', p = 1) => {
    setLoading(true);
    try {
      const res = await coursesApi.list({ search: q, page: p, limit: LIMIT });
      setCourses(res.items);
      setTotal(res.total);
      setPage(p);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    if (user) {
      usersApi.mySubscriptions().then(subs => {
        setSubscribedIds(new Set(subs.map(s => s.id)));
      }).catch(() => {});
    }
  }, [fetchCourses, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(searchQuery, 1);
  };

  const onSubscribeChange = (id: string, subscribed: boolean) => {
    setSubscribedIds(prev => {
      const next = new Set(prev);
      if (subscribed) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <main className="container-page" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        {/* Hero Section */}
        <section style={{ marginBottom: '3rem', textAlign: 'center', maxWidth: 800, margin: '0 auto 4rem' }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: '3.25rem',
            letterSpacing: '-0.04em',
            color: '#0d0d1f',
            lineHeight: 1.05,
            marginBottom: '1.25rem'
          }}>
            Explore Your <span style={{ color: '#2111d4' }}>Curriculum</span>
          </h1>
          <p style={{
            fontFamily: "'Lora', serif",
            fontSize: '1.125rem',
            lineHeight: 1.7,
            color: '#44446a',
            marginBottom: '2.5rem'
          }}>
            Find your courses, find your peers, and discover shared knowledge that actually relates to your exams.
          </p>

          <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
            <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8888aa' }} />
            <input
              type="text"
              className="input"
              placeholder="Search by course code, name, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '3.25rem',
                height: 56,
                fontSize: '1.05rem',
                boxShadow: '0 12px 32px rgba(33, 17, 212, 0.08)'
              }}
            />
          </form>
        </section>

        {/* Courses Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem', height: 200 }}>
                <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 10, marginBottom: 16 }} />
                <div className="skeleton" style={{ width: '80%', height: 20, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: '100%', height: 40, marginTop: 'auto' }} />
              </div>
            ))
          ) : courses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#0d0d1f' }}>
                No courses found matching your search.
              </p>
              <button onClick={() => { setSearchQuery(''); fetchCourses('', 1); }} className="btn btn-ghost" style={{ marginTop: '1rem' }}>
                Clear Search
              </button>
            </div>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                subscribed={subscribedIds.has(course.id)}
                onSubscribeChange={onSubscribeChange}
              />
            ))
          )}
        </div>

        {/* Pagination placeholder */}
        {total > LIMIT && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', gap: '1rem' }}>
            <button
               disabled={page === 1}
               onClick={() => fetchCourses(searchQuery, page - 1)}
               className="btn btn-ghost btn-sm"
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', fontWeight: 600 }}>
              Page {page} of {Math.ceil(total / LIMIT)}
            </span>
            <button
               disabled={page * LIMIT >= total}
               onClick={() => fetchCourses(searchQuery, page + 1)}
               className="btn btn-ghost btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
