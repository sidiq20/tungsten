'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Tag, Lock, Globe } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { postsApi, coursesApi, tagsApi, storageApi } from '@/lib/api';
import type { CourseResponse, TagResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth';

export default function NewPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    content: '',
    status: 'published' as 'published' | 'draft',
    is_anonymous: false,
    course_id: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<TagResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    coursesApi.list({ limit: 100 }).then((r) => setCourses(r.items)).catch(() => {});
  }, []);

  const searchTags = useCallback(async (q: string) => {
    if (!q.trim()) { setTagSuggestions([]); return; }
    try {
      const results = await tagsApi.search(q);
      setTagSuggestions(results);
    } catch { setTagSuggestions([]); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchTags(tagInput), 300);
    return () => clearTimeout(t);
  }, [tagInput, searchTags]);

  function addTag(name: string) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed || form.tags.includes(trimmed) || form.tags.length >= 5) return;
    setForm((f) => ({ ...f, tags: [...f.tags, trimmed] }));
    setTagInput('');
    setTagSuggestions([]);
  }

  function removeTag(t: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(f.type)) {
      setError('Only PDF, JPG, and PNG files are allowed.');
      return;
    }
    setFile(f);
    setUploading(true);
    setError('');
    try {
      const { url, public_url } = await storageApi.presignedUrl(f.name, f.type);
      await fetch(url, { method: 'PUT', body: f, headers: { 'Content-Type': f.type } });
      setFileUrl(public_url);
    } catch {
      setError('File upload failed. Please try again.');
      setFile(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim() || form.title.length < 5) {
      setError('Title must be at least 5 characters.');
      return;
    }
    if (form.content.length < 10) {
      setError('Content must be at least 10 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const post = await postsApi.create({
        title: form.title,
        content: form.content,
        status: form.status,
        is_anonymous: form.is_anonymous,
        course_id: form.course_id || null,
        tags: form.tags,
        file_url: fileUrl || null,
        file_type: file?.type || null,
      });
      router.push(`/posts/${post.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create note.');
      setSubmitting(false);
    }
  }

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div style={{ background: '#f6f6f8', minHeight: '100vh' }}>
      <Navbar />
      <div
        className="container-page"
        style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: 820 }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'Lexend',sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#8888aa',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2111d4')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#8888aa')}
        >
          <ArrowLeft size={15} />
          Back to feed
        </Link>

        <div className="card animate-fade-up" style={{ overflow: 'hidden' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg,#2111d4,#4a3aff)' }} />
          <div style={{ padding: '2rem 2.25rem' }}>
            <h1
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: '1.875rem',
                letterSpacing: '-0.035em',
                color: '#0d0d1f',
                marginBottom: '0.375rem',
              }}
            >
              Share a Note
            </h1>
            <p
              style={{
                fontFamily: "'Lora',serif",
                fontSize: '0.9375rem',
                color: '#8888aa',
                marginBottom: '2rem',
              }}
            >
              Help your peers by sharing study materials and insights.
            </p>

            {error && (
              <div
                style={{
                  background: 'rgba(225,29,72,0.08)',
                  border: '1px solid rgba(225,29,72,0.25)',
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  fontFamily: "'Lexend',sans-serif",
                  fontSize: '0.875rem',
                  color: '#e11d48',
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Title */}
              <div>
                <label style={labelStyle}>Title</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Complete Organic Chemistry Notes — Week 6"
                  required
                  minLength={5}
                  maxLength={200}
                />
              </div>

              {/* Course */}
              <div>
                <label style={labelStyle}>Course <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <select
                  className="input"
                  value={form.course_id}
                  onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">No specific course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label style={labelStyle}>Content</label>
                <textarea
                  className="input"
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write your study notes here. Use line breaks to organize sections…"
                  required
                  minLength={10}
                  rows={12}
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: '1rem',
                    lineHeight: 1.75,
                    resize: 'vertical',
                    minHeight: 240,
                  }}
                />
                <p
                  style={{
                    fontFamily: "'Lexend',sans-serif",
                    fontSize: '0.75rem',
                    color: '#8888aa',
                    marginTop: 4,
                    textAlign: 'right',
                  }}
                >
                  {form.content.length} chars
                </p>
              </div>

              {/* Tags */}
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>
                  <Tag size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Tags{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    (up to 5)
                  </span>
                </label>
                {form.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {form.tags.map((t) => (
                      <span
                        key={t}
                        className="badge"
                        style={{ gap: 4, cursor: 'pointer', paddingRight: 6 }}
                        onClick={() => removeTag(t)}
                      >
                        {t}
                        <X size={10} />
                      </span>
                    ))}
                  </div>
                )}
                <input
                  className="input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Type a tag and press Enter…"
                  disabled={form.tags.length >= 5}
                />
                {tagSuggestions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      border: '1px solid #e2e4ed',
                      borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(33,17,212,0.10)',
                      zIndex: 20,
                      overflow: 'hidden',
                    }}
                  >
                    {tagSuggestions.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => addTag(t.name)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '0.5rem 1rem',
                          fontFamily: "'Lexend',sans-serif",
                          fontSize: '0.875rem',
                          color: '#0d0d1f',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 100ms',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#f6f6f8')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* File upload */}
              <div>
                <label style={labelStyle}>
                  <Upload size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Attachment{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    (PDF / image, optional)
                  </span>
                </label>
                {!file ? (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '2rem',
                      border: '2px dashed #e2e4ed',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'border-color 200ms',
                      background: '#f8f8fc',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(33,17,212,0.4)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor = '#e2e4ed')
                    }
                  >
                    <Upload size={22} style={{ color: '#8888aa' }} />
                    <span
                      style={{
                        fontFamily: "'Lexend',sans-serif",
                        fontSize: '0.875rem',
                        color: '#8888aa',
                      }}
                    >
                      Click to upload PDF or image
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '0.75rem 1rem',
                      background: uploading ? '#f8f8fc' : 'rgba(33,17,212,0.06)',
                      border: '1px solid',
                      borderColor: uploading ? '#e2e4ed' : 'rgba(33,17,212,0.20)',
                      borderRadius: 10,
                    }}
                  >
                    <Upload size={15} style={{ color: '#2111d4' }} />
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "'Lexend',sans-serif",
                        fontSize: '0.875rem',
                        color: '#0d0d1f',
                      }}
                    >
                      {uploading ? 'Uploading…' : file.name}
                    </span>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => { setFile(null); setFileUrl(null); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8888aa', padding: 0 }}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Options row */}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  paddingTop: '0.5rem',
                }}
              >
                {/* Status toggle */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['published', 'draft'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '0.4rem 0.875rem',
                        borderRadius: 10,
                        border: '1.5px solid',
                        borderColor: form.status === s ? '#2111d4' : '#e2e4ed',
                        background: form.status === s ? 'rgba(33,17,212,0.08)' : 'transparent',
                        color: form.status === s ? '#2111d4' : '#44446a',
                        fontFamily: "'Lexend',sans-serif",
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        transition: 'all 200ms',
                      }}
                    >
                      {s === 'published' ? <Globe size={13} /> : <Lock size={13} />}
                      {s === 'published' ? 'Publish' : 'Save as Draft'}
                    </button>
                  ))}
                </div>

                {/* Anonymous toggle */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontFamily: "'Lexend',sans-serif",
                    fontSize: '0.8125rem',
                    color: '#44446a',
                    fontWeight: 500,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.is_anonymous}
                    onChange={(e) => setForm((f) => ({ ...f, is_anonymous: e.target.checked }))}
                    style={{ accentColor: '#2111d4', width: 16, height: 16 }}
                  />
                  Post anonymously
                </label>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 10, paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || uploading}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting
                    ? 'Publishing…'
                    : form.status === 'draft'
                    ? 'Save Draft'
                    : 'Publish Note'}
                </button>
                <Link href="/" className="btn btn-ghost">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Lexend',sans-serif",
  fontSize: '0.78rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#44446a',
  marginBottom: 6,
};
