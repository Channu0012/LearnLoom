"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getUserProgress, updateUserDoc } from "@/lib/firestore";
import { getStreakData, getRankBadge, type StreakData } from "@/lib/streak";
import type { ProgressDoc } from "@/lib/types";
import { updateProfile } from "firebase/auth";

/* ═══════════════════════════════════════════════════════════════════════════
   SVG Icon Components — replace every emoji with crisp vector icons
   ═══════════════════════════════════════════════════════════════════════════ */

function IconBookOpen({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconZap({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconAward({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function IconTrendingUp({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconFlame({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function IconShield({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconTarget({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconSwords({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
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

function IconGraduationCap({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function IconEdit({ size = 14, className = "" }: { size?: number; className?: string }) {
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
      className={className}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconCopy({ size = 12, className = "" }: { size?: number; className?: string }) {
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
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconChevronRight({ size = 14, className = "" }: { size?: number; className?: string }) {
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
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconLock({ size = 14, className = "" }: { size?: number; className?: string }) {
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
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconMail({ size = 14, className = "" }: { size?: number; className?: string }) {
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
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconLogOut({ size = 14, className = "" }: { size?: number; className?: string }) {
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
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconUser({ size = 14, className = "" }: { size?: number; className?: string }) {
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
      className={className}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconCalendar({ size = 14, className = "" }: { size?: number; className?: string }) {
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
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconStar({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Profile Page Component
   ═══════════════════════════════════════════════════════════════════════════ */

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

  // Password Reset
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

  // Copy UID
  const handleCopyUid = () => {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid).then(() => {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    });
  };

  // Update display name
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

  // Password reset
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

  // Milestone Badges
  const milestoneBadges = useMemo(() => {
    const currentStreak = streak?.currentStreak || 0;
    const bestStreak = streak?.bestStreak || 0;
    const effectiveStreak = Math.max(currentStreak, bestStreak);

    return [
      {
        id: "first_spark",
        title: "First Spark",
        desc: "Complete your very first video lesson",
        Icon: IconGraduationCap,
        unlocked: totalCompletedLessons > 0,
        progressText: totalCompletedLessons > 0 ? "Unlocked" : "Complete 1 lesson",
      },
      {
        id: "streak_initiate",
        title: "Streak Initiate",
        desc: "Achieve an unbroken 3-day learning streak",
        Icon: IconFlame,
        unlocked: effectiveStreak >= 3,
        progressText: effectiveStreak >= 3 ? "Unlocked" : `${effectiveStreak}/3 Days`,
      },
      {
        id: "dedicated_scholar",
        title: "Dedicated Scholar",
        desc: "Maintain a full 7-day study streak",
        Icon: IconZap,
        unlocked: effectiveStreak >= 7,
        progressText: effectiveStreak >= 7 ? "Unlocked" : `${effectiveStreak}/7 Days`,
      },
      {
        id: "shield_bearer",
        title: "Shield Bearer",
        desc: "Have an emergency monthly streak shield ready",
        Icon: IconShield,
        unlocked: Boolean(streak?.streakShieldAvailable),
        progressText: streak?.streakShieldAvailable
          ? "Ready & Protected"
          : "Shield Spent This Month",
      },
      {
        id: "certified_master",
        title: "Certified Master",
        desc: "Pass quizzes and earn an official certificate",
        Icon: IconAward,
        unlocked: totalCertificates > 0,
        progressText: totalCertificates > 0 ? `${totalCertificates} Earned` : "0 Earned Yet",
      },
      {
        id: "arena_contender",
        title: "Arena Contender",
        desc: "Participate in 1v1 battle arena or doubt solving",
        Icon: IconSwords,
        unlocked: (userDoc?.battlesPlayed || 0) > 0 || (userDoc?.doubtsAnswered || 0) > 0,
        progressText:
          (userDoc?.battlesPlayed || 0) > 0 ? `${userDoc?.battlesPlayed} Battles` : "Enter Arena",
      },
    ];
  }, [streak, totalCompletedLessons, totalCertificates, userDoc]);

  /* ─── Loading Skeleton ─────────────────────────────────────────────────── */
  if (loading || !user || isLoadingData) {
    return (
      <div className="container-page py-10 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-48 rounded-2xl bg-muted/50" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/40" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 h-56 rounded-2xl bg-muted/40" />
          <div className="lg:col-span-2 h-56 rounded-2xl bg-muted/40" />
        </div>
      </div>
    );
  }

  const isTodayComplete = streak?.todayLessonsCompleted && streak.todayLessonsCompleted > 0;
  const isGoogleUser = user.providerData?.some((p) => p.providerId === "google.com");
  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Member";

  return (
    <div className="container-page py-8 sm:py-12 max-w-4xl mx-auto space-y-6">
      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Identity Card
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative rounded-2xl bg-card border border-border overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "Profile"}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-heading font-black text-3xl sm:text-4xl select-none">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-[2.5px] border-card"
                title="Active"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="font-heading font-black text-xl sm:text-2xl text-foreground truncate">
                  {user.displayName || "VeySkill Scholar"}
                </h1>
                {userDoc?.isAdmin && (
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/12 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    Admin
                  </span>
                )}
                <span
                  className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md border border-border/40 ${rank.color}`}
                >
                  {rank.rank}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-body text-muted-foreground mb-4">
                <span className="inline-flex items-center gap-1.5">
                  <IconMail size={13} className="opacity-50" />
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar size={13} className="opacity-50" />
                  Joined {memberSince}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="inline-flex items-center gap-1 font-mono text-[11px] hover:text-foreground transition-colors cursor-pointer"
                  title="Copy Scholar UID"
                >
                  <span>UID: {user.uid.slice(0, 8)}...</span>
                  {copiedUid ? (
                    <IconCheck size={11} className="text-emerald-500" />
                  ) : (
                    <IconCopy size={11} className="opacity-50" />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewName(user.displayName || "");
                    setIsEditingName(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-heading font-semibold border border-border bg-card hover:bg-muted transition-colors cursor-pointer"
                >
                  <IconEdit size={13} />
                  <span>Edit Profile</span>
                </button>

                <Link
                  href="/my-learning"
                  className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-heading font-bold"
                >
                  <span>Continue Learning</span>
                  <IconChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — KPI Metrics Grid
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Enrolled Courses",
            value: progressList.length,
            Icon: IconBookOpen,
            href: "/my-learning",
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/8",
          },
          {
            label: "Lessons Done",
            value: totalCompletedLessons,
            Icon: IconZap,
            href: "/my-learning",
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/8",
          },
          {
            label: "Certificates",
            value: totalCertificates,
            Icon: IconAward,
            href: "/my-learning",
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/8",
          },
          {
            label: "Total XP",
            value: streak?.totalXp || 0,
            Icon: IconTrendingUp,
            href: "#rank",
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/8",
          },
        ].map((kpi, i) => (
          <Link
            key={i}
            href={kpi.href}
            className="group p-4 rounded-xl bg-card border border-border hover:border-teal-500/30 transition-all"
          >
            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.Icon size={16} className={kpi.color} />
            </div>
            <p className="font-heading font-black text-2xl text-foreground leading-none">
              {kpi.value.toLocaleString()}
            </p>
            <p className="font-body text-[11px] text-muted-foreground mt-1">{kpi.label}</p>
          </Link>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Streak + XP Rank (side-by-side)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Streak Panel (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isTodayComplete
                    ? "bg-amber-500/12 text-amber-500"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <IconFlame size={20} />
              </div>
              <div>
                <h2 className="font-heading font-black text-lg text-foreground leading-tight">
                  {streak?.currentStreak || 0}-Day Streak
                </h2>
                <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                  {isTodayComplete
                    ? "Today's streak is secured."
                    : "Complete any lesson to keep your streak."}
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md flex-shrink-0 ${
                isTodayComplete
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {isTodayComplete ? "Active" : "Pending"}
            </span>
          </div>

          {/* Streak stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
              <p className="font-heading font-black text-lg text-foreground leading-none">
                {streak?.currentStreak || 0}
              </p>
              <p className="text-[10px] font-body text-muted-foreground mt-1">Current</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
              <p className="font-heading font-black text-lg text-foreground leading-none">
                {streak?.bestStreak || 0}
              </p>
              <p className="text-[10px] font-body text-muted-foreground mt-1">Best Ever</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1">
                <IconShield
                  size={14}
                  className={
                    streak?.streakShieldAvailable ? "text-teal-500" : "text-muted-foreground"
                  }
                />
                <p className="font-heading font-black text-sm text-foreground leading-none">
                  {streak?.streakShieldAvailable ? "Active" : "Used"}
                </p>
              </div>
              <p className="text-[10px] font-body text-muted-foreground mt-1">Monthly Shield</p>
            </div>
          </div>

          {/* Shield info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-500/5 border border-teal-500/15 text-xs">
            <IconShield size={16} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <p className="font-body text-muted-foreground leading-relaxed">
              <span className="font-heading font-bold text-foreground">Streak Shield</span> — One
              automatic monthly protection so a missed day won&apos;t erase your progress.
            </p>
          </div>
        </div>

        {/* XP Rank Panel (2 cols) */}
        <div
          id="rank"
          className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 sm:p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted-foreground">
                Scholar Tier
              </span>
              <span className={`text-xs font-heading font-black ${rank.color}`}>{rank.rank}</span>
            </div>

            <div className="text-center py-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/15 mb-3">
                <IconStar size={24} className="text-teal-500" />
              </div>
              <p className="font-heading font-black text-3xl text-foreground">
                {(streak?.totalXp || 0).toLocaleString()}
                <span className="text-sm font-semibold text-muted-foreground ml-1.5">XP</span>
              </p>
              <p className="font-body text-[11px] text-muted-foreground mt-1">
                {remainingXp > 0
                  ? `${remainingXp.toLocaleString()} XP to next tier`
                  : "Maximum Tier Attained"}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-3 space-y-1.5">
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>{(streak?.totalXp || 0).toLocaleString()}</span>
                <span>{nextTarget.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/50 space-y-1.5 text-[11px] font-body text-muted-foreground">
            <p className="font-heading font-bold text-foreground text-xs mb-1.5">Earn XP</p>
            <div className="flex items-center gap-2">
              <IconTarget size={12} className="text-teal-500 flex-shrink-0" />
              <span>Complete a lesson: +10 XP</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck size={12} className="text-teal-500 flex-shrink-0" />
              <span>Pass a quiz: +25 XP</span>
            </div>
            <div className="flex items-center gap-2">
              <IconSwords size={12} className="text-teal-500 flex-shrink-0" />
              <span>Win a battle: +50 XP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — Achievements
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl bg-card border border-border p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="font-heading font-black text-lg text-foreground">Achievements</h2>
          <p className="font-body text-[11px] text-muted-foreground mt-0.5">
            Unlock credentials as you progress through your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {milestoneBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border transition-all ${
                badge.unlocked
                  ? "bg-card border-border hover:border-teal-500/30"
                  : "bg-muted/20 border-border/40 opacity-55"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    badge.unlocked
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <badge.Icon size={18} />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    badge.unlocked
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-transparent"
                  }`}
                >
                  {badge.progressText}
                </span>
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground">{badge.title}</h3>
              <p className="font-body text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — Account & Security
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl bg-card border border-border p-5 sm:p-6 space-y-1">
        <h2 className="font-heading font-black text-lg text-foreground mb-4">Account Settings</h2>

        <div className="divide-y divide-border/50">
          {/* Auth Method */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconUser size={14} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-foreground">Authentication</p>
                <p className="font-body text-[11px] text-muted-foreground">
                  {isGoogleUser
                    ? "Signed in with verified Google OAuth"
                    : "Email and password authentication"}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg bg-muted text-foreground border border-border w-fit">
              {isGoogleUser ? "Google Account" : "Password"}
            </span>
          </div>

          {/* Password Reset */}
          {!isGoogleUser && (
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconLock size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-foreground">Password</p>
                  <p className="font-body text-[11px] text-muted-foreground">
                    Send a recovery email to reset your password.
                  </p>
                  {resetSent && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <IconCheck size={11} /> Recovery email sent
                    </p>
                  )}
                  {resetError && (
                    <p className="text-[11px] text-destructive font-semibold mt-1">{resetError}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleTriggerPasswordReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-heading font-semibold border border-border bg-card hover:bg-muted transition-colors cursor-pointer w-fit"
              >
                <IconMail size={13} />
                Reset Password
              </button>
            </div>
          )}

          {/* Sign Out */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-destructive/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconLogOut size={14} className="text-destructive" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-foreground">Sign Out</p>
                <p className="font-body text-[11px] text-muted-foreground">
                  End your current session on this device.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-heading font-semibold border border-destructive/25 text-destructive hover:bg-destructive/8 transition-colors cursor-pointer w-fit"
            >
              <IconLogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Edit Name Modal
          ══════════════════════════════════════════════════════════════════════ */}
      {isEditingName && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-lg text-foreground">Edit Display Name</h3>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close dialog"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="font-body text-[11px] text-muted-foreground">
              This name appears on your verified certificates.
            </p>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-name-input"
                  className="block text-xs font-heading font-bold text-foreground mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="edit-name-input"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                  required
                />
                {nameError && (
                  <p className="text-[11px] text-destructive mt-1 font-body">{nameError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-4 py-2 rounded-lg text-xs font-heading font-semibold border border-border bg-card hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingName}
                  className="btn-primary px-4 py-2 rounded-lg text-xs font-heading font-bold"
                >
                  {isSavingName ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
