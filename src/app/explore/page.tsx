"use client";

// ---------------------------------------------------------------------------
// Explore page — Bold, Clean & Attractive YouTube-Style Video Discovery
// Features: One prominent search bar, full-strength search engine, zero clutter,
// smart "Refresh Feed" button that prioritizes new or unseen courses (persisted
// in localStorage), and distraction-free video masterclasses grid.
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback, useMemo } from "react";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { searchCoursesFullStrength } from "@/lib/keywords";
import type { CourseDoc } from "@/lib/types";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/CourseCard";

const COURSES_PER_PAGE = 12;
const SEEN_STORAGE_KEY = "learnloom_seen_courses_v1";

// Fisher-Yates Dynamic Shuffle for fresh recommendations
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getSeenCourseIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenCourseIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...ids].slice(-300)));
  } catch {
    // Ignore storage quota
  }
}

export default function ExplorePage() {
  const [searchInput, setSearchInput] = useState("");
  const [rawCourses, setRawCourses] = useState<CourseDoc[]>([]);
  const [feedCourses, setFeedCourses] = useState<CourseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchError, setFetchError] = useState("");

  // Sync initial URL query param if present (?q=... or ?search=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || params.get("search") || params.get("category");
    if (q) {
      setSearchInput(q);
    }
  }, []);

  // ── YouTube-Style Intelligent Feed Refresh (Unseen/New Prioritization) ───
  const refreshFeed = useCallback((sourceCourses: CourseDoc[]) => {
    if (sourceCourses.length === 0) return;
    setIsRefreshing(true);

    const seenIds = getSeenCourseIds();
    const unseen = sourceCourses.filter((c) => !seenIds.has(c.id));
    const seen = sourceCourses.filter((c) => seenIds.has(c.id));

    let nextFeed: CourseDoc[];
    let msg = "";

    if (unseen.length > 0) {
      // Prioritize unseen courses first (shuffled), followed by seen courses (shuffled)
      const shuffledUnseen = shuffleArray(unseen);
      const shuffledSeen = shuffleArray(seen);
      nextFeed = [...shuffledUnseen, ...shuffledSeen];

      // Mark first batch of surfaced unseen courses as seen
      shuffledUnseen.slice(0, COURSES_PER_PAGE).forEach((c) => seenIds.add(c.id));
      saveSeenCourseIds(seenIds);

      msg = `Refreshed with ${unseen.length} new or unseen recommendation${
        unseen.length === 1 ? "" : "s"
      }!`;
    } else {
      // User has cycled through all courses; restart freshness cycle with randomized mix
      saveSeenCourseIds(new Set());
      nextFeed = shuffleArray(sourceCourses);
      msg = "Catalog refreshed with a fresh randomized mix!";
    }

    setFeedCourses(nextFeed);
    setCurrentPage(1);
    setRefreshMessage(msg);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);

    setTimeout(() => {
      setRefreshMessage("");
    }, 3500);
  }, []);

  // ── Fetch published courses from Firestore ─────────────────────────────
  const fetchCourses = useCallback(async () => {
    setFetchError("");
    setLoading(true);

    try {
      const q = query(collection(db, "courses"), where("status", "==", "published"), limit(200));
      const snap = await getDocs(q);
      const fetched = snap.docs.map((d) => ({
        ...(d.data() as CourseDoc),
        id: d.id,
      }));

      setRawCourses(fetched);
      refreshFeed(fetched);
    } catch {
      setFetchError(
        "Unable to load masterclasses right now. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  }, [refreshFeed]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ── Full-Strength Instant Search & Filtering ──────────────────────────
  const courses = useMemo(() => {
    const queryClean = searchInput.trim();
    if (!queryClean) return feedCourses;

    // Run full-strength search across titles, descriptions, creators, keywords & acronyms
    const ranked = searchCoursesFullStrength(rawCourses, queryClean);
    return ranked.map((r) => r.course);
  }, [rawCourses, feedCourses, searchInput]);

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  const handleRefreshClick = () => {
    if (searchInput) setSearchInput("");
    refreshFeed(rawCourses);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.max(1, Math.ceil(courses.length / COURSES_PER_PAGE));
  const paginatedCourses = courses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container-page py-10 sm:py-16 w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* Bold, Clean YouTube-Style Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-foreground tracking-tight mb-3">
          Explore Masterclasses
        </h1>
        <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed">
          Structured, distraction-free video courses. Search any topic, skill, or framework.
        </p>
      </div>

      {/* The One Search Bar & YouTube-Style Refresh Button */}
      <div className="max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/20 via-primary-500/20 to-teal-500/20 blur-md opacity-40 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-card border-2 border-border/80 group-focus-within:border-teal-500 rounded-2xl shadow-sm group-focus-within:shadow-md transition-all">
              <div className="pl-4 sm:pl-5 pr-2 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search video masterclasses (e.g. Python, React, DSA, System Design)..."
                className="w-full py-3.5 sm:py-4 pr-12 text-base sm:text-lg bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-body"
                aria-label="Search masterclasses"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3.5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                  aria-label="Clear search query"
                  title="Clear search"
                >
                  <svg
                    width="18"
                    height="18"
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
          </div>

          {/* YouTube-Style Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing || loading}
            className="w-full sm:w-auto shrink-0 min-h-[52px] sm:min-h-[58px] px-5 py-3 rounded-2xl bg-card border-2 border-border/80 hover:border-teal-500 hover:bg-muted/40 text-foreground font-heading font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
            title="Refresh videos to discover fresh or unseen masterclasses"
          >
            <svg
              className={`w-4 h-4 text-teal-600 dark:text-teal-400 transition-transform ${
                isRefreshing ? "animate-spin" : "group-hover:rotate-45"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.19" />
            </svg>
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Refresh Notification Toast / Indicator */}
        {refreshMessage && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-heading font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping shrink-0" />
            <span>{refreshMessage}</span>
          </div>
        )}

        {/* Results Counter if actively searching */}
        {searchInput.trim() && !loading && (
          <div className="mt-3 px-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Found <strong className="text-foreground">{courses.length}</strong>{" "}
              {courses.length === 1 ? "result" : "results"} for &ldquo;{searchInput}&rdquo;
            </span>
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer font-medium"
            >
              Reset search
            </button>
          </div>
        )}
      </div>

      {/* Network Error Banner */}
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

      {/* Video Masterclasses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 && !fetchError ? (
        <div className="clay-card p-12 text-center max-w-md mx-auto my-12 bg-card border border-border rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
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
          <h2 className="font-heading font-bold text-xl mb-2 text-foreground">No videos found</h2>
          <p className="text-muted-foreground font-body text-sm mb-6 leading-relaxed">
            {searchInput.trim()
              ? `No masterclasses matched "${searchInput}". Try searching for another topic or skill.`
              : "No published masterclasses available right now."}
          </p>
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="btn-primary text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              type="button"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {paginatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Clean Numbered Pagination */}
          {totalPages > 1 && (
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground font-body">
                Showing {(currentPage - 1) * COURSES_PER_PAGE + 1}–
                {Math.min(currentPage * COURSES_PER_PAGE, courses.length)} of {courses.length}{" "}
                masterclasses
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
                    className={`w-10 h-10 sm:w-9 sm:h-9 min-h-[44px] sm:min-h-0 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                      currentPage === pageNum
                        ? "bg-teal-600 text-white shadow-sm"
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
