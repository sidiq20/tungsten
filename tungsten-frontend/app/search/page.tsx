'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, BookOpen, FileText, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PostCard } from '@/components/PostCard';
import { CourseCard } from '@/components/CourseCard';
import { searchApi } from '@/lib/api';
import type { PostResponse, CourseResponse } from '@/lib/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) return;

    const performSearch = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await searchApi.global(query);
        setPosts(res.posts);
        setCourses(res.courses);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />

      <main className="container-page" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: '2.5rem',
            letterSpacing: '-0.035em',
            color: '#0d0d1f',
            marginBottom: '0.5rem'
          }}>
            Search Results
          </h1>
          <p style={{ fontFamily: "'Lexend', sans-serif", fontSize: '1rem', color: '#8888aa' }}>
            Showing results for <span style={{ color: '#2111d4', fontWeight: 600 }}>&quot;{query}&quot;</span>
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card skeleton" style={{ height: 100 }} />
            <div className="card skeleton" style={{ height: 200 }} />
            <div className="card skeleton" style={{ height: 200 }} />
          </div>
        ) : !query ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <SearchIcon size={40} style={{ color: '#8888aa', marginBottom: '1.5rem', opacity: 0.5 }} />
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#0d0d1f' }}>
              What are you looking for?
            </h2>
            <p style={{ fontFamily: "'Lexend', sans-serif", color: '#44446a', marginTop: '0.5rem' }}>
              Enter a search term in the navigation bar to find notes and courses.
            </p>
          </div>
        ) : posts.length === 0 && courses.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
             <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#0d0d1f' }}>
               No results found.
             </h2>
             <p style={{ fontFamily: "'Lexend', sans-serif", color: '#44446a', marginTop: '0.5rem' }}>
               Try searching for something else or browse categories.
             </p>
             <button onClick={() => router.push('/')} className="btn btn-primary btn-sm" style={{ marginTop: '1.5rem' }}>
               Go to Feed
             </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>
            {/* Posts Results */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                <FileText size={20} style={{ color: '#2111d4' }} />
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f' }}>Notes</h2>
                <span className="badge">{posts.length}</span>
              </div>

              {posts.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'transparent', borderStyle: 'dashed' }}>
                  <p style={{ fontFamily: "'Lexend', sans-serif", color: '#8888aa' }}>No notes matched your query.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </section>

            {/* Courses Results */}
            <aside>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                <BookOpen size={20} style={{ color: '#2111d4' }} />
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#0d0d1f' }}>Courses</h2>
                <span className="badge">{courses.length}</span>
              </div>

              {courses.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'transparent', borderStyle: 'dashed' }}>
                  <p style={{ fontFamily: "'Lexend', sans-serif", color: '#8888aa' }}>No courses matched your query.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-page" style={{ paddingTop: '3rem' }}>Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
