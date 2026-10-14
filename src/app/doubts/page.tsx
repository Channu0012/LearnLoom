"use client";

import { useEffect, useState, useCallback } from "react";
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

type TabType = "all" | "can-help" | "my-doubts";

export default function DoubtsPage() {
  const { user, userDoc, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [doubts, setDoubts] = useState<DoubtDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [userScore, setUserScore] = useState<number>(0);
  const [enrolledCourses, setEnrolledCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [filterCourseId, setFilterCourseId] = useState<string>("");

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
    setLoading(true);
    try {
      if (activeTab === "my-doubts") {
        if (!user) {
          setDoubts([]);
        } else {
          const res = await getDoubtsByUser(user.uid);
          setDoubts(res);
        }
      } else if (activeTab === "can-help") {
        if (!user || enrolledCourses.length === 0) {
          setDoubts([]);
        } else {
          const courseIds = enrolledCourses.map((c) => c.id);
          const res = await getDoubtsForCompletedCourses(courseIds, user.uid);
          setDoubts(res);
        }
      } else {
        // "all" tab
        const res = await getDoubtsFeed(25, filterCourseId || undefined);
        setDoubts(res);
      }
    } catch (err) {
      console.error("Failed to fetch doubts:", err);
      setDoubts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user, enrolledCourses, filterCourseId]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-16">
      {/* Hero / Header Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-primary-500/5 via-background to-background py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-heading font-bold mb-3">
                <span>🧠</span>
                <span>Peer-to-Peer Learning</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight">
                Doubt Solve Hub
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
                Get unstuck fast. Ask questions from any lesson, or help fellow students solve
                doubts to climb the Helper leaderboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-2 rounded-2xl shadow-xs">
                  <span className="text-xs text-muted-foreground font-medium">Your Score:</span>
                  <HelperScoreBadge score={userScore} size="md" showLabel />
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    openAuthModal("signin");
                  } else {
                    setComposerOpen(true);
                  }
                }}
                className="px-5 py-2.5 rounded-2xl font-heading font-bold text-sm text-white bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Ask a Doubt</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-border/60 overflow-x-auto">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-heading font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🌐 All Doubts
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    openAuthModal("signin");
                  } else {
                    setActiveTab("can-help");
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-heading font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "can-help"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>🤝 I Can Help</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                  XP
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    openAuthModal("signin");
                  } else {
                    setActiveTab("my-doubts");
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-heading font-semibold transition-all ${
                  activeTab === "my-doubts"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🙋 My Doubts
              </button>
            </div>

            {/* Course Filter (for All Doubts tab) */}
            {activeTab === "all" && enrolledCourses.length > 0 && (
              <select
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="text-xs bg-card border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 max-w-[200px] truncate"
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
      </section>

      {/* Doubts Feed */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl bg-card/60 border border-border animate-pulse"
              />
            ))}
          </div>
        ) : doubts.length > 0 ? (
          <div className="space-y-3">
            {doubts.map((doubt) => (
              <DoubtCard key={doubt.id} doubt={doubt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-card border border-dashed border-border/80 my-4">
            <div className="w-16 h-16 rounded-3xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center text-3xl mx-auto mb-4">
              {activeTab === "my-doubts" ? "🙋" : activeTab === "can-help" ? "🤝" : "💡"}
            </div>
            <h3 className="font-heading font-bold text-lg mb-1">
              {activeTab === "my-doubts"
                ? "You haven't posted any doubts yet"
                : activeTab === "can-help"
                  ? "No open doubts right now in your courses"
                  : "No doubts found"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              {activeTab === "my-doubts"
                ? "Whenever you're stuck on a lesson or concept, post a doubt here to get clear answers from fellow learners."
                : activeTab === "can-help"
                  ? "Great job! All doubts in your completed/enrolled courses are solved, or no one has asked yet. Check back soon to earn XP!"
                  : "Be the first one to ask a doubt or start a discussion for your course."}
            </p>
            <button
              type="button"
              onClick={() => {
                if (!user) openAuthModal("signin");
                else setComposerOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl font-heading font-semibold text-sm text-white bg-primary-600 hover:bg-primary-500 transition-all shadow-sm"
            >
              Ask the First Doubt
            </button>
          </div>
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
