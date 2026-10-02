// ---------------------------------------------------------------------------
// Vidcura Educational Content Verification Engine
// Prevents commercial movies, music videos, pop songs, trailers, and pure
// entertainment from being imported or certified, while safeguarding authentic
// educational masterclasses (including music theory and film pedagogy).
// ---------------------------------------------------------------------------

export interface ContentFilterResult {
  blocked: boolean;
  category?: "music" | "movie" | "entertainment";
  reason?: string;
}

// ── Educational Exemption Keywords ──────────────────────────────────────────
// If a title contains these, it indicates intentional pedagogical instruction
// (e.g. music theory, instrument lessons, film analysis, cinematography).
const EDUCATIONAL_EXEMPTIONS = [
  "tutorial",
  "course",
  "lecture",
  "how to",
  "lesson",
  "masterclass",
  "guide",
  "explained",
  "analysis",
  "theory",
  "walkthrough",
  "study",
  "breakdown",
  "curriculum",
  "workshop",
  "deep dive",
  "for beginners",
  "crash course",
  "introduction to",
  "fundamentals",
  "bootcamp",
  "chords",
  "scales",
  "fingerpicking",
  "harmony",
  "counterpoint",
  "sheet music",
  "composition",
  "cinematography",
  "directing",
  "color grading",
  "screenwriting",
  "storyboarding",
  "lighting technique",
  "sound design",
  "video editing",
];

// ── Commercial Music Signatures ─────────────────────────────────────────────
const MUSIC_SIGNATURES = [
  /\b(official\s+music\s+video|official\s+video|official\s+audio)\b/i,
  /\b(lyric\s+video|visualizer|audio\s+track|single\s+track)\b/i,
  /\b(full\s+album|ep\s+album|album\s+stream)\b/i,
  /\b(sped\s+up|slowed\s+\+?\s*reverb|8d\s+audio|bass\s+boosted)\b/i,
  /\b(prod\.\s*by|produced\s+by)\b/i,
  /\b(feat\.?|ft\.?)\s+[a-zA-Z0-9]/i,
];

// Major commercial music record labels and distributor channels
const MUSIC_CHANNELS = [
  "vevo",
  "t-series",
  "sony music",
  "warner music",
  "universal music",
  "zee music company",
  "speed records",
  "atlantic records",
  "def jam",
  "columbia records",
  "interscope",
  "yash raj films music",
  "tips official",
];

// ── Commercial Movie & Entertainment Signatures ─────────────────────────────
const MOVIE_SIGNATURES = [
  /\b(full\s+movie|complete\s+movie|watch\s+full\s+movie)\b/i,
  /\b(official\s+trailer|teaser\s+trailer|final\s+trailer|trailer\s+1|trailer\s+2|main\s+trailer)\b/i,
  /\b(movie\s+clip|best\s+movie\s+scene|post\s+credits\s+scene|scene\s+4k|movie\s+scene)\b/i,
  /\b(box\s+office|hindi\s+dubbed\s+movie|tamil\s+full\s+movie|telugu\s+full\s+movie|blockbuster\s+movie)\b/i,
];

// Pure entertainment and non-educational meme formats
const ENTERTAINMENT_SIGNATURES = [
  /\b(try\s+not\s+to\s+laugh|prank\s+video|funny\s+moments|roast\s+video|tiktok\s+compilation)\b/i,
  /\b(reacting\s+to|reaction\s+video)\b/i,
];

// Major movie studio and streaming channels
const MOVIE_CHANNELS = [
  "marvel entertainment",
  "paramount pictures",
  "walt disney studios",
  "universal pictures",
  "warner bros. pictures",
  "20th century studios",
  "sony pictures entertainment",
  "netflix",
  "lionsgate",
  "hbo",
];

/**
 * Checks whether content (video or playlist title/channel) qualifies as academic/educational
 * or should be blocked as commercial entertainment, movie, or song.
 */
export function validateEducationalContent(
  title: string,
  authorOrChannel?: string
): ContentFilterResult {
  const cleanTitle = (title || "").trim();
  const cleanAuthor = (authorOrChannel || "").trim().toLowerCase();
  const lowerTitle = cleanTitle.toLowerCase();

  if (!cleanTitle) {
    return { blocked: false };
  }

  // 1. Check for genuine educational exemptions
  const hasPedagogicalIntent = EDUCATIONAL_EXEMPTIONS.some((term) => lowerTitle.includes(term));

  // If title has clear academic intent (e.g. "Music Theory 101" or "Film Analysis: Dune"), permit it
  if (hasPedagogicalIntent) {
    return { blocked: false };
  }

  // 2. Check commercial music channel
  if (cleanAuthor && MUSIC_CHANNELS.some((ch) => cleanAuthor.includes(ch))) {
    return {
      blocked: true,
      category: "music",
      reason:
        "Commercial music tracks and record label releases cannot be imported. Vidcura is dedicated exclusively to academic lectures and technical masterclasses.",
    };
  }

  // 3. Check commercial movie studio channel
  if (cleanAuthor && MOVIE_CHANNELS.some((ch) => cleanAuthor.includes(ch))) {
    return {
      blocked: true,
      category: "movie",
      reason:
        "Commercial studio films, trailers, and entertainment clips cannot be imported. Vidcura is dedicated exclusively to academic curricula and verified coursework.",
    };
  }

  // 4. Check music signatures
  for (const pattern of MUSIC_SIGNATURES) {
    if (pattern.test(cleanTitle)) {
      return {
        blocked: true,
        category: "music",
        reason:
          "Commercial music videos and audio tracks cannot be imported. Vidcura is dedicated exclusively to academic lectures and technical masterclasses.",
      };
    }
  }

  // 5. Check movie signatures
  for (const pattern of MOVIE_SIGNATURES) {
    if (pattern.test(cleanTitle)) {
      return {
        blocked: true,
        category: "movie",
        reason:
          "Commercial movies, trailers, and film clips cannot be imported. Vidcura is dedicated exclusively to academic curricula and verified coursework.",
      };
    }
  }

  // 6. Check entertainment/meme signatures
  for (const pattern of ENTERTAINMENT_SIGNATURES) {
    if (pattern.test(cleanTitle)) {
      return {
        blocked: true,
        category: "entertainment",
        reason:
          "Entertainment streams, reaction videos, and memes cannot be imported. Vidcura is dedicated exclusively to structured academic masterclasses.",
      };
    }
  }

  return { blocked: false };
}
