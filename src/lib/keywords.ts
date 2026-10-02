// ---------------------------------------------------------------------------
// Keyword generation & Full-Strength Search Intelligence Engine
// Generates lowercase, deduplicated, stopword-free keyword arrays and
// provides deep multi-field relevance scoring across Title, Description,
// Creator Name, and Keywords with prefix, substring, and acronym support.
// ---------------------------------------------------------------------------
import { STOPWORDS, MAX_KEYWORDS } from "./constants";

/**
 * Tokenise a string into lowercase words, stripping punctuation.
 */
export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

/**
 * Generate keywords from course fields.
 * Category is optional as categories are decoupled.
 */
export function generateKeywords(params: {
  title: string;
  description: string;
  category?: string;
  lessonTitles: string[];
}): string[] {
  const { title, description, category, lessonTitles } = params;

  const all = [
    ...tokenise(title),
    ...tokenise(description),
    ...tokenise(category || ""),
    ...lessonTitles.flatMap(tokenise),
  ];

  // Deduplicate and cap at MAX_KEYWORDS
  const unique = [...new Set(all)];
  return unique.slice(0, MAX_KEYWORDS);
}

/**
 * Given a search query string, return up to MAX_QUERY_TERMS unique terms
 * suitable for use in a Firestore array-contains-any query.
 */
export function parseQueryTerms(query: string, maxTerms = 10): string[] {
  return [...new Set(tokenise(query))].slice(0, maxTerms);
}

/**
 * Client-side ranking: given courses fetched by array-contains-any,
 * rank by how many query terms appear in the course's keywords.
 */
export function rankByRelevance<T extends { keywords?: string[] }>(
  courses: T[],
  queryTerms: string[]
): T[] {
  const termSet = new Set(queryTerms);
  return [...courses].sort((a, b) => {
    const scoreA = (a.keywords || []).filter((k) => termSet.has(k)).length;
    const scoreB = (b.keywords || []).filter((k) => termSet.has(k)).length;
    return scoreB - scoreA;
  });
}

export interface SearchableCourse {
  title: string;
  description?: string;
  creatorName?: string;
  keywords?: string[];
}

/**
 * Developer and academic acronym / shorthand expansions
 */
const ACRONYM_EXPANSIONS: Record<string, string[]> = {
  ml: ["machine learning"],
  ai: ["artificial intelligence", "ai"],
  dl: ["deep learning"],
  dsa: ["data structure", "data structures", "algorithm", "algorithms"],
  py: ["python"],
  js: ["javascript"],
  ts: ["typescript"],
  cs: ["computer science"],
  os: ["operating system", "operating systems"],
  db: ["database", "sql", "nosql", "postgres", "mongodb"],
  devops: ["devops", "docker", "kubernetes", "ci cd"],
  nlp: ["natural language processing", "natural language"],
  math: ["mathematics", "calculus", "linear algebra"],
  maths: ["mathematics", "calculus", "linear algebra"],
  algo: ["algorithm", "algorithms"],
  algos: ["algorithm", "algorithms"],
  web: ["web development", "frontend", "backend"],
  webdev: ["web development", "frontend", "backend"],
  react: ["react", "react.js", "reactjs"],
  node: ["node", "node.js", "nodejs"],
  vue: ["vue", "vue.js", "vuejs"],
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Full-Strength Multi-Field Search Engine.
 * Matches exact phrases, prefixes, acronyms, and word boundaries across
 * title, description, creator name, and keywords with weighted ranking.
 */
export function searchCoursesFullStrength<T extends SearchableCourse>(
  courses: T[],
  queryText: string
): { course: T; score: number }[] {
  const clean = queryText.trim().toLowerCase();
  if (!clean) {
    return courses.map((c) => ({ course: c, score: 0 }));
  }

  // Preserve tech punctuation like c++, c#, .net
  const queryWords = clean
    .replace(/[^\w\s+#.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const results: { course: T; score: number }[] = [];

  for (const course of courses) {
    let score = 0;
    const titleLower = (course.title || "").toLowerCase();
    const descLower = (course.description || "").toLowerCase();
    const creatorLower = (course.creatorName || "").toLowerCase();
    const keywords = course.keywords || [];

    // 1. Exact full-query match on Title
    if (titleLower === clean) {
      score += 200;
    } else if (titleLower.startsWith(clean)) {
      score += 120;
    } else if (titleLower.includes(clean)) {
      score += 70;
    }

    // Exact phrase in description or creator
    if (descLower.includes(clean)) {
      score += 35;
    }
    if (creatorLower.includes(clean)) {
      score += 40;
    }

    // 2. Individual word matches & prefixes
    let matchedWords = 0;
    for (const word of queryWords) {
      let wordMatched = false;

      // Title word match
      if (titleLower === word) {
        score += 80;
        wordMatched = true;
      } else if (titleLower.includes(word)) {
        score += 30;
        wordMatched = true;
        // Word boundary bonus
        const boundaryRegex = new RegExp(`(^|\\s)${escapeRegex(word)}`, "i");
        if (boundaryRegex.test(titleLower)) {
          score += 25;
        }
      }

      // Keywords match
      for (const kw of keywords) {
        if (kw === word) {
          score += 30;
          wordMatched = true;
        } else if (kw.startsWith(word)) {
          score += 18;
          wordMatched = true;
        } else if (word.length >= 3 && kw.includes(word)) {
          score += 10;
          wordMatched = true;
        }
      }

      // Description match
      if (descLower.includes(word)) {
        score += 12;
        wordMatched = true;
      }

      // Creator name match
      if (creatorLower.includes(word)) {
        score += 20;
        wordMatched = true;
      }

      if (wordMatched) matchedWords++;
    }

    // 3. Acronym & Developer Shorthand Intelligence
    const expansions = ACRONYM_EXPANSIONS[clean] || [];
    for (const phrase of expansions) {
      if (titleLower.includes(phrase)) {
        score += 110;
      } else if (descLower.includes(phrase)) {
        score += 50;
      } else if (keywords.some((k) => k.includes(phrase))) {
        score += 45;
      }
    }

    // Check individual query word expansions (e.g. "learn ml" -> "machine learning")
    for (const word of queryWords) {
      const wordExp = ACRONYM_EXPANSIONS[word];
      if (wordExp) {
        for (const phrase of wordExp) {
          if (titleLower.includes(phrase)) {
            score += 70;
            matchedWords++;
          } else if (descLower.includes(phrase)) {
            score += 30;
            matchedWords++;
          }
        }
      }
    }

    // 4. Boost courses matching ALL words in multi-word query
    if (matchedWords >= queryWords.length && queryWords.length > 1) {
      score += 50;
    }

    if (score > 0) {
      results.push({ course, score });
    }
  }

  // Sort descending by relevance score
  return results.sort((a, b) => b.score - a.score);
}
