// ---------------------------------------------------------------------------
// Shared TypeScript types for Firestore documents
// All fields mirror the Firestore data model exactly.
// ---------------------------------------------------------------------------
import type { Timestamp } from "firebase/firestore";
import type { Category, CourseStatus, ReportStatus } from "./constants";

// ── User document: users/{uid} ──────────────────────────────────────────────
export interface UserDoc {
  uid: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp | null;
  isAdmin: boolean; // only settable manually in the console
  // Doubt Solve — Helper Score & Plus Membership
  helperScore?: number;
  doubtsPosted?: number;
  doubtsAnswered?: number;
  studentsHelped?: number;
  isPlusMember?: boolean;
  plusExpiresAt?: Timestamp | null;
  // Arena 1v1 Battle stats & rankings
  xp?: number;
  battlesPlayed?: number;
  battlesWon?: number;
  battleStreak?: number;
  campus?: string;
}

// ── Course document: courses/{courseId} ────────────────────────────────────
export interface CourseDoc {
  id: string; // populated client-side from doc.id
  title: string;
  description: string;
  category: Category;
  creatorId: string;
  creatorName: string;
  channelTitle?: string | null; // The authentic YouTube instructor / channel owner
  channelUrl?: string | null; // Link to original YouTube channel
  channelAvatarUrl?: string | null; // Channel profile avatar
  status: CourseStatus;
  lessonCount: number;
  coverVideoId: string | null; // first lesson's YouTube ID
  coverThumbnailUrl?: string | null;
  keywords: string[]; // auto-generated on publish/update
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}

// Plain serializable representation for passing across Next.js Server-Client boundaries
export interface SerializedCourseDoc {
  id: string;
  title: string;
  description: string;
  category: Category;
  creatorId: string;
  creatorName: string;
  channelTitle?: string | null;
  channelUrl?: string | null;
  channelAvatarUrl?: string | null;
  status: CourseStatus;
  lessonCount: number;
  coverVideoId: string | null;
  coverThumbnailUrl?: string | null;
  keywords: string[];
  createdAt?: number | null;
  updatedAt?: number | null;
  publishedAt?: number | null;
}

// ── Lesson document: courses/{courseId}/lessons/{lessonId} ─────────────────
export interface LessonDoc {
  id: string; // populated client-side from doc.id
  youtubeId: string;
  title: string;
  order: number; // 0-indexed
  thumbnailUrl: string;
}

// ── Progress document: users/{uid}/progress/{courseId} ────────────────────
export interface ProgressDoc {
  courseId: string;
  completedLessonIds: string[];
  exemptLessonIds?: string[];
  lastLessonId: string | null;
  quizScores?: Record<string, { score: number; total: number }>;
  certificateIssued?: boolean;
  certificateId?: string;
  hasPaidCertificate?: boolean;
  paidOrderId?: string;
  started?: boolean;
  updatedAt: Timestamp;
}

// ── Doubt document: doubts/{doubtId} ──────────────────────────────────────
export interface DoubtDoc {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  text: string;
  status: "open" | "solved";
  answerCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  solvedAnswerId?: string;
}

// ── Answer document: doubts/{doubtId}/answers/{answerId} ──────────────────
export interface AnswerDoc {
  id: string;
  doubtId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  text: string;
  upvotes: number;
  upvotedBy: string[];
  isSolution: boolean;
  createdAt: Timestamp;
}

// ── Report document: reports/{reportId} ────────────────────────────────────
export interface ReportDoc {
  id: string;
  courseId: string;
  reporterId: string;
  reason: string;
  createdAt: Timestamp;
  status: ReportStatus;
}

// ── Client-side form types (no Timestamp, easier to work with) ─────────────
export interface CourseDraft {
  title: string;
  description: string;
  category: Category | "";
}

export interface LessonInput {
  /** temporary client-only ID for keying lists before save */
  tempId: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
}

// ── oEmbed response shape ──────────────────────────────────────────────────
export interface OEmbedResponse {
  title: string;
  author_name: string;
  author_url?: string;
  thumbnail_url: string;
  provider_name: string;
}
