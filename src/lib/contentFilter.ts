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
  // Core pedagogy & instructional formats
  /\b(tutorial|tutorials|course|courses|lecture|lectures|lesson|lessons|masterclass|bootcamp|curriculum|syllabus|workshop|webinar|seminar|training|class|classes|certification|certificate|exam\s+prep|study\s+guide|study\s+plan|revision|syllabus)\b/i,
  /\b(crash\s+course|full\s+course|complete\s+course|deep\s+dive|for\s+beginners|fundamentals|introduction\s+to|intro\s+to|intro\b|introduction\b|step\s+by\s+step|handbook|roadmap|overview|walkthrough|guide|guidelines|zero\s+to\s+hero|from\s+scratch|\b101\b|\b102\b)\b/i,
  /\b(how\s+to\s+[a-z]+|learn\s+[a-z]+|learn\s+to\s+[a-z]+|learning\s+[a-z]+|education|educational|academic|academy|explained|explaining|explanation|principles|concepts|theory|analysis|breakdown)\b/i,
  /\b(how\s+[a-z]+\s+works?|what\s+is\s+[a-z]+|why\s+[a-z]+\s+matters?|getting\s+started|environment\s+setup|installation\s+guide|setup\s+guide)\b/i,
  /\b(architecture|design\s+patterns?|clean\s+code|system\s+design|best\s+practices|interview\s+prep|coding\s+interview|leet\s*code)\b/i,

  // AI, Prompt Engineering, LLMs & Generative Tech (High Priority)
  /\b(prompt\s+engineering|prompting|prompts?|prompt\s+design|prompt\s+crafting|system\s+prompts?|prompt\s+tuning|prompt\s+guide|prompt\s+techniques?|prompt\s+templates?)\b/i,
  /\b(ai\s+education|ai\s+course|ai\s+tutorial|ai\s+masterclass|ai\s+tools?|ai\s+agents?|agentic\s+ai|autonomous\s+agents?|multi[\s-]agent|ai\s+workflow|ai\s+automation|ai\s+engineering|ai\s+developer|ai\s+development)\b/i,
  /\b(generative\s+ai|gen\s*ai|artificial\s+intelligence|\bllm\b|\bllms\b|large\s+language\s+models?|foundation\s+models?|frontier\s+models?)\b/i,
  /\b(chatgpt|gpt-?3(?:\.5)?|gpt-?4(?:o)?(?:-mini)?|gpt-?5|gpt-?o1|gpt-?o3|openai|sora|claude(?:\s*3(?:\.5)?(?:\s*(?:sonnet|haiku|opus))?)?|anthropic|gemini|deepmind|copilot)\b/i,
  /\b(llama(?:\s*[23](?:\.\d+)?)?|meta\s+ai|mistral(?:\s*ai)?|mixtral|deepseek|qwen|gemma|phi-?[234]|groq|ollama|local\s*llm|vllm|lm\s+studio)\b/i,
  /\b(midjourney|stable\s+diffusion|dall-?e|runway(?:\s*gen-?[23])?|pika(?:\s*art)?|kling(?:\s*ai)?|flux(?:\.1)?|diffusion\s+models?)\b/i,
  /\b(langchain|langgraph|llamaindex|crewai|autogen|semantic\s+kernel|hugging\s*face|transformers?|attention\s+mechanism|tokenizers?)\b/i,
  /\b(rag|retrieval[\s-]augmented\s+generation|vector\s+(?:database|store|embeddings?|search)|pinecone|chromadb|qdrant|weaviate)\b/i,
  /\b(fine-?tuning|lora|qlora|peft|rlhf|dpo|zero[\s-]shot|few[\s-]shot|chain[\s-]of[\s-]thought|\bcot\b|in[\s-]context\s+learning)\b/i,
  /\b(machine\s+learning|deep\s+learning|neural\s+networks?|pytorch|tensorflow|keras|scikit-?learn|data\s+science|data\s+analytics?|data\s+engineering|big\s+data|nlp|natural\s+language\s+processing|computer\s+vision)\b/i,

  // Software Engineering, Dev & Cloud
  /\b(programming|coding|software\s+engineering|computer\s+science|web\s+development|full\s+stack|frontend|backend|devops|cloud\s+computing|cybersecurity|ethical\s+hacking|algorithms?|data\s+structures?|\bdsa\b)\b/i,
  /\b(android|jetpack\s+compose|composables?|jetpack|kotlin|coroutines?|kmp|kotlin\s+multiplatform|mobile\s+app|app\s+development|mobile\s+development)\b/i,
  /\b(ios|swift|swiftui|uikit|xcode|flutter|react\s*native|dart|viewmodel|layouts?|modifiers?|components?|widgets?|state\s+management)\b/i,
  /\b(python|javascript|typescript|react(?:\s*native)?|next\.?js|node\.?js|vue(?:\.?js)?|angular|express(?:\.?js)?|django|flask|fastapi|spring\s*boot|c\+\+|c#|\.net|\bgolang\b|go\s+language|\brust\b|\bjava\b|\bcore\s+java\b|php|laravel|sql|mysql|postgresql|mongodb|redis|prisma|supabase|firebase|graphql|rest\s+api|\bgit\b|\bgithub\b|\bdocker\b|\bkubernetes\b|\baws\b|\bazure\b|\bgcp\b|\blinux\b|\bbash\b)\b/i,
  /\b(tailwind(?:\s*css)?|css3?|html5?|figma|ui\/ux|web\s+design|responsive\s+design)\b/i,
  /\b(?:lesson|lecture|module|chapter|episode|part|session|class|step|unit)\s*\d+\b/i,

  // Sciences, STEM, Humanities, Business, Finance
  /\b(mathematics|math|calculus|algebra|linear\s+algebra|geometry|statistics|probability|physics|quantum|chemistry|organic\s+chemistry|biology|genetics|anatomy|medicine)\b/i,
  /\b(economics|macroeconomics|microeconomics|finance|investing|accounting|business|marketing|digital\s+marketing|seo|entrepreneurship|management|psychology|philosophy|history|world\s+history|grammar|english\s+grammar|ielts|toefl)\b/i,

  // Creative & Technical Arts Instruction
  /\b(music\s+theory|sound\s+design|audio\s+production|music\s+production|cinematography|screenwriting|storyboarding|lighting\s+technique|video\s+editing|film\s+analysis|film\s+directing|film\s+making|visual\s+storytelling|color\s+grading|vfx|3d\s+modeling|blender(?:\s*3d)?|unreal\s+engine|unity(?:\s*3d)?|animation\s+tutorial)\b/i,
  /\b(chords?\s+and\s+scales|piano\s+tutorial|guitar\s+lesson|drum\s+lesson|vocal\s+exercises?|drawing\s+tutorial|sketching\s+tutorial)\b/i,
];

// Common pedagogical curriculum lesson structural titles
const CURRICULUM_STRUCTURAL_PATTERNS = [
  /\b(intro|introduction|welcome|orientation|prerequisites?|getting\s+started|installation|environment\s+setup|setup\s+guide|requirements?)\b/i,
  /\b(overview|course\s+overview|syllabus|curriculum|roadmap|agenda|table\s+of\s+contents?|cheat\s*sheet)\b/i,
  /\b(module\s+\d+|chapter\s+\d+|unit\s+\d+|section\s+\d+|part\s+\d+|step\s+\d+|lesson\s+\d+|session\s+\d+|phase\s+\d+|class\s+\d+)\b/i,
  /\b(theory|concepts?|architecture|fundamentals?|basics?|deep\s+dive|advanced|intermediate|beginner)\b/i,
  /\b(demo|demonstration|walkthrough|hands[\s-]on|code[\s-]along|practice|exercise|lab|workshop|tutorial)\b/i,
  /\b(project|capstone|case\s+study|real[\s-]world\s+example|mini[\s-]project|final\s+project|assignment)\b/i,
  /\b(review|summary|wrap[\s-]up|conclusion|recap|next\s+steps|outro|final\s+thoughts|q&a|faq|resources|bonus)\b/i,
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
  /\b(jukebox|all\s+songs|mashup|mega\s+mix|dj\s+remix|remix\s+songs?|club\s+mix)\b/i,
  /\b(original\s+soundtrack|soundtrack\s+ost|\bost\b|bgm\s+ringtone|background\s+score)\b/i,
  /\b(karaoke\s+version|karaoke\s+track|instrumental\s+track|type\s+beat|rap\s+beat)\b/i,
  /\b(live\s+in\s+concert|live\s+performance|acoustic\s+session|unplugged\s+version)\b/i,
  /\b(lo-?fi\s+beats|lofi\s+hip\s+hop|chill\s+beats|beats\s+to\s+relax)\b/i,
  /\b(music\s+video|\bmv\b|lyrical\s+video|title\s+track)\b/i,
  /\b(song\s+teaser|theme\s+song|punjabi\s+songs?|hindi\s+songs?|tamil\s+songs?|telugu\s+songs?|kannada\s+songs?|malayalam\s+songs?|bhojpuri\s+songs?)\b/i,
  /\b(party\s+songs?|pop\s+songs?|love\s+songs?|dance\s+songs?|sad\s+songs?|romantic\s+songs?)\b/i,
];

// Record labels, distributor channels and keywords in channel name
const MUSIC_CHANNEL_KEYWORDS = [
  "- topic",
  "topic",
  "vevo",
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
  "audio library",
  "official artist channel",
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
  /\b(official\s+trailers?|teaser\s+trailers?|final\s+trailers?|trailers?\s+\d+|main\s+trailer|theatrical\s+trailer)\b/i,
  /\b(movie\s+clips?|film\s+clips?|best\s+movie\s+scenes?|post\s+credits|movie\s+scenes?|action\s+scenes?|climax\s+scenes?)\b/i,
  /\b(scenes?\s+(?:4k|1080p|hd)|(?:4k|1080p|hd)\s+scenes?|robbery\s+scenes?|fight\s+scenes?|death\s+scenes?|final\s+scenes?|chase\s+scenes?)\b/i,
  /\b(deleted\s+scenes?|bloopers|behind\s+the\s+scenes\s+of\s+the\s+(?:movie|film)|making\s+of\s+the\s+movie)\b/i,
  /\b(box\s+office|hindi\s+dubbed|tamil\s+full\s+movies?|telugu\s+full\s+movies?|blockbuster\s+movies?)\b/i,
  /\b(kannada\s+movies?|malayalam\s+movies?|punjabi\s+movies?|south\s+movies?|hollywood\s+movies?|bollywood\s+movies?)\b/i,
  /\b(theatrical\s+trailers?|motion\s+poster|glimpse\s+teaser|first\s+glimpse|first\s+look\s+teaser)\b/i,
  /\b(web\s+series\s+episode|tv\s+serial\s+episode|tv\s+show\s+episode)\b/i,
  /\b(movie\s+reviews?|box\s+office\s+collection|film\s+premiere|ott\s+release)\b/i,
  /\b(action\s+movies?|horror\s+movies?|comedy\s+movies?|romantic\s+movies?|thriller\s+movies?)\b/i,
];

// Major movie studio and streaming channels
const MOVIE_CHANNEL_KEYWORDS = [
  "marvel entertainment",
  "paramount pictures",
  "walt disney studios",
  "walt disney",
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
  "disney+",
  "film companion",
  "movieclips",
  "rottentomatoes",
  "ign movie",
  "fandango",
  "screen junkies",
  "cinema sins",
  "bollywood hungama",
  "zee cinema",
  "star gold",
  "sony max",
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
  /\bdeeplearning\.ai\b/i,
  /\bandrew\s+ng\b/i,
  /\bandrej\s+karpathy\b/i,
  /\bstatquest\b/i,
  /\bcodebasics\b/i,
  /\bcampusx\b/i,
  /\bkrish\s+naik\b/i,
  /\bsentdex\b/i,
  /\bneuralnine\b/i,
  /\btech\s+with\s+tim\b/i,
  /\bhugging\s*face\b/i,
  /\btwo\s+minute\s+papers\b/i,
  /\byannic\s+kilcher\b/i,
  /\bai\s+explained\b/i,
  /\bthe\s+ai\s+advantage\b/i,
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

  // 4. Strict non-exemptible pure gaming, prank, and meme markers
  const isPureGamingOrPrank =
    /\b(gta\s+(?:v|5)\s+gameplay|minecraft\s+hardcore|free\s+fire\s+gameplay|pubg\s+mobile\s+gameplay|roblox\s+gameplay|gameplay\s+walkthrough|try\s+not\s+to\s+laugh|prank\s+video|pranking|roast\s+video|funny\s+compilation|meme\s+compilation)\b/i.test(
      cleanTitle
    );
  if (isPureGamingOrPrank) {
    return {
      blocked: true,
      category: "entertainment",
      reason:
        "Video gameplay walkthroughs, gaming streams, and pranks are not permitted. Only educational coursework is allowed.",
    };
  }

  // 5. Explicit commercial music formats
  const isExplicitMusicRelease =
    /\b(official\s+music\s+video|official\s+audio|lyric\s+video|full\s+album\s+stream)\b/i.test(
      cleanTitle
    ) ||
    /[\[\(](?:official\s+music\s+video|official\s+video|official\s+audio|lyric\s+video|visualizer)[\]\)]/i.test(
      cleanTitle
    );
  if (isExplicitMusicRelease) {
    return {
      blocked: true,
      category: "music",
      reason:
        "Commercial music videos and audio tracks cannot be imported. VeySkill is dedicated exclusively to academic lectures and technical masterclasses.",
    };
  }

  // 6. Explicit commercial movie formats & full movie releases
  const isExplicitMovieRelease =
    /\b(watch\s+full\s+movie|complete\s+movie\s+hd|full\s+movie\s+(?:download|1080p|720p|hd|hindi|tamil|telugu|english|malayalam|kannada)|(?:hindi|tamil|telugu|kannada|malayalam)\s+full\s+movies?|hindi\s+dubbed\s+full\s+movie|theatrical\s+trailers?|official\s+theatrical\s+trailer|glimpse\s+teaser|first\s+glimpse\s+teaser)\b/i.test(
      cleanTitle
    );
  if (isExplicitMovieRelease) {
    return {
      blocked: true,
      category: "movie",
      reason:
        "Commercial movies, trailers, and film clips cannot be imported. VeySkill is dedicated exclusively to academic curricula and verified coursework.",
    };
  }

  // 7. Check commercial music channel keywords (Labels and artists can never be courses)
  if (cleanAuthor && MUSIC_CHANNEL_KEYWORDS.some((kw) => cleanAuthor.includes(kw))) {
    return {
      blocked: true,
      category: "music",
      reason:
        "Commercial music tracks and record label releases cannot be imported. VeySkill is dedicated exclusively to academic lectures and technical masterclasses.",
    };
  }

  // 8. Check commercial movie studio channel keywords
  if (cleanAuthor && MOVIE_CHANNEL_KEYWORDS.some((kw) => cleanAuthor.includes(kw))) {
    return {
      blocked: true,
      category: "movie",
      reason:
        "Commercial studio films, trailers, and entertainment clips cannot be imported. VeySkill is dedicated exclusively to academic curricula and verified coursework.",
    };
  }

  // 9. AFFIRMATIVE EDUCATIONAL VERIFICATION
  // If the title contains genuine educational / pedagogy / AI / prompt engineering keywords:
  const hasPedagogicalIntent = hasEducationalKeyword(cleanTitle);
  if (hasPedagogicalIntent) {
    return { blocked: false };
  }

  // 10. For titles WITHOUT affirmative educational keywords:
  // Strictly enforce movie, music, and entertainment detection

  // 10a. Music signatures in title
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

  // 10b. Movie signatures in title
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

  // 10c. Entertainment/meme/gaming signatures in title
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

  // 10d. Famous track title matches without educational intent
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

  // 10e. Commercial music single artist-track pattern check
  // Only flags when there are indicators of commercial music releases or artists,
  // NOT legitimate educational lecture titles with hyphens, colons, or pipes.
  const hasMusicIndicator =
    /\b(ft\.|feat\.|prod\.|official\s+audio|audio\s+track|single\s+track|video\s+song|remix|music\s+video)\b/i.test(
      cleanTitle
    ) ||
    /[\[\(](?:audio|official|single|remix|visualizer)[\]\)]/i.test(cleanTitle) ||
    (cleanAuthor && MUSIC_CHANNEL_KEYWORDS.some((kw) => cleanAuthor.includes(kw)));

  const isEducationalOrCurriculumTopic =
    /\b\d{1,4}\b/.test(cleanTitle) ||
    /\b(android|compose|composables?|kotlin|swift|swiftui|flutter|react|python|code|dev|app|ui|layout|api|guide|tutorial|course|lesson|part|chapter|module|lecture|basics?|setup)\b/i.test(
      cleanTitle
    );

  const isTrackPattern =
    hasMusicIndicator &&
    !isEducationalOrCurriculumTopic &&
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

  // 10f. Affirmative educational requirement: Reject generic non-educational entertainment
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
    /\b(full\s+songs?|hit\s+songs?|video\s+songs?|singles?|album|discography|jukebox|soundtrack|\bost\b|bgm|dj\s+remix|party\s+songs|bollywood\s+songs|punjabi\s+songs|lofi\s+beats)\b/i,
    /\b(full\s+movies?|cinema\s+full|watch\s+full\s+movie|theatrical\s+trailers?|teaser\s+trailers?|movie\s+scenes?|film\s+clips?|climax\s+scene|fight\s+scene|web\s+series|tv\s+serial|kdrama|k-drama)\b/i,
    /\b(pranks?|roasts?|funny\s+videos?|comedy\s+shows?|stand[\s-]?up|memes?|fails?|vlogs?|gameplay|lets\s+play|gaming)\b/i,
  ];

  for (const pattern of playlistTitleRejections) {
    if (pattern.test(cleanTitle)) {
      // Check if it's an authentic academic topic
      const isAcademicCourse =
        hasEducationalKeyword(cleanTitle) ||
        [
          "music theory",
          "music production",
          "sound engineering",
          "composition",
          "film directing",
          "film making",
          "film production",
          "screenwriting",
          "cinematography",
          "video editing",
          "film history",
          "prompt engineering",
          "ai",
          "course",
          "tutorial",
          "masterclass",
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

  const isPlaylistCourse =
    hasEducationalKeyword(cleanTitle) ||
    [
      "course",
      "tutorial",
      "masterclass",
      "bootcamp",
      "lecture",
      "lessons",
      "jetpack compose",
      "android",
      "kotlin",
      "swift",
      "flutter",
      "react",
      "python",
      "coding",
      "programming",
      "development",
    ].some((kw) => lowerTitle.includes(kw));

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i]!;
    const videoClean = (v.title || "").trim();

    // If parent playlist is verified as an educational course:
    // Only reject videos that are EXPLICIT commercial media (e.g. official music video, watch full movie, prank)
    if (isPlaylistCourse) {
      const isExplicitMedia =
        /\b(official\s+music\s+video|official\s+audio|lyric\s+video|full\s+album|full\s+movies?|watch\s+full\s+movie|theatrical\s+trailer|gameplay\s+walkthrough|prank\s+video)\b/i.test(
          videoClean
        ) ||
        /[\[\(](?:official\s+music\s+video|official\s+audio|lyric\s+video)[\]\)]/i.test(videoClean);

      if (isExplicitMedia) {
        return {
          valid: false,
          reason: `Playlist rejected: Item ${i + 1} ("${videoClean}") was flagged as commercial media. VeySkill strictly rejects playlists containing commercial movies, music, or entertainment.`,
          offendingVideoIndex: i,
          offendingVideoTitle: videoClean,
        };
      }
      continue;
    }

    const filter = validateEducationalContent(videoClean, channelName);
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

  // 1. Check if course title or description contains explicit commercial movie/music keywords
  const titleEntertainmentPatterns = [
    /\b(full\s+movies?|watch\s+full\s+movie|hollywood\s+(?:[a-z]+\s+)?movies?|bollywood\s+(?:[a-z]+\s+)?movies?|action\s+movies?|horror\s+movies?|comedy\s+movies?|official\s+trailers?|teaser\s+trailers?)\b/i,
    /\b(hit\s+songs?|video\s+songs?|full\s+album|dj\s+remix|music\s+album|party\s+songs?)\b/i,
    /\b(pranks?|roasts?|gameplay\s+walkthrough|funny\s+videos?|comedy\s+shows?)\b/i,
  ];

  for (const pattern of titleEntertainmentPatterns) {
    const isExempt =
      hasEducationalKeyword(cleanTitle) ||
      hasEducationalKeyword(description) ||
      [
        "film directing",
        "film history",
        "film making",
        "film production",
        "music theory",
        "music production",
        "sound engineering",
        "screenwriting",
        "cinematography",
        "prompt engineering",
        "ai",
        "artificial intelligence",
        "masterclass",
        "course",
        "tutorial",
        "bootcamp",
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

  // 3. Validate curriculum lesson count
  if (lessons.length === 0) {
    return {
      valid: false,
      reason: "Please add at least one lesson before publishing.",
    };
  }

  // 4. Validate every single lesson title in the curriculum:
  // Detects commercial movies, music videos, and non-educational videos embedded in courses
  const isParentCourseEducational =
    hasEducationalKeyword(cleanTitle) || hasEducationalKeyword(description);

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]!;
    const lessonClean = (lesson.title || "").trim();

    // Check if the lesson title is an authentic curriculum structural title (e.g. "Introduction", "Module 1", "Setup", "Summary")
    const isCurriculumStructure = CURRICULUM_STRUCTURAL_PATTERNS.some((p) => p.test(lessonClean));

    // If parent course is verified educational and the lesson has standard curriculum structure,
    // verify only that it is NOT explicitly a commercial movie, music video, or entertainment stream
    if (isParentCourseEducational && isCurriculumStructure) {
      const isExplicitMedia =
        /\b(official\s+music\s+video|official\s+audio|lyric\s+video|full\s+movies?|watch\s+full\s+movie|theatrical\s+trailer|gameplay\s+walkthrough|prank\s+video)\b/i.test(
          lessonClean
        );
      if (isExplicitMedia) {
        return {
          valid: false,
          reason: `Lesson ${i + 1} ("${lessonClean}") was flagged as non-educational entertainment or media. VeySkill strictly permits academic lectures and technical coursework only.`,
          offendingLessonIndex: i,
        };
      }
      continue;
    }

    const filter = validateEducationalContent(lessonClean);
    if (filter.blocked) {
      return {
        valid: false,
        reason: `Lesson ${i + 1} ("${lessonClean}") was flagged as non-educational (${filter.category || "entertainment"}). VeySkill strictly permits academic lectures and technical coursework only.`,
        offendingLessonIndex: i,
      };
    }
  }

  // 5. Positive Educational Intent Verification
  const hasAcademicInTitleOrDesc =
    hasEducationalKeyword(cleanTitle) || hasEducationalKeyword(description);

  const hasAcademicInLessons = lessons.some(
    (l) =>
      hasEducationalKeyword(l.title) || CURRICULUM_STRUCTURAL_PATTERNS.some((p) => p.test(l.title))
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
