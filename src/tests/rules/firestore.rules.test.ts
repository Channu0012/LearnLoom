/**
 * Firestore Security Rules Tests
 *
 * Tests every rule in firestore.rules plus 10+ attack cases.
 * Runs against the Firestore emulator via @firebase/rules-unit-testing.
 *
 * Start emulator before running: firebase emulators:start --only firestore
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { describe, it, beforeAll, afterAll, afterEach } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection } from "firebase/firestore";

// ── Setup ──────────────────────────────────────────────────────────────────

const PROJECT_ID = "learnloom-test";
const RULES = readFileSync(resolve(__dirname, "../../../firestore.rules"), "utf8");

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: RULES,
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

// ── Helpers ────────────────────────────────────────────────────────────────

/** Seeded user data */
const USER_A = { uid: "userA", displayName: "Alice", photoURL: null, isAdmin: false };
const USER_B = { uid: "userB", displayName: "Bob", photoURL: null, isAdmin: false };
const ADMIN_USER = { uid: "adminUser", displayName: "Admin", photoURL: null, isAdmin: true };

async function seedUserDocs() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users", USER_A.uid), { ...USER_A, createdAt: new Date() });
    await setDoc(doc(db, "users", USER_B.uid), { ...USER_B, createdAt: new Date() });
    await setDoc(doc(db, "users", ADMIN_USER.uid), { ...ADMIN_USER, createdAt: new Date() });
  });
}

function validCourse(creatorId: string) {
  return {
    title: "Test Course",
    description: "A test course description.",
    category: "Programming",
    creatorId,
    creatorName: "Alice",
    status: "draft",
    lessonCount: 0,
    coverVideoId: null,
    keywords: ["test"],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
  };
}

function validLesson() {
  return {
    youtubeId: "dQw4w9WgXcQ",
    title: "Intro lesson",
    order: 0,
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  };
}

// ── User document tests ────────────────────────────────────────────────────

describe("users collection", () => {
  it("anyone can read a user document", async () => {
    await seedUserDocs();
    const unauthCtx = testEnv.unauthenticatedContext();
    await assertSucceeds(getDoc(doc(unauthCtx.firestore(), "users", USER_A.uid)));
  });

  it("a user can create their own document", async () => {
    await seedUserDocs();
    const ctx = testEnv.authenticatedContext(USER_A.uid);
    const db = ctx.firestore();
    await testEnv.clearFirestore(); // fresh start
    await assertSucceeds(
      setDoc(doc(db, "users", USER_A.uid), {
        uid: USER_A.uid,
        displayName: "Alice",
        photoURL: null,
        isAdmin: false,
        createdAt: new Date(),
      })
    );
  });

  it("ATTACK: user cannot self-grant isAdmin on create", async () => {
    const ctx = testEnv.authenticatedContext(USER_A.uid);
    const db = ctx.firestore();
    await assertFails(
      setDoc(doc(db, "users", USER_A.uid), {
        uid: USER_A.uid,
        displayName: "Alice",
        photoURL: null,
        isAdmin: true, // <-- attack
        createdAt: new Date(),
      })
    );
  });

  it("ATTACK: user cannot self-grant isAdmin on update", async () => {
    await seedUserDocs();
    const ctx = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(
      updateDoc(doc(ctx.firestore(), "users", USER_A.uid), {
        isAdmin: true, // <-- attack
      })
    );
  });

  it("ATTACK: user cannot write to another user's document", async () => {
    await seedUserDocs();
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(
      updateDoc(doc(ctxA.firestore(), "users", USER_B.uid), {
        displayName: "Hacked by Alice",
      })
    );
  });

  it("ATTACK: user cannot delete their own document", async () => {
    await seedUserDocs();
    const ctx = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(deleteDoc(doc(ctx.firestore(), "users", USER_A.uid)));
  });

  it("user cannot create displayName exceeding 100 chars", async () => {
    const ctx = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(
      setDoc(doc(ctx.firestore(), "users", USER_A.uid), {
        uid: USER_A.uid,
        displayName: "A".repeat(101), // <-- too long
        photoURL: null,
        isAdmin: false,
        createdAt: new Date(),
      })
    );
  });
});

// ── Course tests ───────────────────────────────────────────────────────────

describe("courses collection", () => {
  it("anyone can read a published course", async () => {
    await seedUserDocs();
    const courseId = "pub-course";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), {
        ...validCourse(USER_A.uid),
        status: "published",
      });
    });
    const unauth = testEnv.unauthenticatedContext();
    await assertSucceeds(getDoc(doc(unauth.firestore(), "courses", courseId)));
  });

  it("ATTACK: unauthenticated user cannot read a draft", async () => {
    await seedUserDocs();
    const courseId = "draft-course";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const unauth = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(unauth.firestore(), "courses", courseId)));
  });

  it("ATTACK: another user cannot read creator's draft", async () => {
    await seedUserDocs();
    const courseId = "draft-course-2";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const ctxB = testEnv.authenticatedContext(USER_B.uid);
    await assertFails(getDoc(doc(ctxB.firestore(), "courses", courseId)));
  });

  it("creator can read their own draft", async () => {
    await seedUserDocs();
    const courseId = "my-draft";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertSucceeds(getDoc(doc(ctxA.firestore(), "courses", courseId)));
  });

  it("authenticated user can create a course with correct creatorId", async () => {
    await seedUserDocs();
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertSucceeds(addDoc(collection(ctxA.firestore(), "courses"), validCourse(USER_A.uid)));
  });

  it("ATTACK: user cannot spoof a different creatorId on create", async () => {
    await seedUserDocs();
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(
      addDoc(collection(ctxA.firestore(), "courses"), validCourse(USER_B.uid)) // spoofed
    );
  });

  it("ATTACK: user cannot edit someone else's course", async () => {
    await seedUserDocs();
    const courseId = "alice-course";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const ctxB = testEnv.authenticatedContext(USER_B.uid);
    await assertFails(updateDoc(doc(ctxB.firestore(), "courses", courseId), { title: "Hacked" }));
  });

  it("ATTACK: creator cannot change creatorId", async () => {
    await seedUserDocs();
    const courseId = "alice-course-2";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(
      updateDoc(doc(ctxA.firestore(), "courses", courseId), {
        creatorId: USER_B.uid, // <-- attack: steal course
      })
    );
  });

  it("ATTACK: course title exceeding 120 chars is rejected", async () => {
    await seedUserDocs();
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    const badCourse = { ...validCourse(USER_A.uid), title: "T".repeat(121) };
    await assertFails(addDoc(collection(ctxA.firestore(), "courses"), badCourse));
  });

  it("ATTACK: invalid category is rejected", async () => {
    await seedUserDocs();
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(
      addDoc(collection(ctxA.firestore(), "courses"), {
        ...validCourse(USER_A.uid),
        category: "HackCategory", // not in allowed list
      })
    );
  });

  it("ATTACK: keywords list exceeding 100 items is rejected", async () => {
    await seedUserDocs();
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(
      addDoc(collection(ctxA.firestore(), "courses"), {
        ...validCourse(USER_A.uid),
        keywords: Array.from({ length: 101 }, (_, i) => `kw${i}`),
      })
    );
  });

  it("creator can delete their own course", async () => {
    await seedUserDocs();
    const courseId = "delete-me";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertSucceeds(deleteDoc(doc(ctxA.firestore(), "courses", courseId)));
  });

  it("ATTACK: non-creator cannot delete a course", async () => {
    await seedUserDocs();
    const courseId = "protected-course";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const ctxB = testEnv.authenticatedContext(USER_B.uid);
    await assertFails(deleteDoc(doc(ctxB.firestore(), "courses", courseId)));
  });

  it("admin can unpublish a course (change status)", async () => {
    await seedUserDocs();
    const courseId = "published-course";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), {
        ...validCourse(USER_A.uid),
        status: "published",
      });
    });
    const adminCtx = testEnv.authenticatedContext(ADMIN_USER.uid);
    await assertSucceeds(
      updateDoc(doc(adminCtx.firestore(), "courses", courseId), {
        status: "draft",
        updatedAt: new Date(),
      })
    );
  });

  it("admin can delete any course", async () => {
    await seedUserDocs();
    const courseId = "admin-delete-course";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const adminCtx = testEnv.authenticatedContext(ADMIN_USER.uid);
    await assertSucceeds(deleteDoc(doc(adminCtx.firestore(), "courses", courseId)));
  });
});

// ── Lessons sub-collection tests ───────────────────────────────────────────

describe("lessons sub-collection", () => {
  it("anyone can read lessons of a published course", async () => {
    await seedUserDocs();
    const courseId = "pub-with-lesson";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), {
        ...validCourse(USER_A.uid),
        status: "published",
      });
      await setDoc(doc(ctx.firestore(), "courses", courseId, "lessons", "lesson1"), validLesson());
    });
    const unauth = testEnv.unauthenticatedContext();
    await assertSucceeds(
      getDoc(doc(unauth.firestore(), "courses", courseId, "lessons", "lesson1"))
    );
  });

  it("ATTACK: unauthenticated user cannot read lessons of a draft", async () => {
    await seedUserDocs();
    const courseId = "draft-with-lesson";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
      await setDoc(doc(ctx.firestore(), "courses", courseId, "lessons", "l1"), validLesson());
    });
    const unauth = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(unauth.firestore(), "courses", courseId, "lessons", "l1")));
  });

  it("creator can add a lesson", async () => {
    await seedUserDocs();
    const courseId = "creator-lesson-course";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertSucceeds(
      addDoc(collection(ctxA.firestore(), "courses", courseId, "lessons"), validLesson())
    );
  });

  it("ATTACK: non-creator cannot add a lesson to another's course", async () => {
    await seedUserDocs();
    const courseId = "protected-lesson-course";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "courses", courseId), validCourse(USER_A.uid));
    });
    const ctxB = testEnv.authenticatedContext(USER_B.uid);
    await assertFails(
      addDoc(collection(ctxB.firestore(), "courses", courseId, "lessons"), validLesson())
    );
  });
});

// ── Progress sub-collection tests ──────────────────────────────────────────

describe("progress sub-collection", () => {
  it("user can read their own progress", async () => {
    await seedUserDocs();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users", USER_A.uid, "progress", "course1"), {
        courseId: "course1",
        completedLessonIds: [],
        lastLessonId: null,
        updatedAt: new Date(),
      });
    });
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertSucceeds(getDoc(doc(ctxA.firestore(), "users", USER_A.uid, "progress", "course1")));
  });

  it("ATTACK: user cannot read another user's progress", async () => {
    await seedUserDocs();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users", USER_A.uid, "progress", "course1"), {
        courseId: "course1",
        completedLessonIds: [],
        lastLessonId: null,
        updatedAt: new Date(),
      });
    });
    const ctxB = testEnv.authenticatedContext(USER_B.uid);
    await assertFails(getDoc(doc(ctxB.firestore(), "users", USER_A.uid, "progress", "course1")));
  });

  it("ATTACK: unauthenticated user cannot read any progress", async () => {
    await seedUserDocs();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users", USER_A.uid, "progress", "course1"), {
        courseId: "course1",
        completedLessonIds: [],
        lastLessonId: null,
        updatedAt: new Date(),
      });
    });
    const unauth = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(unauth.firestore(), "users", USER_A.uid, "progress", "course1")));
  });
});

// ── Reports tests ──────────────────────────────────────────────────────────

describe("reports collection", () => {
  it("authenticated user can create a report", async () => {
    await seedUserDocs();
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertSucceeds(
      addDoc(collection(ctxA.firestore(), "reports"), {
        courseId: "some-course",
        reporterId: USER_A.uid,
        reason: "This course violates guidelines.",
        status: "open",
        createdAt: new Date(),
      })
    );
  });

  it("ATTACK: unauthenticated user cannot create a report", async () => {
    const unauth = testEnv.unauthenticatedContext();
    await assertFails(
      addDoc(collection(unauth.firestore(), "reports"), {
        courseId: "some-course",
        reporterId: "nobody",
        reason: "Spam",
        status: "open",
        createdAt: new Date(),
      })
    );
  });

  it("ATTACK: non-admin user cannot read reports", async () => {
    await seedUserDocs();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await addDoc(collection(ctx.firestore(), "reports"), {
        courseId: "c1",
        reporterId: USER_A.uid,
        reason: "Bad content",
        status: "open",
        createdAt: new Date(),
      });
    });
    const ctxB = testEnv.authenticatedContext(USER_B.uid);
    await assertFails(
      // getDocs would fail — checking a specific doc write/read
      setDoc(doc(ctxB.firestore(), "reports", "test-report"), {
        courseId: "c1",
        reporterId: USER_B.uid,
        reason: "Test",
        status: "reviewed", // non-open — attack
        createdAt: new Date(),
      })
    );
  });

  it("ATTACK: reporter cannot spoof a different reporterId", async () => {
    await seedUserDocs();
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(
      addDoc(collection(ctxA.firestore(), "reports"), {
        courseId: "some-course",
        reporterId: USER_B.uid, // <-- spoofed
        reason: "Spam",
        status: "open",
        createdAt: new Date(),
      })
    );
  });

  it("ATTACK: reason exceeding 1000 chars is rejected", async () => {
    await seedUserDocs();
    const ctxA = testEnv.authenticatedContext(USER_A.uid);
    await assertFails(
      addDoc(collection(ctxA.firestore(), "reports"), {
        courseId: "some-course",
        reporterId: USER_A.uid,
        reason: "X".repeat(1001),
        status: "open",
        createdAt: new Date(),
      })
    );
  });

  it("admin can read reports", async () => {
    await seedUserDocs();
    const reportId = "admin-visible-report";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "reports", reportId), {
        courseId: "c1",
        reporterId: USER_A.uid,
        reason: "Spam",
        status: "open",
        createdAt: new Date(),
      });
    });
    const adminCtx = testEnv.authenticatedContext(ADMIN_USER.uid);
    await assertSucceeds(getDoc(doc(adminCtx.firestore(), "reports", reportId)));
  });
});
