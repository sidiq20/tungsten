'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  ExternalLink,
  ChevronDown,
  Trash2,
  Eye
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { adminApi } from '@/lib/api';
import type { ReportResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';

export default function AdminReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listReports({ limit: 100 });
      setReports(data.sort((a,b) => (a.status === 'pending' ? -1 : 1)));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReports();
    }
  }, [user, fetchReports]);

  const handleResolve = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (resolving) return;
    setResolving(reportId);
    try {
      await adminApi.resolveReport(reportId, {
        status,
        resolution_note: resolutionNotes[reportId] || undefined
      });
      setResolutionNotes(prev => {
        const next = {...prev};
        delete next[reportId];
        return next;
      });
      await fetchReports();
    } catch {
      alert('Failed to resolve report.');
    } finally {
      setResolving(null);
    }
  };

  const handleDeleteContent = async (report: ReportResponse) => {
    if (!confirm(`Permanently delete this ${report.target_type}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteContent(report.target_type, report.target_id);
      await handleResolve(report.id, 'resolved');
    } catch {
      alert('Failed to delete content.');
    }
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

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
                  <AlertCircle size={24} style={{ color: '#e11d48' }} />
                  <h1 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '2.25rem',
                    letterSpacing: '-0.04em',
                    color: '#0d0d1f'
                  }}>
                    Moderation Queue
                  </h1>
                </div>
                <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.9375rem', color: '#8888aa' }}>
                  Sift through flags and maintain the integrity of academic discourse.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.25rem', background: '#fff', padding: '0.375rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                {(['pending', 'resolved', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: 12,
                      border: 'none',
                      background: filter === f ? '#e11d48' : 'transparent',
                      color: filter === f ? '#fff' : '#44446a',
                      fontFamily: "'Lexend', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 200ms'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card skeleton" style={{ height: 220, borderRadius: 24 }} />
                ))
              ) : filteredReports.length === 0 ? (
                <div className="card" style={{ padding: '6rem 2rem', textAlign: 'center', borderRadius: 24 }}>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: 20, 
                    background: 'rgba(5, 150, 69, 0.05)', 
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                  }}>
                    <CheckCircle size={32} />
                  </div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f', marginBottom: 8 }}>
                    Clear Skies
                  </h3>
                  <p style={{ fontFamily: "'Lexend', sans-serif", color: '#8888aa' }}>
                    No {filter === 'pending' ? 'pending' : ''} reports require attention at this time.
                  </p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div key={report.id} className="card" style={{ 
                    padding: '2rem', 
                    borderRadius: 24,
                    borderLeft: report.status === 'pending' ? '6px solid #e11d48' : '6px solid #059669',
                    background: '#fff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                         <div style={{ 
                           width: 48,
                           height: 48,
                           borderRadius: 14, 
                           background: report.status === 'pending' ? '#fef2f2' : '#f0fdf4',
                           color: report.status === 'pending' ? '#e11d48' : '#059669',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                         }}>
                           <AlertCircle size={22} />
                         </div>
                         <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: '#0d0d1f' }}>
                                Flagged {report.target_type}
                              </h3>
                              <span style={{ 
                                fontFamily: "'Lexend', sans-serif", 
                                fontSize: '0.65rem', 
                                fontWeight: 800, 
                                color: '#8888aa',
                                background: '#f8f8fc',
                                padding: '0.2rem 0.5rem',
                                borderRadius: 6
                              }}>
                                REF: {report.target_id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                            <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#8888aa' }}>
                              Reported by {report.reporter_id.slice(0, 8)} • {timeAgo(report.created_at)}
                            </p>
                         </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/posts/${report.target_id}`)}
                        className="btn btn-ghost btn-sm" 
                        style={{ gap: 8, borderRadius: 12 }}
                      >
                        <Eye size={14} /> Inspect Content
                      </button>
                    </div>

                    <div style={{ background: '#f8f8fc', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
                       <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#8888aa', marginBottom: 8, letterSpacing: '0.05em' }}>Violation Description</p>
                       <p style={{ fontFamily: "'Lora', serif", fontSize: '1rem', color: '#0d0d1f', lineHeight: 1.6 }}>{report.reason}</p>
                    </div>

                    {report.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-end', borderTop: '1px solid #f8f8fc', paddingTop: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontFamily: "'Lexend', sans-serif", fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#8888aa', marginBottom: 8, letterSpacing: '0.05em' }}>Internal Resolution Note</label>
                          <input 
                            className="input" 
                            placeholder="e.g. Violation of Rule 4: Harassment" 
                            style={{ borderRadius: 12, height: '3rem' }}
                            value={resolutionNotes[report.id] || ''}
                            onChange={(e) => setResolutionNotes(prev => ({...prev, [report.id]: e.target.value}))}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                           <button 
                              onClick={() => handleResolve(report.id, 'dismissed')} 
                              disabled={resolving === report.id}
                              className="btn btn-ghost" 
                              style={{ color: '#44446a', fontWeight: 700 }}
                           >
                             <CheckCircle size={16} /> Dismiss
                           </button>
                           <button 
                              onClick={() => handleDeleteContent(report)} 
                              disabled={resolving === report.id}
                              className="btn btn-primary" 
                              style={{ background: '#e11d48', gap: 10, borderRadius: 14, boxShadow: '0 8px 16px rgba(225, 29, 72, 0.2)' }}
                           >
                             <Trash2 size={16} /> Purge & Resolve
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '1.25rem', background: '#f0fdf4', padding: '1.25rem', borderRadius: 16, border: '1px solid #dcfce7' }}>
                        <CheckCircle size={20} style={{ color: '#059669', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 800, fontSize: '0.875rem', color: '#059669', marginBottom: 4 }}>
                            Audit: Resolved as {report.status.toUpperCase()}
                          </p>
                          {report.resolution_note && (
                            <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#166534', opacity: 0.8, lineHeight: 1.5 }}>
                              "{report.resolution_note}"
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <span style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa', display: 'flex', alignItems: 'center', gap: 4 }}>
                              Curator: {report.resolved_by_id?.slice(0, 8)}
                            </span>
                            <span style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa', display: 'flex', alignItems: 'center', gap: 4 }}>
                              Timestamp: {report.resolved_at ? new Date(report.resolved_at).toLocaleString() : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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
