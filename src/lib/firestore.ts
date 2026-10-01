// ---------------------------------------------------------------------------
// Typed Firestore helpers — thin wrappers around the Firebase SDK.
// All reads return properly typed documents; writes are fully typed.
// ---------------------------------------------------------------------------
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  serverTimestamp,
  writeBatch,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type QueryConstraint,
  type FieldValue,
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS, PAGE_SIZE } from "./constants";
import type {
  UserDoc,
  CourseDoc,
  LessonDoc,
  ProgressDoc,
  ReportDoc,
  SerializedCourseDoc,
} from "./types";

// ── Helpers ────────────────────────────────────────────────────────────────

export function serializeCourse(course: CourseDoc): SerializedCourseDoc {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    creatorId: course.creatorId,
    creatorName: course.creatorName,
    status: course.status,
    lessonCount: course.lessonCount,
    coverVideoId: course.coverVideoId,
    keywords: course.keywords ?? [],
    createdAt: course.createdAt?.toMillis?.() ?? null,
    updatedAt: course.updatedAt?.toMillis?.() ?? null,
    publishedAt: course.publishedAt?.toMillis?.() ?? null,
  };
}

function snapToUser(snap: DocumentSnapshot): UserDoc | null {
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}

function snapToCourse(snap: DocumentSnapshot | QueryDocumentSnapshot): CourseDoc {
  return { ...(snap.data() as CourseDoc), id: snap.id };
}

function snapToLesson(snap: QueryDocumentSnapshot): LessonDoc {
  return { ...(snap.data() as LessonDoc), id: snap.id };
}

// ── User helpers ───────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snapToUser(snap);
}

export async function createUserDoc(
  uid: string,
  data: Omit<UserDoc, "createdAt" | "isAdmin">
): Promise<void> {
  await setDoc(
    doc(db, COLLECTIONS.USERS, uid),
    {
      ...data,
      createdAt: serverTimestamp(),
      isAdmin: false,
    },
    { merge: true }
  );
}

// ── Course helpers ─────────────────────────────────────────────────────────

export async function getCourse(courseId: string): Promise<CourseDoc | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.COURSES, courseId));
    if (!snap.exists()) return null;
    return snapToCourse(snap);
  } catch {
    return null;
  }
}

export async function createCourse(
  data: Omit<CourseDoc, "id" | "createdAt" | "updatedAt" | "publishedAt">
): Promise<string> {
  const isPublished = (data as { status?: string }).status === "published";
  const ref = await addDoc(collection(db, COLLECTIONS.COURSES), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: isPublished ? serverTimestamp() : null,
  });
  return ref.id;
}

// Looser type for update payloads — allows FieldValue for server-set fields
type CourseUpdatePayload = {
  title?: string;
  description?: string;
  category?: string;
  creatorName?: string;
  status?: "draft" | "published";
  lessonCount?: number;
  coverVideoId?: string | null;
  keywords?: string[];
  updatedAt?: FieldValue;
  publishedAt?: FieldValue | null;
};

export async function updateCourse(courseId: string, data: CourseUpdatePayload): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.COURSES, courseId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCourse(courseId: string): Promise<void> {
  await clearLessons(courseId);
  await deleteDoc(doc(db, COLLECTIONS.COURSES, courseId));
}

/** Get published courses — paginated without requiring undeployed composite indexes */
export async function getPublishedCourses(
  constraints: QueryConstraint[] = [],
  pageSize = PAGE_SIZE
): Promise<CourseDoc[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.COURSES),
      where("status", "==", "published"),
      ...constraints,
      limit(pageSize * 2)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(snapToCourse);
    list.sort((a, b) => {
      const timeA = a.publishedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
      const timeB = b.publishedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
      return timeB - timeA;
    });
    return list.slice(0, pageSize);
  } catch {
    return [];
  }
}

/** Get courses by creator (all statuses) — in-memory sorted to avoid missing composite index */
export async function getCoursesByCreator(uid: string): Promise<CourseDoc[]> {
  try {
    const q = query(collection(db, COLLECTIONS.COURSES), where("creatorId", "==", uid));
    const snap = await getDocs(q);
    const list = snap.docs.map(snapToCourse);
    list.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
      const timeB = b.updatedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
      return timeB - timeA;
    });
    return list;
  } catch {
    return [];
  }
}

// ── Lesson helpers ─────────────────────────────────────────────────────────

export async function getLessons(courseId: string): Promise<LessonDoc[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.COURSES, courseId, COLLECTIONS.LESSONS));
    const list = snap.docs.map(snapToLesson);
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list;
  } catch {
    return [];
  }
}

export async function addLesson(courseId: string, data: Omit<LessonDoc, "id">): Promise<string> {
  const ref = await addDoc(
    collection(db, COLLECTIONS.COURSES, courseId, COLLECTIONS.LESSONS),
    data
  );
  return ref.id;
}

export async function clearLessons(courseId: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.COURSES, courseId, COLLECTIONS.LESSONS));
    if (snap.empty) return;
    const BATCH_CHUNK_SIZE = 450;
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += BATCH_CHUNK_SIZE) {
      const batch = writeBatch(db);
      for (const d of docs.slice(i, i + BATCH_CHUNK_SIZE)) {
        batch.delete(d.ref);
      }
      await batch.commit();
    }
  } catch {
    // Non-fatal if clearing empty collection
  }
}

/**
 * High-performance atomic batch writer for course lessons.
 * Saves 100+ video courses in single atomic chunks instead of sequential requests.
 */
export async function batchSetLessons(
  courseId: string,
  lessons: Array<Omit<LessonDoc, "id">>
): Promise<void> {
  const BATCH_CHUNK_SIZE = 450;
  for (let i = 0; i < lessons.length; i += BATCH_CHUNK_SIZE) {
    const chunk = lessons.slice(i, i + BATCH_CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const lesson of chunk) {
      const lessonRef = doc(collection(db, COLLECTIONS.COURSES, courseId, COLLECTIONS.LESSONS));
      batch.set(lessonRef, lesson);
    }
    await batch.commit();
  }
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  data: Partial<Omit<LessonDoc, "id">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.COURSES, courseId, COLLECTIONS.LESSONS, lessonId), data);
}

export async function deleteLesson(courseId: string, lessonId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.COURSES, courseId, COLLECTIONS.LESSONS, lessonId));
}

// ── Progress helpers ───────────────────────────────────────────────────────

export async function getProgress(uid: string, courseId: string): Promise<ProgressDoc | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROGRESS, courseId));
    if (!snap.exists()) return null;
    return snap.data() as ProgressDoc;
  } catch {
    return null;
  }
}

/** Enroll or register course start into user's My Learning progress */
export async function enrollOrStartCourse(
  uid: string,
  courseId: string,
  firstLessonId?: string
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROGRESS, courseId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(
        ref,
        {
          courseId,
          completedLessonIds: [],
          lastLessonId: firstLessonId ?? null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch {
    // Graceful fallback for offline / IndexedDB cache
  }
}

export async function markLessonComplete(
  uid: string,
  courseId: string,
  lessonId: string
): Promise<void> {
  await setDoc(
    doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROGRESS, courseId),
    {
      courseId,
      completedLessonIds: arrayUnion(lessonId),
      lastLessonId: lessonId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Persist real-time MCQ assessment scores for a lesson under user progress */
export async function saveQuizScore(
  uid: string,
  courseId: string,
  lessonId: string,
  score: number,
  total: number
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROGRESS, courseId);
    await setDoc(
      ref,
      {
        [`quizScores.${lessonId}`]: { score, total },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to save quiz score in Firestore:", err);
  }
}

/** Get all in-progress courses for a user */
export async function getUserProgress(uid: string): Promise<ProgressDoc[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROGRESS));
    return snap.docs.map((d) => d.data() as ProgressDoc);
  } catch {
    return [];
  }
}

// ── Report helpers ─────────────────────────────────────────────────────────

export async function createReport(
  data: Omit<ReportDoc, "id" | "createdAt" | "status">
): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.REPORTS), {
    ...data,
    status: "open",
    createdAt: serverTimestamp(),
  });
}

export { startAfter, orderBy, where, limit };
