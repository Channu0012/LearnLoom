"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BATTLE_TOPICS, type ArenaRoomDoc } from "@/lib/arena";
import {
  createArenaRoom,
  joinArenaRoom,
  getShareableChallengeUrl,
  getWhatsAppShareUrl,
} from "@/lib/arenaBattle";
import type { DomainType } from "@/lib/curriculumEngine";

// ── Clean Vector SVGs (Zero Emojis, Google Standard) ─────────────────────────

function SwordsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="17" x2="4" y2="20" />
      <line x1="3" y1="19" x2="5" y2="21" />
    </svg>
  );
}

function UsersIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ShareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface FriendChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomReady: (_room: ArenaRoomDoc) => void;
  initialTopic?: DomainType;
}

export function FriendChallengeModal({
  isOpen,
  onClose,
  onRoomReady,
  initialTopic = "react",
}: FriendChallengeModalProps) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [selectedTopic, setSelectedTopic] = useState<DomainType>(initialTopic);
  const [playerMode, setPlayerMode] = useState<"1v1" | "group">("1v1");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Created room state
  const [createdRoom, setCreatedRoom] = useState<ArenaRoomDoc | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUserName = user?.displayName || (user?.email ? user.email.split("@")[0] : "Learner");
  const currentUserUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 9)}`;

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setErrorMsg(null);
    try {
      const room = await createArenaRoom({
        topic: selectedTopic,
        hostUid: currentUserUid,
        hostName: currentUserName || "Host Scholar",
        hostAvatar: user?.photoURL || null,
        maxPlayers: playerMode === "1v1" ? 2 : 5,
      });
      setCreatedRoom(room);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create battle room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdRoom) return;
    const url = getShareableChallengeUrl(createdRoom.id);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setIsJoining(true);
    setErrorMsg(null);
    try {
      const code = joinCodeInput.trim().toUpperCase();
      const room = await joinArenaRoom(code, {
        uid: currentUserUid,
        name: currentUserName || "Scholar",
        avatar: user?.photoURL || null,
      });
      onRoomReady(room);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Invalid room code");
    } finally {
      setIsJoining(false);
    }
  };

  const handleEnterLobby = () => {
    if (createdRoom) {
      onRoomReady(createdRoom);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <SwordsIcon size={16} />
            </div>
            <div>
              <h3
                id="challenge-modal-title"
                className="font-heading font-bold text-base text-foreground"
              >
                Challenge Friends
              </h3>
              <p className="text-xs text-muted-foreground">
                Live 1v1 duel or group quiz battle with shareable link
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Tab switch */}
        {!createdRoom && (
          <div className="flex border-b border-border bg-muted/10 px-6 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`pb-2.5 px-3 font-heading font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "create"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <SwordsIcon size={14} />
              <span>Create Challenge Link</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("join")}
              className={`pb-2.5 px-3 font-heading font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "join"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <UsersIcon size={14} />
              <span>Join with Code</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-body">
              {errorMsg}
            </div>
          )}

          {/* If room was generated */}
          {createdRoom ? (
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-heading font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Room Ready to Battle
                </span>
                <h4 className="font-heading font-extrabold text-2xl text-foreground font-mono tracking-wider pt-2">
                  {createdRoom.id}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Topic: <strong className="text-foreground">{createdRoom.topicLabel}</strong> ·
                  Mode:{" "}
                  <strong className="text-foreground">
                    {createdRoom.maxPlayers === 2 ? "1v1 Duel" : "Group Battle"}
                  </strong>
                </p>
              </div>

              {/* Share actions */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-heading font-bold text-muted-foreground uppercase tracking-wider block">
                  Share Challenge Link With Friends
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareableChallengeUrl(createdRoom.id)}
                    className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl text-xs font-heading font-bold bg-card border border-border hover:bg-muted text-foreground transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <a
                  href={getWhatsAppShareUrl(createdRoom.id, createdRoom.topicLabel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <WhatsAppIcon size={15} />
                  <span>Send Challenge via WhatsApp</span>
                </a>
              </div>

              {/* Enter Lobby Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleEnterLobby}
                  className="w-full py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <SwordsIcon size={15} />
                  <span>Enter Battle Room Lobby</span>
                </button>
              </div>
            </div>
          ) : activeTab === "create" ? (
            /* Create Tab */
            <div className="space-y-4">
              {/* Topic Selector */}
              <div>
                <label className="text-xs font-heading font-bold text-foreground block mb-2">
                  Select Technical Domain
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BATTLE_TOPICS.map((topic) => {
                    const isSelected = selectedTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300 shadow-xs"
                            : "bg-card border-border hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-heading font-bold text-xs">{topic.label}</span>
                          {isSelected && <CheckIcon size={13} />}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {topic.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="text-xs font-heading font-bold text-foreground block mb-2">
                  Battle Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayerMode("1v1")}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      playerMode === "1v1"
                        ? "bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300"
                        : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 font-heading font-bold text-xs mb-0.5">
                      <SwordsIcon size={14} />
                      <span>1v1 Head-to-Head</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">You vs 1 Friend</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlayerMode("group")}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      playerMode === "group"
                        ? "bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300"
                        : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 font-heading font-bold text-xs mb-0.5">
                      <UsersIcon size={14} />
                      <span>Group Battle</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Up to 5 Friends</span>
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleCreateRoom}
                  className="w-full py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isCreating ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <ShareIcon size={14} />
                  )}
                  <span>{isCreating ? "Generating Challenge..." : "Generate Challenge Link"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Join Tab */
            <form onSubmit={handleJoinWithCode} className="space-y-4">
              <div>
                <label className="text-xs font-heading font-bold text-foreground block mb-1.5">
                  Enter Room Code
                </label>
                <input
                  type="text"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="e.g. VS-K89D2"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-mono text-center text-lg tracking-widest placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500 uppercase"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Ask your friend for their 5-character battle room code.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isJoining || !joinCodeInput.trim()}
                  className="w-full py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isJoining ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <UsersIcon size={14} />
                  )}
                  <span>{isJoining ? "Joining Room..." : "Join Battle Room"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
