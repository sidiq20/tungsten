'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  History,
  Search,
  Filter,
  ArrowRight,
  Database,
  User as UserIcon,
  Shield,
  Calendar
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { adminApi } from '@/lib/api';
import type { AuditLogResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';

export default function AdminLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listAuditLogs({ limit: 100 });
      setLogs(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs();
    }
  }, [user, fetchLogs]);

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <History size={24} style={{ color: '#2111d4' }} />
                  <h1 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '2.25rem',
                    letterSpacing: '-0.04em',
                    color: '#0d0d1f'
                  }}>
                    Audit Logs
                  </h1>
                </div>
                <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.9375rem', color: '#8888aa' }}>
                  A non-repudiable record of all librarian activity on the platform.
                </p>
              </div>

              <div style={{ position: 'relative', width: 320 }}>
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8888aa' }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Search by action or admin ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '3rem', height: '3.5rem', borderRadius: 18, border: 'none', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                />
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 2rem', background: '#fcfcfd', borderBottom: '1px solid #f0f0f5', display: 'grid', gridTemplateColumns: '120px 1fr 180px 140px', gap: '1.5rem', alignItems: 'center' }}>
                   <p style={thStyle}>Action</p>
                   <p style={thStyle}>Activity Specification</p>
                   <p style={thStyle}>Librarian</p>
                   <p style={thStyle}>Chronology</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} style={{ padding: '2rem', borderBottom: '1px solid #f8f8fc' }}>
                        <div className="skeleton" style={{ height: 40, borderRadius: 12 }} />
                      </div>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                       <Database size={48} style={{ color: '#8888aa', marginBottom: '1.5rem', opacity: 0.2 }} />
                       <p style={{ fontFamily: "'Lexend', sans-serif", color: '#8888aa' }}>No log entries found in the current archival period.</p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log.id} style={{ 
                        padding: '1.5rem 2rem', 
                        borderBottom: '1px solid #f8f8fc', 
                        display: 'grid', 
                        gridTemplateColumns: '120px 1fr 180px 140px', 
                        gap: '1.5rem',
                        alignItems: 'center',
                        transition: 'background 200ms'
                      }}
                      className="hover:bg-slate-50/50"
                      >
                         <div>
                            <span 
                              style={{ 
                                fontFamily: "'Lexend', sans-serif", 
                                fontSize: '0.65rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase',
                                color: getActionColor(log.action),
                                background: `${getActionColor(log.action)}0d`,
                                padding: '0.3rem 0.6rem',
                                borderRadius: 8,
                                letterSpacing: '0.04em'
                              }}
                            >
                               {log.action.split('_')[0]}
                            </span>
                         </div>

                         <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0d0d1f', marginBottom: 2 }}>
                               {log.action.replace(/_/g, ' ')}
                            </p>
                            <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.8125rem', color: '#8888aa', lineHeight: 1.5 }}>
                               {log.description}
                               {log.metadata_json && Object.keys(log.metadata_json).length > 0 && (
                                 <code style={{ marginLeft: 8, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', color: '#475569' }}>
                                   {JSON.stringify(log.metadata_json).slice(0, 40)}...
                                 </code>
                               )}
                            </p>
                         </div>

                         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f8f8fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2111d4' }}>
                               <UserIcon size={14} />
                            </div>
                            <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#44446a', fontWeight: 600 }}>
                               ADMIN-{log.user_id.slice(0, 4).toUpperCase()}
                            </p>
                         </div>

                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calendar size={14} style={{ color: '#8888aa' }} />
                            <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#8888aa' }}>
                               {timeAgo(log.timestamp)}
                            </p>
                         </div>
                      </div>
                    ))
                  )}
                </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

function getActionColor(action: string) {
  if (action.includes('ban') || action.includes('delete')) return '#e11d48';
  if (action.includes('create') || action.includes('reputation')) return '#2111d4';
  if (action.includes('report') || action.includes('resolve')) return '#059669';
}

const thStyle: React.CSSProperties = {
  fontFamily: "'Lexend', sans-serif",
  fontSize: '0.7rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#8888aa',
  margin: 0
};
