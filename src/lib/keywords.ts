// ---------------------------------------------------------------------------
// Keyword generation utility
// Generates lowercase, deduplicated, stopword-free keyword arrays from
// course content for Firestore array-contains-any search.
// ---------------------------------------------------------------------------
import { STOPWORDS, MAX_KEYWORDS } from "./constants";

/**
 * Tokenise a string into lowercase words, stripping punctuation.
 */
function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

/**
 * Generate keywords from course fields.
 * Always called server-side (oEmbed route or API route) — never trust client.
 */
export function generateKeywords(params: {
  title: string;
  description: string;
  category: string;
  lessonTitles: string[];
}): string[] {
  const { title, description, category, lessonTitles } = params;

  const all = [
    ...tokenise(title),
    ...tokenise(description),
    ...tokenise(category),
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
export function rankByRelevance<T extends { keywords: string[] }>(
  courses: T[],
  queryTerms: string[]
): T[] {
  const termSet = new Set(queryTerms);
  return [...courses].sort((a, b) => {
    const scoreA = a.keywords.filter((k) => termSet.has(k)).length;
    const scoreB = b.keywords.filter((k) => termSet.has(k)).length;
    return scoreB - scoreA;
  });
}
