import { describe, it, expect } from "vitest";
import { validateEducationalContent } from "@/lib/contentFilter";

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
  });

  describe("blocks commercial movies, trailers, and film clips", () => {
    it("blocks full movies", () => {
      const res = validateEducationalContent("Inception 2010 Full Movie English HD");
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("movie");
      expect(res.reason).toContain("Commercial movies, trailers");
    });

    it("blocks official trailers", () => {
      const res = validateEducationalContent(
        "Marvel Studios' Avengers: Secret Wars | Official Teaser Trailer"
      );
      expect(res.blocked).toBe(true);
      expect(res.category).toBe("movie");
    });

    it("blocks movie scenes and clips", () => {
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
  });

  describe("blocks pure entertainment and meme formats", () => {
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
  });
});
