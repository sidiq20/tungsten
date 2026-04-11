'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Eye,
  FileText,
  Clock,
  Share2,
  Flag,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { postsApi } from '@/lib/api';
import { timeAgo, truncate, formatCount, courseColor } from '@/lib/utils';
import type { PostResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { ReportDialog } from './ReportDialog';

interface PostCardProps {
  post: PostResponse;
  onBookmarkChange?: (postId: string, bookmarked: boolean) => void;
}

export function PostCard({
  post,
  onBookmarkChange,
}: PostCardProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [userVote, setUserVote] = useState<number | null>(post.user_vote ?? null);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked ?? false);
  const [votingLoading, setVotingLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const handleVote = useCallback(
    async (value: number) => {
      if (!user) return;
      if (votingLoading) return;
      
      // Optimistic update
      const oldValue = userVote;
      const oldUpvotes = upvotes;
      
      // Toggle logic
      if (userVote === value) {
         setUserVote(null);
         setUpvotes(prev => prev - value);
      } else {
         setUserVote(value);
         setUpvotes(prev => prev + (oldValue ? value * 2 : value));
      }
      
      setVotingLoading(true);
      try {
        const result = await postsApi.vote(post.id, value);
        setUpvotes(result.upvotes);
        setUserVote(result.user_vote);
      } catch {
        // Rollback
        setUserVote(oldValue);
        setUpvotes(oldUpvotes);
      } finally {
        setVotingLoading(false);
      }
    },
    [post.id, user, votingLoading, userVote, upvotes],
  );

  const handleBookmark = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || bookmarkLoading) return;
    
    // Optimistic
    const oldBookmarked = bookmarked;
    setBookmarked(!oldBookmarked);
    
    setBookmarkLoading(true);
    try {
      if (oldBookmarked) {
        await postsApi.unbookmark(post.id);
        onBookmarkChange?.(post.id, false);
      } else {
        await postsApi.bookmark(post.id);
        onBookmarkChange?.(post.id, true);
      }
    } catch {
      setBookmarked(oldBookmarked);
    } finally {
      setBookmarkLoading(false);
    }
  }, [post.id, user, bookmarked, bookmarkLoading, onBookmarkChange]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(url);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  }, [post.id]);

  const isNote = !!post.file_url;
  const dotColor = post.course ? courseColor(post.course.code) : '#2111d4';

  return (
    <article
      className="card animate-fade-up"
      style={{ 
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative'
      }}
    >
      {/* Type Badge & Meta Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div 
             className="badge" 
             style={{ 
               background: isNote ? 'rgba(33, 17, 212, 0.08)' : 'rgba(124, 58, 237, 0.08)',
               color: isNote ? '#2111d4' : '#7c3aed',
               borderColor: isNote ? 'rgba(33, 17, 212, 0.15)' : 'rgba(124, 58, 237, 0.15)',
               fontSize: '0.65rem',
               padding: '0.25rem 0.75rem'
             }}
          >
            {isNote ? 'Academic Note' : 'Scholar Question'}
          </div>
          {post.course && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor }} />
              <span style={{ 
                fontFamily: "'Lexend', sans-serif", 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: '#44446a',
                letterSpacing: '-0.01em'
              }}>
                {post.course.code}
              </span>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            fontFamily: "'Lexend', sans-serif", 
            fontSize: '0.75rem', 
            color: '#8888aa',
            fontWeight: 500
          }}>
            {timeAgo(post.created_at)}
          </span>
        </div>
      </div>

      {/* Title & Content */}
      <div style={{ flex: 1 }}>
        <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: '1.25rem',
            lineHeight: 1.3,
            color: '#0d0d1f',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
            transition: 'color 200ms ease'
          }} className="hover:text-primary">
            {post.title}
          </h2>
        </Link>
        <p style={{
          fontFamily: "'Lexend', sans-serif",
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          color: '#44446a',
          fontWeight: 400,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '1.25rem'
        }}>
          {post.content}
        </p>
      </div>

      {/* Attachment / Action Link */}
      {isNote && (
        <div style={{ marginBottom: '0.5rem' }}>
          <Link 
            href={`/posts/${post.id}`}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.5rem 1rem',
              borderRadius: 12,
              background: '#f8f8fc',
              color: '#2111d4',
              fontFamily: "'Lexend', sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 200ms ease'
            }}
            className="hover:bg-primary-10"
          >
            <FileText size={16} />
            Study Document
          </Link>
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginTop: '0.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(33, 17, 212, 0.04)'
      }}>
        {/* Social Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button 
              onClick={() => handleVote(1)}
              disabled={!user || votingLoading}
              style={{
                background: userVote === 1 ? 'rgba(33, 17, 212, 0.1)' : 'transparent',
                color: userVote === 1 ? '#2111d4' : '#8888aa',
                border: 'none',
                padding: '0.5rem',
                borderRadius: 10,
                cursor: user ? 'pointer' : 'default',
                transition: 'all 200ms'
              }}
              className="hover:bg-primary-10"
            >
              <ThumbsUp size={18} fill={userVote === 1 ? 'currentColor' : 'none'} />
            </button>
            <span style={{ 
              fontFamily: "'Lexend', sans-serif", 
              fontSize: '0.8125rem', 
              fontWeight: 700,
              color: userVote === 1 ? '#2111d4' : '#44446a',
              minWidth: '1.5rem',
              textAlign: 'center'
            }}>
              {formatCount(upvotes)}
            </span>
            <button 
              onClick={() => handleVote(-1)}
              disabled={!user || votingLoading}
              style={{
                background: userVote === -1 ? 'rgba(225, 29, 72, 0.08)' : 'transparent',
                color: userVote === -1 ? '#e11d48' : '#8888aa',
                border: 'none',
                padding: '0.5rem',
                borderRadius: 10,
                cursor: user ? 'pointer' : 'default',
                transition: 'all 200ms'
              }}
              className="hover:bg-rose-50"
            >
              <ThumbsDown size={18} fill={userVote === -1 ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          <Link 
            href={`/posts/${post.id}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              color: '#8888aa',
              textDecoration: 'none',
              padding: '0.5rem',
              borderRadius: 10
            }}
            className="hover:bg-slate-50"
          >
            <MessageSquare size={18} />
            <span style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.8125rem', fontWeight: 600 }}>
              Reply
            </span>
          </Link>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button 
            onClick={handleShare}
            style={{
              padding: '0.5rem',
              borderRadius: 10,
              border: 'none',
              background: shareFeedback ? 'rgba(5, 150, 105, 0.1)' : 'transparent',
              color: shareFeedback ? '#059669' : '#8888aa',
              cursor: 'pointer',
              transition: 'all 200ms',
              position: 'relative'
            }}
            className="hover:bg-slate-50"
            title="Share"
          >
            <Share2 size={18} />
            {shareFeedback && (
              <span style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#059669',
                color: '#fff',
                fontSize: '0.65rem',
                padding: '0.25rem 0.5rem',
                borderRadius: 6,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                marginBottom: 8
              }}>
                Link Copied
              </span>
            )}
          </button>
          
          <button 
             onClick={handleBookmark}
             disabled={bookmarkLoading}
             style={{
               padding: '0.5rem',
               borderRadius: 10,
               border: 'none',
               background: bookmarked ? 'rgba(33, 17, 212, 0.08)' : 'transparent',
               color: bookmarked ? '#2111d4' : '#8888aa',
               cursor: 'pointer',
               transition: 'all 200ms'
             }}
             className="hover:bg-primary-10"
             title="Bookmark"
          >
            {bookmarked ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
          </button>

          <button 
            onClick={(e) => { e.preventDefault(); setShowReport(true); }}
            style={{
              padding: '0.5rem',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: '#8888aa',
              cursor: 'pointer',
              transition: 'all 200ms'
            }}
            className="hover:bg-rose-50 hover:text-rose"
            title="Report"
          >
            <Flag size={18} />
          </button>
        </div>
      </div>

      {showReport && (
        <ReportDialog 
          targetId={post.id} 
          targetType="post" 
          onClose={() => setShowReport(false)}
          onSuccess={() => {
            setShowReport(false);
            // Optional: Show toast or confirmation
          }} 
        />
      )}
    </article>
  );
}
