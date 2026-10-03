// ---------------------------------------------------------------------------
// VeySkill Educational Content Verification Engine
// Strictly enforces academic and educational integrity across courses and videos.
// Automatically detects and blocks commercial movies, music tracks, pop songs,
// trailers, teasers, film clips, entertainment streams, pranks, and memes,
// while safeguarding authentic pedagogical masterclasses and coursework.
// ---------------------------------------------------------------------------

export interface ContentFilterResult {
  blocked: boolean;
  category?: "music" | "movie" | "entertainment";
  reason?: string;
}

// ── Educational Exemption Keywords ──────────────────────────────────────────
// Genuine pedagogical terms indicating intentional academic instruction
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
  "training",
  "certification",
  "syllabus",
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
  "programming",
  "coding",
  "software engineering",
  "computer science",
  "data science",
  "machine learning",
  "artificial intelligence",
  "web development",
  "mathematics",
  "physics",
  "chemistry",
  "biology",
  "history",
  "economics",
  "finance",
  "accounting",
  "psychology",
  "philosophy",
  "grammar",
  "vocabulary",
];

// ── Commercial Music Signatures ─────────────────────────────────────────────
const MUSIC_SIGNATURES = [
  /\b(official\s+music\s+video|official\s+video|official\s+audio)\b/i,
  /\b(lyric\s+video|visualizer|audio\s+track|single\s+track|video\s+song|audio\s+song)\b/i,
  /\b(full\s+song|new\s+song|hit\s+song|item\s+song|love\s+song|sad\s+song|dj\s+song)\b/i,
  /\b(full\s+album|ep\s+album|album\s+stream|album\s+release|discography)\b/i,
  /\b(sped\s+up|slowed\s+\+?\s*reverb|8d\s+audio|bass\s+boosted|nightcore)\b/i,
  /\b(prod\.\s*by|produced\s+by)\b/i,
  /\b(feat\.?|ft\.?)\s+[a-zA-Z0-9]/i,
  /\b(jukebox|all\s+songs|mashup|mega\s+mix|dj\s+remix|remix\s+song|club\s+mix)\b/i,
  /\b(original\s+soundtrack|soundtrack\s+ost|\bost\b|bgm\s+ringtone|background\s+score)\b/i,
  /\b(karaoke\s+version|karaoke\s+track|instrumental\s+track|type\s+beat|rap\s+beat)\b/i,
  /\b(live\s+in\s+concert|live\s+performance|acoustic\s+session|unplugged\s+version)\b/i,
  /\b(lo-?fi\s+beats|lofi\s+hip\s+hop|chill\s+beats\s+to|beats\s+to\s+relax|study\s+beats)\b/i,
  /\b(music\s+video|\bmv\b|lyrical\s+video|title\s+track)\b/i,
  /\b(song\s+teaser|theme\s+song|punjabi\s+song|hindi\s+song|tamil\s+song|telugu\s+song)\b/i,
  /\b(party\s+songs?|pop\s+songs?|love\s+songs?|dance\s+songs?)\b/i,
];

// Record labels, distributor channels and keywords in channel name
const MUSIC_CHANNEL_KEYWORDS = [
  "vevo",
  "music",
  "records",
  "t-series",
  "sony music",
  "warner music",
  "universal music",
  "zee music",
  "speed records",
  "atlantic records",
  "def jam",
  "columbia records",
  "interscope",
  "yash raj films music",
  "tips official",
  "saregama",
  "geet mp3",
  "desi music factory",
  "spinnin",
  "monstercat",
  "ultra records",
  "sub pop",
  "soundtrack",
  "audio library",
  "recordings",
  "record label",
  "tseries",
];

// ── Commercial Movie, Film & TV Signatures ─────────────────────────────────
const MOVIE_SIGNATURES = [
  /\b(full\s+movie|complete\s+movie|watch\s+full\s+movie|full\s+film|cinema\s+full)\b/i,
  /\b(official\s+trailer|teaser\s+trailer|final\s+trailer|trailer\s+\d+|main\s+trailer|first\s+trailer)\b/i,
  /\b(movie\s+clip|best\s+movie\s+scene|post\s+credits|movie\s+scene|action\s+scene|climax\s+scene)\b/i,
  /\b(scene\s+(?:4k|1080p|hd)|(?:4k|1080p|hd)\s+scene|robbery\s+scene|fight\s+scene|death\s+scene|final\s+scene|chase\s+scene)\b/i,
  /\b(deleted\s+scene|bloopers|behind\s+the\s+scenes|making\s+of\s+the\s+movie|film\s+clip)\b/i,
  /\b(box\s+office|hindi\s+dubbed|tamil\s+full\s+movie|telugu\s+full\s+movie|blockbuster\s+movie)\b/i,
  /\b(kannada\s+movie|malayalam\s+movie|punjabi\s+movie|south\s+movie|hollywood\s+movie|bollywood\s+movie)\b/i,
  /\b(theatrical\s+trailer|motion\s+poster|glimpse|first\s+look|sneak\s+peek|sneak\s+preview)\b/i,
  /\b(web\s+series|tv\s+serial|season\s+\d+\s+episode|episode\s+\d+|tv\s+show\s+episode)\b/i,
  /\b(movie\s+review|box\s+office\s+collection|film\s+premiere|ott\s+release)\b/i,
  /\b(action\s+movie|horror\s+movie|comedy\s+movie|romantic\s+movie|thriller\s+movie)\b/i,
];

// Major movie studio and streaming channels
const MOVIE_CHANNEL_KEYWORDS = [
  "marvel entertainment",
  "paramount pictures",
  "walt disney studios",
  "universal pictures",
  "warner bros",
  "20th century studios",
  "sony pictures",
  "netflix",
  "lionsgate",
  "hbo",
  "prime video",
  "hulu",
  "hotstar",
  "film companion",
  "cinema",
  "pictures",
  "studios",
  "entertainment",
  "films",
  "movieclips",
];

// ── Pure Entertainment, Memes, Gaming & Non-Educational Signatures ──────────
const ENTERTAINMENT_SIGNATURES = [
  /\b(try\s+not\s+to\s+laugh|prank\s+video|pranking|funny\s+moments|roast\s+video|roasting)\b/i,
  /\b(tiktok\s+compilation|meme\s+compilation|funny\s+compilation|fail\s+compilation)\b/i,
  /\b(reacting\s+to|reaction\s+video|first\s+time\s+hearing|first\s+time\s+watching)\b/i,
  /\b(stand[\s-]?up\s+comedy|comedy\s+special|comedy\s+show|comedy\s+club|kapil\s+sharma|comedy\s+skit)\b/i,
  /\b(daily\s+vlog|family\s+vlog|travel\s+vlog|couples\s+vlog|my\s+routine\s+vlog)\b/i,
  /\b(unboxing\s+iphone|unboxing\s+mystery|spending\s+\$\d+|bought\s+everything|challenge\s+video)\b/i,
  /\b(gameplay\s+walkthrough|gameplay|let's\s+play\s+part|gaming\s+stream|twitch\s+stream\s+highlights)\b/i,
  /\b(gta\s+(?:v|5)\s+gameplay|minecraft\s+hardcore|free\s+fire\s+gameplay|pubg\s+mobile\s+gameplay|roblox\s+gameplay)\b/i,
];

// Recognized educational channel whitelist
const ACADEMIC_CHANNEL_EXEMPTIONS = [
  "mit",
  "harvard",
  "stanford",
  "yale",
  "oxford",
  "cambridge",
  "crashcourse",
  "khan academy",
  "freecodecamp",
  "coursera",
  "edureka",
  "simplilearn",
  "traversy media",
  "fireship",
  "academics",
  "university",
  "college",
  "ted-ed",
  "veritasium",
  "3blue1brown",
  "kurzgesagt",
  "geeksforgeeks",
  "edx",
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

  // 1. Recognized university or verified educational publisher exemption
  const isAcademicPublisher =
    cleanAuthor && ACADEMIC_CHANNEL_EXEMPTIONS.some((ch) => cleanAuthor.includes(ch));
  if (isAcademicPublisher) {
    return { blocked: false };
  }

  // 2. Strict non-exemptible entertainment markers
  const isGamingOrPrank = /\b(gameplay|let's\s+play|gaming|prank|roast|funny\s+moments)\b/i.test(
    cleanTitle
  );
  const isExplicitTrailer =
    /\b(official\s+trailer|teaser\s+trailer|final\s+trailer|trailer\s+\d+|teaser)\b/i.test(
      cleanTitle
    );
  const isMovieScene =
    /\b(movie\s+scene|film\s+scene|robbery\s+scene|fight\s+scene|action\s+scene|climax\s+scene|death\s+scene|final\s+scene|chase\s+scene|scene\s+4k|4k\s+scene)\b/i.test(
      cleanTitle
    );

  // 3. Check commercial music channel keywords FIRST (Labels can never be courses)
  if (cleanAuthor && MUSIC_CHANNEL_KEYWORDS.some((kw) => cleanAuthor.includes(kw))) {
    return {
      blocked: true,
      category: "music",
      reason:
        "Commercial music tracks and record label releases cannot be imported. VeySkill is dedicated exclusively to academic lectures and technical masterclasses.",
    };
  }

  // 4. Check commercial movie studio channel keywords FIRST
  if (cleanAuthor && MOVIE_CHANNEL_KEYWORDS.some((kw) => cleanAuthor.includes(kw))) {
    return {
      blocked: true,
      category: "movie",
      reason:
        "Commercial studio films, trailers, and entertainment clips cannot be imported. VeySkill is dedicated exclusively to academic curricula and verified coursework.",
    };
  }

  // 5. Check music signatures in title FIRST
  for (const pattern of MUSIC_SIGNATURES) {
    if (pattern.test(cleanTitle)) {
      return {
        blocked: true,
        category: "music",
        reason:
          "Commercial music videos and audio tracks cannot be imported. VeySkill is dedicated exclusively to academic lectures and technical masterclasses.",
      };
    }
  }

  // 6. Check movie signatures in title FIRST
  for (const pattern of MOVIE_SIGNATURES) {
    if (pattern.test(cleanTitle)) {
      return {
        blocked: true,
        category: "movie",
        reason:
          "Commercial movies, trailers, and film clips cannot be imported. VeySkill is dedicated exclusively to academic curricula and verified coursework.",
      };
    }
  }

  // 7. Check entertainment/meme/gaming signatures in title FIRST
  for (const pattern of ENTERTAINMENT_SIGNATURES) {
    if (pattern.test(cleanTitle)) {
      return {
        blocked: true,
        category: "entertainment",
        reason:
          "Entertainment streams, reaction videos, and memes cannot be imported. VeySkill is dedicated exclusively to structured academic masterclasses.",
      };
    }
  }

  // 8. If non-exemptible markers matched, block
  if (isGamingOrPrank) {
    return {
      blocked: true,
      category: "entertainment",
      reason:
        "Video gameplay walkthroughs and pranks are not permitted. Only educational coursework is allowed.",
    };
  }
  if (isExplicitTrailer || isMovieScene) {
    return {
      blocked: true,
      category: "movie",
      reason:
        "Movie trailers and film scenes are not permitted. Only educational coursework is allowed.",
    };
  }

  // 9. Educational intent check for general titles
  const hasPedagogicalIntent = EDUCATIONAL_EXEMPTIONS.some((term) => lowerTitle.includes(term));
  if (hasPedagogicalIntent) {
    return { blocked: false };
  }

  return { blocked: false };
}

export interface PlaylistValidationResult {
  valid: boolean;
  reason?: string;
  offendingVideoIndex?: number;
  offendingVideoTitle?: string;
}

/**
 * Strict Educational Playlist Validator.
 * Zero-tolerance verification for playlists:
 * 1. Rejects if channel is a record label or film studio.
 * 2. Rejects if playlist title contains entertainment/movie/music keywords.
 * 3. Rejects if ANY video in the playlist is detected as non-educational.
 * 4. Requires affirmative educational/academic intent.
 */
export function validatePlaylistEducation(
  playlistTitle: string,
  channelName: string = "",
  videos: Array<{ title: string; videoId?: string }> = []
): PlaylistValidationResult {
  const cleanTitle = (playlistTitle || "").trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const cleanChannel = (channelName || "").trim().toLowerCase();

  // 1. Check playlist publisher/channel
  if (cleanChannel && MUSIC_CHANNEL_KEYWORDS.some((kw) => cleanChannel.includes(kw))) {
    return {
      valid: false,
      reason:
        "Playlist rejected: Hosted by a commercial music label or music artist. VeySkill is exclusively an educational and certification platform.",
    };
  }

  if (cleanChannel && MOVIE_CHANNEL_KEYWORDS.some((kw) => cleanChannel.includes(kw))) {
    return {
      valid: false,
      reason:
        "Playlist rejected: Hosted by a movie studio or commercial entertainment channel. VeySkill is exclusively an educational and certification platform.",
    };
  }

  // 2. Check playlist title for explicit non-educational intent
  const playlistTitleRejections = [
    /\b(songs?|tracks?|singles?|album|discography|jukebox|hits|soundtrack|\bost\b|bgm|remix|dj\s+mix|party\s+songs|bollywood\s+songs|punjabi\s+songs|lofi\s+beats)\b/i,
    /\b(movies?|films?|cinema|trailers?|teasers?|movie\s+scenes?|film\s+clips?|climax|fight\s+scene|web\s+series|tv\s+serial|season\s+\d+|episodes?|kdrama|k-drama)\b/i,
    /\b(pranks?|roasts?|funny\s+videos?|comedy\s+shows?|stand[\s-]?up|memes?|fails?|vlogs?|gameplay|lets\s+play|gaming)\b/i,
  ];

  for (const pattern of playlistTitleRejections) {
    if (pattern.test(cleanTitle)) {
      // Check if it's an authentic academic topic
      const isAcademicCourse = [
        "music theory",
        "music production",
        "sound engineering",
        "composition",
        "film directing",
        "screenwriting",
        "cinematography",
        "video editing",
        "film history",
      ].some((term) => lowerTitle.includes(term));

      if (!isAcademicCourse) {
        return {
          valid: false,
          reason: `Playlist title ("${cleanTitle}") is identified as commercial entertainment, movie, or music. Only educational courses and masterclasses are permitted on VeySkill.`,
        };
      }
    }
  }

  // 3. Strict verification of EVERY video in the playlist: ZERO tolerance
  if (videos.length === 0) {
    return {
      valid: false,
      reason: "Playlist contains no playable videos to verify.",
    };
  }

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i]!;
    const filter = validateEducationalContent(v.title, channelName);
    if (filter.blocked) {
      return {
        valid: false,
        reason: `Playlist rejected: Item ${i + 1} ("${v.title}") was flagged as ${filter.category || "non-educational"}. VeySkill strictly rejects playlists containing commercial movies, music, or entertainment.`,
        offendingVideoIndex: i,
        offendingVideoTitle: v.title,
      };
    }
  }

  // 4. Affirmative Educational Integrity
  const hasEducationalPlaylistTitle = EDUCATIONAL_EXEMPTIONS.some((term) =>
    lowerTitle.includes(term)
  );

  const educationalVideoCount = videos.filter((v) =>
    EDUCATIONAL_EXEMPTIONS.some((term) => v.title.toLowerCase().includes(term))
  ).length;

  const hasEducationalVideos = educationalVideoCount > 0;

  if (!hasEducationalPlaylistTitle && !hasEducationalVideos) {
    return {
      valid: false,
      reason:
        "Playlist rejected: Could not verify educational or instructional intent. VeySkill is exclusively an educational and certification platform.",
    };
  }

  return { valid: true };
}

export interface CourseValidationResult {
  valid: boolean;
  reason?: string;
  offendingLessonIndex?: number;
}

/**
 * Strict Course Integrity Validator for Course Publishing.
 * Validates course title, description, and every single lesson in the curriculum.
 * Guarantees that only authentic courses and educational material can be published.
 */
export function validateCourseEducation(course: {
  title: string;
  description?: string;
  lessons: Array<{ title: string }>;
}): CourseValidationResult {
  const { title, description = "", lessons } = course;
  const cleanTitle = title.trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const lowerDesc = description.trim().toLowerCase();

  // 1. Verify Course Title is not a movie, music, or entertainment title
  const titleFilter = validateEducationalContent(cleanTitle);
  if (titleFilter.blocked) {
    return {
      valid: false,
      reason: `Course title rejected: ${titleFilter.reason}`,
    };
  }

  // 2. Check if course title or description contains non-educational marketing keywords
  const titleEntertainmentPatterns = [
    /\b(movie|movies|film|films|cinema|trailer|trailers|teaser)\b/i,
    /\b(song|songs|track|tracks|music\s+video|album|remix|dj\s+mix)\b/i,
    /\b(prank|pranks|roast|gaming|gameplay|funny\s+video|comedy\s+show)\b/i,
  ];

  for (const pattern of titleEntertainmentPatterns) {
    const isExempt = [
      "film directing",
      "film history",
      "music theory",
      "music production",
      "sound engineering",
      "screenwriting",
      "cinematography",
    ].some((term) => lowerTitle.includes(term) || lowerDesc.includes(term));

    if (!isExempt && pattern.test(cleanTitle)) {
      return {
        valid: false,
        reason:
          "Course title cannot be about commercial movies, music videos, or entertainment. Only authentic academic courses and educational masterclasses are allowed on VeySkill.",
      };
    }
  }

  // 3. Validate every single lesson title in the curriculum: ZERO tolerance
  if (lessons.length === 0) {
    return {
      valid: false,
      reason: "Please add at least one lesson before publishing.",
    };
  }

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]!;
    const filter = validateEducationalContent(lesson.title);
    if (filter.blocked) {
      return {
        valid: false,
        reason: `Lesson ${i + 1} ("${lesson.title}") was flagged as non-educational (${filter.category || "entertainment"}). VeySkill strictly permits academic lectures and technical coursework only.`,
        offendingLessonIndex: i,
      };
    }
  }

  // 4. Positive Educational Intent Verification
  // The course must contain at least one pedagogical, technical, or academic indicator in title, description, or lessons
  const hasAcademicInTitleOrDesc = EDUCATIONAL_EXEMPTIONS.some(
    (term) => lowerTitle.includes(term) || lowerDesc.includes(term)
  );

  const hasAcademicInLessons = lessons.some((l) =>
    EDUCATIONAL_EXEMPTIONS.some((term) => l.title.toLowerCase().includes(term))
  );

  if (!hasAcademicInTitleOrDesc && !hasAcademicInLessons) {
    return {
      valid: false,
      reason:
        "Course rejected: Please provide a descriptive educational course title (e.g., 'Introduction to Python', 'Calculus Masterclass', 'World History Overview') or include instructional lecture modules. Only authentic educational courses can be published.",
    };
  }

  return { valid: true };
}
