import { NextRequest, NextResponse } from "next/server";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rate = checkRateLimit(ip, "arena-reward", 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.uid !== "string" || !body.uid.trim()) {
      return NextResponse.json({ error: "Invalid payload: uid required" }, { status: 400 });
    }

    const targetUid = body.uid.trim();
    const delta = typeof body.delta === "number" ? Math.max(-50, Math.min(50, body.delta)) : 0;
    const xpDelta =
      typeof body.xpDelta === "number" ? Math.max(0, Math.min(1000, body.xpDelta)) : 0;
    const incrementHelped = Boolean(body.incrementStudentsHelped);
    const incrementBattlesPlayed = Boolean(body.incrementBattlesPlayed);
    const incrementBattlesWon = Boolean(body.incrementBattlesWon);
    const streak = typeof body.streak === "number" ? Math.max(0, body.streak) : undefined;

    if (!isFirebaseAdminConfigured) {
      // In local dev without admin keys, acknowledge request gracefully
      return NextResponse.json({ success: true, mocked: true });
    }

    const userRef = adminDb.collection("users").doc(targetUid);
    const updates: Record<string, unknown> = {};

    if (delta !== 0) {
      updates.helperScore = FieldValue.increment(delta);
    }
    if (xpDelta > 0) {
      updates.xp = FieldValue.increment(xpDelta);
    }
    if (incrementHelped) {
      updates.studentsHelped = FieldValue.increment(1);
    }
    if (incrementBattlesPlayed) {
      updates.battlesPlayed = FieldValue.increment(1);
    }
    if (incrementBattlesWon) {
      updates.battlesWon = FieldValue.increment(1);
    }
    if (typeof streak === "number") {
      updates.battleStreak = streak;
    }

    if (Object.keys(updates).length > 0) {
      await userRef.set(updates, { merge: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Arena reward error:", error);
    return NextResponse.json({ error: "Failed to update helper rewards" }, { status: 500 });
  }
}
