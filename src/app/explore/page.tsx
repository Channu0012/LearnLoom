"use client";

// ---------------------------------------------------------------------------
// Explore page — Bold, Clean & Attractive YouTube-Style Video Discovery
// Features: One prominent search bar, full-strength search engine, zero clutter,
// smart "Refresh Feed" button that prioritizes new or unseen courses (persisted
// in localStorage), and distraction-free video masterclasses grid.
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { searchCoursesFullStrength } from "@/lib/keywords";
import { CATEGORIES } from "@/lib/constants";
import type { CourseDoc } from "@/lib/types";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/CourseCard";

const COURSES_PER_PAGE = 12;
const SEEN_STORAGE_KEY = "learnloom_seen_courses_v1";
const COURSES_CACHE_KEY = "learnloom_explore_courses_cache_v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

let memoryCoursesCache: { courses: CourseDoc[]; timestamp: number } | null = null;

function getCachedCourses(): CourseDoc[] | null {
  if (memoryCoursesCache && Date.now() - memoryCoursesCache.timestamp < CACHE_TTL_MS) {
    return memoryCoursesCache.courses;
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(COURSES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.courses) && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      memoryCoursesCache = parsed;
      return parsed.courses;
    }
  } catch {
    // Ignore cache parse errors
  }
  return null;
}

function setCachedCourses(courses: CourseDoc[]) {
  const payload = { courses, timestamp: Date.now() };
  memoryCoursesCache = payload;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota
  }
}

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"recommended" | "modules" | "newest">("recommended");
  const [rawCourses, setRawCourses] = useState<CourseDoc[]>([]);
  const [feedCourses, setFeedCourses] = useState<CourseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(COURSES_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sync initial URL query param if present (?q=... or ?search=... or ?category=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || params.get("search");
    const cat = params.get("category");
    if (q) setSearchInput(q);
    if (cat) setSelectedCategory(cat);
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
    setVisibleCount(COURSES_PER_PAGE);
    setRefreshMessage(msg);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);

    setTimeout(() => {
      setRefreshMessage("");
    }, 3500);
  }, []);

  // ── Fetch published courses from Firestore (Cache-First) ──────────────
  const fetchCourses = useCallback(
    async (force = false) => {
      if (!force) {
        const cached = getCachedCourses();
        if (cached && cached.length > 0) {
          setRawCourses(cached);
          refreshFeed(cached);
          setLoading(false);
          return;
        }
      }

      setFetchError("");
      setLoading(true);

      try {
        const q = query(collection(db, "courses"), where("status", "==", "published"), limit(200));
        const snap = await getDocs(q);
        const fetched = snap.docs.map((d) => ({
          ...(d.data() as CourseDoc),
          id: d.id,
        }));

        setCachedCourses(fetched);
        setRawCourses(fetched);
        refreshFeed(fetched);
      } catch {
        setFetchError(
          "Unable to load masterclasses right now. Please check your internet connection."
        );
      } finally {
        setLoading(false);
      }
    },
    [refreshFeed]
  );

  useEffect(() => {
    fetchCourses();

    const handleCoursesUpdated = () => {
      memoryCoursesCache = null;
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(COURSES_CACHE_KEY);
        } catch {
          // Ignore
        }
      }
      fetchCourses(true);
    };

    window.addEventListener("learnloom:courses-updated", handleCoursesUpdated);
    return () => {
      window.removeEventListener("learnloom:courses-updated", handleCoursesUpdated);
    };
  }, [fetchCourses]);

  // Compute category count breakdown for faceted navigation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: rawCourses.length };
    for (const c of rawCourses) {
      if (c.category) {
        counts[c.category] = (counts[c.category] || 0) + 1;
      }
    }
    return counts;
  }, [rawCourses]);

  // ── Full-Strength Instant Search & Filtering & Sorting ────────────────
  const courses = useMemo(() => {
    let list: CourseDoc[];
    const queryClean = searchInput.trim();
    if (queryClean) {
      const ranked = searchCoursesFullStrength(rawCourses, queryClean);
      list = ranked.map((r) => r.course);
    } else {
      list = feedCourses;
    }

    if (selectedCategory !== "all") {
      list = list.filter((c) => c.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (sortBy === "modules") {
      return [...list].sort((a, b) => (b.lessonCount || 0) - (a.lessonCount || 0));
    } else if (sortBy === "newest") {
      return [...list].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
    }

    return list;
  }, [rawCourses, feedCourses, searchInput, selectedCategory, sortBy]);

  // Reset visibleCount on search, category, or sort change
  useEffect(() => {
    setVisibleCount(COURSES_PER_PAGE);
  }, [searchInput, selectedCategory, sortBy]);

  const loadMore = useCallback(() => {
    if (visibleCount >= courses.length || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + COURSES_PER_PAGE, courses.length));
      setIsLoadingMore(false);
    }, 200);
  }, [visibleCount, courses.length, isLoadingMore]);

  // YouTube-Style IntersectionObserver for continuous infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "350px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleRefreshClick = () => {
    if (searchInput) setSearchInput("");
    setVisibleCount(COURSES_PER_PAGE);
    refreshFeed(rawCourses);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayedCourses = courses.slice(0, visibleCount);

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
                placeholder="Search..."
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

        {/* Coursera/Google-style Category Faceted Navigation Pills */}
        <div className="mt-5 pt-3 border-t border-border/60">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold shrink-0 transition-all border cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground border-border hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              All Tracks ({categoryCounts.all || 0})
            </button>
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? "all" : cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold shrink-0 transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                      : "bg-card text-muted-foreground hover:text-foreground border-border hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {cat} {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter and Sort Row */}
        <div className="mt-4 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-foreground">{courses.length}</strong> masterclass
              {courses.length !== 1 ? "es" : ""}
              {selectedCategory !== "all" && (
                <>
                  {" "}
                  in{" "}
                  <strong className="text-teal-600 dark:text-teal-400">{selectedCategory}</strong>
                </>
              )}
              {searchInput.trim() && (
                <>
                  {" "}
                  matching &ldquo;<strong className="text-foreground">{searchInput}</strong>&rdquo;
                </>
              )}
            </span>
            {(selectedCategory !== "all" || searchInput.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchInput("");
                }}
                className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer font-semibold ml-1 inline-flex items-center gap-1"
              >
                <span>Clear filters</span>
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-heading font-semibold text-foreground/80">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recommended" | "modules" | "newest")}
              aria-label="Sort masterclasses"
              className="bg-card border border-border rounded-lg px-2.5 py-1 text-xs text-foreground font-heading font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="recommended">Curated Feed</option>
              <option value="modules">Most Modules</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Network Error Banner */}
      {fetchError && (
        <div
          className="enterprise-card p-6 text-center my-6 bg-red-50 dark:bg-red-950/20 border-destructive/30 max-w-lg mx-auto rounded-2xl"
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
        <div className="enterprise-card p-12 text-center max-w-md mx-auto my-12 bg-card border border-border rounded-2xl">
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
            {displayedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* YouTube-Style Infinite Scroll Sentinel & Smooth Loading Indicator */}
          <div ref={sentinelRef} className="w-full py-10 flex flex-col items-center justify-center">
            {visibleCount < courses.length ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-heading font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-4 py-2 rounded-full border border-teal-500/20 shadow-sm animate-fade-in">
                  <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>Loading more masterclasses…</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-body">
                  Showing {displayedCourses.length} of {courses.length} masterclasses
                </span>
              </div>
            ) : courses.length > COURSES_PER_PAGE ? (
              <div className="text-center py-6 space-y-2 border-t border-border/60 w-full max-w-md mx-auto animate-fade-in">
                <p className="text-xs font-heading font-semibold text-muted-foreground">
                  You&apos;ve reached the end of the catalog ({courses.length} masterclasses)
                </p>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-xs font-heading font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Back to top ↑</span>
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
