"use client";

// ---------------------------------------------------------------------------
// Explore page — category tabs, search box, paginated course grid
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback, useRef } from "react";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CATEGORIES, PAGE_SIZE, type Category } from "@/lib/constants";
import { parseQueryTerms, rankByRelevance } from "@/lib/keywords";
import type { CourseDoc } from "@/lib/types";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/CourseCard";

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

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [courses, setCourses] = useState<CourseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch courses ────────────────────────────────────────────────────────

  const fetchCourses = useCallback(
    async (reset = true) => {
      setFetchError("");
      if (reset) {
        setLoading(true);
        setHasMore(false);
      } else {
        setLoadingMore(true);
      }

      try {
        const q = buildQuery(selectedCategory, searchTerms);
        const snap = await getDocs(q);
        const fetched = snap.docs.map((d) => ({
          ...(d.data() as CourseDoc),
          id: d.id,
        }));

        // Sort by newest published or created date
        fetched.sort((a, b) => {
          const timeA = a.publishedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
          const timeB = b.publishedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
          return timeB - timeA;
        });

        const ranked = searchTerms.length > 0 ? rankByRelevance(fetched, searchTerms) : fetched;

        setCourses(ranked);
        setHasMore(false);
      } catch {
        setFetchError(
          "Unable to load courses right now. Please check your internet connection and try again."
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, searchTerms]
  );

  useEffect(() => {
    fetchCourses(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerms]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchTerms(parseQueryTerms(value));
    }, 300);
  };

  return (
    <div className="container-page py-10 w-full overflow-x-hidden">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground mb-2">
          Explore Courses
        </h1>
        <p className="font-body text-sm sm:text-base text-muted-foreground">
          Discover community-built courses and learn at your own pace without distractions.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
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
          placeholder="Search by title, topic, or keyword (e.g. Next.js, Python, Guitar)…"
          className="input pl-11 text-sm sm:text-base py-3 w-full"
          aria-label="Search courses"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1"
            aria-label="Clear search input"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category tabs */}
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
            onClick={() => setSelectedCategory(cat as Category | "All")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-heading font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-primary-500 text-white shadow-sm"
                : "bg-card border border-border text-foreground/80 hover:border-primary-400 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Fetch Error Banner */}
      {fetchError && (
        <div
          className="clay-card p-6 text-center my-6 bg-red-50 border-destructive/30 max-w-lg mx-auto"
          role="alert"
        >
          <p className="text-destructive font-body text-sm mb-4">{fetchError}</p>
          <button
            type="button"
            onClick={() => fetchCourses(true)}
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
        <div className="clay-card p-12 text-center max-w-md mx-auto my-8 bg-card border-border">
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
                : `${selectedCategory === "All" ? "All" : selectedCategory} courses (${courses.length})`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => fetchCourses(false)}
                disabled={loadingMore}
                className="btn-ghost px-8 py-3 text-sm inline-flex items-center gap-2"
                type="button"
              >
                {loadingMore ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Loading courses…</span>
                  </>
                ) : (
                  <span>Load more courses</span>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
