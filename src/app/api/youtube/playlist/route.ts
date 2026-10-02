// ---------------------------------------------------------------------------
// GET /api/youtube/playlist?url=<playlistUrlOrId>
// Fetches full playlist metadata and video items from YouTube.
// ---------------------------------------------------------------------------
import { type NextRequest, NextResponse } from "next/server";
import { extractYouTubePlaylistId } from "@/lib/constants";
import { validateEducationalContent } from "@/lib/contentFilter";

export const dynamic = "force-dynamic";

// In-memory rate limiting (max 15 playlist imports per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RPM_LIMIT = 15;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= RPM_LIMIT) return false;

  entry.count += 1;
  return true;
}

export interface PlaylistVideoItem {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before importing another playlist." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const inputParam = searchParams.get("url") || searchParams.get("id");

  if (!inputParam) {
    return NextResponse.json({ error: "Missing required parameter: url (or id)" }, { status: 400 });
  }

  const playlistId = extractYouTubePlaylistId(inputParam);
  if (!playlistId) {
    return NextResponse.json(
      {
        error:
          "Invalid YouTube playlist link. Please paste a URL containing 'list=...' or a valid playlist ID.",
      },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const ytUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
    const res = await fetch(ytUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+478;",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to access YouTube playlist. The playlist might be private or removed." },
        { status: 404 }
      );
    }

    const html = await res.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);

    if (!match || !match[1]) {
      return NextResponse.json(
        { error: "Could not parse playlist information from YouTube." },
        { status: 500 }
      );
    }

    let ytData: any;
    try {
      ytData = JSON.parse(match[1]);
    } catch {
      return NextResponse.json({ error: "Unable to parse playlist structure." }, { status: 500 });
    }

    // Check for alerts (e.g., playlist does not exist)
    if (ytData.alerts && Array.isArray(ytData.alerts)) {
      const alert = ytData.alerts[0]?.alertRenderer;
      if (alert?.type === "ERROR") {
        const msg =
          alert.text?.runs?.[0]?.text ||
          alert.text?.simpleText ||
          "The requested playlist does not exist or is private.";
        return NextResponse.json({ error: msg }, { status: 404 });
      }
    }

    // Extract title
    const playlistTitle =
      ytData?.metadata?.playlistMetadataRenderer?.title ||
      ytData?.header?.playlistHeaderRenderer?.title?.simpleText ||
      ytData?.header?.pageHeaderRenderer?.pageTitle ||
      "Imported Course";

    const videos: PlaylistVideoItem[] = [];

    // Traverse ytData to collect video items
    function walk(o: any) {
      if (!o || typeof o !== "object") return;

      // Modern YouTube lockupViewModel (2024+)
      if (o.lockupViewModel && o.lockupViewModel.contentType === "LOCKUP_CONTENT_TYPE_VIDEO") {
        const vm = o.lockupViewModel;
        const videoId = vm.contentId;
        let title =
          vm.metadata?.lockupMetadataViewModel?.title?.content ||
          vm.accessibilityContext?.label ||
          "";

        // Strip trailing duration labels from accessibility label (e.g., "5 minutes, 3 seconds")
        if (title.includes(" - ")) {
          title = title.split(" - ")[0];
        }
        title = title.replace(/\s+\d+\s+(?:minutes?|hours?|seconds?).*$/i, "").trim();

        if (videoId && typeof videoId === "string" && !videos.some((v) => v.videoId === videoId)) {
          videos.push({
            videoId,
            title: title || `Lesson ${videos.length + 1}`,
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          });
        }
      }

      // Classic YouTube playlistVideoRenderer fallback
      if (o.playlistVideoRenderer) {
        const pvr = o.playlistVideoRenderer;
        const videoId = pvr.videoId;
        const title =
          pvr.title?.runs?.[0]?.text || pvr.title?.simpleText || `Lesson ${videos.length + 1}`;

        if (videoId && typeof videoId === "string" && !videos.some((v) => v.videoId === videoId)) {
          videos.push({
            videoId,
            title: title.trim(),
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          });
        }
      }

      for (const k of Object.keys(o)) {
        walk(o[k]);
      }
    }

    walk(ytData);

    if (videos.length === 0) {
      return NextResponse.json(
        {
          error:
            "No videos found in this playlist. Please ensure the playlist is public and contains videos.",
        },
        { status: 404 }
      );
    }

    const channelName =
      ytData?.header?.playlistHeaderRenderer?.ownerText?.runs?.[0]?.text ||
      ytData?.metadata?.playlistMetadataRenderer?.ownerText?.runs?.[0]?.text ||
      "";

    // 1. Academic integrity check: verify playlist title and channel
    const playlistFilter = validateEducationalContent(playlistTitle, channelName);
    if (playlistFilter.blocked) {
      return NextResponse.json(
        {
          error: playlistFilter.reason,
          blocked: true,
          category: playlistFilter.category,
        },
        { status: 422 }
      );
    }

    // 2. Strict educational verification across ALL video items
    const verifiedEducationalVideos: PlaylistVideoItem[] = [];
    let blockedCount = 0;
    let sampleReason = "";

    for (const v of videos) {
      const vFilter = validateEducationalContent(v.title);
      if (vFilter.blocked) {
        blockedCount++;
        sampleReason = vFilter.reason || sampleReason;
      } else {
        verifiedEducationalVideos.push(v);
      }
    }

    if (
      verifiedEducationalVideos.length === 0 ||
      blockedCount >= Math.max(2, Math.floor(videos.length * 0.25))
    ) {
      return NextResponse.json(
        {
          error:
            sampleReason ||
            "This playlist contains commercial music, movies, or entertainment videos that do not meet Vidcura's academic standards.",
          blocked: true,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      playlistId,
      title: playlistTitle,
      itemCount: verifiedEducationalVideos.length,
      videos: verifiedEducationalVideos.slice(0, 150), // Supports massive playlists up to 150 lessons
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out while connecting to YouTube." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Failed to import YouTube playlist. Please try again." },
      { status: 500 }
    );
  }
}
