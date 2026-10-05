// ---------------------------------------------------------------------------
// GET /api/youtube/playlist?url=<playlistUrlOrId>
// Fetches full playlist metadata and video items from YouTube.
// Features resilient multi-tier ingestion: fast scraper with private/deleted video
// filtering, followed by official YouTube Data API v3 fallback.
// ---------------------------------------------------------------------------
import { type NextRequest, NextResponse } from "next/server";
import { extractYouTubePlaylistId } from "@/lib/constants";
import { validatePlaylistEducation } from "@/lib/contentFilter";

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

/**
 * Fallback to official YouTube Data API v3 if scraping is throttled.
 */
async function fetchViaOfficialApi(
  playlistId: string
): Promise<{ title: string; channelTitle: string; videos: PlaylistVideoItem[] } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    // 1. Fetch playlist metadata
    const metaRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${encodeURIComponent(
        playlistId
      )}&key=${apiKey}`
    );
    if (!metaRes.ok) return null;
    const metaData = await metaRes.json();
    const playlistItem = metaData.items?.[0]?.snippet;
    const title = playlistItem?.title || "Imported Course";
    const channelTitle = playlistItem?.channelTitle || "";

    // 2. Fetch playlist items
    const itemsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(
        playlistId
      )}&key=${apiKey}`
    );
    if (!itemsRes.ok) return null;
    const itemsData = await itemsRes.json();

    const videos: PlaylistVideoItem[] = [];
    for (const item of itemsData.items || []) {
      const vId = item.snippet?.resourceId?.videoId;
      const vTitle = item.snippet?.title || "";
      if (
        vId &&
        vTitle &&
        !/private video|deleted video|\[deleted video\]|\[private video\]/i.test(vTitle)
      ) {
        videos.push({
          videoId: vId,
          title: vTitle.trim(),
          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.default?.url ||
            `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
        });
      }
    }

    if (videos.length === 0) return null;
    return { title, channelTitle, videos };
  } catch {
    return null;
  }
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

  const lowerInput = inputParam.toLowerCase();
  if (
    lowerInput.includes("music.youtube.com") ||
    lowerInput.includes("list=rd") ||
    lowerInput.includes("list=olak") ||
    lowerInput.includes("list=lm")
  ) {
    return NextResponse.json(
      {
        error:
          "YouTube Music playlists, albums, and auto-generated mixes cannot be imported. VeySkill is strictly for educational courses and masterclasses.",
        blocked: true,
        category: "music",
      },
      { status: 422 }
    );
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

    let html = "";
    if (res.ok) {
      html = await res.text();
    }

    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);

    // If scraping was blocked or returned no data, attempt official API fallback
    if (!match || !match[1]) {
      const apiFallback = await fetchViaOfficialApi(playlistId);
      if (apiFallback) {
        const val = validatePlaylistEducation(
          apiFallback.title,
          apiFallback.channelTitle,
          apiFallback.videos,
          inputParam
        );
        if (!val.valid) {
          return NextResponse.json(
            {
              error:
                val.reason ||
                "This playlist cannot be imported. It contains commercial entertainment or music videos that do not meet VeySkill academic standards.",
              blocked: true,
              offendingVideoTitle: val.offendingVideoTitle,
            },
            { status: 422 }
          );
        }
        return NextResponse.json({
          playlistId,
          title: apiFallback.title,
          channelTitle: apiFallback.channelTitle,
          itemCount: apiFallback.videos.length,
          videos: apiFallback.videos,
        });
      }

      return NextResponse.json(
        {
          error:
            "Could not parse playlist information from YouTube. The playlist might be private, restricted, or unavailable.",
        },
        { status: 404 }
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

        // Only strip trailing duration labels (e.g., "5 minutes, 3 seconds") if label was used
        title = title.replace(/\s+\d+\s+(?:minutes?|hours?|seconds?).*$/i, "").trim();

        // Filter out private or deleted videos
        const isUnavailable =
          /private video|deleted video|\[deleted video\]|\[private video\]/i.test(title);

        if (
          !isUnavailable &&
          videoId &&
          typeof videoId === "string" &&
          !videos.some((v) => v.videoId === videoId)
        ) {
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
        const title = (
          pvr.title?.runs?.[0]?.text ||
          pvr.title?.simpleText ||
          `Lesson ${videos.length + 1}`
        ).trim();

        const isUnavailable =
          /private video|deleted video|\[deleted video\]|\[private video\]/i.test(title);

        if (
          !isUnavailable &&
          videoId &&
          typeof videoId === "string" &&
          !videos.some((v) => v.videoId === videoId)
        ) {
          videos.push({
            videoId,
            title,
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
      // Try official API as fallback before giving up
      const apiFallback = await fetchViaOfficialApi(playlistId);
      if (apiFallback && apiFallback.videos.length > 0) {
        const val = validatePlaylistEducation(
          apiFallback.title,
          apiFallback.channelTitle,
          apiFallback.videos,
          inputParam
        );
        if (!val.valid) {
          return NextResponse.json(
            {
              error:
                val.reason ||
                "This playlist cannot be imported. It contains commercial entertainment or music videos.",
              blocked: true,
            },
            { status: 422 }
          );
        }
        return NextResponse.json({
          playlistId,
          title: apiFallback.title,
          channelTitle: apiFallback.channelTitle,
          itemCount: apiFallback.videos.length,
          videos: apiFallback.videos,
        });
      }

      return NextResponse.json(
        {
          error:
            "No public videos found in this playlist. Please ensure the playlist is public and contains active videos.",
        },
        { status: 404 }
      );
    }

    const channelName =
      ytData?.header?.playlistHeaderRenderer?.ownerText?.runs?.[0]?.text ||
      ytData?.metadata?.playlistMetadataRenderer?.ownerText?.runs?.[0]?.text ||
      "";

    // Academic integrity check: Zero-tolerance playlist educational verification
    const playlistValidation = validatePlaylistEducation(
      playlistTitle,
      channelName,
      videos,
      inputParam
    );
    if (!playlistValidation.valid) {
      return NextResponse.json(
        {
          error:
            playlistValidation.reason ||
            "This playlist cannot be imported. It contains commercial music, movies, or entertainment videos that do not meet VeySkill's academic standards.",
          blocked: true,
          offendingVideoTitle: playlistValidation.offendingVideoTitle,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      playlistId,
      title: playlistTitle,
      channelTitle: channelName,
      itemCount: videos.length,
      videos,
    });
  } catch (err: unknown) {
    if ((err as { name?: string })?.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out while connecting to YouTube. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while fetching the playlist. Please try again." },
      { status: 500 }
    );
  }
}
