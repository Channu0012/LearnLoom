"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getUserProgress, updateUserDoc } from "@/lib/firestore";
import { getStreakData, getRankBadge, getLocalDateString, type StreakData } from "@/lib/streak";
import type { ProgressDoc } from "@/lib/types";
import { updateProfile } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userDoc, loading, signOut, resetPassword } = useAuth();

  const [streak, setStreak] = useState<StreakData | null>(null);
  const [progressList, setProgressList] = useState<ProgressDoc[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Edit Name Modal State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  // Copy UID Feedback
  const [copiedUid, setCopiedUid] = useState(false);

  // Password Reset Toast
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  // Route protection
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [loading, user, router]);

  // Load streak and course progress
  useEffect(() => {
    if (!user) return;

    setStreak(getStreakData());

    const handleStreakUpdate = (e: Event) => {
      const detail = (e as CustomEvent<StreakData>).detail;
      if (detail) setStreak(detail);
      else setStreak(getStreakData());
    };

    window.addEventListener("veyskill:streak-updated", handleStreakUpdate);

    (async () => {
      try {
        const list = await getUserProgress(user.uid);
        setProgressList(list);
      } catch {
        // Silently continue
      } finally {
        setIsLoadingData(false);
      }
    })();

    return () => {
      window.removeEventListener("veyskill:streak-updated", handleStreakUpdate);
    };
  }, [user]);

  // Copy UID helper
  const handleCopyUid = () => {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid).then(() => {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    });
  };

  // Update display name helper
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError("Full name must be at least 2 characters.");
      return;
    }

    setIsSavingName(true);
    setNameError("");
    try {
      await updateProfile(user, { displayName: trimmed });
      await updateUserDoc(user.uid, { displayName: trimmed });
      setIsEditingName(false);
    } catch {
      setNameError("Could not update name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

  // Password reset helper
  const handleTriggerPasswordReset = async () => {
    if (!user?.email) return;
    setResetSent(false);
    setResetError("");
    try {
      const ok = await resetPassword(user.email);
      if (ok) {
        setResetSent(true);
        setTimeout(() => setResetSent(false), 5000);
      } else {
        setResetError("Could not dispatch reset email. Please try again later.");
      }
    } catch {
      setResetError("Failed to send reset email.");
    }
  };

  // Generate 14-day Habit Matrix
  const habitMatrix = useMemo(() => {
    const days: { dateStr: string; label: string; isActive: boolean; isToday: boolean }[] = [];
    const todayStr = getLocalDateString();
    const activeDatesSet = new Set(streak?.recentActiveDates || []);
    if (streak?.lastActiveDate === todayStr) {
      activeDatesSet.add(todayStr);
    }

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });
      days.push({
        dateStr,
        label: dayName,
        isActive: activeDatesSet.has(dateStr),
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [streak]);

  // Derived metrics
  const totalCompletedLessons = useMemo(() => {
    return progressList.reduce((acc, p) => acc + (p.completedLessonIds?.length || 0), 0);
  }, [progressList]);

  const totalCertificates = useMemo(() => {
    return progressList.filter(
      (p) =>
        Boolean(p.certificateIssued) || Boolean(p.certificateId) || Boolean(p.hasPaidCertificate)
    ).length;
  }, [progressList]);

  // Rank progression
  const rank = useMemo(() => {
    const xp = streak?.totalXp || 0;
    return getRankBadge(xp);
  }, [streak?.totalXp]);

  const { nextTarget, progressPercent, remainingXp } = useMemo(() => {
    const xp = streak?.totalXp || 0;
    let target = 200;
    if (xp >= 2000) target = 5000;
    else if (xp >= 1000) target = 2000;
    else if (xp >= 500) target = 1000;
    else if (xp >= 200) target = 500;

    const pct = Math.min(100, Math.round((xp / target) * 100));
    return {
      nextTarget: target,
      progressPercent: pct,
      remainingXp: Math.max(0, target - xp),
    };
  }, [streak?.totalXp]);

  // Milestone Badges Evaluation
  const milestoneBadges = useMemo(() => {
    const currentStreak = streak?.currentStreak || 0;
    const bestStreak = streak?.bestStreak || 0;
    const effectiveStreak = Math.max(currentStreak, bestStreak);

    return [
      {
        id: "first_spark",
        title: "First Spark",
        desc: "Complete your very first video lesson",
        icon: "🎓",
        unlocked: totalCompletedLessons > 0,
        progressText: totalCompletedLessons > 0 ? "Unlocked" : "Complete 1 lesson",
      },
      {
        id: "streak_initiate",
        title: "Streak Initiate",
        desc: "Achieve an unbroken 3-day learning streak",
        icon: "🔥",
        unlocked: effectiveStreak >= 3,
        progressText: effectiveStreak >= 3 ? "Unlocked" : `${effectiveStreak}/3 Days`,
      },
      {
        id: "dedicated_scholar",
        title: "Dedicated Scholar",
        desc: "Maintain a full 7-day study streak",
        icon: "⚡",
        unlocked: effectiveStreak >= 7,
        progressText: effectiveStreak >= 7 ? "Unlocked" : `${effectiveStreak}/7 Days`,
      },
      {
        id: "shield_bearer",
        title: "Shield Bearer",
        desc: "Have an emergency monthly streak shield ready",
        icon: "🛡️",
        unlocked: Boolean(streak?.streakShieldAvailable),
        progressText: streak?.streakShieldAvailable
          ? "Ready & Protected"
          : "Shield Spent This Month",
      },
      {
        id: "certified_master",
        title: "Certified Master",
        desc: "Pass quizzes and earn an official certificate",
        icon: "🏆",
        unlocked: totalCertificates > 0,
        progressText: totalCertificates > 0 ? `${totalCertificates} Earned` : "0 Earned Yet",
      },
      {
        id: "arena_contender",
        title: "Arena Contender",
        desc: "Participate in 1v1 battle arena or doubt solving",
        icon: "⚔️",
        unlocked: (userDoc?.battlesPlayed || 0) > 0 || (userDoc?.doubtsAnswered || 0) > 0,
        progressText:
          (userDoc?.battlesPlayed || 0) > 0 ? `${userDoc?.battlesPlayed} Battles` : "Enter Arena",
      },
    ];
  }, [streak, totalCompletedLessons, totalCertificates, userDoc]);

  // Loading Skeleton
  if (loading || !user || isLoadingData) {
    return (
      <div className="container-page py-10 max-w-5xl mx-auto space-y-8 animate-pulse">
        {/* Cover Skeleton */}
        <div className="h-44 sm:h-52 rounded-3xl bg-muted/70" />
        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/60" />
          ))}
        </div>
        {/* Streak & Rank Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-2xl bg-muted/60" />
          <div className="h-72 rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  const isTodayComplete = streak?.todayLessonsCompleted && streak.todayLessonsCompleted > 0;
  const isGoogleUser = user.providerData?.some((p) => p.providerId === "google.com");
  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Member";

  return (
    <div className="container-page py-8 sm:py-12 max-w-5xl mx-auto space-y-8">
      {/* ── 1. Hero Identity & Scholar Card ─────────────────────────────────── */}
      <div className="relative rounded-3xl bg-card border border-border shadow-md overflow-hidden">
        {/* Subtle geometric gradient cover */}
        <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(#14b8a6 1px, transparent 1px), radial-gradient(#059669 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
            }}
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-teal-300 border border-teal-500/30">
              Verified Scholar Profile
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar with Rank Ring */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl border-4 border-card bg-card shadow-xl overflow-hidden flex items-center justify-center">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "Scholar"}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-heading font-black text-3xl">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
              {/* Online / Active status pulse */}
              <span
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card"
                title="Active Account"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setNewName(user.displayName || "");
                  setIsEditingName(true);
                }}
                className="btn-secondary text-xs px-3.5 py-2 rounded-xl"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Edit Profile</span>
              </button>

              <Link
                href="/my-learning"
                className="btn-primary text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
              >
                <span>Continue Learning</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground">
                {user.displayName || "VeySkill Scholar"}
              </h1>
              {userDoc?.isAdmin && (
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Admin
                </span>
              )}
              <span
                className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-teal-500/10 ${rank.color} border border-teal-500/20`}
              >
                {rank.rank}
              </span>
            </div>

            <p className="font-body text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{user.email}</span>
              <span className="text-border">•</span>
              <span>Joined {memberSince}</span>
              <span className="text-border">•</span>
              <button
                type="button"
                onClick={handleCopyUid}
                className="inline-flex items-center gap-1 font-mono text-xs hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
                title="Copy Scholar UID"
              >
                <span>UID: {user.uid.slice(0, 8)}…</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copiedUid && (
                  <span className="text-emerald-500 font-bold text-[10px]">Copied!</span>
                )}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Academic Metrics KPI Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          {
            label: "Enrolled Courses",
            value: progressList.length,
            icon: "📚",
            href: "/my-learning",
            desc: "Active Roadmaps",
          },
          {
            label: "Lessons Completed",
            value: totalCompletedLessons,
            icon: "⚡",
            href: "/my-learning",
            desc: "Curriculum Units",
          },
          {
            label: "Certificates Earned",
            value: totalCertificates,
            icon: "🏆",
            href: "/my-learning",
            desc: "Verified Credentials",
          },
          {
            label: "Total Scholar XP",
            value: streak?.totalXp || 0,
            icon: "✨",
            href: "#xp-progress",
            desc: rank.rank,
          },
        ].map((kpi, i) => (
          <Link
            key={i}
            href={kpi.href}
            className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-teal-500/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className="text-[10px] font-mono uppercase text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400">
                View →
              </span>
            </div>
            <p className="font-heading font-black text-2xl sm:text-3xl text-foreground">
              {kpi.value}
            </p>
            <p className="font-heading font-semibold text-xs text-foreground/90 mt-0.5">
              {kpi.label}
            </p>
            <p className="font-body text-[11px] text-muted-foreground">{kpi.desc}</p>
          </Link>
        ))}
      </div>

      {/* ── 3. Habit & Streak Command Center ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak & 14-Day Heatmap (2 cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                  isTodayComplete
                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-black text-xl text-foreground">
                    {streak?.currentStreak || 0}-Day Daily Streak
                  </h2>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isTodayComplete
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {isTodayComplete ? "Active Today" : "Study Today"}
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  {isTodayComplete
                    ? "Fantastic work! Today's streak is defended."
                    : "Complete any lesson today to keep your streak burning."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-body text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
              <div>
                <span className="block font-heading font-black text-foreground text-sm">
                  {streak?.bestStreak || 0} Days
                </span>
                <span className="text-[10px]">All-Time Best</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div>
                <span className="block font-heading font-black text-foreground text-sm">
                  {streak?.streakShieldAvailable ? "1 Ready" : "Used"}
                </span>
                <span className="text-[10px]">Monthly Shield</span>
              </div>
            </div>
          </div>

          {/* 14-Day Visual Habit Heatmap */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-heading font-bold text-foreground">
                14-Day Activity Consistency
              </span>
              <span className="text-[11px] font-body text-muted-foreground">
                {habitMatrix.filter((d) => d.isActive).length} active days in last 2 weeks
              </span>
            </div>

            <div className="grid grid-cols-14 gap-1.5 sm:gap-2">
              {habitMatrix.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    title={`${day.dateStr}: ${day.isActive ? "Studied" : "Rest"}`}
                    className={`w-full aspect-square rounded-lg transition-all flex items-center justify-center text-[10px] font-bold ${
                      day.isActive
                        ? "bg-teal-500 text-white shadow-xs"
                        : "bg-muted/70 text-muted-foreground/60 border border-border/50"
                    } ${day.isToday ? "ring-2 ring-teal-500 ring-offset-2 ring-offset-card" : ""}`}
                  >
                    {day.isActive ? "✓" : ""}
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Shield Info Banner */}
          <div className="p-3.5 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex items-center gap-3 text-xs font-body text-foreground">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 text-base">
              🛡️
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-foreground">
                Monthly Streak Shield Defense
              </p>
              <p className="text-muted-foreground text-[11px]">
                Life gets busy. VeySkill gives every scholar 1 automatic monthly streak shield so an
                unforeseen missed day won&apos;t erase your hard-earned progress.
              </p>
            </div>
          </div>
        </div>

        {/* Scholar Rank & XP Engine (1 col) */}
        <div
          id="xp-progress"
          className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-5"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                Scholar Tier
              </span>
              <span className={`text-xs font-heading font-black ${rank.color}`}>{rank.rank}</span>
            </div>

            <div className="text-center py-4">
              <p className="font-heading font-black text-4xl text-foreground">
                {streak?.totalXp || 0}
                <span className="text-sm font-semibold text-muted-foreground ml-1">XP</span>
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                {remainingXp > 0
                  ? `${remainingXp} XP until next tier target`
                  : "Maximum Scholar Tier Attained!"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 mt-2">
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{streak?.totalXp || 0} XP</span>
                <span>{nextTarget} XP</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 text-xs font-body text-muted-foreground space-y-1">
            <p className="font-heading font-bold text-foreground text-xs">How to earn XP:</p>
            <p>• Complete a video lesson: +10 XP</p>
            <p>• Pass a checkpoint quiz: +25 XP</p>
            <p>• 1v1 Battle Arena victory: +50 XP</p>
          </div>
        </div>
      </div>

      {/* ── 4. Milestone Badges Showcase ───────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
        <div>
          <h2 className="font-heading font-black text-xl text-foreground">
            Milestone Achievements
          </h2>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Collect verifiable credentials as you progress through disciplines and maintain study
            habits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestoneBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all ${
                badge.unlocked
                  ? "bg-card border-teal-500/30 shadow-xs"
                  : "bg-muted/30 border-border/50 opacity-65"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-2xl ${badge.unlocked ? "" : "grayscale"}`}>
                  {badge.icon}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    badge.unlocked
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {badge.progressText}
                </span>
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground">{badge.title}</h3>
              <p className="font-body text-xs text-muted-foreground mt-0.5 leading-normal">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Account & Security Management ────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
        <h2 className="font-heading font-black text-xl text-foreground">
          Account &amp; Security Settings
        </h2>

        <div className="divide-y divide-border/60">
          {/* Provider row */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-heading font-bold text-sm text-foreground">Sign-In Method</p>
              <p className="font-body text-xs text-muted-foreground">
                {isGoogleUser
                  ? "Authenticated via verified Google OAuth"
                  : "Email and password authentication"}
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-muted text-foreground border border-border w-fit">
              {isGoogleUser ? "Google Account" : "Password Protected"}
            </span>
          </div>

          {/* Password Reset */}
          {!isGoogleUser && (
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-heading font-bold text-sm text-foreground">Account Password</p>
                <p className="font-body text-xs text-muted-foreground">
                  Send a password recovery email to your registered inbox.
                </p>
                {resetSent && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    ✓ Recovery instructions dispatched to your email!
                  </p>
                )}
                {resetError && (
                  <p className="text-xs text-destructive font-semibold mt-1">{resetError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleTriggerPasswordReset}
                className="btn-secondary text-xs px-4 py-2 rounded-xl"
              >
                Send Reset Link
              </button>
            </div>
          )}

          {/* Danger Zone / Sign Out */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-heading font-bold text-sm text-foreground">Session Management</p>
              <p className="font-body text-xs text-muted-foreground">
                Sign out of your active session on this device.
              </p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="px-4 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-heading font-bold cursor-pointer transition-colors w-fit"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Name Modal ─────────────────────────────────────────────────── */}
      {isEditingName && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-lg text-foreground">Edit Full Name</h3>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              This name appears on your official verified certificates of completion.
            </p>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-name-input"
                  className="block text-xs font-heading font-bold text-foreground mb-1.5"
                >
                  Full Legal / Display Name
                </label>
                <input
                  id="edit-name-input"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                  required
                />
                {nameError && (
                  <p className="text-xs text-destructive mt-1 font-body">{nameError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="btn-secondary text-xs px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingName}
                  className="btn-primary text-xs px-4 py-2 rounded-xl"
                >
                  {isSavingName ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
