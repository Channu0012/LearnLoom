"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getDoubtsFeed,
  getDoubtsByUser,
  getDoubtsForCompletedCourses,
  getUserEnrolledCourses,
  getHelperScore,
} from "@/lib/firestore";
import type { DoubtDoc } from "@/lib/types";
import { DoubtCard } from "@/components/doubts/DoubtCard";
import { DoubtComposer } from "@/components/doubts/DoubtComposer";
import { HelperScoreBadge } from "@/components/doubts/HelperScoreBadge";
import { BattleArena } from "@/components/arena/BattleArena";
import { LeaderboardView } from "@/components/arena/LeaderboardView";

// ── Clean SVG Icon Components (Strictly No Emojis) ───────────────────────────

function DoubtsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function BattleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="17" x2="4" y2="20" />
      <line x1="3" y1="19" x2="5" y2="21" />
    </svg>
  );
}

function LeaderboardIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function PlusIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SearchIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

export type SectionType = "doubts" | "battle" | "leaderboard";
export type DoubtTabType = "all" | "can-help" | "my-doubts";

// ── Unified Arena Page Component ─────────────────────────────────────────────

function ArenaPageContent() {
  const { user, userDoc, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const validInitialTab: SectionType =
    initialTab === "battle" || initialTab === "leaderboard" ? initialTab : "doubts";

  const [activeSection, setActiveSection] = useState<SectionType>(validInitialTab);
  const [activeDoubtTab, setActiveDoubtTab] = useState<DoubtTabType>("all");
  const [doubts, setDoubts] = useState<DoubtDoc[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [userScore, setUserScore] = useState<number>(0);
  const [enrolledCourses, setEnrolledCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [filterCourseId, setFilterCourseId] = useState<string>("");
  const [doubtSearchQuery, setDoubtSearchQuery] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "battle" || tab === "leaderboard" || tab === "doubts") {
      setActiveSection(tab);
    }
  }, [searchParams]);

  // Load user metadata (helper score & enrolled courses)
  useEffect(() => {
    if (!user) {
      setUserScore(0);
      setEnrolledCourses([]);
      return;
    }

    if (typeof userDoc?.helperScore === "number") {
      setUserScore(userDoc.helperScore);
    } else if (typeof getHelperScore === "function") {
      getHelperScore(user.uid)
        .then(setUserScore)
        .catch(() => {});
    }

    if (typeof getUserEnrolledCourses === "function") {
      getUserEnrolledCourses(user.uid)
        .then((courses) => {
          if (Array.isArray(courses)) {
            setEnrolledCourses(courses.map((c) => ({ id: c.id, title: c.title })));
          }
        })
        .catch(() => {});
    }
  }, [user, userDoc?.helperScore]);

  // Load doubts based on current tab & filter
  const fetchDoubts = useCallback(async () => {
    setLoadingDoubts(true);
    try {
      if (activeDoubtTab === "my-doubts") {
        if (!user) {
          setDoubts([]);
        } else if (typeof getDoubtsByUser === "function") {
          const res = await getDoubtsByUser(user.uid);
          setDoubts(res);
        } else {
          setDoubts([]);
        }
      } else if (activeDoubtTab === "can-help") {
        if (!user || enrolledCourses.length === 0) {
          setDoubts([]);
        } else if (typeof getDoubtsForCompletedCourses === "function") {
          const courseIds = enrolledCourses.map((c) => c.id);
          const res = await getDoubtsForCompletedCourses(courseIds, user.uid);
          setDoubts(res);
        } else {
          setDoubts([]);
        }
      } else {
        // "all" tab
        if (typeof getDoubtsFeed === "function") {
          const res = await getDoubtsFeed(30, filterCourseId || undefined);
          setDoubts(res);
        } else {
          setDoubts([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch doubts:", err);
      setDoubts([]);
    } finally {
      setLoadingDoubts(false);
    }
  }, [activeDoubtTab, user, enrolledCourses, filterCourseId]);

  useEffect(() => {
    if (activeSection === "doubts") {
      fetchDoubts();
    }
  }, [fetchDoubts, activeSection]);

  // Filtered doubts by search query
  const filteredDoubts = useMemo(() => {
    if (!doubtSearchQuery.trim()) return doubts;
    const q = doubtSearchQuery.toLowerCase();
    return doubts.filter(
      (d) =>
        d.text.toLowerCase().includes(q) ||
        d.courseTitle.toLowerCase().includes(q) ||
        (d.lessonTitle && d.lessonTitle.toLowerCase().includes(q))
    );
  }, [doubts, doubtSearchQuery]);

  const sectionTabs: { id: SectionType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "doubts", label: "Doubts", icon: <DoubtsIcon size={18} /> },
    { id: "battle", label: "Learn Battle", icon: <BattleIcon size={18} />, badge: "LIVE" },
    { id: "leaderboard", label: "Leaderboard", icon: <LeaderboardIcon size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-16">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
                Arena
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
                Collaborative doubt clearance, 1v1 technical knowledge duels, and verified skill
                rankings.
              </p>
            </div>

            {/* Action buttons contextual per section */}
            <div className="flex flex-wrap items-center gap-2.5">
              {user && activeSection === "doubts" && (
                <div className="flex items-center gap-2 bg-muted/60 border border-border px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-muted-foreground font-medium">Helper Score:</span>
                  <HelperScoreBadge score={userScore} size="md" showLabel />
                </div>
              )}

              {activeSection === "doubts" && (
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      openAuthModal("signin");
                    } else {
                      setComposerOpen(true);
                    }
                  }}
                  className="px-4 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-500 shadow-sm active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <PlusIcon size={15} />
                  <span>Ask a Doubt</span>
                </button>
              )}

              {activeSection === "battle" && (
                <button
                  type="button"
                  onClick={() => setActiveSection("leaderboard")}
                  className="px-3.5 py-1.5 rounded-xl font-heading font-semibold text-xs text-foreground bg-muted border border-border hover:bg-muted/80 transition-all flex items-center gap-1.5"
                >
                  <LeaderboardIcon size={14} />
                  <span>View Standings</span>
                </button>
              )}

              {activeSection === "leaderboard" && (
                <button
                  type="button"
                  onClick={() => setActiveSection("battle")}
                  className="px-4 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-500 shadow-sm active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <BattleIcon size={15} />
                  <span>Enter Battle</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Section Navigation Tabs ───────────────────────────────────── */}
          <div className="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-none">
            {sectionTabs.map((tab) => {
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`relative flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-heading font-semibold transition-colors whitespace-nowrap ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className={
                      isActive ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground"
                    }
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] font-heading font-black px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 leading-none">
                      {tab.badge}
                    </span>
                  )}
                  {/* Active Underline Indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-teal-600 dark:bg-teal-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* ─── 1. DOUBTS SECTION ─────────────────────────────────────────── */}
        {activeSection === "doubts" && (
          <div className="space-y-4">
            {/* Filter Bar: Sub-tabs, Search & Course Select */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveDoubtTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                    activeDoubtTab === "all"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Doubts
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      openAuthModal("signin");
                    } else {
                      setActiveDoubtTab("can-help");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all flex items-center gap-1.5 ${
                    activeDoubtTab === "can-help"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>I Can Help</span>
                  <span className="text-[10px] px-1.5 py-px rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold leading-none">
                    XP
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      openAuthModal("signin");
                    } else {
                      setActiveDoubtTab("my-doubts");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                    activeDoubtTab === "my-doubts"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My Doubts
                </button>
              </div>

              {/* Search & Course Filter */}
              <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-2.5 flex items-center text-muted-foreground pointer-events-none">
                    <SearchIcon size={14} />
                  </span>
                  <input
                    type="text"
                    value={doubtSearchQuery}
                    onChange={(e) => setDoubtSearchQuery(e.target.value)}
                    placeholder="Search doubts or topics..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {activeDoubtTab === "all" && enrolledCourses.length > 0 && (
                  <select
                    value={filterCourseId}
                    onChange={(e) => setFilterCourseId(e.target.value)}
                    className="text-xs bg-card border border-border rounded-xl px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500 max-w-[160px] truncate"
                  >
                    <option value="">All Courses</option>
                    {enrolledCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Doubts Feed */}
            {loadingDoubts ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-28 rounded-2xl bg-card border border-border animate-pulse"
                  />
                ))}
              </div>
            ) : filteredDoubts.length > 0 ? (
              <div className="space-y-3">
                {filteredDoubts.map((doubt) => (
                  <DoubtCard key={doubt.id} doubt={doubt} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 rounded-2xl bg-card border border-dashed border-border/80 my-4">
                <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
                  <DoubtsIcon size={24} />
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-foreground mb-1">
                  {doubtSearchQuery
                    ? "No matching doubts found"
                    : activeDoubtTab === "my-doubts"
                      ? "You haven't posted any doubts yet"
                      : activeDoubtTab === "can-help"
                        ? "No open doubts right now in your enrolled courses"
                        : "No doubts found"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
                  {doubtSearchQuery
                    ? "Try adjusting your search terms or course filter."
                    : activeDoubtTab === "my-doubts"
                      ? "Post a question whenever you encounter difficulties in any video lesson to receive answers from peers."
                      : activeDoubtTab === "can-help"
                        ? "All questions in your enrolled subjects have been answered, or no doubts are active. Check back shortly to earn Helper XP."
                        : "Be the first to post a question for your course community."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) openAuthModal("signin");
                    else setComposerOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl font-heading font-semibold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-sm"
                >
                  Ask a Doubt
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── 2. LEARN BATTLE SECTION ───────────────────────────────────── */}
        {activeSection === "battle" && (
          <BattleArena onLeaderboardClick={() => setActiveSection("leaderboard")} />
        )}

        {/* ─── 3. LEADERBOARD SECTION ────────────────────────────────────── */}
        {activeSection === "leaderboard" && (
          <LeaderboardView onStartBattleClick={() => setActiveSection("battle")} />
        )}
      </main>

      {/* Doubt Composer Modal */}
      <DoubtComposer
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        enrolledCourses={enrolledCourses}
        onCreated={() => {
          fetchDoubts();
        }}
      />
    </div>
  );
}

export default function ArenaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ArenaPageContent />
    </Suspense>
  );
}
