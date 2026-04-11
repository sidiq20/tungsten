'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, GraduationCap } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { usersApi } from '@/lib/api';
import type { CourseResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { courseColor } from '@/lib/utils';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      usersApi.mySubscriptions()
        .then(setCourses)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <div className="container-page" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <GraduationCap size={28} style={{ color: '#2111d4' }} />
            <h1 style={{ 
              fontFamily: "'Syne', sans-serif", 
              fontWeight: 800, 
              fontSize: '2.25rem', 
              color: '#0d0d1f',
              letterSpacing: '-0.03em'
            }}>
              My Learning Path
            </h1>
          </div>
          <p style={{ 
            fontFamily: "'Lexend', sans-serif", 
            fontSize: '1rem', 
            color: '#44446a',
            maxWidth: '60ch'
          }}>
            Explore the specialized academic disciplines you've subscribed to. Access focused notes and collaborate with fellow scholars.
          </p>
        </header>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: '2rem' }}>
                <div className="skeleton" style={{ height: 40, width: 40, borderRadius: 12, marginBottom: 20 }} />
                <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 8 }} />
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {courses.map(course => (
              <Link 
                key={course.id} 
                href={`/?course=${course.id}`} 
                style={{ textDecoration: 'none' }}
                className="animate-fade-up"
              >
                <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 16, 
                    background: `${courseColor(course.code)}15`, 
                    color: courseColor(course.code),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={24} />
                  </div>
                  
                  <div>
                    <h2 style={{ 
                      fontFamily: "'Lexend', sans-serif", 
                      fontWeight: 800, 
                      fontSize: '1.125rem', 
                      color: '#0d0d1f',
                      marginBottom: 4,
                      letterSpacing: '-0.01em'
                    }}>
                      {course.code}: {course.name}
                    </h2>
                    <p style={{ 
                      fontFamily: "'Lexend', sans-serif", 
                      fontSize: '0.875rem', 
                      color: '#44446a',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {course.description}
                    </p>
                  </div>

                  <div style={{ 
                    marginTop: 'auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    color: '#2111d4', 
                    fontFamily: "'Lexend', sans-serif",
                    fontSize: '0.8125rem',
                    fontWeight: 700
                  }}>
                    View Course Feed
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '5rem 2rem', 
            background: '#fff', 
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
          }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 24, 
              background: 'rgba(33, 17, 212, 0.05)', 
              color: '#2111d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <GraduationCap size={40} />
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f', marginBottom: 8 }}>
              No subscriptions yet
            </h2>
            <p style={{ fontFamily: "'Lexend', sans-serif", color: '#8888aa', marginBottom: '2rem', maxWidth: '40ch', margin: '0 auto 2rem' }}>
              Subscribe to courses to follow specific academic paths and never miss a critical note.
            </p>
            <Link href="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}
