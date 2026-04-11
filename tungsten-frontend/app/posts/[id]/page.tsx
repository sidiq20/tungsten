'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Eye,
  Clock,
  FileText,
  ArrowLeft,
  Trash2,
  Share2,
  Flag,
  MessageSquare,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { postsApi } from '@/lib/api';
import { timeAgo, formatCount, courseColor } from '@/lib/utils';
import type { PostResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { ReportDialog } from '@/components/ReportDialog';
import { CommentSection } from '@/components/CommentSection';

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundPage, setNotFoundPage] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  useEffect(() => {
    postsApi
      .get(id)
      .then((p) => {
        setPost(p);
        setUpvotes(p.upvotes);
        setUserVote(p.user_vote ?? null);
        setBookmarked(p.is_bookmarked ?? false);
      })
      .catch((err) => {
        if (err.status === 404) setNotFoundPage(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = useCallback(
    async (value: number) => {
      if (!user || !post) return;
      const oldValue = userVote;
      const oldUpvotes = upvotes;

      if (userVote === value) {
        setUserVote(null);
        setUpvotes(prev => prev - value);
      } else {
        setUserVote(value);
        setUpvotes(prev => prev + (oldValue ? value * 2 : value));
      }

      try {
        const r = await postsApi.vote(post.id, value);
        setUpvotes(r.upvotes);
        setUserVote(r.user_vote);
      } catch {
        setUserVote(oldValue);
        setUpvotes(oldUpvotes);
      }
    },
    [post, user, userVote, upvotes],
  );

  const handleBookmark = useCallback(async () => {
    if (!user || !post) return;
    const oldBookmarked = bookmarked;
    setBookmarked(!oldBookmarked);
    try {
      if (oldBookmarked) {
        await postsApi.unbookmark(post.id);
      } else {
        await postsApi.bookmark(post.id);
      }
    } catch {
      setBookmarked(oldBookmarked);
    }
  }, [bookmarked, post, user]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  }, []);

  async function handleDelete() {
    if (!post || !user) return;
    if (!confirm('Delete this note permanently?')) return;
    setDeleting(true);
    try {
      await postsApi.delete(post.id);
      router.push('/');
    } catch {
      setDeleting(false);
    }
  }

  if (notFoundPage) notFound();

  const isNote = post?.file_url;
  const dotColor = post?.course ? courseColor(post.course.code) : '#2111d4';

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <div
        className="container-page"
        style={{
          paddingTop: '2.5rem',
          paddingBottom: '8rem',
          maxWidth: 760,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Lexend',sans-serif",
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: '#44446a',
              textDecoration: 'none',
              transition: 'all 200ms',
            }}
            className="hover:text-primary"
          >
            <ArrowLeft size={18} />
            Study Feed
          </Link>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={handleShare}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem', position: 'relative' }}
            >
              <Share2 size={14} />
              {shareFeedback ? 'Copied' : 'Share'}
            </button>
            <button 
              onClick={() => setShowReport(true)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.5rem 0.875rem', color: '#8888aa', fontSize: '0.8125rem' }}
            >
              <Flag size={14} />
              Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '3rem' }}>
            <div className="skeleton" style={{ height: 24, width: '20%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 48, width: '85%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 32 }} />
            <div className="skeleton" style={{ height: 40, width: '30%', borderRadius: 12 }} />
          </div>
        ) : post ? (
          <>
            <article className="card animate-fade-up" style={{ padding: '3rem 3.5rem', position: 'relative' }}>
              {/* Header Context */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div 
                   className="badge" 
                   style={{ 
                     background: isNote ? 'rgba(33, 17, 212, 0.08)' : 'rgba(124, 58, 237, 0.08)',
                     color: isNote ? '#2111d4' : '#7c3aed',
                     borderColor: isNote ? 'rgba(33, 17, 212, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                     padding: '0.35rem 1rem'
                   }}
                >
                  {isNote ? 'Academic Note' : 'Scholar Question'}
                </div>
                {post.course && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
                    <span style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: '#0d0d1f' }}>
                      {post.course.code}: {post.course.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 800,
                  fontSize: '2.5rem',
                  letterSpacing: '-0.04em',
                  color: '#0d0d1f',
                  lineHeight: 1.1,
                  marginBottom: '1.5rem',
                }}
              >
                {post.title}
              </h1>

              {/* Metadata */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginBottom: '2.5rem',
                  paddingBottom: '1.5rem',
                  borderBottom: '1px solid rgba(33, 17, 212, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <div style={{ 
                     width: 32, 
                     height: 32, 
                     borderRadius: 10, 
                     background: '#2111d4', 
                     color: '#fff', 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     fontFamily: "'Lexend', sans-serif",
                     fontWeight: 700,
                     fontSize: '0.875rem'
                   }}>
                     {post.is_anonymous ? 'A' : 'S'}
                   </div>
                   <span style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#0d0d1f' }}>
                     {post.is_anonymous ? 'Anonymous Scholar' : `Contributor ${post.author_id.slice(0, 4)}`}
                   </span>
                </div>
                <div style={{ color: 'rgba(0,0,0,0.1)', height: 16, width: 1, borderLeft: '1.5px solid currentColor' }} />
                <span
                  style={{
                    fontFamily: "'Lexend',sans-serif",
                    fontSize: '0.875rem',
                    color: '#8888aa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Clock size={16} />
                  {timeAgo(post.created_at)}
                </span>
                <span
                  style={{
                    fontFamily: "'Lexend',sans-serif",
                    fontSize: '0.875rem',
                    color: '#8888aa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Eye size={16} />
                  {formatCount(post.view_count)} views
                </span>
              </div>

              {/* Content */}
              <div
                className="prose-reading"
                style={{ 
                  maxWidth: '100%', 
                  whiteSpace: 'pre-wrap',
                  marginBottom: '2.5rem',
                  fontSize: '1.125rem'
                }}
              >
                {post.content}
              </div>

              {/* Attachment Context */}
              {post.file_url && (
                <div style={{ 
                  background: '#f8f8fc', 
                  borderRadius: 20, 
                  padding: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '2.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(33, 17, 212, 0.1)', color: '#2111d4', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0d0d1f', marginBottom: 2 }}>Study Document</h4>
                      <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.75rem', color: '#8888aa' }}>{post.file_type || 'PDF Reference'}</p>
                    </div>
                  </div>
                  <a
                    href={post.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    View Material
                  </a>
                </div>
              )}

              {/* Bottom interaction row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleVote(1)}
                      disabled={!user}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 14,
                        border: 'none',
                        background: userVote === 1 ? 'rgba(33, 17, 212, 0.1)' : '#f8f8fc',
                        color: userVote === 1 ? '#2111d4' : '#8888aa',
                        cursor: user ? 'pointer' : 'default',
                        transition: 'all 240ms',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                      className="hover:translate-y-[-1px]"
                    >
                      <ThumbsUp size={20} fill={userVote === 1 ? 'currentColor' : 'none'} />
                      <span style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 800 }}>{formatCount(upvotes)}</span>
                    </button>
                    <button
                      onClick={() => handleVote(-1)}
                      disabled={!user}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 14,
                        border: 'none',
                        background: userVote === -1 ? 'rgba(225, 29, 72, 0.08)' : '#f8f8fc',
                        color: userVote === -1 ? '#e11d48' : '#8888aa',
                        cursor: user ? 'pointer' : 'default',
                        transition: 'all 240ms',
                      }}
                      className="hover:translate-y-[-1px]"
                    >
                      <ThumbsDown size={20} fill={userVote === -1 ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {user && (
                    <button
                      onClick={handleBookmark}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0.75rem 1.25rem',
                        borderRadius: 14,
                        border: 'none',
                        background: bookmarked ? 'rgba(33, 17, 212, 0.1)' : '#f8f8fc',
                        color: bookmarked ? '#2111d4' : '#8888aa',
                        fontFamily: "'Lexend', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        cursor: 'pointer',
                        transition: 'all 240ms',
                      }}
                    >
                      {bookmarked ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
                      {bookmarked ? 'Bookmarked' : 'Add to Collection'}
                    </button>
                  )}
                  {user && user.id === post.author_id && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="btn btn-ghost"
                      style={{ color: '#e11d48', borderColor: 'rgba(225, 29, 72, 0.2)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </article>

            {/* Comment Section (NestJS GraphQL) */}
            <CommentSection postId={post.id} />
          </>
        ) : null}

        {showReport && post && (
          <ReportDialog 
            targetId={post.id} 
            targetType="post" 
            onClose={() => setShowReport(false)}
            onSuccess={() => {
              setShowReport(false);
              alert('Report submitted. Our moderators will review this content shortly.');
            }}
          />
        )}
      </div>
    </div>
  );
}
