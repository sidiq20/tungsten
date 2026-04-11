export interface UserResponse {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  reputation_score: number;
  role: string;
  is_verified: boolean;
  is_banned: boolean;
  privacy_settings: Record<string, unknown> | null;
  profile_metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface TagResponse {
  id: string;
  name: string;
  slug: string;
}

export interface CourseResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  department: string | null;
  created_at: string;
}

export interface PostResponse {
  id: string;
  author_id: string;
  course_id: string | null;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  is_anonymous: boolean;
  file_url: string | null;
  file_type: string | null;
  view_count: number;
  upvotes: number;
  created_at: string;
  updated_at: string;
  course: CourseResponse | null;
  tags: TagResponse[];
  
  // User-specific metadata
  is_bookmarked?: boolean;
  user_vote?: number | null;
}

export interface PaginatedPostResponse {
  total: number;
  page: number;
  limit: number;
  items: PostResponse[];
}

export interface AdminStatsResponse {
  total_users: number;
  total_posts: number;
  total_reports: number;
  total_audit_logs: number;
  system_status: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommentResponse[];
  author?: UserResponse;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string | null;
}

export interface CourseCreate {
  code: string;
  name: string;
  description?: string;
  department?: string;
}

export interface PaginatedCourseResponse {
  total: number;
  page: number;
  limit: number;
  items: CourseResponse[];
}

export interface CourseUpdate {
  code?: string;
  name?: string;
  description?: string;
  department?: string;
}

export interface VoteResponse {
  target_id: string;
  upvotes: number;
  downvotes: number;
  user_vote: number | null;
}

export interface SearchResponse {
  query: string;
  posts: PostResponse[];
  courses: CourseResponse[];
}

export interface PostCreate {
  title: string;
  content: string;
  status?: 'draft' | 'published' | 'archived';
  is_anonymous?: boolean;
  course_id?: string | null;
  tags?: string[];
  file_url?: string | null;
  file_type?: string | null;
}

export interface PostUpdate {
  title?: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived';
  course_id?: string | null;
  is_anonymous?: boolean;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string;
  password?: string;
  privacy_settings?: Record<string, unknown>;
  profile_metadata?: Record<string, unknown>;
}

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface AdminResponse {
  id: string;
  user_id: string;
  permissions_level: number;
  is_active: boolean;
  last_active: string;
  created_at: string;
}

export interface AdminRegistration {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  permissions_level?: number;
}

export interface ReportCreate {
  target_id: string;
  target_type: 'post' | 'comment';
  reason: string;
}

export interface AdminUpdate {
  permissions_level?: number;
  is_active?: boolean;
}

export interface ReportResponse {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: ReportStatus;
  resolved_by_id: string | null;
  resolution_note: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ReportResolve {
  status: ReportStatus;
  resolution_note?: string;
}

export interface AuditLogResponse {
  id: string;
  user_id: string;
  action: string;
  description: string | null;
  metadata_json: any;
  timestamp: string;
}
