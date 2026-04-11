'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  Clock,
  Filter,
  PenSquare,
  ChevronDown,
  BookOpen,
  Tag,
  FileText,
  HelpCircle,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PostCard } from '@/components/PostCard';
import { postsApi, coursesApi, tagsApi } from '@/lib/api';
import type {
  PostResponse,
  CourseResponse,
  TagResponse,
} from '@/lib/types';
import { useAuth } from '@/lib/auth';

const LIMIT = 15;

function PostSkeleton() {
  return (
    <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ height: 24, width: '30%', borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 20, width: '20%', borderRadius: 6 }} />
      </div>
      <div className="skeleton" style={{ height: 28, width: '80%', borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 16, width: '100%', borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 16, width: '70%', borderRadius: 6 }} />
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 10 }} />
        <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 10 }} />
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get('tag') || '';
  const courseFilter = searchParams.get('course') || '';

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [selectedCourse, setSelectedCourse] = useState(courseFilter);
  const [selectedTag, setSelectedTag] = useState(tagFilter);
  const [postType, setPostType] = useState<'note' | 'question' | null>(null);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Load sidebar data
  useEffect(() => {
    coursesApi.list({ limit: 50 }).then((r) => setCourses(r.items)).catch(() => {});
    tagsApi.list().then(setTags).catch(() => {});
  }, []);

  const fetchPosts = useCallback(
    async (p: number, reset = false) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await postsApi.list({
          page: p,
          limit: LIMIT,
          sort_by: sortBy,
          post_type: postType || undefined,
          ...(selectedCourse ? { course_id: selectedCourse } : {}),
          ...(selectedTag ? { tag: selectedTag } : {}),
        });
        if (reset) {
          setPosts(res.items);
        } else {
          setPosts((prev) => [...prev, ...res.items]);
        }
        setTotal(res.total);
        setPage(p);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortBy, selectedCourse, selectedTag, postType],
  );

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore && posts.length < total) {
          fetchPosts(page + 1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchPosts, loadingMore, page, posts.length, total]);

  function clearFilters() {
    setSelectedCourse('');
    setSelectedTag('');
    setPostType(null);
    setShowFilters(false);
  }

  const hasMore = posts.length < total;
  const activeFilters = [selectedCourse, selectedTag, postType].filter(Boolean).length;

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <div className="container-page" style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 260px', gap: '3rem', alignItems: 'start' }}>

          {/* ── Left sidebar ──────────────────────────────────── */}
          <aside className="hidden lg:block" style={{ position: 'sticky', top: '7rem' }}>
            {/* Content Mode */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <p style={{
                fontFamily: "'Lexend', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#8888aa',
                marginBottom: '1rem',
              }}>
                Stream Mode
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SidebarButton 
                  active={!postType} 
                  onClick={() => setPostType(null)}
                  icon={LayoutGrid}
                  label="All Resources"
                />
                <SidebarButton 
                  active={postType === 'note'} 
                  onClick={() => setPostType('note')}
                  icon={FileText}
                  label="Academic Notes"
                  color="#2111d4"
                />
                <SidebarButton 
                  active={postType === 'question'} 
                  onClick={() => setPostType('question')}
                  icon={HelpCircle}
                  label="Scholar Questions"
                  color="#7c3aed"
                />
              </div>
            </div>

            {/* Courses */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <p style={{
                fontFamily: "'Lexend', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#8888aa',
                marginBottom: '1rem',
              }}>
                Subjects
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
                {courses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourse(selectedCourse === c.id ? '' : c.id)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 12,
                      border: 'none',
                      background: selectedCourse === c.id ? 'rgba(33,17,212,0.08)' : 'transparent',
                      color: selectedCourse === c.id ? '#2111d4' : '#44446a',
                      fontFamily: "'Lexend', sans-serif",
                      fontWeight: selectedCourse === c.id ? 700 : 500,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 200ms',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                    className="hover:bg-slate-50"
                  >
                    <BookOpen size={14} style={{ opacity: selectedCourse === c.id ? 1 : 0.4 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main feed ─────────────────────────────────────── */}
          <main>
            {/* Feed header */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Sparkles size={24} style={{ color: '#2111d4' }} />
                  <h1 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '2rem',
                    letterSpacing: '-0.04em',
                    color: '#0d0d1f',
                  }}>
                    Scholar Stream
                  </h1>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setSortBy(sortBy === 'recent' ? 'popular' : 'recent')}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 8, padding: '0.5rem 1rem', borderRadius: 14 }}
                  >
                    {sortBy === 'recent' ? <Clock size={16} /> : <TrendingUp size={16} />}
                    <span style={{ fontWeight: 700 }}>{sortBy === 'recent' ? 'Latest' : 'Trending'}</span>
                    <ChevronDown size={14} style={{ opacity: 0.5 }} />
                  </button>
                </div>
              </div>
              <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.9375rem', color: '#8888aa' }}>
                Exploring {total.toLocaleString()} shared insights from the community.
              </p>
            </div>

            {/* Active filter chips */}
            {activeFilters > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {postType && (
                  <span className="badge" style={{ gap: 6, cursor: 'pointer', padding: '0.5rem 0.875rem', borderRadius: 12 }} onClick={() => setPostType(null)}>
                    {postType === 'note' ? <FileText size={12} /> : <HelpCircle size={12} />}
                    {postType === 'note' ? 'Academic Notes' : 'Scholar Questions'}
                    <span style={{ opacity: 0.5 }}>×</span>
                  </span>
                )}
                {selectedCourse && (
                  <span className="badge" style={{ gap: 6, cursor: 'pointer', padding: '0.5rem 0.875rem', borderRadius: 12 }} onClick={() => setSelectedCourse('')}>
                    <BookOpen size={12} />
                    {courses.find((c) => c.id === selectedCourse)?.code || 'Course'}
                    <span style={{ opacity: 0.5 }}>×</span>
                  </span>
                )}
                {selectedTag && (
                  <span className="badge" style={{ gap: 6, cursor: 'pointer', padding: '0.5rem 0.875rem', borderRadius: 12 }} onClick={() => setSelectedTag('')}>
                    <Tag size={12} />
                    {selectedTag}
                    <span style={{ opacity: 0.5 }}>×</span>
                  </span>
                )}
                {activeFilters > 1 && (
                  <button onClick={clearFilters} style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    color: '#2111d4', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Lexend', sans-serif"
                  }}>
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <PostSkeleton key={i} />
                ))
              ) : posts.length === 0 ? (
                <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: 20, 
                    background: 'rgba(33, 17, 212, 0.05)', 
                    color: '#2111d4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                  }}>
                    <Sparkles size={32} />
                  </div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f', marginBottom: 8 }}>
                    Quiet in this stream
                  </h2>
                  <p style={{ fontFamily: "'Lexend', sans-serif", color: '#8888aa', marginBottom: '2rem', maxWidth: '40ch', margin: '0 auto 2rem' }}>
                    {activeFilters > 0
                      ? 'No resources match your current selection.'
                      : 'Be the first to contribute to this scholarship.'}
                  </p>
                  <Link href="/posts/new" className="btn btn-primary">Create Contribution</Link>
                </div>
              ) : (
                posts.map((post, i) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>

            {/* Infinite scroll loader */}
            <div ref={loaderRef} style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loadingMore && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(33, 17, 212, 0.1)', borderTopColor: '#2111d4', animation: 'spin 1s linear infinite' }} />
              )}
              {!loading && !hasMore && posts.length > 0 && (
                <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', color: '#8888aa', fontWeight: 500 }}>
                  You have discovered everything in this stream.
                </p>
              )}
            </div>
          </main>

          {/* ── Right sidebar ──────────────────────────────────── */}
          <aside className="hidden lg:block" style={{ position: 'sticky', top: '7rem' }}>
            {tags.length > 0 && (
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <p style={{
                  fontFamily: "'Lexend', sans-serif",
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#8888aa',
                  marginBottom: '1rem',
                }}>
                  Discovery
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tags.slice(0, 15).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTag(selectedTag === t.slug ? '' : t.slug)}
                      className={selectedTag === t.slug ? 'badge' : 'badge badge-neutral'}
                      style={{ cursor: 'pointer', border: 'none', padding: '0.4rem 0.75rem' }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!user && (
              <div style={{
                background: 'linear-gradient(135deg, #2111d4 0%, #4a3aff 100%)',
                borderRadius: 24,
                padding: '2rem',
                color: '#fff',
                boxShadow: '0 12px 40px rgba(33, 17, 212, 0.2)'
              }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                  Elevate Your Scholarship
                </h3>
                <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Join the elite circle of students sharing high-impact study materials.
                </p>
                <Link href="/register" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  background: '#fff',
                  color: '#2111d4',
                  borderRadius: 14,
                  fontFamily: "'Lexend', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  textDecoration: 'none'
                }}>
                  Join Now
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function SidebarButton({ active, onClick, icon: Icon, label, color }: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.75rem 1rem',
        borderRadius: 14,
        border: 'none',
        background: active ? 'rgba(33,17,212,0.08)' : 'transparent',
        color: active ? (color || '#2111d4') : '#44446a',
        fontFamily: "'Lexend', sans-serif",
        fontWeight: active ? 700 : 500,
        fontSize: '0.875rem',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 200ms',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
      className="hover:bg-slate-50"
    >
      <Icon size={18} style={{ opacity: active ? 1 : 0.5 }} />
      {label}
    </button>
  );
}
