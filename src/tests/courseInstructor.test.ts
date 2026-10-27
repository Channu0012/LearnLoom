import { describe, it, expect } from "vitest";
import {
  getCourseInstructor,
  getInstructorInitial,
  generateLinkedInShareUrl,
  generateTwitterShareUrl,
} from "@/lib/courseInstructor";

describe("Course Instructor & Channel Attribution Engine", () => {
  it("prioritizes channelTitle when available", () => {
    const course = {
      channelTitle: "freeCodeCamp.org",
      creatorName: "John Doe",
      title: "Python for Beginners",
    };
    const instructor = getCourseInstructor(course);
    expect(instructor.name).toBe("freeCodeCamp.org");
    expect(instructor.isChannel).toBe(true);
    expect(instructor.channelUrl).toContain("freeCodeCamp.org");
    expect(instructor.avatarInitial).toBe("FR");
  });

  it("falls back to creatorName when channelTitle is empty", () => {
    const course = {
      channelTitle: "",
      creatorName: "Hitesh Choudhary",
      title: "JavaScript Masterclass",
    };
    const instructor = getCourseInstructor(course);
    expect(instructor.name).toBe("Hitesh Choudhary");
    expect(instructor.avatarInitial).toBe("HC");
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
