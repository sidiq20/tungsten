'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Mail,
  User,
  Key,
  Shield,
  Activity,
  ChevronRight,
  MoreVertical,
  X,
  Plus,
  Database
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { adminApi } from '@/lib/api';
import type { AdminResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [admins, setAdmins] = useState<AdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    permissions_level: 1
  });
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listAdmins();
      setAdmins(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdmins();
    }
  }, [user, fetchAdmins]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError('');
    try {
      await adminApi.registerAdmin(inviteForm);
      setInviteForm({
        email: '',
        username: '',
        password: '',
        full_name: '',
        permissions_level: 1
      });
      setShowInvite(false);
      await fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to register admin.');
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to revoke admin access for this user?')) return;
    try {
      await adminApi.deleteAdmin(adminId);
      await fetchAdmins();
    } catch {
      alert('Failed to delete admin.');
    }
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <main className="container-page" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          <AdminSidebar />

          <section className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <h1 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: '2rem',
                  letterSpacing: '-0.035em',
                  color: '#0d0d1f',
                  marginBottom: '0.375rem'
                }}>
                  Admin Management
                </h1>
                <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#8888aa' }}>
                  Manage the librarian team, control permissions, and platform settings.
                </p>
              </div>

              <button 
                onClick={() => setShowInvite(true)}
                className="btn btn-primary" 
                style={{ gap: 8 }}
              >
                <Plus size={18} /> Add Administrator
              </button>
            </div>

            {/* Invite Modal Overlay */}
            {showInvite && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(13, 13, 31, 0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}>
                <div className="card animate-fade-up" style={{ width: '100%', maxWidth: 480, padding: '2rem', position: 'relative' }}>
                  <button 
                    onClick={() => setShowInvite(false)}
                    style={{ position: 'absolute', right: 16, top: 16, border: 'none', background: 'transparent', cursor: 'pointer', color: '#8888aa' }}
                  >
                    <X size={24} />
                  </button>
                  
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f', marginBottom: '0.5rem' }}>
                    Register New Admin
                  </h2>
                  <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#8888aa', marginBottom: '1.5rem' }}>
                    Create a new administrative account with specific permissions.
                  </p>

                  {error && (
                    <div style={{ background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#e11d48', fontSize: '0.8125rem', fontFamily: "'Lexend', sans-serif" }}>
                       {error}
                    </div>
                  )}

                  <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input 
                        className="input" 
                        required 
                        value={inviteForm.full_name} 
                        onChange={(e) => setInviteForm({...inviteForm, full_name: e.target.value})}
                        placeholder="e.g. Jane Doe"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Username</label>
                      <input 
                        className="input" 
                        required 
                        value={inviteForm.username} 
                        onChange={(e) => setInviteForm({...inviteForm, username: e.target.value})}
                        placeholder="janedoe_admin"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address</label>
                      <input 
                        className="input" 
                        type="email" 
                        required 
                        value={inviteForm.email} 
                        onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                        placeholder="jane@tungstenlearn.com"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Temporary Password</label>
                      <input 
                        className="input" 
                        type="password" 
                        required 
                        value={inviteForm.password} 
                        onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})}
                        placeholder="Min 8 characters"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Permission Level</label>
                      <select 
                        className="input" 
                        value={inviteForm.permissions_level}
                        onChange={(e) => setInviteForm({...inviteForm, permissions_level: parseInt(e.target.value)})}
                      >
                        <option value={1}>Librarian (Standard)</option>
                        <option value={2}>Moderator (Advanced)</option>
                        <option value={3}>System Admin (Full)</option>
                      </select>
                    </div>

                    <button type="submit" disabled={inviting} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                      {inviting ? 'Registering...' : 'Complete Registration'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="card" style={{ padding: '0.5rem' }}>
               <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e4ed', display: 'grid', gridTemplateColumns: '1fr 140px 140px 80px', gap: '1rem' }}>
                   <p style={thStyle}>Administrator</p>
                   <p style={thStyle}>Status</p>
                   <p style={thStyle}>Last Active</p>
                   <p style={thStyle}>Actions</p>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f5' }}>
                        <div className="skeleton" style={{ height: 40 }} />
                      </div>
                    ))
                  ) : admins.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#8888aa', fontFamily: "'Lexend', sans-serif" }}>
                       No additional administrators found.
                    </div>
                  ) : (
                    admins.map((adm) => (
                      <div key={adm.id} style={{ 
                        padding: '1.25rem 1.5rem', 
                        borderBottom: '1px solid #f0f0f5', 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 140px 140px 80px', 
                        gap: '1rem',
                        alignItems: 'center',
                        transition: 'background 150ms'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8fc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: '#2111d4',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.875rem'
                            }}>
                              U
                            </div>
                            <div>
                               <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0d0d1f' }}>
                                 Admin User
                               </p>
                               <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa' }}>
                                 Level {adm.permissions_level} Librarian
                               </p>
                            </div>
                        </div>

                        <div>
                           <span className={`badge ${adm.is_active ? 'badge-primary' : 'badge-neutral'}`} style={{ color: adm.is_active ? '#2111d4' : '#8888aa' }}>
                             {adm.is_active ? 'Active' : 'Deactivated'}
                           </span>
                        </div>

                        <div>
                           <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.8125rem', color: '#44446a' }}>
                              {timeAgo(adm.last_active)}
                           </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           <button 
                             onClick={() => handleDeleteAdmin(adm.id)}
                             disabled={adm.user_id === user.id}
                             className="btn btn-ghost btn-sm" 
                             style={{ color: '#e11d48', opacity: adm.user_id === user.id ? 0.3 : 1 }}
                           >
                             <Trash2 size={16} />
                           </button>
                           <button className="btn btn-ghost btn-sm">
                             <MoreVertical size={16} />
                           </button>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

            {/* Platform Settings Hint */}
            <div className="card" style={{ marginTop: '2.5rem', padding: '1.5rem 2rem', borderLeft: '4px solid #2111d4' }}>
               <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0d0d1f', marginBottom: '0.5rem' }}>
                 Platform Configurations
               </h3>
               <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#44446a', lineHeight: 1.6, maxWidth: '600px' }}>
                 Tungsten Learn global settings such as maintenance mode, reputation weights, and integration keys are managed via infrastructure config files.
               </p>
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <div style={{ padding: '1rem', background: '#f8f8fc', borderRadius: 12, border: '1px solid #e2e4ed', flex: 1 }}>
                     <Shield size={18} style={{ color: '#2111d4', marginBottom: 8 }} />
                     <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0d0d1f' }}>Auth Policy</p>
                     <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa' }}>JWT Expiry, Rate Limits</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8f8fc', borderRadius: 12, border: '1px solid #e2e4ed', flex: 1 }}>
                     <Database size={18} style={{ color: '#2111d4', marginBottom: 8 }} />
                     <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0d0d1f' }}>R2 Storage</p>
                     <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa' }}>Bucket Config, CORS</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8f8fc', borderRadius: 12, border: '1px solid #e2e4ed', flex: 1 }}>
                     <Activity size={18} style={{ color: '#2111d4', marginBottom: 8 }} />
                     <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0d0d1f' }}>System Logs</p>
                     <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa' }}>Error Tracing, Performance</p>
                  </div>
               </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Lexend', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#44446a',
  marginBottom: 6
};
