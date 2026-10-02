// ---------------------------------------------------------------------------
// GET /api/oembed?url=<youtubeUrl>
// Fetches video metadata from YouTube's oEmbed endpoint.
// Rate-limited to OEMBED_RATE_LIMIT_RPM requests per minute per IP.
// ---------------------------------------------------------------------------
import { type NextRequest, NextResponse } from "next/server";
import { extractYouTubeId } from "@/lib/constants";
import { validateEducationalContent } from "@/lib/contentFilter";
import type { OEmbedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter (per-IP, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RPM_LIMIT = parseInt(process.env.OEMBED_RATE_LIMIT_RPM ?? "30", 10);

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

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json({ error: "Missing required parameter: url" }, { status: 400 });
  }

  // Validate the YouTube video ID
  const videoId = extractYouTubeId(urlParam);
  if (!videoId) {
    return NextResponse.json(
      {
        error:
          "That doesn't look like a valid YouTube URL. Try pasting a link like youtube.com/watch?v=... or youtu.be/...",
      },
      { status: 400 }
    );
  }

  // Fetch from YouTube oEmbed (no API key required)
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    const response = await fetch(oembedUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      // Video is private, removed, or doesn't exist
      return NextResponse.json(
        {
          error:
            "We couldn't find that video. It might be private, removed, or the URL is incorrect.",
          videoId,
        },
        { status: 404 }
      );
    }

    const data = (await response.json()) as OEmbedResponse;

    // Academic integrity check: block commercial movies, songs, trailers, entertainment
    const filter = validateEducationalContent(data.title ?? "", data.author_name);
    if (filter.blocked) {
      return NextResponse.json(
        {
          error: filter.reason,
          blocked: true,
          category: filter.category,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      videoId,
      title: data.title?.slice(0, 200) ?? "Untitled Video",
      channelName: data.author_name ?? "",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to verify this video with YouTube. Only verified public educational videos can be imported.",
        blocked: true,
      },
      { status: 502 }
    );
  }
}
