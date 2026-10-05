"use client";

// ---------------------------------------------------------------------------
// Create / Edit Course Page
// /create → new course
// /edit/[courseId] → edit existing draft (owner only)
// ---------------------------------------------------------------------------
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LIMITS,
  extractYouTubeId,
  extractYouTubePlaylistId,
  youtubeThumbnail,
  type Category,
} from "@/lib/constants";
import type { LessonInput } from "@/lib/types";
import { generateKeywords } from "@/lib/keywords";
import {
  createCourse,
  updateCourse,
  batchSetLessons,
  clearLessons,
  getLessons,
  getCourse,
} from "@/lib/firestore";
import { serverTimestamp } from "firebase/firestore";
import {
  validateEducationalContent,
  validateCourseEducation,
  validatePlaylistEducation,
} from "@/lib/contentFilter";

// ── Lesson row component ──────────────────────────────────────────────────

function LessonRow({
  lesson,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  onTitleChange,
}: {
  lesson: LessonInput;
  index: number;
  total: number;
  onRemove: (_id: string) => void;
  onMoveUp: (_id: string) => void;
  onMoveDown: (_id: string) => void;
  onTitleChange: (_id: string, _title: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 clay-card bg-muted/40 group">
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
        {/* Order number */}
        <span className="text-xs font-heading font-bold text-muted-foreground w-5 text-center flex-shrink-0">
          {index + 1}
        </span>

        {/* Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lesson.thumbnailUrl}
          alt={lesson.title ? `${lesson.title} preview` : `Lesson ${index + 1} thumbnail`}
          className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded-lg flex-shrink-0 bg-muted border border-border/60"
        />

        {/* Title */}
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => onTitleChange(lesson.tempId, e.target.value)}
          className="input flex-1 text-base sm:text-sm py-2 min-h-[44px]"
          maxLength={LIMITS.LESSON_TITLE}
          aria-label={`Lesson ${index + 1} title`}
        />
      </div>

      {/* Action buttons (Move & Remove) */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 self-end sm:self-auto flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
        <span className="text-[11px] font-body text-muted-foreground sm:hidden">
          Lesson #{index + 1} controls
        </span>

        <div className="flex items-center gap-1">
          <div className="flex items-center sm:flex-col gap-1">
            <button
              onClick={() => onMoveUp(lesson.tempId)}
              disabled={index === 0}
              className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-muted-foreground hover:text-primary-500 disabled:opacity-30 p-2 sm:p-1 transition-colors cursor-pointer disabled:cursor-not-allowed rounded-lg hover:bg-muted"
              aria-label={`Move lesson ${index + 1} up`}
              type="button"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              onClick={() => onMoveDown(lesson.tempId)}
              disabled={index === total - 1}
              className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-muted-foreground hover:text-primary-500 disabled:opacity-30 p-2 sm:p-1 transition-colors cursor-pointer disabled:cursor-not-allowed rounded-lg hover:bg-muted"
              aria-label={`Move lesson ${index + 1} down`}
              type="button"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(lesson.tempId)}
            className="btn-destructive min-h-[44px] sm:min-h-0 px-3 py-1.5 text-xs opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 inline-flex items-center gap-1 cursor-pointer"
            aria-label={`Remove lesson ${index + 1}`}
            type="button"
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
              <line x1="6" y1="18" x2="18" y2="18" />
            </svg>
            <span className="sm:hidden text-xs">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface CourseEditorProps {
  courseId?: string; // undefined = new course
}

export function CourseEditor({ courseId }: CourseEditorProps) {
  const { user, loading: authLoading, signIn, isSigningIn, authError } = useAuth();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingCategory, setExistingCategory] = useState<Category>("Other");
  const [lessons, setLessons] = useState<LessonInput[]>([]);

  // URL input state
  const [urlInput, setUrlInput] = useState("");
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [urlError, setUrlError] = useState("");

  // Import mode state: 'single' | 'playlist' | 'batch'
  const [importMode, setImportMode] = useState<"single" | "playlist" | "batch">("playlist");

  // Playlist import state
  const [playlistInput, setPlaylistInput] = useState("");
  const [playlistImporting, setPlaylistImporting] = useState(false);
  const [playlistSuccessMsg, setPlaylistSuccessMsg] = useState("");

  // Bulk URL import state
  const [bulkInput, setBulkInput] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");

  // Submission state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loadingCourse, setLoadingCourse] = useState(!!courseId);

  const searchParams = useSearchParams();
  const [initialUrlHandled, setInitialUrlHandled] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-import when redirected from homepage with ?url=
  useEffect(() => {
    if (initialUrlHandled || !searchParams || courseId) return;
    const paramUrl = searchParams.get("url");
    if (!paramUrl) return;

    setInitialUrlHandled(true);
    const trimmed = paramUrl.trim();
    const lower = trimmed.toLowerCase();

    // Strict URL check
    if (
      lower.includes("music.youtube.com") ||
      lower.includes("list=rd") ||
      lower.includes("list=olak") ||
      lower.includes("list=lm")
    ) {
      setUrlError(
        "Commercial music tracks, albums, and auto-generated mixes cannot be imported. VeySkill is strictly for educational courses and masterclasses."
      );
      return;
    }

    if (trimmed.includes("list=") || extractYouTubePlaylistId(trimmed)) {
      setImportMode("playlist");
      setPlaylistInput(trimmed);
      (async () => {
        setPlaylistImporting(true);
        setUrlError("");
        try {
          const res = await fetch(`/api/youtube/playlist?url=${encodeURIComponent(trimmed)}`);
          const data = await res.json();
          if (!res.ok || data.error || data.blocked) {
            setUrlError(
              data.error ||
                "This playlist cannot be imported. Only verified educational masterclasses and coursework are permitted."
            );
            return;
          }
          if (data.videos && data.videos.length > 0) {
            const playlistIntegrity = validatePlaylistEducation(
              data.title || "",
              data.channelTitle || "",
              data.videos,
              trimmed
            );
            if (!playlistIntegrity.valid) {
              setUrlError(
                playlistIntegrity.reason ||
                  "This playlist cannot be imported. Only verified educational masterclasses and coursework are permitted."
              );
              return;
            }
            if (!title.trim() && data.title) {
              setTitle(data.title.slice(0, LIMITS.COURSE_TITLE));
            }
            const newLessons: LessonInput[] = data.videos.map((v: any, index: number) => ({
              tempId: `tmp-pl-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
              youtubeId: v.videoId,
              title: (v.title || `Lesson ${index + 1}`).slice(0, LIMITS.LESSON_TITLE),
              thumbnailUrl: v.thumbnailUrl || youtubeThumbnail(v.videoId),
            }));
            setLessons((prev) => [...prev, ...newLessons]);
            setPlaylistSuccessMsg(
              `Imported ${data.videos.length} educational lessons successfully.`
            );
          }
        } catch {
          setUrlError("Failed to import playlist. Please ensure it is public and educational.");
        } finally {
          setPlaylistImporting(false);
        }
      })();
    } else if (extractYouTubeId(trimmed)) {
      setImportMode("single");
      setUrlInput(trimmed);
      (async () => {
        setFetchingVideo(true);
        setUrlError("");
        try {
          const res = await fetch(`/api/oembed?url=${encodeURIComponent(trimmed)}`);
          const data = await res.json();
          if (!res.ok || data.blocked || data.error || !data.videoId) {
            setUrlError(
              data.error ||
                "This video cannot be imported. VeySkill strictly permits authentic educational lectures only. Commercial music, movies, and entertainment are prohibited."
            );
            return;
          }
          const filter = validateEducationalContent(data.title ?? "", data.channelName, trimmed);
          if (filter.blocked) {
            setUrlError(filter.reason || "This video is not educational and cannot be added.");
            return;
          }
          setLessons((prev) => [
            ...prev,
            {
              tempId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              youtubeId: data.videoId!,
              title: (data.title ?? "Untitled Video").slice(0, LIMITS.LESSON_TITLE),
              thumbnailUrl: data.thumbnailUrl || youtubeThumbnail(data.videoId!),
            },
          ]);
          if (!title.trim() && data.title) {
            setTitle(data.title.slice(0, LIMITS.COURSE_TITLE));
          }
          setUrlInput("");
        } catch {
          setUrlError(
            "Unable to import this video. Please ensure it is an active public educational video."
          );
        } finally {
          setFetchingVideo(false);
        }
      })();
    }
  }, [searchParams, initialUrlHandled, courseId, title]);

  // Load existing course if editing
  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        const course = await getCourse(courseId);
        if (!course || course.creatorId !== user?.uid) {
          router.replace("/");
          return;
        }
        setTitle(course.title);
        setDescription(course.description);
        if (course.category) {
          setExistingCategory(course.category);
        }
        const existingLessons = await getLessons(courseId);
        setLessons(
          existingLessons.map((l) => ({
            tempId: l.id,
            youtubeId: l.youtubeId,
            title: l.title,
            thumbnailUrl: l.thumbnailUrl,
          }))
        );
      } catch {
        setSaveError("Failed to load existing course details.");
      } finally {
        setLoadingCourse(false);
      }
    })();
  }, [courseId, user?.uid, router]);

  // ── Add video from URL ─────────────────────────────────────────────────

  const handleAddVideo = useCallback(async () => {
    setUrlError("");
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    const lower = trimmedUrl.toLowerCase();
    if (
      lower.includes("music.youtube.com") ||
      lower.includes("list=rd") ||
      lower.includes("list=olak") ||
      lower.includes("list=lm")
    ) {
      setUrlError(
        "Commercial music tracks, songs, and albums cannot be imported. VeySkill is strictly for educational courses and masterclasses."
      );
      return;
    }

    const videoId = extractYouTubeId(trimmedUrl);
    if (!videoId) {
      setUrlError(
        "Please paste a valid YouTube URL (e.g. youtube.com/watch?v=... or youtu.be/...)"
      );
      return;
    }

    setFetchingVideo(true);
    try {
      const res = await fetch(`/api/oembed?url=${encodeURIComponent(trimmedUrl)}`);
      const data = (await res.json()) as {
        videoId?: string;
        title?: string;
        channelName?: string;
        thumbnailUrl?: string;
        error?: string;
        blocked?: boolean;
      };

      if (!res.ok || data.blocked || data.error || !data.videoId) {
        setUrlError(
          data.error ||
            "This video cannot be imported. VeySkill strictly permits authentic educational lectures and masterclasses only. Commercial music, movies, and entertainment are prohibited."
        );
        return;
      }

      // Strict client-side educational verification
      const filter = validateEducationalContent(data.title ?? "", data.channelName, trimmedUrl);
      if (filter.blocked) {
        setUrlError(
          filter.reason ||
            "This video was identified as non-educational entertainment or music and cannot be added."
        );
        return;
      }

      setLessons((prev) => [
        ...prev,
        {
          tempId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          youtubeId: data.videoId!,
          title: (data.title ?? "Untitled Video").slice(0, LIMITS.LESSON_TITLE),
          thumbnailUrl: data.thumbnailUrl || youtubeThumbnail(data.videoId!),
        },
      ]);
      setUrlInput("");
    } catch {
      setUrlError(
        "Unable to verify this video. Please ensure it is an active public educational video."
      );
    } finally {
      setFetchingVideo(false);
    }
  }, [urlInput]);

  // ── 1-Click Import Full YouTube Playlist ────────────────────────────────
  const handleImportPlaylist = useCallback(async () => {
    setUrlError("");
    setPlaylistSuccessMsg("");
    const trimmed = playlistInput.trim();
    if (!trimmed) {
      setUrlError("Please paste a YouTube playlist link or playlist ID.");
      return;
    }

    const lower = trimmed.toLowerCase();
    if (
      lower.includes("music.youtube.com") ||
      lower.includes("list=rd") ||
      lower.includes("list=olak") ||
      lower.includes("list=lm")
    ) {
      setUrlError(
        "Commercial music tracks, albums, and auto-generated mixes cannot be imported. VeySkill is strictly for educational courses and masterclasses."
      );
      return;
    }

    const playlistId = extractYouTubePlaylistId(trimmed);
    if (!playlistId) {
      setUrlError(
        "Invalid YouTube playlist link. Make sure the URL contains 'list=...' or is a valid playlist ID."
      );
      return;
    }

    setPlaylistImporting(true);
    try {
      const res = await fetch(`/api/youtube/playlist?url=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as {
        title?: string;
        channelTitle?: string;
        videos?: { videoId: string; title: string; thumbnailUrl: string }[];
        error?: string;
      };

      if (!res.ok || data.error) {
        setUrlError(data.error || "Failed to load playlist. Please ensure it is public.");
        return;
      }

      if (!data.videos || data.videos.length === 0) {
        setUrlError("No videos found in this playlist.");
        return;
      }

      // Auto-populate course title if empty
      if (!title.trim() && data.title) {
        setTitle(data.title.slice(0, LIMITS.COURSE_TITLE));
      }

      // Academic integrity check: Zero-tolerance playlist verification
      const playlistIntegrity = validatePlaylistEducation(
        data.title || "",
        data.channelTitle || "",
        data.videos || [],
        trimmed
      );

      if (!playlistIntegrity.valid) {
        setUrlError(
          playlistIntegrity.reason ||
            "Playlist rejected: Only verified educational courses and masterclasses are permitted. Commercial music, movies, or entertainment playlists cannot be imported."
        );
        return;
      }

      const newLessons: LessonInput[] = (data.videos || []).map((v, index) => ({
        tempId: `tmp-pl-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        youtubeId: v.videoId,
        title: (v.title || `Lesson ${index + 1}`).slice(0, LIMITS.LESSON_TITLE),
        thumbnailUrl: v.thumbnailUrl || youtubeThumbnail(v.videoId),
      }));

      setLessons((prev) => [...prev, ...newLessons]);
      setPlaylistSuccessMsg(
        `Successfully imported ${newLessons.length} lessons from "${data.title || "playlist"}"!`
      );
      setPlaylistInput("");
    } catch {
      setUrlError(
        "Connection error while importing playlist. Please check your network and try again."
      );
    } finally {
      setPlaylistImporting(false);
    }
  }, [playlistInput, title]);

  // ── Bulk Add Videos from Multiple URLs ───────────────────────────────────

  const handleAddBulkVideos = useCallback(async () => {
    setUrlError("");
    const lines = bulkInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setUrlError("Please paste at least one YouTube URL.");
      return;
    }

    setBulkImporting(true);
    setBulkProgress(`Importing 0 of ${lines.length} videos…`);

    try {
      const validLessons: LessonInput[] = [];
      let completed = 0;
      let skippedNonEducational = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const videoId = extractYouTubeId(line);
        if (videoId) {
          try {
            const res = await fetch(`/api/oembed?url=${encodeURIComponent(line)}`);
            const data = (await res.json()) as {
              title?: string;
              channelName?: string;
              thumbnailUrl?: string;
              blocked?: boolean;
              error?: string;
            };

            if (!res.ok || data.blocked) {
              skippedNonEducational++;
              continue;
            }

            const localFilter = validateEducationalContent(
              data.title ?? "",
              data.channelName,
              line
            );
            if (localFilter.blocked) {
              skippedNonEducational++;
              continue;
            }

            validLessons.push({
              tempId: `tmp-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
              youtubeId: videoId,
              title: (data.title ?? `Lesson ${lessons.length + validLessons.length + 1}`).slice(
                0,
                LIMITS.LESSON_TITLE
              ),
              thumbnailUrl: data.thumbnailUrl || youtubeThumbnail(videoId),
            });
          } catch {
            skippedNonEducational++;
            continue;
          }
        }
        completed++;
        setBulkProgress(`Imported ${completed} of ${lines.length} videos…`);
      }

      if (validLessons.length === 0) {
        setUrlError(
          skippedNonEducational > 0
            ? "All submitted links were non-educational entertainment or music and were excluded."
            : "No valid YouTube URLs found. Please check your links."
        );
      } else {
        setLessons((prev) => [...prev, ...validLessons]);
        setBulkInput("");
        setImportMode("single");
        setBulkProgress("");
        if (skippedNonEducational > 0) {
          setUrlError(
            `${skippedNonEducational} non-educational link(s) were excluded based on VeySkill academic policy.`
          );
        }
      }
    } catch {
      setUrlError("An error occurred during bulk import. Please try again.");
    } finally {
      setBulkImporting(false);
    }
  }, [bulkInput, lessons.length]);

  // ── Lesson manipulation ─────────────────────────────────────────────────

  const removeLesson = (tempId: string) =>
    setLessons((prev) => prev.filter((l) => l.tempId !== tempId));

  const moveLesson = (tempId: string, direction: "up" | "down") => {
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.tempId === tempId);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  const changeLessonTitle = (tempId: string, newTitle: string) =>
    setLessons((prev) =>
      prev.map((l) =>
        l.tempId === tempId ? { ...l, title: newTitle.slice(0, LIMITS.LESSON_TITLE) } : l
      )
    );

  // ── Validation ──────────────────────────────────────────────────────────

  function validate(publishMode: boolean): boolean {
    const e: Record<string, string> = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      e.title = "Please provide a course title.";
    } else if (trimmedTitle.length < 3) {
      e.title = "Course title must be at least 3 characters long.";
    } else if (trimmedTitle.length > LIMITS.COURSE_TITLE) {
      e.title = `Title is too long (max ${LIMITS.COURSE_TITLE} characters).`;
    }

    if (description.length > LIMITS.COURSE_DESCRIPTION) {
      e.description = `Description is too long (max ${LIMITS.COURSE_DESCRIPTION} characters).`;
    }

    if (publishMode) {
      if (lessons.length === 0) e.lessons = "Please add at least one lesson before publishing.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save logic ──────────────────────────────────────────────────────────

  async function saveCourse(status: "draft" | "published") {
    if (!user) return;
    if (!validate(status === "published")) return;

    // Strict Educational Verification before publishing
    if (status === "published") {
      const courseCheck = validateCourseEducation({
        title,
        description,
        lessons,
      });

      if (!courseCheck.valid) {
        setSaveError(
          courseCheck.reason ||
            "Course rejected: Only authentic educational coursework is allowed on VeySkill. Commercial movies, music videos, and entertainment are prohibited."
        );
        setErrors((prev) => ({
          ...prev,
          course: courseCheck.reason || "Educational integrity verification failed.",
        }));
        setSaving(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setSaving(true);
    setSaveError("");

    try {
      const lessonTitles = lessons.map((l) => l.title);
      const keywords = generateKeywords({
        title,
        description,
        category: existingCategory,
        lessonTitles,
      });

      const courseData = {
        title: title.trim().slice(0, LIMITS.COURSE_TITLE),
        description: description.trim().slice(0, LIMITS.COURSE_DESCRIPTION),
        category: existingCategory,
        creatorId: user.uid,
        creatorName: user.displayName ?? "Anonymous",
        status,
        lessonCount: lessons.length,
        coverVideoId: lessons[0]?.youtubeId ?? null,
        keywords,
      };

      let id = courseId;

      if (!id) {
        // Create new course
        id = await createCourse(courseData);
      } else {
        // Update existing course
        const { creatorId: _ignored, ...updateData } = courseData;
        void _ignored;
        const updatePayload: Parameters<typeof updateCourse>[1] = {
          ...updateData,
        };
        if (status === "published") {
          updatePayload.publishedAt = serverTimestamp();
        }
        await updateCourse(id, updatePayload);
        // Clear previous lessons to prevent duplicates when updating
        await clearLessons(id);
      }

      // High-capacity atomic batch lesson sync (handles 100+ videos instantly)
      if (id) {
        const lessonDocs = lessons.map((lesson, i) => ({
          youtubeId: lesson.youtubeId,
          title: lesson.title.trim().slice(0, LIMITS.LESSON_TITLE),
          order: i,
          thumbnailUrl: lesson.thumbnailUrl,
        }));
        await batchSetLessons(id, lessonDocs);
        const targetPath = status === "published" ? `/course/${id}` : "/my-courses";
        router.push(targetPath);
        router.refresh();
      }
    } catch {
      setSaveError("An error occurred while saving your course. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  if (authLoading || loadingCourse) {
    return (
      <div className="container-page py-16 text-center">
        <div className="skeleton h-8 w-64 mx-auto mb-4 rounded-xl" />
        <div className="skeleton h-4 w-48 mx-auto rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-20 text-center max-w-md mx-auto">
        <div className="clay-card p-8 bg-card border border-border text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h1 className="font-heading font-bold text-2xl mb-2 text-foreground">
            Sign in to Create Courses
          </h1>
          <p className="text-muted-foreground font-body text-sm mb-6 leading-relaxed">
            Join the community to weave YouTube tutorials into structured courses and track your
            creations.
          </p>
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-left">
              {authError}
            </div>
          )}
          <button
            type="button"
            onClick={signIn}
            disabled={isSigningIn}
            className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#FFFFFF"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#FFFFFF"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FFFFFF"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#FFFFFF"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isSigningIn ? "Signing in..." : "Continue with Google"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 max-w-3xl w-full overflow-x-hidden">
      <h1 className="font-heading font-extrabold text-3xl mb-8 text-foreground">
        {courseId ? "Edit Course" : "Create a Course"}
      </h1>

      {/* Educational Rejection / Save Error Banner */}
      {(saveError || errors.course) && (
        <div
          className="p-5 rounded-2xl bg-destructive/10 border-2 border-destructive/30 text-destructive mb-6 flex items-start gap-3 shadow-sm animate-fade-in"
          role="alert"
        >
          <svg
            className="w-5 h-5 shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1 text-sm font-heading font-semibold leading-relaxed">
            <p className="font-bold text-base mb-1">Publishing Blocked — Non-Educational Content</p>
            <p className="font-body text-xs sm:text-sm">{saveError || errors.course}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Title */}
        <div>
          <label
            htmlFor="course-title"
            className="block font-heading font-semibold text-sm mb-2 text-foreground"
          >
            Course title{" "}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="course-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, LIMITS.COURSE_TITLE))}
            className={`input ${errors.title ? "error" : ""}`}
            placeholder="e.g. Master Modern Web Design with Tailwind CSS"
            maxLength={LIMITS.COURSE_TITLE}
            aria-describedby={errors.title ? "title-error" : undefined}
            aria-required="true"
          />
          {errors.title && (
            <p id="title-error" className="text-destructive text-xs mt-1.5" role="alert">
              {errors.title}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {title.length}/{LIMITS.COURSE_TITLE}
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="course-description"
            className="block font-heading font-semibold text-sm mb-2 text-foreground"
          >
            Description
          </label>
          <textarea
            id="course-description"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, LIMITS.COURSE_DESCRIPTION))}
            className={`textarea ${errors.description ? "error" : ""}`}
            placeholder="What will learners achieve upon completing this course?"
            maxLength={LIMITS.COURSE_DESCRIPTION}
            aria-describedby={errors.description ? "desc-error" : undefined}
            rows={4}
          />
          {errors.description && (
            <p id="desc-error" className="text-destructive text-xs mt-1.5" role="alert">
              {errors.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {description.length}/{LIMITS.COURSE_DESCRIPTION}
          </p>
        </div>

        {/* Add video */}
        <div className="clay-card p-5 sm:p-6 bg-card border-2 border-border rounded-2xl">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="font-heading font-bold text-sm text-foreground">
                Course Curriculum & Videos
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Add YouTube videos as structured lessons. Students learn distraction-free.
              </p>
            </div>

            {/* Mode switch */}
            <div className="flex flex-wrap sm:inline-flex p-1 bg-muted rounded-xl text-xs font-heading font-bold gap-1 sm:gap-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setImportMode("playlist")}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer ${
                  importMode === "playlist"
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
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
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>1-Click Playlist</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent-500 text-white font-extrabold uppercase">
                  Fast
                </span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode("single")}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-all flex-1 sm:flex-initial inline-flex items-center justify-center cursor-pointer ${
                  importMode === "single"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Single Video
              </button>
              <button
                type="button"
                onClick={() => setImportMode("batch")}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-all flex-1 sm:flex-initial inline-flex items-center justify-center cursor-pointer ${
                  importMode === "batch"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Batch URLs
              </button>
            </div>
          </div>

          {/* Mode 1: 1-Click Playlist Importer */}
          {importMode === "playlist" && (
            <div>
              <p className="text-xs text-muted-foreground font-body mb-3">
                Paste any public video playlist link. VeySkill will instantly import all lessons in
                sequence with titles and thumbnails, and auto-name your course in seconds!
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="youtube-playlist-input"
                  type="url"
                  value={playlistInput}
                  onChange={(e) => {
                    setPlaylistInput(e.target.value);
                    setUrlError("");
                    setPlaylistSuccessMsg("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleImportPlaylist();
                    }
                  }}
                  className={`input flex-1 min-h-[48px] ${urlError ? "error" : ""}`}
                  placeholder="Paste YouTube playlist URL (e.g. https://www.youtube.com/playlist?list=PL...)"
                  aria-label="YouTube playlist URL"
                />
                <button
                  onClick={handleImportPlaylist}
                  disabled={playlistImporting || !playlistInput.trim()}
                  className="btn-accent px-5 py-3 min-h-[48px] whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center gap-2 font-heading font-bold cursor-pointer active:scale-95"
                  type="button"
                >
                  {playlistImporting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>Importing Playlist…</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <span>Import Playlist</span>
                    </>
                  )}
                </button>
              </div>

              {playlistSuccessMsg && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="font-semibold">{playlistSuccessMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Single Video Add */}
          {importMode === "single" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="youtube-url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddVideo();
                    }
                  }}
                  className={`input flex-1 min-h-[48px] ${urlError ? "error" : ""}`}
                  placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=...)"
                  aria-label="YouTube video URL"
                  aria-describedby={urlError ? "url-error" : undefined}
                />
                <button
                  onClick={handleAddVideo}
                  disabled={fetchingVideo || !urlInput.trim()}
                  className="btn-primary px-5 py-3 min-h-[48px] whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  type="button"
                >
                  {fetchingVideo ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>Fetching…</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
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
                      <span>Add video</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supports standard YouTube videos, shorts, and youtu.be links.
              </p>
            </div>
          )}

          {/* Mode 3: Batch URLs */}
          {importMode === "batch" && (
            <div>
              <p className="text-xs text-muted-foreground font-body mb-2">
                Paste multiple YouTube links (one per line). We&apos;ll automatically extract titles
                and thumbnails for your full curriculum!
              </p>
              <textarea
                value={bulkInput}
                onChange={(e) => {
                  setBulkInput(e.target.value);
                  setUrlError("");
                }}
                rows={5}
                placeholder={
                  "https://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=...\nhttps://youtu.be/..."
                }
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
              />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs font-heading font-bold text-primary-600 dark:text-primary-400">
                  {bulkProgress ||
                    `${bulkInput.split("\n").filter((l) => l.trim()).length} link(s) detected`}
                </span>
                <button
                  type="button"
                  onClick={handleAddBulkVideos}
                  disabled={bulkImporting || !bulkInput.trim()}
                  className="btn-accent px-5 py-2.5 text-xs inline-flex items-center gap-2"
                >
                  {bulkImporting ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>Importing Videos…</span>
                    </>
                  ) : (
                    <span>Import All Lessons</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {urlError && (
            <div
              id="url-error"
              className="mt-3.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-body flex items-start gap-2.5 animate-fade-in"
              role="alert"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="flex-1 leading-relaxed font-medium">{urlError}</div>
            </div>
          )}
        </div>

        {/* Lesson list */}
        {lessons.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-heading font-semibold text-sm text-foreground">
                Lessons ({lessons.length})
              </p>
              <span className="text-xs text-muted-foreground">
                Drag / reorder using arrow buttons
              </span>
            </div>
            <div className="space-y-2">
              {lessons.map((lesson, idx) => (
                <LessonRow
                  key={lesson.tempId}
                  lesson={lesson}
                  index={idx}
                  total={lessons.length}
                  onRemove={removeLesson}
                  onMoveUp={(id) => moveLesson(id, "up")}
                  onMoveDown={(id) => moveLesson(id, "down")}
                  onTitleChange={changeLessonTitle}
                />
              ))}
            </div>
            {errors.lessons && (
              <p className="text-destructive text-xs mt-2" role="alert">
                {errors.lessons}
              </p>
            )}
          </div>
        )}

        {lessons.length === 0 && (
          <div className="clay-card p-8 text-center text-muted-foreground bg-card border-dashed border-2 border-border">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <p className="font-body text-sm text-foreground mb-1">No lessons added yet</p>
            <p className="font-body text-xs text-muted-foreground">
              Paste a YouTube link above to automatically import title and preview.
            </p>
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div
            className="p-4 rounded-xl border border-destructive/30 bg-red-50 text-destructive text-sm font-body"
            role="alert"
          >
            {saveError}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => saveCourse("draft")}
            disabled={saving}
            className="btn-ghost flex-1 py-3.5 min-h-[48px] text-sm cursor-pointer"
            type="button"
          >
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <button
            onClick={() => saveCourse("published")}
            disabled={saving}
            className="btn-accent flex-1 py-3.5 min-h-[48px] text-sm inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            type="button"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
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
                <span>Publishing…</span>
              </>
            ) : (
              <span>Publish course</span>
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground font-body text-center">
          Published courses appear on the Explore page and can be taken by anyone for free.
        </p>
      </div>
    </div>
  );
}
