"use client";

// ---------------------------------------------------------------------------
// Explore page — YouTube-Style Dynamic Discovery Feed
// Features: Dynamic fresh feed rotation on every refresh, interactive "Shuffle Feed"
// button, Discovery Modes (Fresh Mix, Trending, Newest), category pills, and
// debounced keyword search with relevance ranking.
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback, useRef } from "react";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CATEGORIES, PAGE_SIZE, type Category } from "@/lib/constants";
import { parseQueryTerms, rankByRelevance } from "@/lib/keywords";
import type { CourseDoc } from "@/lib/types";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/CourseCard";

type DiscoveryFilter = "Fresh Mix" | "Trending" | "Newest";

// ── Query Builder ──────────────────────────────────────────────────────────
function buildQuery(selectedCategory: Category | "All", searchTerms: string[]) {
  const base = collection(db, "courses");
  const constraints = [where("status", "==", "published")];

  if (selectedCategory !== "All") {
    constraints.push(where("category", "==", selectedCategory));
  }

  if (searchTerms.length > 0) {
    constraints.push(where("keywords", "array-contains-any", searchTerms.slice(0, 10)));
  }

  return query(base, ...constraints, limit(PAGE_SIZE * 3));
}

// Fisher-Yates Dynamic Shuffle for YouTube-like fresh recommendations
function shuffleCourses<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const [discoveryFilter, setDiscoveryFilter] = useState<DiscoveryFilter>("Fresh Mix");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [rawCourses, setRawCourses] = useState<CourseDoc[]>([]);
  const [courses, setCourses] = useState<CourseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const COURSES_PER_PAGE = 12;
  const [fetchError, setFetchError] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch courses from Firestore ─────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setFetchError("");
    setLoading(true);

    try {
      const q = buildQuery(selectedCategory, searchTerms);
      const snap = await getDocs(q);
      const fetched = snap.docs.map((d) => ({
        ...(d.data() as CourseDoc),
        id: d.id,
      }));

      setRawCourses(fetched);
    } catch {
      setFetchError(
        "Unable to load courses right now. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerms]);

  // Initial fetch and on category/search change
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ── Apply Discovery Sorting & Dynamic Shuffling ─────────────────────────
  useEffect(() => {
    if (rawCourses.length === 0) {
      setCourses([]);
      return;
    }

    // If active search terms exist, prioritize keyword relevance
    if (searchTerms.length > 0) {
      const ranked = rankByRelevance(rawCourses, searchTerms);
      setCourses(ranked);
      return;
    }

    // Apply Discovery Filter (YouTube style)
    let ordered: CourseDoc[] = [];

    if (discoveryFilter === "Fresh Mix") {
      // Dynamic shuffle like YouTube feed on reload
      ordered = shuffleCourses(rawCourses);
    } else if (discoveryFilter === "Trending") {
      // Sort by lessons count & engagement
      ordered = [...rawCourses].sort((a, b) => (b.lessonCount || 0) - (a.lessonCount || 0));
    } else {
      // Newest
      ordered = [...rawCourses].sort((a, b) => {
        const timeA = a.publishedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
        const timeB = b.publishedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
        return timeB - timeA;
      });
    }

    setCourses(ordered);
    setCurrentPage(1);
  }, [rawCourses, searchTerms, discoveryFilter]);

  // ── 1-Click Refresh Recommendations Button (YouTube Style) ───────────────
  const handleShuffleFeed = () => {
    setIsShuffling(true);
    setCourses((prev) => shuffleCourses(prev));
    setCurrentPage(1);
    setTimeout(() => setIsShuffling(false), 450);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchTerms(parseQueryTerms(value));
    }, 300);
  };

  const totalPages = Math.max(1, Math.ceil(courses.length / COURSES_PER_PAGE));
  const paginatedCourses = courses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const el = document.getElementById("explore-heading");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container-page py-8 sm:py-12 w-full overflow-x-hidden">
      {/* Heading & Tagline */}
      <div className="mb-6 sm:mb-8" id="explore-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-mono font-bold mb-2 border border-teal-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>Dynamic Discovery Feed</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Explore Masterclasses
            </h1>
            <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Fresh recommendations on every visit. No algorithmic traps—only structured,
              distraction-free video masterclasses with verified certificates.
            </p>
          </div>

          {/* Quick Shuffle Feed Button */}
          <button
            type="button"
            onClick={handleShuffleFeed}
            disabled={isShuffling || loading}
            className="self-start sm:self-auto min-h-[44px] px-4 py-2.5 rounded-2xl bg-card border border-border hover:border-teal-500 text-foreground font-heading font-bold text-xs inline-flex items-center gap-2 shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
            title="Shuffle courses to discover fresh recommendations"
          >
            <svg
              className={`w-4 h-4 text-teal-600 dark:text-teal-400 ${isShuffling ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Fresh Feed</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by title, curriculum keyword, or topic (e.g. Distributed Systems, Python, Design)…"
          className="input pl-11 text-base sm:text-base py-3 w-full min-h-[48px] rounded-2xl"
          aria-label="Search courses"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear search input"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        )}
      </div>

      {/* YouTube-Style Feed Discovery Modes (Fresh Mix, Trending, Newest) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide text-xs font-heading font-bold">
        {(["Fresh Mix", "Trending", "Newest"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setDiscoveryFilter(mode)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              discoveryFilter === mode
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {mode === "Fresh Mix" && (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {mode === "Trending" && (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            )}
            {mode === "Newest" && (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            )}
            <span>{mode}</span>
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-3 mb-8 max-w-full scrollbar-hide"
        role="tablist"
        aria-label="Filter courses by category"
      >
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            onClick={() => {
              setSelectedCategory(cat as Category | "All");
              setCurrentPage(1);
            }}
            className={`flex-shrink-0 min-h-[40px] px-4 py-2 rounded-full text-xs font-heading font-semibold transition-all cursor-pointer inline-flex items-center justify-center ${
              selectedCategory === cat
                ? "bg-primary-500 text-white shadow-sm"
                : "bg-card border border-border text-foreground/80 hover:border-primary-400 hover:text-foreground active:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Fetch Error Banner */}
      {fetchError && (
        <div
          className="clay-card p-6 text-center my-6 bg-red-50 border-destructive/30 max-w-lg mx-auto rounded-3xl"
          role="alert"
        >
          <p className="text-destructive font-body text-sm mb-4">{fetchError}</p>
          <button
            type="button"
            onClick={() => fetchCourses()}
            className="btn-primary text-xs px-4 py-2"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 && !fetchError ? (
        <div className="clay-card p-12 text-center max-w-md mx-auto my-8 bg-card border border-border rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className="font-heading font-bold text-xl mb-2 text-foreground">No courses found</h2>
          <p className="text-muted-foreground font-body text-sm mb-6 leading-relaxed">
            {searchTerms.length > 0
              ? `No courses matched "${searchInput}". Try broader search terms or browse another category.`
              : `No published courses in ${selectedCategory === "All" ? "this category" : selectedCategory} yet.`}
          </p>
          <button
            onClick={() => {
              setSearchInput("");
              setSearchTerms([]);
              setSelectedCategory("All");
              setCurrentPage(1);
            }}
            className="btn-ghost text-xs px-4 py-2"
            type="button"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground font-body" aria-live="polite">
              {searchTerms.length > 0
                ? `Showing results for "${searchInput}"`
                : `${discoveryFilter} · ${selectedCategory === "All" ? "All Disciplines" : selectedCategory} (${courses.length} courses)`}
            </p>
            {totalPages > 1 && (
              <span className="text-xs text-muted-foreground font-heading font-semibold">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Numbered Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground font-body">
                Showing {(currentPage - 1) * COURSES_PER_PAGE + 1}–
                {Math.min(currentPage * COURSES_PER_PAGE, courses.length)} of {courses.length}{" "}
                courses
              </p>

              <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-border text-xs font-heading font-semibold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all inline-flex items-center justify-center active:scale-95"
                  aria-label="Previous page"
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 sm:w-8 sm:h-8 min-h-[44px] sm:min-h-0 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                      currentPage === pageNum
                        ? "bg-primary-600 text-white shadow-sm"
                        : "border border-border text-foreground hover:bg-muted"
                    }`}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-border text-xs font-heading font-semibold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all inline-flex items-center justify-center active:scale-95"
                  aria-label="Next page"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
