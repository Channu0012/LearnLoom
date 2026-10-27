import { useState, useEffect } from "react";
import { extractYouTubeId } from "@/lib/constants";

/**
 * VeySkill Course Instructor & YouTube Channel Attribution Engine
 * Strictly honors and elevates authentic YouTube creators and channel owners.
 * Never masquerades platform users or uploaders as the YouTube instructor.
 */

export interface CourseInstructorInfo {
  name: string;
  isChannel: boolean;
  channelUrl: string;
  avatarInitial: string;
}

export const GENERIC_NAMES = new Set([
  "anonymous",
  "learner",
  "user",
  "admin",
  "veyskill",
  "veyskill learning",
  "featured instructor",
  "youtube creator",
]);

/**
 * Pure synchronous resolver for instructor info.
 * Strictly uses channelTitle when available. Never falls back to platform uploader/user name.
 */
export function getCourseInstructor(course?: {
  channelTitle?: string | null;
  channelUrl?: string | null;
  creatorName?: string | null;
  title?: string | null;
}): CourseInstructorInfo {
  const channelCandidate = course?.channelTitle?.trim();
  if (channelCandidate && !GENERIC_NAMES.has(channelCandidate.toLowerCase())) {
    const rawUrl = course?.channelUrl?.trim();
    const effectiveUrl =
      rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
        ? rawUrl
        : channelCandidate.startsWith("http://") || channelCandidate.startsWith("https://")
          ? channelCandidate
          : `https://www.youtube.com/results?search_query=${encodeURIComponent(channelCandidate)}`;

    return {
      name: channelCandidate,
      isChannel: true,
      channelUrl: effectiveUrl,
      avatarInitial: getInstructorInitial(channelCandidate),
    };
  }

  // Fallback default: Never return creatorName (the platform user who uploaded the playlist).
  // Return neutral YouTube Creator attribution until dynamically resolved.
  return {
    name: "YouTube Creator",
    isChannel: true,
    channelUrl: "https://www.youtube.com",
    avatarInitial: "YT",
  };
}

/**
 * Clean 1-2 letter initial for avatar representation
 */
export function getInstructorInitial(name: string): string {
  if (!name || name.trim().length === 0) return "YT";
  const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return (cleaned.slice(0, 2) || "YT").toUpperCase();
}

/**
 * In-memory cache for resolved YouTube channel names & URLs to avoid duplicate network fetches
 */
const channelInfoCache = new Map<string, { channelTitle: string; channelUrl: string }>();

/**
 * Asynchronously resolves authentic YouTube channel owner from video ID or URL.
 * Multi-tier: Memory Cache -> localStorage -> YouTube oEmbed -> Internal API.
 */
export async function fetchYouTubeChannelInfo(
  videoIdOrUrl: string
): Promise<{ channelTitle: string; channelUrl: string } | null> {
  if (!videoIdOrUrl || typeof videoIdOrUrl !== "string") return null;

  // Extract pure 11-char video ID if a full URL was provided
  const videoId = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl.trim();
  if (!videoId || videoId.length < 5) return null;

  // 1. Memory cache
  const cached = channelInfoCache.get(videoId);
  if (cached) return cached;

  // 2. localStorage cache (browser client)
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(`veyskill_yt_author_${videoId}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed?.channelTitle && typeof parsed.channelTitle === "string") {
          channelInfoCache.set(videoId, parsed);
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  // 3. YouTube Direct oEmbed (CORS-friendly public endpoint)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data?.author_name) {
        const title = String(data.author_name).trim();
        const url = data.author_url
          ? String(data.author_url).trim()
          : `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
        const result = { channelTitle: title, channelUrl: url };
        channelInfoCache.set(videoId, result);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`veyskill_yt_author_${videoId}`, JSON.stringify(result));
          } catch {}
        }
        return result;
      }
    }
  } catch {
    // Silently proceed to fallback endpoint
  }

  // 4. Internal API Fallback (/api/oembed)
  try {
    const internalRes = await fetch(`/api/oembed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (internalRes.ok) {
      const data = await internalRes.json();
      const channelName = data?.channelName || data?.author_name;
      if (channelName) {
        const title = String(channelName).trim();
        const url =
          data?.channelUrl ||
          data?.author_url ||
          `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
        const result = { channelTitle: title, channelUrl: url };
        channelInfoCache.set(videoId, result);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`veyskill_yt_author_${videoId}`, JSON.stringify(result));
          } catch {}
        }
        return result;
      }
    }
  } catch {
    // Fail gracefully
  }

  return null;
}

/**
 * React Hook for resolving authentic YouTube instructor in client components.
 * Immediately returns cached or static channelTitle, and asynchronously resolves
 * authentic channel name from video ID for courses created prior to attribution engine.
 */
export function useCourseInstructor(
  course?: {
    channelTitle?: string | null;
    channelUrl?: string | null;
    creatorName?: string | null;
    coverVideoId?: string | null;
    lessons?: { youtubeId: string }[];
    title?: string | null;
  } | null
): CourseInstructorInfo & { isResolved: boolean } {
  const initial = getCourseInstructor(course || undefined);
  const [instructor, setInstructor] = useState<CourseInstructorInfo>(initial);
  const [isResolved, setIsResolved] = useState<boolean>(
    Boolean(course?.channelTitle && !GENERIC_NAMES.has(course.channelTitle.toLowerCase()))
  );

  useEffect(() => {
    // If course already has an authentic YouTube channel title, use it immediately
    const directChannel = course?.channelTitle?.trim();
    if (directChannel && !GENERIC_NAMES.has(directChannel.toLowerCase())) {
      setInstructor(
        getCourseInstructor({
          channelTitle: directChannel,
          channelUrl: course?.channelUrl,
        })
      );
      setIsResolved(true);
      return;
    }

    // Otherwise, resolve authentic channel owner via coverVideoId or first lesson
    const videoId = course?.coverVideoId || course?.lessons?.[0]?.youtubeId;
    if (!videoId) return;

    let isMounted = true;
    fetchYouTubeChannelInfo(videoId).then((res) => {
      if (!isMounted || !res || !res.channelTitle) return;
      if (GENERIC_NAMES.has(res.channelTitle.toLowerCase())) return;

      setInstructor({
        name: res.channelTitle,
        isChannel: true,
        channelUrl: res.channelUrl,
        avatarInitial: getInstructorInitial(res.channelTitle),
      });
      setIsResolved(true);
    });

    return () => {
      isMounted = false;
    };
  }, [course?.channelTitle, course?.channelUrl, course?.coverVideoId, course?.lessons]);

  return { ...instructor, isResolved };
}

/**
 * Generates viral LinkedIn share URL crediting both the instructor and VeySkill
 */
export function generateLinkedInShareUrl(params: {
  courseTitle: string;
  instructorName: string;
  certUrl: string;
}): string {
  const text = `Excited to share that I've completed the "${params.courseTitle}" curriculum by ${params.instructorName} on @VeySkill! Verified Credential: ${params.certUrl}`;
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(params.certUrl)}&summary=${encodeURIComponent(text)}`;
}

/**
 * Generates viral X / Twitter share URL crediting the instructor
 */
export function generateTwitterShareUrl(params: {
  courseTitle: string;
  instructorName: string;
  certUrl: string;
}): string {
  const text = `Just completed "${params.courseTitle}" by ${params.instructorName} on @VeySkill! 🎓 Check out my verified credential:`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(params.certUrl)}`;
}
