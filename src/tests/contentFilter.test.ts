import { describe, it, expect } from "vitest";
import {
  validateEducationalContent,
  validateCourseEducation,
  validatePlaylistEducation,
} from "@/lib/contentFilter";

describe("validateEducationalContent", () => {
  describe("blocks commercial music and songs", () => {
    it("blocks official music videos", () => {
      const res = validateEducationalContent("Ed Sheeran - Shape of You (Official Music Video)");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
      expect(res.reason).toContain("Commercial music videos");
    });

    it("blocks official audio tracks", () => {
      const res = validateEducationalContent("Taylor Swift - Cruel Summer (Official Audio)");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });

    it("blocks lyric videos", () => {
      const res = validateEducationalContent("Adele - Hello (Lyric Video)");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });

    it("blocks full albums and streams", () => {
      const res = validateEducationalContent("Daft Punk - Discovery Full Album Stream");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });

    it("blocks tracks from music label channels", () => {
      const res = validateEducationalContent("New Hit Song 2024", "T-Series");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });

    it("blocks Vevo channel uploads", () => {
      const res = validateEducationalContent("Popular Pop Song", "BillieEilishVEVO");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });

    it("blocks jukebox and DJ remix tracks", () => {
      const res = validateEducationalContent("Top Bollywood Party Songs Jukebox 2024");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });

    it("blocks slowed + reverb / sped up tracks", () => {
      const res = validateEducationalContent("After Hours (Slowed + Reverb)");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });

    it("blocks singles without official music video tag (e.g. Alan Walker - Faded)", () => {
      const res = validateEducationalContent("Alan Walker - Faded", "Alan Walker");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });

    it("blocks YouTube Music domain links", () => {
      const res = validateEducationalContent(
        "Faded",
        "Alan Walker",
        "https://music.youtube.com/watch?v=60ItHLz5WEA"
      );
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
      expect(res.reason).toContain("YouTube Music");
    });

    it("blocks YouTube Music radio mix lists (list=RD...)", () => {
      const res = validateEducationalContent(
        "Shape of You",
        "Ed Sheeran",
        "https://www.youtube.com/watch?v=JGwWNGJdvx8&list=RDJGwWNGJdvx8"
      );
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });

    it("blocks YouTube topic channels (- Topic)", () => {
      const res = validateEducationalContent("Song Track", "Coldplay - Topic");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("music");
    });
  });

  describe("blocks commercial movies, trailers, and film clips", () => {
    it("blocks full movies", () => {
      const res = validateEducationalContent("Inception 2010 Full Movie English HD");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("movie");
      expect(res.reason).toContain("Commercial movies, trailers");
    });

    it("blocks official trailers and teasers", () => {
      const res = validateEducationalContent(
        "Marvel Studios' Avengers: Secret Wars | Official Teaser Trailer"
      );
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("movie");
    });

    it("blocks movie scenes, climax, and action clips", () => {
      const res = validateEducationalContent("The Dark Knight - Bank Robbery Scene 4K");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("movie");
    });

    it("blocks uploads from movie studio channels", () => {
      const res = validateEducationalContent(
        "Behind The Scenes Sneak Peek",
        "Marvel Entertainment"
      );
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("movie");
    });

    it("blocks theatrical promo and glimpse releases", () => {
      const res = validateEducationalContent("Pushpa 2 The Rule - First Glimpse Teaser");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("movie");
    });
  });

  describe("blocks pure entertainment, gaming streams, and meme formats", () => {
    it("blocks try not to laugh challenges", () => {
      const res = validateEducationalContent("Try Not To Laugh Challenge (Impossible Edition)");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("entertainment");
    });

    it("blocks prank videos", () => {
      const res = validateEducationalContent("Extreme Prank Video on Roommates Gone Wrong");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("entertainment");
    });

    it("blocks gaming streams and walkthroughs", () => {
      const res = validateEducationalContent("GTA 5 Gameplay Walkthrough Part 12");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("entertainment");
    });

    it("blocks standup comedy and roast videos", () => {
      const res = validateEducationalContent("Stand up comedy special 2024");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("entertainment");
    });
  });

  describe("safeguards authentic educational courses and exemptions", () => {
    it("allows standard programming courses", () => {
      const res = validateEducationalContent("Python Full Course for Beginners [2024]");
      expect(res.blocked).toBe(false);
    });

    it("allows academic lectures and tutorials", () => {
      const res = validateEducationalContent(
        "CS50 Lecture 1 - C and Memory Allocation",
        "Harvard University"
      );
      expect(res.blocked).toBe(false);
    });

    it("allows legitimate music theory lessons", () => {
      const res = validateEducationalContent("Music Theory 101 - How Chords and Scales Work");
      expect(res.blocked).toBe(false);
    });

    it("allows instrument tutorials", () => {
      const res = validateEducationalContent(
        "Piano Tutorial for Beginners: Finger Placement and Chords"
      );
      expect(res.blocked).toBe(false);
    });

    it("allows film studies and cinematography masterclasses", () => {
      const res = validateEducationalContent(
        "Film Analysis: How Christopher Nolan Directs Visual Suspense"
      );
      expect(res.blocked).toBe(false);
    });

    it("allows video editing tutorials", () => {
      const res = validateEducationalContent(
        "Premiere Pro Video Editing Masterclass for Beginners"
      );
      expect(res.blocked).toBe(false);
    });

    it("allows AI Education and Prompt Engineering courses without false movie detection", () => {
      const res1 = validateEducationalContent("AI Education: Complete Prompt Engineering Course");
      expect(res1.blocked).toBe(false);

      const res2 = validateEducationalContent(
        "Generative AI and Prompt Engineering - Episode 1: Foundation Models"
      );
      expect(res2.blocked).toBe(false);

      const res3 = validateEducationalContent(
        "Prompt Engineering Masterclass ft. Andrew Ng",
        "DeepLearning.AI"
      );
      expect(res3.blocked).toBe(false);

      const res4 = validateEducationalContent(
        "First look at GPT-5 and Prompt Engineering Guide",
        "AI Research Group"
      );
      expect(res4.blocked).toBe(false);

      const res5 = validateEducationalContent(
        "Behind the Scenes of LLM Training: Deep Dive into Transformers"
      );
      expect(res5.blocked).toBe(false);

      const res6 = validateEducationalContent(
        "ChatGPT & Claude Prompt Engineering Tutorial for Beginners",
        "Prompt Engineering Studios"
      );
      expect(res6.blocked).toBe(false);

      const res7 = validateEducationalContent("AI in Film Production and Storytelling Masterclass");
      expect(res7.blocked).toBe(false);

      const res8 = validateEducationalContent("Prompt Engineering: Making a Movie Script with AI");
      expect(res8.blocked).toBe(false);

      const res9 = validateEducationalContent(
        "Prompt Engineering for Filmmakers - Hollywood Scriptwriting with ChatGPT"
      );
      expect(res9.blocked).toBe(false);

      const res10 = validateEducationalContent(
        "AI Education: Sentiment Analysis on Movie Reviews using Python & BERT"
      );
      expect(res10.blocked).toBe(false);

      const res11 = validateEducationalContent(
        "Generative AI Tutorial: Creating Short Films with Sora and Runway"
      );
      expect(res11.blocked).toBe(false);
    });
  });
});

describe("validateCourseEducation", () => {
  it("approves genuine academic and technical courses", () => {
    const res = validateCourseEducation({
      title: "Complete Python Web Development Masterclass",
      description: "Learn Django, FastAPI, and PostgreSQL from scratch with hands-on projects.",
      lessons: [
        { title: "Lesson 1: Introduction and Environment Setup" },
        { title: "Lesson 2: Variables, Loops, and Functions" },
        { title: "Lesson 3: Building a REST API" },
      ],
    });
    expect(res.valid).toBe(true);
  });

  it("approves AI education and Prompt Engineering courses with standard curriculum lesson titles", () => {
    const res = validateCourseEducation({
      title: "Complete AI & Prompt Engineering Masterclass",
      description: "Learn LLMs, ChatGPT, Claude, and Agentic Workflows from scratch.",
      lessons: [
        { title: "Introduction" },
        { title: "Environment Setup & API Keys" },
        { title: "Zero-Shot vs Few-Shot Prompting" },
        { title: "AI in Film & Video Generation (Runway & Sora)" },
        { title: "Building an Autonomous AI Agent" },
        { title: "Conclusion & Course Summary" },
      ],
    });
    expect(res.valid).toBe(true);
  });

  it("blocks publishing if course title is about commercial movies", () => {
    const res = validateCourseEducation({
      title: "Latest Hollywood Action Movies 2024",
      description: "Watch action clips",
      lessons: [{ title: "Scene 1" }],
    });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("commercial movies");
  });

  it("blocks publishing if course title is about music songs", () => {
    const res = validateCourseEducation({
      title: "Top 50 Hindi Hit Songs Collection",
      description: "Enjoy party tracks",
      lessons: [{ title: "Track 1" }],
    });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("commercial movies, music videos");
  });

  it("blocks publishing if any single lesson contains a movie or music video", () => {
    const res = validateCourseEducation({
      title: "Full Stack Coding Bootcamp",
      description: "Learn web development",
      lessons: [
        { title: "Module 1: HTML & CSS Fundamentals" },
        { title: "Ed Sheeran - Shape of You (Official Music Video)" }, // non-educational!
        { title: "Module 3: JavaScript Algorithms" },
      ],
    });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Lesson 2");
    expect(res.offendingLessonIndex).toBe(1);
  });

  it("blocks publishing if course has 0 lessons", () => {
    const res = validateCourseEducation({
      title: "Machine Learning Foundations",
      description: "Study neural networks",
      lessons: [],
    });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("at least one lesson");
  });
});

describe("validatePlaylistEducation", () => {
  it("approves genuine academic and technical playlists", () => {
    const res = validatePlaylistEducation(
      "Python for Beginners Tutorial Series",
      "Programming with Mosh",
      [
        { title: "Lesson 1: Introduction to Python" },
        { title: "Lesson 2: Variables & Types" },
        { title: "Lesson 3: Control Flow" },
      ]
    );
    expect(res.valid).toBe(true);
  });

  it("strictly rejects playlist if channel is a music record label", () => {
    const res = validatePlaylistEducation("All Hits 2024", "T-Series", [{ title: "Hit Song 1" }]);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("commercial music label");
  });

  it("strictly rejects playlist if channel is a movie studio", () => {
    const res = validatePlaylistEducation("Film Clips Collection", "Marvel Entertainment", [
      { title: "Clip 1" },
    ]);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("movie studio");
  });

  it("strictly rejects playlist if title is commercial music or songs", () => {
    const res = validatePlaylistEducation("Top 100 Punjabi Songs Playlist", "IndependentCreator", [
      { title: "Track 1" },
      { title: "Track 2" },
    ]);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("commercial entertainment, movie, or music");
  });

  it("strictly rejects playlist if ANY single video item is a music or movie video", () => {
    const res = validatePlaylistEducation("Web Development Masterclass", "DevTuts", [
      { title: "Lecture 1: HTML Basics" },
      { title: "Taylor Swift - Blank Space (Official Music Video)" }, // non-educational!
      { title: "Lecture 3: CSS Grid" },
    ]);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Item 2");
    expect(res.offendingVideoIndex).toBe(1);
  });

  it("strictly rejects non-educational playlist with zero educational intent", () => {
    const res = validatePlaylistEducation("Random Summer Hits Collection", "VibeZone", [
      { title: "Summer Breeze" },
      { title: "Ocean Waves" },
    ]);
    expect(res.valid).toBe(false);
  });
});
