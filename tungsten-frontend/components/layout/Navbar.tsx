'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Search,
  PenSquare,
  BookOpen,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  }

  const navLinks = [
    { href: '/', label: 'Feed' },
    { href: '/courses', label: 'Courses' },
  ];

  return (
    <nav className="navbar">
      <div
        className="container-page h-full flex items-center justify-between gap-4"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 scale-105 transition-transform active:scale-95">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2111d4 0%, #4a3aff 100%)',
              color: '#fff',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: '1.125rem',
              letterSpacing: '-0.02em',
              boxShadow: '0 4px 12px rgba(33, 17, 212, 0.25)'
            }}
          >
            T
          </div>
          <span
            style={{
              fontFamily: "'Lexend', sans-serif",
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.03em',
              color: '#0d0d1f',
            }}
          >
            Tungsten
            <span style={{ color: '#2111d4', opacity: 0.9 }}>Learn</span>
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "'Lexend', sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 12,
                transition: 'all 280ms cubic-bezier(0.22,1,0.36,1)',
                color: isActive(l.href) ? '#2111d4' : '#44446a',
                background: isActive(l.href)
                  ? 'rgba(33,17,212,0.06)'
                  : 'transparent',
              }}
              className="hover:translate-y-[-1px]"
              onMouseEnter={(e) => {
                if (!isActive(l.href)) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(33,17,212,0.04)';
                  (e.currentTarget as HTMLElement).style.color = '#2111d4';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(l.href)) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#44446a';
                }
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form
              onSubmit={handleSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                border: '1.5px solid #2111d4',
                borderRadius: 12,
                overflow: 'hidden',
                width: 260,
              }}
            >
              <Search
                size={15}
                style={{ marginLeft: 10, color: '#8888aa', flexShrink: 0 }}
              />
              <input
                ref={searchRef}
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search notes, courses…"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '0.5rem 0.5rem',
                  fontFamily: "'Lexend', sans-serif",
                  fontSize: '0.875rem',
                  color: '#0d0d1f',
                  background: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{
                  padding: '0.5rem 0.625rem',
                  color: '#8888aa',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            </form>
          ) : (
            <button
              className="btn-icon btn btn-ghost"
              onClick={() => setSearchOpen(true)}
              title="Search"
            >
              <Search size={17} />
            </button>
          )}

          {user ? (
            <>
              {/* Create note */}
              <Link href="/posts/new" className="btn btn-primary btn-sm hidden md:inline-flex">
                <PenSquare size={15} />
                New Note
              </Link>

              {/* Profile menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(33,17,212,0.04)',
                    borderRadius: 14,
                    padding: '0.45rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'all 280ms cubic-bezier(0.22,1,0.36,1)',
                    border: 'none',
                  }}
                  className="hover:bg-primary-10"
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: '#2111d4',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Lexend',sans-serif",
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                    }}
                  >
                    {(user.full_name || user.username)[0].toUpperCase()}
                  </div>
                  <span
                    className="hidden lg:block"
                    style={{
                      fontFamily: "'Lexend',sans-serif",
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#0d0d1f',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {user.full_name || user.username}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{ color: '#8888aa', flexShrink: 0 }}
                  />
                </button>

                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: '#fff',
                      border: '1px solid #e2e4ed',
                      borderRadius: 14,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
                      minWidth: 180,
                      overflow: 'hidden',
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem 0.5rem',
                        borderBottom: '1px solid #f0f0f5',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Lexend',sans-serif",
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: '#0d0d1f',
                        }}
                      >
                        {user.full_name || user.username}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Lexend',sans-serif",
                          fontSize: '0.75rem',
                          color: '#8888aa',
                        }}
                      >
                        {user.reputation_score} rep
                      </p>
                    </div>
                    {[
                      { href: '/profile', icon: <User size={14} />, label: 'Profile' },
                      { href: '/courses', icon: <BookOpen size={14} />, label: 'My Courses' },
                      ...(user.role === 'admin'
                        ? [
                            {
                              href: '/admin',
                              icon: <ShieldCheck size={14} />,
                              label: 'Admin Dashboard',
                            },
                          ]
                        : []),
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '0.625rem 1rem',
                          fontFamily: "'Lexend',sans-serif",
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#44446a',
                          textDecoration: 'none',
                          transition: 'background 150ms',
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            '#f6f6f8')
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            'transparent')
                        }
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '0.625rem 1rem',
                        fontFamily: "'Lexend',sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#e11d48',
                        background: 'transparent',
                        border: 'none',
                        borderTop: '1px solid #f0f0f5',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          'rgba(225,29,72,0.05)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          'transparent')
                      }
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
