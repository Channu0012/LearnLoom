// ---------------------------------------------------------------------------
// Shared constants — single source of truth for the entire app
// ---------------------------------------------------------------------------

/** Fixed category list for backwards-compatible database storage */
export const CATEGORIES = [
  "Programming",
  "Design",
  "Exam preparation",
  "Business and finance",
  "Languages",
  "Science and maths",
  "Music and arts",
  "Health and fitness",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Open educational topic suggestions for dynamic discovery and fast search */
export const POPULAR_TOPICS = [
  "Computer Science",
  "Artificial Intelligence",
  "Web Development",
  "Mathematics",
  "Physics",
  "Design & 3D",
  "Business & Finance",
  "Languages",
  "Music Theory",
  "Philosophy & History",
  "Engineering",
  "Data Science",
] as const;

/** Course publish statuses */
export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];

/** Firestore collection names */
export const COLLECTIONS = {
  USERS: "users",
  COURSES: "courses",
  LESSONS: "lessons",
  PROGRESS: "progress",
  REPORTS: "reports",
  QUIZ_RESULTS: "quizResults",
  CERTIFICATES: "certificates",
  PAYMENTS: "payments",
} as const;

/** Report statuses */
export const REPORT_STATUS = {
  OPEN: "open",
  REVIEWED: "reviewed",
  DISMISSED: "dismissed",
} as const;

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

/** Pagination */
export const PAGE_SIZE = 12;

/** Keyword generation limits */
export const MAX_KEYWORDS = 100;
export const MAX_QUERY_TERMS = 10;

/** Field length limits (also enforced in Firestore rules) */
export const LIMITS = {
  COURSE_TITLE: 120,
  COURSE_DESCRIPTION: 2000,
  LESSON_TITLE: 200,
  REPORT_REASON: 1000,
  DISPLAY_NAME: 100,
} as const;

/** YouTube URL regex patterns for extracting video IDs */
export const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
] as const;

/** Extract YouTube video ID from any supported URL format */
export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  // Direct 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Extract YouTube Playlist ID from URL or raw ID */
export function extractYouTubePlaylistId(url: string): string | null {
  const trimmed = url.trim();
  // Direct playlist ID format (e.g. PL..., UU..., FL..., RD...)
  if (/^[a-zA-Z0-9_-]{10,64}$/.test(trimmed) && !trimmed.includes(".")) {
    return trimmed;
  }
  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match?.[1]) return match[1];
  return null;
}

/** Build YouTube thumbnail URL */
export function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** Build oEmbed URL for fetching video title */
export function youtubeOEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
}

/**
 * Common English stopwords — removed during keyword generation.
 * Keep short; we want common words that add no search value.
 */
export const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "it",
  "its",
  "be",
  "are",
  "was",
  "were",
  "been",
  "has",
  "have",
  "had",
  "do",
  "does",
  "did",
  "not",
  "no",
  "nor",
  "so",
  "yet",
  "both",
  "either",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "my",
  "your",
  "his",
  "her",
  "our",
  "their",
  "what",
  "which",
  "who",
  "how",
  "when",
  "where",
  "why",
  "all",
  "any",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "own",
  "same",
  "than",
  "too",
  "very",
  "can",
  "will",
  "just",
  "as",
  "if",
  "up",
  "out",
  "about",
  "into",
  "through",
  "after",
  "before",
]);
