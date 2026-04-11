'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  BookOpen,
  Bookmark,
  TrendingUp,
  Award,
  LogOut,
  Mail,
  Calendar,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PostCard } from '@/components/PostCard';
import { CourseCard } from '@/components/CourseCard';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { PostResponse, CourseResponse } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'subscriptions' | 'settings'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<PostResponse[]>([]);
  const [subscriptions, setSubscriptions] = useState<CourseResponse[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingContent(true);
      try {
        if (activeTab === 'bookmarks') {
          const res = await usersApi.myBookmarks();
          setBookmarks(res);
        } else if (activeTab === 'subscriptions') {
          const res = await usersApi.mySubscriptions();
          setSubscriptions(res);
        }
      } catch {
        // silent
      } finally {
        setLoadingContent(false);
      }
    };

    fetchData();
  }, [user, activeTab]);

  if (authLoading || !user) return null;

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <main className="container-page" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '3rem', alignItems: 'start' }}>

          {/* Sidebar / Profile Info */}
          <aside className="animate-fade-up">
            <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: '#2111d4',
                color: '#fff',
                fontSize: '2.5rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 24px rgba(33, 17, 212, 0.2)'
              }}>
                {(user.full_name || user.username)[0].toUpperCase()}
              </div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: '1.5rem',
                color: '#0d0d1f',
                marginBottom: '0.25rem'
              }}>
                {user.full_name || user.username}
              </h1>
              <p style={{
                fontFamily: "'Lexend', sans-serif",
                fontSize: '0.875rem',
                color: '#8888aa',
                marginBottom: '1.5rem'
              }}>
                @{user.username}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: '1px solid #f0f0f5', paddingTop: '1.5rem' }}>
                <div>
                  <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#2111d4' }}>
                    {user.reputation_score}
                  </p>
                  <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07rem', color: '#8888aa' }}>
                    Reputation
                  </p>
                </div>
                <div style={{ width: 1, background: '#f0f0f5' }} />
                <div>
                  <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0d0d1f' }}>
                    {user.role === 'admin' ? 'Mod' : 'Scholar'}
                  </p>
                  <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07rem', color: '#8888aa' }}>
                    Rank
                  </p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 12,
                    border: 'none',
                    background: activeTab === 'bookmarks' ? 'rgba(33, 17, 212, 0.1)' : 'transparent',
                    color: activeTab === 'bookmarks' ? '#2111d4' : '#44446a',
                    fontFamily: "'Lexend', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms'
                  }}
                >
                  <Bookmark size={17} /> Bookmarks
                </button>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 12,
                    border: 'none',
                    background: activeTab === 'subscriptions' ? 'rgba(33, 17, 212, 0.1)' : 'transparent',
                    color: activeTab === 'subscriptions' ? '#2111d4' : '#44446a',
                    fontFamily: "'Lexend', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms'
                  }}
                >
                  <BookOpen size={17} /> Subscriptions
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 12,
                    border: 'none',
                    background: activeTab === 'settings' ? 'rgba(33, 17, 212, 0.1)' : 'transparent',
                    color: activeTab === 'settings' ? '#2111d4' : '#44446a',
                    fontFamily: "'Lexend', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms'
                  }}
                >
                  <Settings size={17} /> Account Settings
                </button>
                <div style={{ height: 1, background: '#f0f0f5', margin: '0.5rem 0' }} />
                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 12,
                    border: 'none',
                    background: 'transparent',
                    color: '#e11d48',
                    fontFamily: "'Lexend', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms'
                  }}
                >
                  <LogOut size={17} /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="animate-fade-up stagger-2">
            {activeTab === 'bookmarks' && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f' }}>Saved for Later</h2>
                  <span className="badge">{bookmarks.length} notes</span>
                </div>

                {loadingContent ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 120 }} />)}
                  </div>
                ) : bookmarks.length === 0 ? (
                  <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <Bookmark size={40} style={{ color: '#8888aa', marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '1rem', color: '#44446a' }}>
                      You haven&apos;t bookmarked any notes yet.
                    </p>
                    <button onClick={() => router.push('/')} className="btn btn-primary btn-sm" style={{ marginTop: '1.5rem' }}>
                      Browse the Feed
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bookmarks.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'subscriptions' && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f' }}>Subscribed Courses</h2>
                  <span className="badge">{subscriptions.length} courses</span>
                </div>

                {loadingContent ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="card skeleton" style={{ height: 180 }} />)}
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <BookOpen size={40} style={{ color: '#8888aa', marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '1rem', color: '#44446a' }}>
                      You haven&apos;t subcribed to any courses yet.
                    </p>
                    <button onClick={() => router.push('/courses')} className="btn btn-primary btn-sm" style={{ marginTop: '1.5rem' }}>
                      Explore Courses
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {subscriptions.map((course) => (
                      <CourseCard key={course.id} course={course} subscribed={true} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'settings' && (
              <section>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f', marginBottom: '1.5rem' }}>Account Settings</h2>

                <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: '#2111d4',
                      color: '#fff',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(user.full_name || user.username)[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0d0d1f' }}>Profile Picture</p>
                      <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.8125rem', color: '#8888aa' }}>Tungsten currently uses academic initials.</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>Change</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 12, background: '#f8f8fc', border: '1px solid #e2e4ed' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Mail size={18} style={{ color: '#8888aa' }} />
                        <div>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 600, fontSize: '0.875rem', color: '#0d0d1f' }}>Email Address</p>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.8125rem', color: '#8888aa' }}>{user.email}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: '#8888aa' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 12, background: '#f8f8fc', border: '1px solid #e2e4ed' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Shield size={18} style={{ color: '#8888aa' }} />
                        <div>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 600, fontSize: '0.875rem', color: '#0d0d1f' }}>Privacy Settings</p>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.8125rem', color: '#8888aa' }}>Manage who can see your activity.</p>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: '#8888aa' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 12, background: '#f8f8fc', border: '1px solid #e2e4ed' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Calendar size={18} style={{ color: '#8888aa' }} />
                        <div>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 600, fontSize: '0.875rem', color: '#0d0d1f' }}>Account Age</p>
                          <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.8125rem', color: '#8888aa' }}>Member since {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Save Profile Changes</button>
                    <p style={{ textAlign: 'center', fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa', marginTop: '1rem' }}>
                      Reputation cannot be reset. All sharing activity is permanent.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
