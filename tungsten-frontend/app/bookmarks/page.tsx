'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Search, Ghost } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PostCard } from '@/components/PostCard';
import { usersApi } from '@/lib/api';
import type { PostResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const data = await usersApi.myBookmarks();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const handleBookmarkChange = (postId: string, bookmarked: boolean) => {
    if (!bookmarked) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <div className="container-page" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Bookmark size={28} style={{ color: '#2111d4' }} />
            <h1 style={{ 
              fontFamily: "'Syne', sans-serif", 
              fontWeight: 800, 
              fontSize: '2.25rem', 
              color: '#0d0d1f',
              letterSpacing: '-0.03em'
            }}>
              Saved Scholarship
            </h1>
          </div>
          <p style={{ 
            fontFamily: "'Lexend', sans-serif", 
            fontSize: '1rem', 
            color: '#44446a',
            maxWidth: '60ch'
          }}>
            Your personal collection of critical notes, scholar questions, and academic resources.
          </p>
        </header>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 800 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ height: 200, padding: '2rem' }}>
                <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 800 }}>
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onBookmarkChange={handleBookmarkChange}
              />
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '6rem 2rem', 
            background: '#fff', 
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
            maxWidth: 800
          }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 24, 
              background: 'rgba(33, 17, 212, 0.05)', 
              color: '#2111d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Ghost size={40} />
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f', marginBottom: 8 }}>
              Quiet in the archives
            </h2>
            <p style={{ fontFamily: "'Lexend', sans-serif", color: '#8888aa', marginBottom: '2rem', maxWidth: '40ch', margin: '0 auto 2rem' }}>
              You haven't bookmarked any notes yet. Save content you find valuable to see it here.
            </p>
            <Link href="/" className="btn btn-primary">Discover Notes</Link>
          </div>
        )}
      </div>
    </div>
  );
}
