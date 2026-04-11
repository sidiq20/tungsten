'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  MoreVertical,
  ShieldBan,
  ShieldCheck,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { adminApi } from '@/lib/api';
import type { UserResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({ limit: 100 });
      setUsers(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleBanToggle = async (targetUser: UserResponse) => {
    const isBanned = targetUser.is_banned;
    if (actionLoading) return;
    
    if (!confirm(`Are you sure you want to ${isBanned ? 'unban' : 'ban'} ${targetUser.username}?`)) return;

    setActionLoading(targetUser.id);
    try {
      if (isBanned) {
        await adminApi.unbanUser(targetUser.id);
      } else {
        await adminApi.banUser(targetUser.id);
      }
      await fetchUsers();
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReputationAdjust = async (targetUser: UserResponse, amount: number) => {
    if (actionLoading) return;
    setActionLoading(targetUser.id);
    try {
      await adminApi.adjustReputation(targetUser.id, amount);
      await fetchUsers();
    } catch {
      alert('Failed to adjust reputation');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <main className="container-page" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          <AdminSidebar />

          <section className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Users size={24} style={{ color: '#2111d4' }} />
                  <h1 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '2.25rem',
                    letterSpacing: '-0.04em',
                    color: '#0d0d1f'
                  }}>
                    Scholars
                  </h1>
                </div>
                <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.9375rem', color: '#8888aa' }}>
                  Manage student credentials, reputations, and access levels.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: 320 }}>
                  <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8888aa' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search by name, email or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '3rem', height: '3.5rem', borderRadius: 18, border: 'none', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#fcfcfd', borderBottom: '1px solid #f0f0f5' }}>
                    <th style={thStyle}>Scholar Identity</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Reputation</th>
                    <th style={thStyle}>Academic Tenure</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} style={{ padding: '2rem' }}><div className="skeleton" style={{ height: 60, borderRadius: 12 }} /></td></tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '6rem', textAlign: 'center', color: '#8888aa', fontFamily: "'Lexend', sans-serif" }}>No scholars detected in the directory.</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f8f8fc', transition: 'background 200ms' }} className="hover:bg-slate-50/50">
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                              width: 44,
                              height: 44,
                              borderRadius: 16,
                              background: 'linear-gradient(135deg, #2111d4 0%, #4a3aff 100%)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1rem',
                              fontFamily: "'Syne', sans-serif"
                            }}>
                              {(u.full_name || u.username)[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0d0d1f' }}>{u.full_name || u.username}</p>
                              <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa', display: 'flex', alignItems: 'center', gap: 6 }}>
                                @{u.username} • {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span 
                            className={`badge ${u.is_banned ? 'badge-amber' : 'badge-neutral'}`} 
                            style={{ 
                              fontWeight: 700, 
                              fontSize: '0.65rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.05em',
                              padding: '0.25rem 0.6rem',
                              borderRadius: 8,
                              background: u.is_banned ? '#fef2f2' : u.role === 'admin' ? '#f0f9ff' : '#f8f8fc',
                              color: u.is_banned ? '#ef4444' : u.role === 'admin' ? '#0284c7' : '#44446a',
                              border: 'none'
                            }}
                          >
                            {u.is_banned ? 'Banned' : u.role === 'admin' ? 'Curator' : 'Scholar'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                             <span style={{ 
                               fontFamily: "'Syne', sans-serif", 
                               fontWeight: 800, 
                               fontSize: '1rem', 
                               color: '#2111d4' 
                             }}>
                               {u.reputation_score}
                             </span>
                             <div style={{ display: 'flex', gap: 4 }}>
                               <button 
                                 onClick={() => handleReputationAdjust(u, 10)}
                                 style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: '#f0f9ff', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}
                                 className="hover:scale-110 active:scale-95"
                               >
                                 +
                               </button>
                               <button 
                                 onClick={() => handleReputationAdjust(u, -10)}
                                 style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}
                                 className="hover:scale-110 active:scale-95"
                               >
                                 -
                               </button>
                             </div>
                           </div>
                        </td>
                        <td style={tdStyle}>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.8125rem', color: '#44446a', display: 'flex', alignItems: 'center', gap: 6 }}>
                             Joined {timeAgo(u.created_at)}
                          </p>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                              onClick={() => handleBanToggle(u)}
                              disabled={actionLoading === u.id || u.id === user.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '0.6rem 1rem',
                                borderRadius: 12,
                                border: 'none',
                                background: u.is_banned ? '#0596690d' : '#e11d480d',
                                color: u.is_banned ? '#059669' : '#e11d48',
                                fontFamily: "'Lexend', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.8125rem',
                                cursor: 'pointer',
                                transition: 'all 200ms',
                                opacity: actionLoading === u.id || u.id === user.id ? 0.5 : 1
                              }}
                              className="hover:scale-105"
                            >
                              {u.is_banned ? <ShieldCheck size={14} /> : <ShieldBan size={14} />}
                              {u.is_banned ? 'Restore' : 'Ban'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  fontFamily: "'Lexend', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#8888aa',
  padding: '1.25rem 1.5rem',
};

const tdStyle: React.CSSProperties = {
  padding: '1.25rem 1.5rem',
  verticalAlign: 'middle',
};
