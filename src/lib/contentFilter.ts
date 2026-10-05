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

// ── Educational Exemption Patterns ───────────────────────────────────────────
// Genuine pedagogical terms indicating intentional academic instruction with strict word boundaries
const EDUCATIONAL_PATTERNS = [
  /\b(tutorial|tutorials|course|courses|lecture|lectures|lesson|lessons|masterclass|bootcamp|curriculum|syllabus|workshop)\b/i,
  /\b(crash\s+course|full\s+course|complete\s+course|deep\s+dive|for\s+beginners|fundamentals|introduction\s+to|step\s+by\s+step)\b/i,
  /\b(how\s+to\s+[a-z]+|learn\s+[a-z]+\s+(?:programming|development|coding|from\s+scratch|basics|fast)|learn\s+to\s+code)\b/i,
  /\b(architecture|design\s+patterns|clean\s+code|system\s+design|best\s+practices|interview\s+prep|study\s+guide|study\s+plan)\b/i,
  /\b(programming|coding|software\s+engineering|computer\s+science|data\s+science|machine\s+learning|artificial\s+intelligence)\b/i,
  /\b(web\s+development|full\s+stack|frontend|backend|devops|cloud\s+computing|cybersecurity|ethical\s+hacking|algorithms|data\s+structures|\bdsa\b)\b/i,
  /\b(python|javascript|typescript|react|next\.?js|node\.?js|c\+\+|\bgolang\b|\brust\s+(?:programming|language|course|tutorial)\b|\bjava\s+(?:programming|course|tutorial|lecture)\b|\bcore\s+java\b|\bsql\s+(?:database|course|tutorial|queries)\b|\bgit\b|\bgithub\b|\bfigma\b|ui\/ux)\b/i,
  /\b(mathematics|calculus|algebra|physics|chemistry|biology|economics|finance|accounting|psychology|philosophy|grammar)\b/i,
  /\b(music\s+theory|sound\s+design|audio\s+production|cinematography|screenwriting|storyboarding|lighting\s+technique|video\s+editing|film\s+analysis|directing|visual\s+storytelling)\b/i,
  /\b(analysis|theory|breakdown)\b/i,
  /\b(chords?\s+and\s+scales|piano\s+tutorial|guitar\s+lesson|drum\s+lesson|vocal\s+exercises?)\b/i,
];

export function hasEducationalKeyword(text: string): boolean {
  if (!text) return false;
  return EDUCATIONAL_PATTERNS.some((p) => p.test(text));
}

// ── Commercial Music Signatures ─────────────────────────────────────────────
const MUSIC_SIGNATURES = [
  /\b(official\s+music\s+video|official\s+video|official\s+audio)\b/i,
  /[\[\(](?:official\s+music\s+video|official\s+video|official\s+audio|lyric\s+video|visualizer|audio|official)[\]\)]/i,
  /\b(lyric\s+video|visualizer|audio\s+tracks?|single\s+tracks?|video\s+songs?|audio\s+songs?)\b/i,
  /\b(full\s+songs?|new\s+songs?|hit\s+songs?|item\s+songs?|love\s+songs?|sad\s+songs?|dj\s+songs?)\b/i,
  /\b(full\s+album|ep\s+album|album\s+stream|album\s+release|discography)\b/i,
  /\b(sped\s+up|slowed\s+\+?\s*reverb|8d\s+audio|bass\s+boosted|nightcore)\b/i,
  /\b(prod\.\s*by|produced\s+by)\b/i,
  /\b(feat\.?|ft\.?)\s+[a-zA-Z0-9]/i,
  /\b(jukebox|all\s+songs|mashup|mega\s+mix|dj\s+remix|remix\s+songs?|club\s+mix)\b/i,
  /\b(original\s+soundtrack|soundtrack\s+ost|\bost\b|bgm\s+ringtone|background\s+score)\b/i,
  /\b(karaoke\s+version|karaoke\s+track|instrumental\s+track|type\s+beat|rap\s+beat)\b/i,
  /\b(live\s+in\s+concert|live\s+performance|acoustic\s+session|unplugged\s+version)\b/i,
  /\b(lo-?fi\s+beats|lofi\s+hip\s+hop|chill\s+beats|beats\s+to\s+relax|study\s+beats|beats\s+to\s+study)\b/i,
  /\b(music\s+video|\bmv\b|lyrical\s+video|title\s+track)\b/i,
  /\b(song\s+teaser|theme\s+song|punjabi\s+songs?|hindi\s+songs?|tamil\s+songs?|telugu\s+songs?|kannada\s+songs?|malayalam\s+songs?|bhojpuri\s+songs?)\b/i,
  /\b(party\s+songs?|pop\s+songs?|love\s+songs?|dance\s+songs?|sad\s+songs?|romantic\s+songs?)\b/i,
];

// Record labels, distributor channels and keywords in channel name
const MUSIC_CHANNEL_KEYWORDS = [
  "- topic",
  "topic",
  "vevo",
  "music",
  "records",
  "t-series",
  "tseries",
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
  "official artist channel",
  "band",
  "orchestra",
  "beats",
  "records",
  "vocalist",
  "singer",
  "shemaroo",
  "eros now",
  "alan walker",
  "ed sheeran",
  "taylor swift",
  "coldplay",
  "eminem",
  "the weeknd",
  "bts",
  "blackpink",
  "drake",
  "dua lipa",
  "billie eilish",
  "justin bieber",
  "post malone",
  "arijit singh",
  "badshah",
  "diljit dosanjh",
  "sidhu moose wala",
  "karan aujla",
  "honey singh",
  "neha kakkar",
  "shreya ghoshal",
  "anirudh ravichander",
  "ar rahman",
  "a.r. rahman",
  "sonu nigam",
  "kumar sanu",
  "katy perry",
  "ariana grande",
  "rihanna",
  "beyonce",
  "lady gaga",
  "bruno mars",
  "maroon 5",
  "david guetta",
  "avicii",
  "marshmello",
  "linkin park",
  "metallica",
  "nirvana",
  "queen",
  "michael jackson",
  "imagine dragons",
  "charlie puth",
  "harry styles",
  "olivia rodrigo",
  "kendrick lamar",
  "travis scott",
  "kanye west",
];

// Famous global music track titles (for high-precision single-track blocking)
const FAMOUS_TRACK_TITLES = [
  "faded",
  "shape of you",
  "blank space",
  "bad guy",
  "blinding lights",
  "despacito",
  "believer",
  "lose yourself",
  "tum hi ho",
  "kesariya",
  "hukum",
  "channa mereya",
  "kal ho naa ho",
  "senorita",
  "dance monkey",
  "perfect",
  "someone like you",
  "uptown funk",
  "counting stars",
  "gangnam style",
  "see you again",
  "roar",
  "sugar",
  "thinking out loud",
  "dark horse",
  "sorry",
  "lean on",
  "cheap thrills",
  "stargazing",
  "starboy",
  "lucid dreams",
  "rockstar",
  "god's plan",
  "industry baby",
  "montero",
  "stay",
  "as it was",
  "flowers",
  "vampire",
  "espresso",
  "cruel summer",
  "anti-hero",
  "genda phool",
  "apna bana le",
  "raataan lambiyan",
  "pasoori",
  "lut gaye",
  "vaaste",
  "dilbar",
  "lehanga",
  "khalasi",
  "dynamite",
  "butter",
  "yellow",
  "fix you",
  "viva la vida",
  "bohemian rhapsody",
  "smells like teen spirit",
  "in the end",
  "numb",
  "without me",
  "mockingbird",
  "stan",
  "levitating",
  "peaches",
  "circles",
  "sunflower",
  "waka waka",
  "closer",
  "something just like this",
  "take me to church",
  "demons",
  "radioactive",
  "thunder",
  "chandelier",
  "titanium",
  "wake me up",
  "alone",
  "heat waves",
];

// ── Commercial Movie, Film & TV Signatures ─────────────────────────────────
const MOVIE_SIGNATURES = [
  /\b(full\s+movies?|complete\s+movies?|watch\s+full\s+movie|full\s+films?|cinema\s+full)\b/i,
  /\b(official\s+trailers?|teaser\s+trailers?|final\s+trailers?|trailers?\s+\d+|main\s+trailer|first\s+trailer|theatrical\s+trailer)\b/i,
  /\b(movie\s+clips?|film\s+clips?|best\s+movie\s+scenes?|post\s+credits|movie\s+scenes?|action\s+scenes?|climax\s+scenes?)\b/i,
  /\b(scenes?\s+(?:4k|1080p|hd)|(?:4k|1080p|hd)\s+scenes?|robbery\s+scenes?|fight\s+scenes?|death\s+scenes?|final\s+scenes?|chase\s+scenes?)\b/i,
  /\b(deleted\s+scenes?|bloopers|behind\s+the\s+scenes|making\s+of\s+the\s+movie)\b/i,
  /\b(box\s+office|hindi\s+dubbed|tamil\s+full\s+movies?|telugu\s+full\s+movies?|blockbuster\s+movies?)\b/i,
  /\b(kannada\s+movies?|malayalam\s+movies?|punjabi\s+movies?|south\s+movies?|hollywood\s+movies?|bollywood\s+movies?)\b/i,
  /\b(theatrical\s+trailers?|motion\s+poster|glimpse|first\s+look|sneak\s+peek|sneak\s+preview)\b/i,
  /\b(web\s+series|tv\s+serial|season\s+\d+\s+episode|episode\s+\d+|tv\s+show\s+episode)\b/i,
  /\b(movie\s+reviews?|box\s+office\s+collection|film\s+premiere|ott\s+release)\b/i,
  /\b(action\s+movies?|horror\s+movies?|comedy\s+movies?|romantic\s+movies?|thriller\s+movies?)\b/i,
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

// Recognized educational channel whitelist with strict word boundaries
const ACADEMIC_CHANNEL_PATTERNS = [
  /\bmit\b/i,
  /\bmit\s+opencourseware\b/i,
  /\bharvard\b/i,
  /\bstanford\b/i,
  /\byale\b/i,
  /\boxford\b/i,
  /\bcambridge\b/i,
  /\bcrashcourse\b/i,
  /\bkhan\s+academy\b/i,
  /\bfreecodecamp\b/i,
  /\bcoursera\b/i,
  /\bedureka\b/i,
  /\bsimplilearn\b/i,
  /\btraversy\s+media\b/i,
  /\bfireship\b/i,
  /\buniversity\b/i,
  /\bcollege\b/i,
  /\bted-ed\b/i,
  /\bveritasium\b/i,
  /\b3blue1brown\b/i,
  /\bkurzgesagt\b/i,
  /\bgeeksforgeeks\b/i,
  /\bedx\b/i,
];

/**
 * Checks whether content (video or playlist title/channel/url) qualifies as academic/educational
 * or must be blocked as commercial entertainment, movie, or music.
 */
export function validateEducationalContent(
  title: string,
  authorOrChannel?: string,
  url?: string,
  authorUrl?: string
): ContentFilterResult {
  const cleanTitle = (title || "").trim();
  const cleanAuthor = (authorOrChannel || "").trim().toLowerCase();
  const cleanUrl = (url || "").trim().toLowerCase();
  const cleanAuthorUrl = (authorUrl || "").trim().toLowerCase();
  const lowerTitle = cleanTitle.toLowerCase();

  // 1. Strict URL check (YouTube Music domains and radio mix IDs)
  if (
    cleanUrl.includes("music.youtube.com") ||
    cleanUrl.includes("list=rd") ||
    cleanUrl.includes("list=olak") ||
    cleanUrl.includes("list=lm")
  ) {
    return {
      blocked: true,
      category: "music",
      reason:
        "YouTube Music tracks, albums, and auto-generated mixes cannot be imported. VeySkill is strictly for educational courses and masterclasses.",
    };
  }

  // 2. Check author URL for music and label domains
  if (
    cleanAuthorUrl.includes("music") ||
    cleanAuthorUrl.includes("vevo") ||
    cleanAuthorUrl.includes("records")
  ) {
    return {
      blocked: true,
      category: "music",
      reason:
        "Commercial music artist and record label channels cannot be imported. VeySkill is strictly for academic and technical coursework.",
    };
  }

  if (!cleanTitle) {
    return { blocked: false };
  }

  // 3. Recognized university or verified educational publisher exemption
  const isAcademicPublisher =
    cleanAuthor && ACADEMIC_CHANNEL_PATTERNS.some((p) => p.test(cleanAuthor));
  if (isAcademicPublisher) {
    return { blocked: false };
  }

  // 4. Strict non-exemptible entertainment markers
  const isGamingOrPrank = /\b(gameplay|let's\s+play|gaming|prank|roast|funny\s+moments)\b/i.test(
    cleanTitle
  );
  const isExplicitTrailer =
    /\b(official\s+trailer|teaser\s+trailer|final\s+trailer|trailer\s+\d+|teaser)\b/i.test(
      cleanTitle
    );
  const isMovieScene =
    /\b(movie\s+scenes?|film\s+scenes?|robbery\s+scenes?|fight\s+scenes?|action\s+scenes?|climax\s+scenes?|death\s+scenes?|final\s+scenes?|chase\s+scenes?|scenes?\s+4k|4k\s+scenes?)\b/i.test(
      cleanTitle
    );

  // 5. Check commercial music channel keywords FIRST (Labels and artists can never be courses)
  if (cleanAuthor && MUSIC_CHANNEL_KEYWORDS.some((kw) => cleanAuthor.includes(kw))) {
    return {
      blocked: true,
      category: "music",
      reason:
        "Commercial music tracks and record label releases cannot be imported. VeySkill is dedicated exclusively to academic lectures and technical masterclasses.",
    };
  }

  // 6. Check commercial movie studio channel keywords FIRST
  if (cleanAuthor && MOVIE_CHANNEL_KEYWORDS.some((kw) => cleanAuthor.includes(kw))) {
    return {
      blocked: true,
      category: "movie",
      reason:
        "Commercial studio films, trailers, and entertainment clips cannot be imported. VeySkill is dedicated exclusively to academic curricula and verified coursework.",
    };
  }

  // 7. Check music signatures in title FIRST
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

  // 8. Check movie signatures in title FIRST
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

  // 9. Check entertainment/meme/gaming signatures in title FIRST
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

  // 10. If non-exemptible markers matched, block
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

  // 11. Check pedagogical intent keywords
  const hasPedagogicalIntent = hasEducationalKeyword(cleanTitle);
  if (hasPedagogicalIntent) {
    return { blocked: false };
  }

  // 12. Check famous track title matches without educational intent
  for (const track of FAMOUS_TRACK_TITLES) {
    if (
      lowerTitle === track ||
      lowerTitle.startsWith(`${track} `) ||
      lowerTitle.endsWith(` ${track}`) ||
      lowerTitle.includes(`- ${track}`)
    ) {
      return {
        blocked: true,
        category: "music",
        reason: `Commercial music track ("${cleanTitle}") cannot be imported. VeySkill is strictly for educational courses and tutorials.`,
      };
    }
  }

  // 13. Artist - Track pattern check (e.g. "Alan Walker - Faded", "Ed Sheeran - Shape of You")
  const isTrackPattern =
    /^[^\n\r]{2,60}\s*[-–—:|]\s*["']?[^\n\r]{2,80}["']?(?:\s*[\[\(][^\]\)]*[\]\)])?$/i.test(
      cleanTitle
    );
  if (isTrackPattern) {
    return {
      blocked: true,
      category: "music",
      reason: `Commercial music single ("${cleanTitle}") cannot be imported. VeySkill strictly permits educational courses and masterclasses only.`,
    };
  }

  // 14. Affirmative educational requirement: Reject generic non-educational entertainment
  return {
    blocked: true,
    category: "entertainment",
    reason:
      "This video does not have verified educational or instructional content. VeySkill is exclusively an educational and certification platform.",
  };
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
  videos: Array<{ title: string; videoId?: string }> = [],
  url?: string
): PlaylistValidationResult {
  const cleanTitle = (playlistTitle || "").trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const cleanChannel = (channelName || "").trim().toLowerCase();
  const cleanUrl = (url || "").trim().toLowerCase();

  // 0. Strict URL check (YouTube Music domain, mixes, and album releases)
  if (
    cleanUrl.includes("music.youtube.com") ||
    cleanUrl.includes("list=rd") ||
    cleanUrl.includes("list=olak") ||
    cleanUrl.includes("list=lm")
  ) {
    return {
      valid: false,
      reason:
        "Playlist rejected: YouTube Music playlists, albums, and auto-generated mixes cannot be imported. VeySkill is strictly an educational platform.",
    };
  }

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
    /\b(songs?|tracks?|singles?|album|discography|jukebox|hits|soundtrack|\bost\b|bgm|remixes?|dj\s+mix|party\s+songs|bollywood\s+songs|punjabi\s+songs|lofi\s+beats)\b/i,
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
  const hasEducationalPlaylistTitle = hasEducationalKeyword(cleanTitle);

  const educationalVideoCount = videos.filter((v) => hasEducationalKeyword(v.title)).length;

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

  // 1. Check if course title or description contains non-educational marketing keywords FIRST
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

  // 2. Verify Course Title is not a movie, music, or entertainment title
  const titleFilter = validateEducationalContent(cleanTitle);
  if (titleFilter.blocked) {
    return {
      valid: false,
      reason: `Course title rejected: ${titleFilter.reason}`,
    };
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
  const hasAcademicInTitleOrDesc =
    hasEducationalKeyword(cleanTitle) || hasEducationalKeyword(description);

  const hasAcademicInLessons = lessons.some((l) => hasEducationalKeyword(l.title));

  if (!hasAcademicInTitleOrDesc && !hasAcademicInLessons) {
    return {
      valid: false,
      reason:
        "Course rejected: Please provide a descriptive educational course title (e.g., 'Introduction to Python', 'Calculus Masterclass', 'World History Overview') or include instructional lecture modules. Only authentic educational courses can be published.",
    };
  }

  return { valid: true };
}
