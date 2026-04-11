'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  AlertCircle,
  History,
  TrendingUp,
  Activity,
  ArrowUpRight,
  X,
  Plus,
  Database,
  ShieldAlert
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminStats } from '@/components/admin/AdminStats';
import { adminApi } from '@/lib/api';
import type { AuditLogResponse, ReportResponse, AdminStatsResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [realStats, setRealStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [l, r, s] = await Promise.all([
          adminApi.listAuditLogs({ limit: 8 }),
          adminApi.listReports({ limit: 5 }),
          adminApi.getStats()
        ]);
        setLogs(l);
        setReports(r.filter(x => x.status === 'pending'));
        setRealStats(s);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || !user || user.role !== 'admin') return null;

  const stats = [
    { label: 'Live Reports', value: realStats?.total_reports ?? 0, icon: AlertCircle, color: '#e11d48' },
    { label: 'Scholars', value: realStats?.total_users ?? 0, icon: Users },
    { label: 'Resources', value: realStats?.total_posts ?? 0, icon: Activity, color: '#7c3aed' },
    { label: 'System Health', value: realStats?.system_status || 'Healthy', icon: ShieldAlert, color: '#059669' },
  ];

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <main className="container-page" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          <AdminSidebar />

          <section className="animate-fade-up">
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: '2rem',
                letterSpacing: '-0.035em',
                color: '#0d0d1f',
                marginBottom: '0.5rem'
              }}>
                Platform Overview
              </h1>
              <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#8888aa' }}>
                Welcome, {user.full_name || user.username}. Here is what&apos;s happening on Tungsten Learn today.
              </p>
            </div>

            <AdminStats stats={stats} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              
              {/* Recent Audit Logs */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: '#0d0d1f' }}>
                    Recent Audit Logs
                  </h3>
                  <button onClick={() => router.push('/admin/logs')} className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
                    View All <ArrowUpRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)
                  ) : logs.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#8888aa', fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem' }}>
                      No audit logs found.
                    </p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', borderRadius: '10px', background: '#f8f8fc', border: '1px solid #e2e4ed' }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'rgba(33, 17, 212, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2111d4',
                          flexShrink: 0
                        }}>
                          <History size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#0d0d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa' }}>
                            {log.description}
                          </p>
                        </div>
                        <span style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.68rem', color: '#8888aa', flexShrink: 0 }}>
                          {timeAgo(log.timestamp)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Reports */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: '#0d0d1f' }}>
                    Moderation Queue
                  </h3>
                  <button onClick={() => router.push('/admin/reports')} className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
                    View Queue <ArrowUpRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)
                  ) : reports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <ShieldAlert size={32} style={{ color: '#059669', marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#44446a' }}>
                           Clear queue. No pending reports!
                        </p>
                    </div>
                  ) : (
                    reports.map((report) => (
                      <div key={report.id} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.03)', border: '1px solid rgba(225, 29, 72, 0.1)' }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'rgba(225, 29, 72, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#e11d48',
                          flexShrink: 0
                        }}>
                          <AlertCircle size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#0d0d1f' }}>
                            {report.target_type} Flagged
                          </p>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#44446a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {report.reason}
                          </p>
                        </div>
                        <span style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.68rem', color: '#8888aa', flexShrink: 0 }}>
                          {timeAgo(report.created_at)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
