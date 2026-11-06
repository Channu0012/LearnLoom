// ---------------------------------------------------------------------------
// VeySkill Arena — Real-Time Multiplayer Room & Challenge Engine
// Supports 1v1 friend duels, small group lobbies (up to 5), live answer sync,
// streak multipliers, and shareable WhatsApp/direct challenge links.
// ---------------------------------------------------------------------------

import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "./constants";
import { getDomainQuestions, type QuizQuestion, type DomainType } from "./curriculumEngine";
import { BATTLE_TOPICS, type ArenaRoomDoc, type ArenaParticipant } from "./arena";

// In-memory fallback cache for instant optimistic responsiveness & offline testing
const localRoomStore = new Map<string, ArenaRoomDoc>();

/** Broadcast channel for cross-tab real-time sync when testing locally */
const localBroadcast =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("veyskill_arena_rooms")
    : null;

// ── ID & URL Helpers ─────────────────────────────────────────────────────────

export function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "VS-";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getShareableChallengeUrl(roomId: string): string {
  if (typeof window === "undefined") {
    return `https://veyskill.in/arena?room=${roomId}`;
  }
  return `${window.location.origin}/arena?room=${roomId}`;
}

export function getWhatsAppShareUrl(roomId: string, topicLabel: string): string {
  const url = getShareableChallengeUrl(roomId);
  const text = `[VeySkill Arena] Technical Quiz Duel Challenge: I created a live ${topicLabel} battle on VeySkill Arena. Test your skills and compete with me here: ${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

// ── Score & Streak Calculations ──────────────────────────────────────────────

export function calculateQuestionPoints(
  isCorrect: boolean,
  timeTakenMs: number,
  currentStreak: number,
  timeLimitSeconds = 15
): { points: number; speedBonus: number; streakMultiplier: number; newStreak: number } {
  if (!isCorrect) {
    return { points: 0, speedBonus: 0, streakMultiplier: 1.0, newStreak: 0 };
  }

  const newStreak = currentStreak + 1;
  const timeTakenSec = Math.min(timeLimitSeconds, Math.max(0.5, timeTakenMs / 1000));
  const timeRemaining = Math.max(0, timeLimitSeconds - timeTakenSec);

  // Speed Bonus: 0 to 50 points based on response velocity
  const speedBonus = Math.round((timeRemaining / timeLimitSeconds) * 50);

  // Streak Multiplier:
  // 1 correct: 1.0x
  // 2 correct: 1.1x (+10%)
  // 3 correct: 1.25x (+25%)
  // 4+ correct: 1.5x (+50% blaze!)
  let streakMultiplier = 1.0;
  if (newStreak === 2) streakMultiplier = 1.1;
  else if (newStreak === 3) streakMultiplier = 1.25;
  else if (newStreak >= 4) streakMultiplier = 1.5;

  const basePoints = 100;
  const points = Math.round((basePoints + speedBonus) * streakMultiplier);

  return { points, speedBonus, streakMultiplier, newStreak };
}

// ── Room Lifecycle ───────────────────────────────────────────────────────────

export interface CreateRoomParams {
  topic: DomainType;
  hostUid: string;
  hostName: string;
  hostAvatar?: string | null;
  hostCampus?: string;
  maxPlayers?: number;
}

export async function createArenaRoom(params: CreateRoomParams): Promise<ArenaRoomDoc> {
  const roomId = generateRoomId();
  const topicMeta = BATTLE_TOPICS.find((t) => t.id === params.topic);
  const topicLabel = topicMeta?.label || "Technical Challenge";

  // Select 5 standardized questions for this room
  const rawQuestions = getDomainQuestions(params.topic, "Technical Arena Challenge", 5);
  const selectedQuestions = rawQuestions.slice(0, 5);

  const initialParticipant: ArenaParticipant = {
    uid: params.hostUid,
    name: params.hostName,
    avatar: params.hostAvatar || null,
    campus: params.hostCampus || "VeySkill Scholar",
    isHost: true,
    score: 0,
    streak: 0,
    currentQ: 0,
    answers: [],
    status: "ready",
    updatedAt: Date.now(),
  };

  const room: ArenaRoomDoc & { questions: QuizQuestion[] } = {
    id: roomId,
    hostUid: params.hostUid,
    hostName: params.hostName,
    topic: params.topic,
    topicLabel,
    maxPlayers: params.maxPlayers || 2,
    status: "waiting",
    createdAt: Date.now(),
    questions: selectedQuestions,
    participants: {
      [params.hostUid]: initialParticipant,
    },
  };

  // Optimistic local cache
  localRoomStore.set(roomId, room);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`arena_room_${roomId}`, JSON.stringify(room));
      localBroadcast?.postMessage({ type: "ROOM_UPDATED", room });
    } catch {}
  }

  // Firestore persistence
  try {
    const roomRef = doc(db, COLLECTIONS.ARENA_ROOMS, roomId);
    await setDoc(roomRef, {
      ...room,
      createdAtServer: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firestore arena room creation fallback to local:", err);
  }

  return room;
}

export async function fetchArenaRoom(roomId: string): Promise<ArenaRoomDoc | null> {
  const cleanId = roomId.trim().toUpperCase();

  // Try Firestore
  try {
    const roomRef = doc(db, COLLECTIONS.ARENA_ROOMS, cleanId);
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      const data = snap.data() as ArenaRoomDoc;
      localRoomStore.set(cleanId, data);
      return data;
    }
  } catch (err) {
    console.warn("Failed to fetch room from Firestore:", err);
  }

  // Fallback to local
  if (localRoomStore.has(cleanId)) {
    return localRoomStore.get(cleanId)!;
  }
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`arena_room_${cleanId}`);
      if (saved) {
        const parsed = JSON.parse(saved) as ArenaRoomDoc;
        localRoomStore.set(cleanId, parsed);
        return parsed;
      }
    } catch {}
  }

  return null;
}

export async function joinArenaRoom(
  roomId: string,
  user: {
    uid: string;
    name: string;
    avatar?: string | null;
    campus?: string;
  }
): Promise<ArenaRoomDoc> {
  const cleanId = roomId.trim().toUpperCase();
  let room = await fetchArenaRoom(cleanId);

  if (!room) {
    throw new Error("Challenge room not found. Please verify your invite link or code.");
  }

  const currentCount = Object.keys(room.participants).length;
  if (!room.participants[user.uid] && currentCount >= (room.maxPlayers || 2)) {
    throw new Error(`Room is full (maximum ${room.maxPlayers || 2} players).`);
  }

  if (room.status === "completed") {
    throw new Error("This battle has already concluded.");
  }

  const existing = room.participants[user.uid];
  const participant: ArenaParticipant = {
    uid: user.uid,
    name: user.name,
    avatar: user.avatar || null,
    campus: user.campus || "Scholar",
    isHost: existing ? existing.isHost : false,
    score: existing ? existing.score : 0,
    streak: existing ? existing.streak : 0,
    currentQ: existing ? existing.currentQ : 0,
    answers: existing ? existing.answers : [],
    status: "ready",
    updatedAt: Date.now(),
  };

  const updatedParticipants = {
    ...room.participants,
    [user.uid]: participant,
  };

  const updatedRoom: ArenaRoomDoc = {
    ...room,
    participants: updatedParticipants,
  };

  // Local update
  localRoomStore.set(cleanId, updatedRoom);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`arena_room_${cleanId}`, JSON.stringify(updatedRoom));
      localBroadcast?.postMessage({ type: "ROOM_UPDATED", room: updatedRoom });
    } catch {}
  }

  // Firestore update
  try {
    const roomRef = doc(db, COLLECTIONS.ARENA_ROOMS, cleanId);
    await updateDoc(roomRef, {
      [`participants.${user.uid}`]: participant,
    });
  } catch (err) {
    console.warn("Firestore join room fallback to local:", err);
  }

  return updatedRoom;
}

export async function startArenaBattle(roomId: string): Promise<void> {
  const cleanId = roomId.trim().toUpperCase();
  const room = await fetchArenaRoom(cleanId);
  if (!room) return;

  const updatedRoom: ArenaRoomDoc = {
    ...room,
    status: "active",
    startedAt: Date.now() + 3500, // 3.5s countdown before Q1
  };

  localRoomStore.set(cleanId, updatedRoom);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`arena_room_${cleanId}`, JSON.stringify(updatedRoom));
      localBroadcast?.postMessage({ type: "ROOM_UPDATED", room: updatedRoom });
    } catch {}
  }

  try {
    const roomRef = doc(db, COLLECTIONS.ARENA_ROOMS, cleanId);
    await updateDoc(roomRef, {
      status: "active",
      startedAt: updatedRoom.startedAt,
    });
  } catch (err) {
    console.warn("Firestore start arena battle fallback:", err);
  }
}

export async function submitPlayerAnswer(
  roomId: string,
  uid: string,
  answerData: {
    qIndex: number;
    selectedOption: number;
    isCorrect: boolean;
    timeTakenMs: number;
  }
): Promise<ArenaRoomDoc | null> {
  const cleanId = roomId.trim().toUpperCase();
  const room = await fetchArenaRoom(cleanId);
  if (!room) return null;

  const currentParticipant = room.participants[uid];
  if (!currentParticipant) return room;

  const calc = calculateQuestionPoints(
    answerData.isCorrect,
    answerData.timeTakenMs,
    currentParticipant.streak
  );

  const updatedAnswers = [...(currentParticipant.answers || [])];
  updatedAnswers[answerData.qIndex] = {
    qIndex: answerData.qIndex,
    selectedOption: answerData.selectedOption,
    isCorrect: answerData.isCorrect,
    timeTakenMs: answerData.timeTakenMs,
    points: calc.points,
  };

  const isLastQuestion = answerData.qIndex >= 4; // 5 questions total (0..4)
  const updatedParticipant: ArenaParticipant = {
    ...currentParticipant,
    score: currentParticipant.score + calc.points,
    streak: calc.newStreak,
    currentQ: answerData.qIndex + 1,
    answers: updatedAnswers,
    status: isLastQuestion ? "finished" : "in_quiz",
    finishedAt: isLastQuestion ? Date.now() : undefined,
    updatedAt: Date.now(),
  };

  const updatedParticipants = {
    ...room.participants,
    [uid]: updatedParticipant,
  };

  // Check if all players finished
  const allFinished = Object.values(updatedParticipants).every((p) => p.status === "finished");

  const updatedRoom: ArenaRoomDoc = {
    ...room,
    participants: updatedParticipants,
    status: allFinished ? "completed" : room.status,
  };

  // Local update
  localRoomStore.set(cleanId, updatedRoom);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`arena_room_${cleanId}`, JSON.stringify(updatedRoom));
      localBroadcast?.postMessage({ type: "ROOM_UPDATED", room: updatedRoom });
    } catch {}
  }

  // Firestore update
  try {
    const roomRef = doc(db, COLLECTIONS.ARENA_ROOMS, cleanId);
    await updateDoc(roomRef, {
      [`participants.${uid}`]: updatedParticipant,
      ...(allFinished ? { status: "completed" } : {}),
    });
  } catch (err) {
    console.warn("Firestore answer submission fallback to local:", err);
  }

  return updatedRoom;
}

export function subscribeArenaRoom(
  roomId: string,
  callback: (_room: ArenaRoomDoc | null) => void
): () => void {
  const cleanId = roomId.trim().toUpperCase();

  // Instant optimistic fire from local store
  if (localRoomStore.has(cleanId)) {
    callback(localRoomStore.get(cleanId)!);
  } else if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`arena_room_${cleanId}`);
      if (saved) {
        callback(JSON.parse(saved) as ArenaRoomDoc);
      }
    } catch {}
  }

  // Broadcast channel listener for multi-tab testing
  const onBroadcast = (e: MessageEvent) => {
    if (e.data?.type === "ROOM_UPDATED" && e.data?.room?.id === cleanId) {
      callback(e.data.room);
    }
  };
  localBroadcast?.addEventListener("message", onBroadcast);

  // Firestore onSnapshot listener
  let unsubFirestore: (() => void) | null = null;
  try {
    const roomRef = doc(db, COLLECTIONS.ARENA_ROOMS, cleanId);
    unsubFirestore = onSnapshot(
      roomRef,
      (snap) => {
        if (snap.exists()) {
          const roomData = snap.data() as ArenaRoomDoc;
          localRoomStore.set(cleanId, roomData);
          callback(roomData);
        } else {
          // If Firestore doc not found, check local
          if (localRoomStore.has(cleanId)) {
            callback(localRoomStore.get(cleanId)!);
          }
        }
      },
      (err) => {
        console.warn("Firestore arena listener error:", err);
      }
    );
  } catch (err) {
    console.warn("Failed to subscribe to arena room:", err);
  }

  return () => {
    unsubFirestore?.();
    localBroadcast?.removeEventListener("message", onBroadcast);
  };
}
