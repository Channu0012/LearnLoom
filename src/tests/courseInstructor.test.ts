import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCourseInstructor,
  getInstructorInitial,
  fetchYouTubeChannelInfo,
  generateLinkedInShareUrl,
  generateTwitterShareUrl,
} from "@/lib/courseInstructor";

describe("Course Instructor & Channel Attribution Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("prioritizes authentic YouTube channelTitle when available", () => {
    const course = {
      channelTitle: "freeCodeCamp.org",
      creatorName: "Channabasav Patil",
      title: "Python for Beginners",
    };
    const instructor = getCourseInstructor(course);
    expect(instructor.name).toBe("freeCodeCamp.org");
    expect(instructor.isChannel).toBe(true);
    expect(instructor.channelUrl).toContain("freeCodeCamp.org");
    expect(instructor.avatarInitial).toBe("FR");
  });

  it("strictly NEVER masquerades creatorName (uploader) as the YouTube instructor when channelTitle is empty", () => {
    const course = {
      channelTitle: "",
      creatorName: "Channabasav Patil", // Platform user who imported the video
      title: "JavaScript Masterclass",
    };
    const instructor = getCourseInstructor(course);
    // Must NOT be the platform user!
    expect(instructor.name).not.toBe("Channabasav Patil");
    expect(instructor.name).toBe("YouTube Creator");
    expect(instructor.avatarInitial).toBe("YT");
  });

  it("filters out generic/anonymous names and defaults to YouTube Creator", () => {
    const genericCourses = [
      { channelTitle: "Anonymous", creatorName: "Learner" },
      { channelTitle: "", creatorName: "VeySkill Learning" },
      { channelTitle: undefined, creatorName: "admin" },
      { channelTitle: null, creatorName: "" },
    ];

    for (const c of genericCourses) {
      const instructor = getCourseInstructor(c);
      expect(instructor.name).toBe("YouTube Creator");
      expect(instructor.avatarInitial).toBe("YT");
    }
  });

  it("extracts 2-letter clean initials for channels and creators", () => {
    expect(getInstructorInitial("Chai aur Code")).toBe("CA");
    expect(getInstructorInitial("Traversy Media")).toBe("TM");
    expect(getInstructorInitial("CS50")).toBe("CS");
    expect(getInstructorInitial("")).toBe("YT");
  });

  it("fetches and caches authentic YouTube creator from video oEmbed", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        author_name: "Programming with Mosh",
        author_url: "https://www.youtube.com/@programmingwithmosh",
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const info = await fetchYouTubeChannelInfo("_uQrJ0TkZlc");
    expect(info).not.toBeNull();
    expect(info?.channelTitle).toBe("Programming with Mosh");
    expect(info?.channelUrl).toBe("https://www.youtube.com/@programmingwithmosh");

    // Second call should hit the cache without another fetch
    const cachedInfo = await fetchYouTubeChannelInfo("_uQrJ0TkZlc");
    expect(cachedInfo?.channelTitle).toBe("Programming with Mosh");
  });

  it("generates viral LinkedIn and Twitter share links crediting the instructor", () => {
    const linkedIn = generateLinkedInShareUrl({
      courseTitle: "React 19 Deep Dive",
      instructorName: "Academind",
      certUrl: "https://veyskill.in/verify/VS-12345",
    });
    expect(linkedIn).toContain("Academind");
    expect(linkedIn).toContain("React%2019%20Deep%20Dive");
    expect(linkedIn).toContain("https%3A%2F%2Fveyskill.in%2Fverify%2FVS-12345");

    const twitter = generateTwitterShareUrl({
      courseTitle: "React 19 Deep Dive",
      instructorName: "Academind",
      certUrl: "https://veyskill.in/verify/VS-12345",
    });
    expect(twitter).toContain("Academind");
    expect(twitter).toContain("twitter.com/intent/tweet");
  });
});
