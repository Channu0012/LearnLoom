import fs from "fs";
import path from "path";

// Read Firebase CLI token
const configPath = path.join(process.env.USERPROFILE, ".config", "configstore", "firebase-tools.json");
const configRaw = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configRaw);
let accessToken = config.tokens?.access_token;
const refreshToken = config.tokens?.refresh_token;

async function getValidToken() {
  // If token is about to expire, refresh it
  if (!accessToken || (config.tokens?.expires_at && Date.now() >= config.tokens.expires_at - 60000)) {
    console.log("Refreshing Google OAuth token...");
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho85od6.apps.googleusercontent.com",
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const data = await res.json();
    if (data.access_token) {
      accessToken = data.access_token;
      console.log("Token refreshed successfully.");
    }
  }
  return accessToken;
}

async function fetchYouTubeAuthor(videoId) {
  if (!videoId) return null;
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.author_name) {
      return {
        channelTitle: String(data.author_name).trim(),
        channelUrl: data.author_url ? String(data.author_url).trim() : `https://www.youtube.com/results?search_query=${encodeURIComponent(data.author_name)}`,
      };
    }
  } catch (err) {
    console.warn(`oEmbed fetch failed for ${videoId}:`, err.message);
  }
  return null;
}

async function updateCourseInFirestore(courseId, channelTitle, channelUrl, token) {
  const url = `https://firestore.googleapis.com/v1/projects/learnloom-27899/databases/(default)/documents/courses/${courseId}?updateMask.fieldPaths=channelTitle&updateMask.fieldPaths=channelUrl`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        channelTitle: { stringValue: channelTitle },
        channelUrl: { stringValue: channelUrl },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore update failed (${res.status}): ${errText}`);
  }
}

async function listAllCourses(token) {
  const url = `https://firestore.googleapis.com/v1/projects/learnloom-27899/databases/(default)/documents/courses?pageSize=100`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list courses: ${errText}`);
  }
  const data = await res.json();
  return (data.documents || []).map((doc) => {
    const id = doc.name.split("/").pop();
    const fields = doc.fields || {};
    return {
      id,
      title: fields.title?.stringValue || "Untitled Course",
      coverVideoId: fields.coverVideoId?.stringValue || null,
      existingChannelTitle: fields.channelTitle?.stringValue || null,
      creatorName: fields.creatorName?.stringValue || null,
    };
  });
}

async function main() {
  console.log("=== VeySkill Authentic YouTube Channel Backfill Engine ===");
  const token = await getValidToken();
  const courses = await listAllCourses(token);
  console.log(`Found ${courses.length} total courses in Firestore.\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    console.log(`[${i + 1}/${courses.length}] Checking: "${c.title}" (ID: ${c.id})`);
    console.log(`  Current Creator / Uploader: "${c.creatorName || 'None'}"`);
    console.log(`  Current Channel Title: "${c.existingChannelTitle || 'MISSING'}"`);

    if (!c.coverVideoId) {
      console.log(`  ⚠️ No coverVideoId found. Skipping.`);
      skippedCount++;
      continue;
    }

    const authorInfo = await fetchYouTubeAuthor(c.coverVideoId);
    if (!authorInfo) {
      console.log(`  ⚠️ Could not resolve YouTube author for video ${c.coverVideoId}`);
      skippedCount++;
      continue;
    }

    console.log(`  ✨ Authentic YouTube Channel: "${authorInfo.channelTitle}" (${authorInfo.channelUrl})`);

    try {
      await updateCourseInFirestore(c.id, authorInfo.channelTitle, authorInfo.channelUrl, token);
      console.log(`  ✅ Successfully updated Firestore document ${c.id}!\n`);
      updatedCount++;
    } catch (err) {
      console.error(`  ❌ Failed to update Firestore:`, err.message);
      errorCount++;
    }

    // Small delay to be polite to APIs
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log("=================================================");
  console.log(`Summary:`);
  console.log(`  Total Courses: ${courses.length}`);
  console.log(`  Successfully Backfilled: ${updatedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Fatal backfill error:", err);
  process.exit(1);
});
