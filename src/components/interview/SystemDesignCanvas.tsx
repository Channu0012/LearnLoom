"use client";
// ---------------------------------------------------------------------------
// SystemDesignCanvas — Interactive Visual Architecture Whiteboard
// Features: Drag-and-drop infrastructure blocks (CDN, Gateway, Services,
// Redis, Kafka, PostgreSQL), live connections, capacity calculator,
// and Chaos Monkey failure injection.
// ---------------------------------------------------------------------------
import { useState, useRef, useCallback } from "react";
import {
  type SystemNode,
  type SystemEdge,
  type SystemDesignBlueprint,
  SYSTEM_DESIGN_BLUEPRINTS,
} from "@/lib/interview";

interface SystemDesignCanvasProps {
  blueprintId?: string;
  onSubmitArchitecture: (_summary: string, _nodes: SystemNode[], _edges: SystemEdge[]) => void;
  isEvaluating?: boolean;
}

const NODE_COLORS: Record<
  SystemNode["type"],
  { bg: string; border: string; text: string; icon: string }
> = {
  client: { bg: "bg-blue-950/60", border: "border-blue-500/60", text: "text-blue-300", icon: "📱" },
  cdn: { bg: "bg-cyan-950/60", border: "border-cyan-500/60", text: "text-cyan-300", icon: "🌐" },
  gateway: {
    bg: "bg-purple-950/60",
    border: "border-purple-500/60",
    text: "text-purple-300",
    icon: "🛡️",
  },
  service: {
    bg: "bg-teal-950/60",
    border: "border-teal-500/60",
    text: "text-teal-300",
    icon: "⚙️",
  },
  cache: { bg: "bg-red-950/60", border: "border-red-500/60", text: "text-red-300", icon: "⚡" },
  database: {
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/60",
    text: "text-emerald-300",
    icon: "🗄️",
  },
  queue: {
    bg: "bg-amber-950/60",
    border: "border-amber-500/60",
    text: "text-amber-300",
    icon: "📬",
  },
  storage: {
    bg: "bg-slate-900",
    border: "border-slate-500/60",
    text: "text-slate-300",
    icon: "📦",
  },
};

export function SystemDesignCanvas({
  blueprintId = "url-shortener",
  onSubmitArchitecture,
  isEvaluating = false,
}: SystemDesignCanvasProps) {
  const blueprint: SystemDesignBlueprint =
    SYSTEM_DESIGN_BLUEPRINTS[blueprintId] || SYSTEM_DESIGN_BLUEPRINTS["url-shortener"];

  const [nodes, setNodes] = useState<SystemNode[]>(blueprint.defaultNodes);
  const [edges, setEdges] = useState<SystemEdge[]>(blueprint.defaultEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  // ── Capacity Calculator State ──────────────────────────────────────────────
  const [dauMillions, setDauMillions] = useState(100);
  const [readWriteRatio, setReadWriteRatio] = useState(100); // 100:1
  const [payloadBytes, setPayloadBytes] = useState(500); // 500 bytes

  // Math derivations
  const writeQps = Math.round((dauMillions * 1_000_000) / 86400);
  const readQps = Math.round(writeQps * readWriteRatio);
  const storagePerYearGb = Math.round(
    (dauMillions * 1_000_000 * payloadBytes * 365) / (1024 * 1024 * 1024)
  );
  const hotCacheGb = Math.round(storagePerYearGb * 0.2); // 20% 80-20 rule

  // ── Dragging Logic ─────────────────────────────────────────────────────────
  const canvasRef = useRef<SVGSVGElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    if (connectingFromId && connectingFromId !== id) {
      // Create new edge
      const edgeId = `e_${connectingFromId}_${id}_${Date.now().toString(36)}`;
      setEdges((prev) => [...prev, { id: edgeId, source: connectingFromId, target: id }]);
      setConnectingFromId(null);
      return;
    }

    setSelectedNodeId(id);
    setDraggingNodeId(id);
    dragOffsetRef.current = {
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!draggingNodeId) return;
      const newX = Math.max(20, Math.min(950, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(20, Math.min(420, e.clientY - dragOffsetRef.current.y));

      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      );
    },
    [draggingNodeId]
  );

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Add new node
  const handleAddNode = (type: SystemNode["type"], defaultLabel: string) => {
    const id = `node_${type}_${Date.now().toString(36)}`;
    const newNode: SystemNode = {
      id,
      label: defaultLabel,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 150,
      status: "normal",
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  // Delete node
  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    );
    setSelectedNodeId(null);
  };

  // Chaos Monkey: Invalidate or crash a node
  const handleInjectChaos = () => {
    if (!selectedNodeId) {
      // Find a cache or db to fail
      const target = nodes.find((n) => n.type === "cache" || n.type === "database") || nodes[0];
      if (target) {
        setNodes((prev) => prev.map((n) => (n.id === target.id ? { ...n, status: "failed" } : n)));
        setSelectedNodeId(target.id);
      }
      return;
    }

    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNodeId ? { ...n, status: n.status === "failed" ? "normal" : "failed" } : n
      )
    );
  };

  // Submit Architecture to Interviewer
  const handleSubmit = () => {
    const summary = `System Architecture Blueprint: "${blueprint.title}"
Scale: ${dauMillions}M DAU (${writeQps} write RPS, ${readQps} read RPS), ${storagePerYearGb} GB storage/yr, ${hotCacheGb} GB hot cache memory.
Nodes deployed: ${nodes.map((n) => `${n.label} (${n.type}, status: ${n.status || "normal"})`).join(", ")}.
Data flow connections: ${edges.map((e) => `${e.source} -> ${e.target} (${e.protocol || "HTTP"})`).join(", ")}.`;

    onSubmitArchitecture(summary, nodes, edges);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#080d1a] text-slate-100 font-body select-none">
      {/* ── Top Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0d1322] border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-heading font-extrabold uppercase text-slate-400 mr-1 hidden sm:inline">
            Add Node:
          </span>
          <button
            type="button"
            onClick={() => handleAddNode("gateway", "API Gateway (Envoy)")}
            className="px-2.5 py-1 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-[11px] font-heading font-bold text-purple-300 transition-colors cursor-pointer"
          >
            + Gateway
          </button>
          <button
            type="button"
            onClick={() => handleAddNode("service", "Worker Microservice")}
            className="px-2.5 py-1 rounded-lg bg-teal-950/50 hover:bg-teal-900/60 border border-teal-500/40 text-[11px] font-heading font-bold text-teal-300 transition-colors cursor-pointer"
          >
            + Service
          </button>
          <button
            type="button"
            onClick={() => handleAddNode("cache", "Redis Cache Cluster")}
            className="px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-[11px] font-heading font-bold text-red-300 transition-colors cursor-pointer"
          >
            + Redis
          </button>
          <button
            type="button"
            onClick={() => handleAddNode("queue", "Kafka Event Bus")}
            className="px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-[11px] font-heading font-bold text-amber-300 transition-colors cursor-pointer"
          >
            + Kafka
          </button>
          <button
            type="button"
            onClick={() => handleAddNode("database", "Sharded PostgreSQL")}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-[11px] font-heading font-bold text-emerald-300 transition-colors cursor-pointer"
          >
            + Database
          </button>
        </div>

        {/* Right Tools: Connect, Chaos Monkey, Submit */}
        <div className="flex items-center gap-2">
          {selectedNodeId && (
            <button
              type="button"
              onClick={() => setConnectingFromId(selectedNodeId)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold border transition-colors cursor-pointer ${
                connectingFromId
                  ? "bg-teal-500 text-white border-teal-400 animate-pulse"
                  : "bg-slate-800 text-teal-300 border-teal-500/40 hover:bg-slate-700"
              }`}
            >
              {connectingFromId ? "Click target node..." : "Connect Arrow"}
            </button>
          )}

          {selectedNodeId && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-500/40 text-[11px] font-heading font-bold transition-colors cursor-pointer"
              title="Delete selected block"
            >
              Delete
            </button>
          )}

          <button
            type="button"
            onClick={handleInjectChaos}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[11px] font-heading font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Inject chaos failure on node"
          >
            <span>💥 Chaos Monkey</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isEvaluating}
            className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-heading font-black flex items-center gap-1.5 shadow-md shadow-teal-950/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {isEvaluating ? (
              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <span>Submit Design</span>
          </button>
        </div>
      </div>

      {/* ── Main Canvas Workspace ───────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        <svg
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-crosshair"
          viewBox="0 0 1000 460"
        >
          {/* Arrowhead Defs */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#14b8a6" />
            </marker>
          </defs>

          {/* Render Connections */}
          {edges.map((edge) => {
            const src = nodes.find((n) => n.id === edge.source);
            const tgt = nodes.find((n) => n.id === edge.target);
            if (!src || !tgt) return null;

            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            return (
              <g key={edge.id}>
                <line
                  x1={src.x + 75}
                  y1={src.y + 25}
                  x2={tgt.x + 75}
                  y2={tgt.y + 25}
                  stroke="#14b8a6"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  markerEnd="url(#arrowhead)"
                  className="opacity-70"
                />
                {edge.label && (
                  <text
                    x={midX + 75}
                    y={midY + 15}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="bg-black px-1"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const meta = NODE_COLORS[node.type] || NODE_COLORS.service;
            const isSelected = selectedNodeId === node.id;
            const isFailed = node.status === "failed";

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                className="cursor-move"
              >
                {/* Node Box */}
                <rect
                  width="150"
                  height="50"
                  rx="10"
                  fill={isFailed ? "#450a0a" : isSelected ? "#132338" : "#0d1424"}
                  stroke={
                    isFailed
                      ? "#ef4444"
                      : isSelected
                        ? "#14b8a6"
                        : meta.border.replace("border-", "#")
                  }
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  className="shadow-lg transition-all"
                />

                {/* Node Label */}
                <text
                  x="15"
                  y="24"
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {meta.icon}{" "}
                  {node.label.length > 15 ? node.label.slice(0, 15) + "..." : node.label}
                </text>

                {/* Subtag / Status */}
                <text
                  x="15"
                  y="38"
                  fill={isFailed ? "#f87171" : "#06b6d4"}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {isFailed ? "🔴 NODE DOWN (503)" : `tier: ${node.type}`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ── Overlay: Live Scale & Capacity Calculator Bar ──────────────── */}
        <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-[#090d18]/90 backdrop-blur-md border border-slate-800 p-3 shadow-2xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs font-mono">
            {/* Input Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-heading font-black text-teal-400 uppercase tracking-wider">
                Scale Calculator:
              </span>

              <label className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400">DAU:</span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={dauMillions}
                  onChange={(e) => setDauMillions(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-teal-300 font-bold focus:outline-none"
                />
                <span className="text-slate-500">M</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400">R/W Ratio:</span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={readWriteRatio}
                  onChange={(e) => setReadWriteRatio(Math.max(1, Number(e.target.value) || 1))}
                  className="w-14 bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-teal-300 font-bold focus:outline-none"
                />
                <span className="text-slate-500">:1</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400">Payload:</span>
                <input
                  type="number"
                  min={50}
                  max={50000}
                  value={payloadBytes}
                  onChange={(e) => setPayloadBytes(Math.max(50, Number(e.target.value) || 50))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-teal-300 font-bold focus:outline-none"
                />
                <span className="text-slate-500">bytes</span>
              </label>
            </div>

            {/* Derived Metric Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-2.5 py-1 rounded-lg bg-black/50 border border-slate-800 text-[11px]">
                <span className="text-slate-400">Read QPS: </span>
                <span className="text-emerald-400 font-bold">{readQps.toLocaleString()} RPS</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-black/50 border border-slate-800 text-[11px]">
                <span className="text-slate-400">Write QPS: </span>
                <span className="text-cyan-400 font-bold">{writeQps.toLocaleString()} RPS</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-black/50 border border-slate-800 text-[11px]">
                <span className="text-slate-400">Storage/Yr: </span>
                <span className="text-amber-400 font-bold">{storagePerYearGb} GB</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-black/50 border border-slate-800 text-[11px]">
                <span className="text-slate-400">Hot Cache (20%): </span>
                <span className="text-purple-400 font-bold">{hotCacheGb} GB RAM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
