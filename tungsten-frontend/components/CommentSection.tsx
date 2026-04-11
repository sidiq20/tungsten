'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, User, ChevronDown, ChevronUp, Reply } from 'lucide-react';
import { commentsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';
import type { CommentResponse } from '@/lib/types';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchComments = async () => {
    try {
      const data = await commentsApi.listByPost(postId);
      // Construct tree
      const tree = buildTree(data);
      setComments(tree);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  function buildTree(list: CommentResponse[]): CommentResponse[] {
    const map = new Map<string, CommentResponse & { replies: CommentResponse[] }>();
    const roots: CommentResponse[] = [];

    list.forEach(item => {
      map.set(item.id, { ...item, replies: [] });
    });

    list.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async function handleCreateComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await commentsApi.create({
        postId,
        content: newComment,
      });
      setNewComment('');
      await fetchComments();
    } catch (err) {
      console.error('Failed to create comment', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateReply(parentId: string) {
    if (!user || !replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await commentsApi.create({
        postId,
        content: replyText,
        parentId,
      });
      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
    } catch (err) {
      console.error('Failed to create reply', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
        <MessageSquare size={20} style={{ color: '#2111d4' }} />
        <h3 style={{ 
          fontFamily: "'Syne', sans-serif", 
          fontWeight: 800, 
          fontSize: '1.25rem', 
          color: '#0d0d1f',
          letterSpacing: '-0.02em'
        }}>
          Discussions
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleCreateComment} style={{ marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.25rem',
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 4px 12px rgba(33, 17, 212, 0.04)',
          }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Contribute to the scholarship..."
              style={{
                width: '100%',
                minHeight: 100,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: "'Lexend', sans-serif",
                fontSize: '0.9375rem',
                color: '#0d0d1f',
                background: 'transparent',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                disabled={submitting || !newComment.trim()}
              >
                <Send size={14} />
                Post Reply
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: 'rgba(33, 17, 212, 0.03)', 
          borderRadius: 20,
          marginBottom: '2.5rem'
        }}>
          <p style={{ fontFamily: "'Lexend', sans-serif", color: '#44446a', marginBottom: '1rem' }}>
            Join the conversation to contribute.
          </p>
          <Link href="/login" className="btn btn-primary btn-sm">Sign In to Reply</Link>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#8888aa', fontFamily: "'Lexend', sans-serif", padding: '2rem' }}>
              No discussions yet. Be the first to chime in.
            </p>
          ) : (
            comments.map(c => (
              <CommentItem 
                key={c.id} 
                comment={c} 
                user={user}
                onReply={(text) => handleCreateReply(c.id)}
                submitting={submitting}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyText={replyText}
                setReplyText={setReplyText}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({ 
  comment, 
  user, 
  onReply, 
  submitting,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText
}: { 
  comment: CommentResponse; 
  user: any;
  onReply: (text: string) => void;
  submitting: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
}) {
  const isReplying = replyingTo === comment.id;

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ 
          width: 36, 
          height: 36, 
          borderRadius: 12, 
          background: 'rgba(33, 17, 212, 0.08)', 
          color: '#2111d4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Lexend', sans-serif",
          fontWeight: 700,
          fontSize: '0.8rem'
        }}>
          {comment.authorId[0].toUpperCase()}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ 
            fontFamily: "'Lexend', sans-serif", 
            fontWeight: 700, 
            fontSize: '0.875rem', 
            color: '#0d0d1f' 
          }}>
            Scholar {comment.authorId.slice(0, 4)}
          </span>
          <span style={{ 
            fontFamily: "'Lexend', sans-serif", 
            fontSize: '0.75rem', 
            color: '#8888aa' 
          }}>
            • {timeAgo(comment.createdAt)}
          </span>
        </div>
        <div style={{ 
          fontFamily: "'Lexend', sans-serif", 
          fontSize: '0.9375rem', 
          lineHeight: 1.6, 
          color: '#44446a' 
        }}>
          {comment.isDeleted ? (
            <span style={{ fontStyle: 'italic', color: '#8888aa' }}>This comment has been removed.</span>
          ) : comment.content}
        </div>

        {!comment.isDeleted && user && (
          <div style={{ marginTop: 8 }}>
            <button 
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'transparent',
                border: 'none',
                color: isReplying ? '#2111d4' : '#8888aa',
                fontFamily: "'Lexend', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 0',
                transition: 'color 150ms'
              }}
              className="hover:text-primary"
            >
              <Reply size={12} />
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          </div>
        )}

        {isReplying && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a focused reply..."
              style={{
                width: '100%',
                minHeight: 80,
                border: '2px solid rgba(33, 17, 212, 0.1)',
                borderRadius: 14,
                padding: '0.75rem',
                fontFamily: "'Lexend', sans-serif",
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'none',
                background: '#fff'
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => onReply(replyText)}
                className="btn btn-primary btn-sm"
                disabled={submitting || !replyText.trim()}
              >
                Post Reply
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div style={{ 
            marginTop: '1.5rem', 
            paddingLeft: '1rem', 
            borderLeft: '2px solid rgba(33, 17, 212, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {comment.replies.map(r => (
              <CommentItem 
                key={r.id} 
                comment={r} 
                user={user}
                onReply={onReply}
                submitting={submitting}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyText={replyText}
                setReplyText={setReplyText}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
