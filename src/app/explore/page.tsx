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
  const [currentPage, setCurrentPage] = useState(1);
  const COURSES_PER_PAGE = 12;
  const [fetchError, setFetchError] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch courses ────────────────────────────────────────────────────────

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

      // Sort by newest published or created date
      fetched.sort((a, b) => {
        const timeA = a.publishedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
        const timeB = b.publishedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
        return timeB - timeA;
      });

      const ranked = searchTerms.length > 0 ? rankByRelevance(fetched, searchTerms) : fetched;

      setCourses(ranked);
    } catch {
      setFetchError(
        "Unable to load courses right now. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerms]);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerms]);

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
    <div className="container-page py-10 w-full overflow-x-hidden">
      <div className="mb-8" id="explore-heading">
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
          className="input pl-11 text-base sm:text-base py-3 w-full min-h-[48px]"
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
            onClick={() => {
              setSelectedCategory(cat as Category | "All");
              setCurrentPage(1);
            }}
            className={`flex-shrink-0 min-h-[44px] px-4 py-2.5 rounded-full text-xs sm:text-sm font-heading font-semibold transition-all cursor-pointer inline-flex items-center justify-center ${
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
          className="clay-card p-6 text-center my-6 bg-red-50 border-destructive/30 max-w-lg mx-auto"
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
                : `${selectedCategory === "All" ? "All" : selectedCategory} courses (${courses.length})`}
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
