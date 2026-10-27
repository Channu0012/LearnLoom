/**
 * VeySkill Course Instructor & YouTube Channel Attribution Engine
 * Honors and elevates authentic YouTube creators and channel owners.
 */

export interface CourseInstructorInfo {
  name: string;
  isChannel: boolean;
  channelUrl: string;
  avatarInitial: string;
}

const GENERIC_NAMES = new Set([
  "anonymous",
  "learner",
  "user",
  "admin",
  "veyskill",
  "veyskill learning",
  "featured instructor",
]);

/**
 * Resolves the authentic instructor / channel name for any course.
 * Prioritizes actual YouTube channelTitle, falling back gracefully to creatorName.
 */
export function getCourseInstructor(course?: {
  channelTitle?: string | null;
  creatorName?: string | null;
  title?: string | null;
}): CourseInstructorInfo {
  const channelCandidate = course?.channelTitle?.trim();
  if (channelCandidate && !GENERIC_NAMES.has(channelCandidate.toLowerCase())) {
    return {
      name: channelCandidate,
      isChannel: true,
      channelUrl:
        channelCandidate.startsWith("http://") || channelCandidate.startsWith("https://")
          ? channelCandidate
          : `https://www.youtube.com/results?search_query=${encodeURIComponent(channelCandidate)}`,
      avatarInitial: getInstructorInitial(channelCandidate),
    };
  }

  const creatorCandidate = course?.creatorName?.trim();
  if (creatorCandidate && !GENERIC_NAMES.has(creatorCandidate.toLowerCase())) {
    return {
      name: creatorCandidate,
      isChannel: false,
      channelUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(creatorCandidate)}`,
      avatarInitial: getInstructorInitial(creatorCandidate),
    };
  }

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
