import type {
  TokenResponse,
  UserResponse,
  UserUpdate,
  PostCreate,
  PostUpdate,
  PaginatedPostResponse,
  PaginatedCourseResponse,
  PostResponse,
  CourseResponse,
  CourseCreate,
  CourseUpdate,
  TagResponse,
  VoteResponse,
  SearchResponse,
  AdminStatsResponse,
  ReportCreate,
  ReportResponse,
  ReportResolve,
  AuditLogResponse,
  AdminResponse,
  AdminRegistration,
  AdminUpdate,
  CommentResponse,
  CreateCommentInput,
} from './types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const GQL_URL = 
  process.env.NEXT_PUBLIC_GQL_URL || 'http://localhost:3001/graphql';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tungsten_token');
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new ApiError(
      typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail),
      res.status,
    );
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

async function gqlRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = getToken();
  try {
    const res = await fetch(GQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apollo-require-preflight': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'No response body');
      console.error(`GQL HTTP Error [${res.status}] at ${GQL_URL}:`, text);
      throw new ApiError(`GraphQL request failed: ${res.status}`, res.status);
    }

    const body = await res.json();
    if (body.errors) {
      throw new ApiError(body.errors[0].message, res.status);
    }
    return body.data as T;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error(`Network Error: Failed to fetch from ${GQL_URL}. Ensure the NestJS server is running on port 3001 and CORS is allowed.`);
    }
    throw error;
  }
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (username: string, password: string): Promise<TokenResponse> => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new ApiError(
        typeof err.detail === 'string' ? err.detail : 'Login failed',
        res.status,
      );
    }
    return res.json();
  },

  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }): Promise<UserResponse> =>
    request<UserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  me: (): Promise<UserResponse> => request<UserResponse>('/users/me'),

  updateMe: (data: UserUpdate): Promise<UserResponse> =>
    request<UserResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  myBookmarks: (): Promise<PostResponse[]> =>
    request<PostResponse[]>('/users/me/bookmarks'),

  mySubscriptions: (): Promise<CourseResponse[]> =>
    request<CourseResponse[]>('/users/me/subscriptions'),
};

// ─── Posts ───────────────────────────────────────────────────────────────────
export const postsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    course_id?: string;
    tag?: string;
    search?: string;
    post_type?: 'note' | 'question';
    sort_by?: string;
  }): Promise<PaginatedPostResponse> => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.course_id) q.set('course_id', params.course_id);
    if (params?.tag) q.set('tag', params.tag);
    if (params?.search) q.set('search', params.search);
    if (params?.post_type) q.set('post_type', params.post_type);
    if (params?.sort_by) q.set('sort_by', params.sort_by);
    const qs = q.toString();
    return request<PaginatedPostResponse>(`/posts/${qs ? `?${qs}` : ''}`);
  },

  get: (id: string): Promise<PostResponse> =>
    request<PostResponse>(`/posts/${id}`),

  create: (data: PostCreate): Promise<PostResponse> =>
    request<PostResponse>('/posts/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: PostUpdate): Promise<PostResponse> =>
    request<PostResponse>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<null> =>
    request<null>(`/posts/${id}`, { method: 'DELETE' }),

  bookmark: (id: string): Promise<null> =>
    request<null>(`/posts/${id}/bookmark`, { method: 'POST' }),

  unbookmark: (id: string): Promise<null> =>
    request<null>(`/posts/${id}/bookmark`, { method: 'DELETE' }),

  vote: (id: string, value: number): Promise<VoteResponse> =>
    request<VoteResponse>(`/posts/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    }),
};

// ─── Courses ─────────────────────────────────────────────────────────────────
export const coursesApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedCourseResponse> => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return request<PaginatedCourseResponse>(`/courses/${qs ? `?${qs}` : ''}`);
  },

  get: (id: string): Promise<CourseResponse> =>
    request<CourseResponse>(`/courses/${id}`),

  subscribe: (id: string): Promise<null> =>
    request<null>(`/courses/${id}/subscribe`, { method: 'POST' }),

  unsubscribe: (id: string): Promise<null> =>
    request<null>(`/courses/${id}/subscribe`, { method: 'DELETE' }),

  create: (data: CourseCreate): Promise<CourseResponse> =>
    request<CourseResponse>('/courses/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: CourseUpdate): Promise<CourseResponse> =>
    request<CourseResponse>(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<null> =>
    request<null>(`/courses/${id}`, { method: 'DELETE' }),
};

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const tagsApi = {
  list: (): Promise<TagResponse[]> => request<TagResponse[]>('/tags/'),

  search: (q: string): Promise<TagResponse[]> =>
    request<TagResponse[]>(`/tags/search?q=${encodeURIComponent(q)}`),
};

// ─── Search ──────────────────────────────────────────────────────────────────
export const searchApi = {
  global: (q: string): Promise<SearchResponse> =>
    request<SearchResponse>(`/search/?q=${encodeURIComponent(q)}`),
};

// ─── Reports ────────────────────────────────────────────────────────────────
export const reportsApi = {
  create: (data: ReportCreate): Promise<ReportResponse> =>
    request<ReportResponse>('/reports/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Comments (NestJS GraphQL) ──────────────────────────────────────────────
export const commentsApi = {
  listByPost: async (postId: string): Promise<CommentResponse[]> => {
    const query = `
      query CommentsByPost($postId: ID!) {
        commentsByPost(postId: $postId) {
          id
          content
          authorId
          postId
          parentId
          isDeleted
          createdAt
          updatedAt
        }
      }
    `;
    const data = await gqlRequest<{ commentsByPost: CommentResponse[] }>(query, { postId });
    return data.commentsByPost;
  },

  create: async (input: CreateCommentInput): Promise<CommentResponse> => {
    const query = `
      mutation CreateComment($input: CreateCommentInput!) {
        createComment(input: $input) {
          id
          content
          authorId
          postId
          parentId
          createdAt
        }
      }
    `;
    const data = await gqlRequest<{ createComment: CommentResponse }>(query, { input });
    return data.createComment;
  },
};

// ─── Storage ─────────────────────────────────────────────────────────────────
export const storageApi = {
  presignedUrl: (
    filename: string,
    content_type: string,
  ): Promise<{ url: string; public_url: string }> =>
    request('/storage/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ filename, content_type }),
    }),
};

// ─── Admin ──────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: (): Promise<AdminStatsResponse> =>
    request<AdminStatsResponse>('/admins/stats'),

  listUsers: (params?: { skip?: number; limit?: number }): Promise<UserResponse[]> => {
    const q = new URLSearchParams();
    if (params?.skip) q.set('skip', String(params.skip));
    if (params?.limit) q.set('limit', String(params.limit));
    return request<UserResponse[]>(`/admins/users${q.toString() ? `?${q.toString()}` : ''}`);
  },

  banUser: (userId: string): Promise<{ message: string }> =>
    request<{ message: string }>(`/admins/users/${userId}/ban`, { method: 'POST' }),

  unbanUser: (userId: string): Promise<{ message: string }> =>
    request<{ message: string }>(`/admins/users/${userId}/unban`, { method: 'POST' }),

  adjustReputation: (userId: string, amount: number): Promise<UserResponse> =>
    request<UserResponse>(`/admins/users/${userId}/reputation?amount=${amount}`, { method: 'PATCH' }),

  listReports: (params?: { skip?: number; limit?: number }): Promise<ReportResponse[]> => {
    const q = new URLSearchParams();
    if (params?.skip) q.set('skip', String(params.skip));
    if (params?.limit) q.set('limit', String(params.limit));
    return request<ReportResponse[]>(`/admins/reports${q.toString() ? `?${q.toString()}` : ''}`);
  },

  resolveReport: (reportId: string, data: ReportResolve): Promise<ReportResponse> =>
    request<ReportResponse>(`/admins/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteContent: (targetType: string, targetId: string): Promise<null> =>
    request<null>(`/admins/content/${targetType}/${targetId}`, { method: 'DELETE' }),

  listAuditLogs: (params?: { skip?: number; limit?: number }): Promise<AuditLogResponse[]> => {
    const q = new URLSearchParams();
    if (params?.skip) q.set('skip', String(params.skip));
    if (params?.limit) q.set('limit', String(params.limit));
    return request<AuditLogResponse[]>(`/admins/audit-logs${q.toString() ? `?${q.toString()}` : ''}`);
  },

  listAdmins: (params?: { skip?: number; limit?: number }): Promise<AdminResponse[]> => {
    const q = new URLSearchParams();
    if (params?.skip) q.set('skip', String(params.skip));
    if (params?.limit) q.set('limit', String(params.limit));
    return request<AdminResponse[]>(`/admins/${q.toString() ? `?${q.toString()}` : ''}`);
  },

  registerAdmin: (data: AdminRegistration): Promise<AdminResponse> =>
    request<AdminResponse>('/admins/register-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAdmin: (adminId: string, data: AdminUpdate): Promise<AdminResponse> =>
    request<AdminResponse>(`/admins/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAdmin: (adminId: string): Promise<null> =>
    request<null>(`/admins/${adminId}`, { method: 'DELETE' }),
};

export { ApiError };
