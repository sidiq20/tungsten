'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Info,
  Loader2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { coursesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function AdminEditCoursePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await coursesApi.get(courseId);
        setFormData({
          code: res.code,
          name: res.name,
          department: res.department || '',
          description: res.description || ''
        });
      } catch (err) {
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') fetchCourse();
  }, [user, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await coursesApi.update(courseId, formData);
      router.push('/admin/courses');
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
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
            <button 
              onClick={() => router.back()}
              className="btn btn-ghost" 
              style={{ padding: 0, gap: 8, marginBottom: '2rem' }}
            >
              <ArrowLeft size={18} />
              <span style={{ fontWeight: 700 }}>Back to Courses</span>
            </button>

            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: '2.25rem',
                letterSpacing: '-0.04em',
                color: '#0d0d1f',
                marginBottom: 8
              }}>
                Update {formData.code || 'Course'}
              </h1>
              <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.9375rem', color: '#8888aa' }}>
                Modify academic stream details and metadata.
              </p>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                <Loader2 size={40} className="animate-spin" style={{ color: '#2111d4' }} />
              </div>
            ) : (
              <div className="card" style={{ padding: '2.5rem', maxWidth: 600 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="label">Course Code</label>
                      <input 
                        type="text" 
                        className="input" 
                        required
                        value={formData.code}
                        onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Department</label>
                      <input 
                        type="text" 
                        className="input" 
                        required
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Course Name</label>
                    <input 
                      type="text" 
                      className="input" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Description</label>
                    <textarea 
                      className="input" 
                      style={{ minHeight: 120, paddingTop: '0.75rem' }}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  {error && (
                    <div style={{ 
                      padding: '1rem', 
                      background: '#fef2f2', 
                      color: '#b91c1c', 
                      borderRadius: 12, 
                      fontSize: '0.875rem', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}>
                      <Info size={18} />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={submitting}
                    style={{ justifyContent: 'center', gap: 10, padding: '1rem' }}
                  >
                    {submitting ? 'Saving...' : <><Save size={18} /> Update Course</>}
                  </button>
                </form>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
