"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { vectorIndexes } from "@/data/mock-data";
import type { VectorIndex, IndexStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Database,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
  Cpu,
  HardDrive,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Info,
} from "lucide-react";

// ── Status badge ──────────────────────────────────────────────────────────────

function IndexStatusBadge({ status }: { status: IndexStatus }) {
  const config: Record<IndexStatus, { label: string; colorClass: string; dotClass: string }> = {
    ready:          { label: "Ready",          colorClass: "text-[color:var(--success)] bg-[color:var(--success)]/10 border-[color:var(--success)]/25", dotClass: "bg-[color:var(--success)]" },
    indexing:       { label: "Indexing",       colorClass: "text-primary bg-primary/10 border-primary/25",                                               dotClass: "bg-primary animate-pulse" },
    stale:          { label: "Stale",          colorClass: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/25", dotClass: "bg-[color:var(--warning)]" },
    partial:        { label: "Partial",        colorClass: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/25", dotClass: "bg-[color:var(--warning)]" },
    failed:         { label: "Failed",         colorClass: "text-destructive bg-destructive/10 border-destructive/25",                                  dotClass: "bg-destructive" },
    drift_detected: { label: "Drift Detected", colorClass: "text-destructive bg-destructive/10 border-destructive/25",                                  dotClass: "bg-destructive" },
  };
  const c = config[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.dotClass)} />
      <Badge
        variant="outline"
        className={cn("text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-sm border", c.colorClass)}
      >
        {c.label}
      </Badge>
    </div>
  );
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date("2026-02-26T12:00:00Z");
  const diffMs  = now.getTime() - d.getTime();
  const diffH   = diffMs / (1000 * 60 * 60);
  if (diffH < 1)  return `${Math.round(diffMs / 60000)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  return `${Math.round(diffH / 24)}d ago`;
}

// ── Index card ────────────────────────────────────────────────────────────────

function IndexCard({
  index,
  isSelected,
  onClick,
}: {
  index: VectorIndex;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isWarning  = index.status === "stale" || index.status === "partial";
  const isError    = index.status === "drift_detected" || index.status === "failed";
  const isIndexing = index.status === "indexing";
  const isReady    = index.status === "ready";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "dark-card cursor-pointer p-0 overflow-hidden transition-all duration-[60ms]",
        isSelected && "border-primary/40 bg-primary/5",
        isError    && !isSelected && "border-destructive/25 bg-destructive/5",
        isWarning  && !isSelected && "border-[color:var(--warning)]/20"
      )}
    >
      {/* Warning / error banner */}
      {(isWarning || isError) && index.statusNote && (
        <div
          className={cn(
            "flex items-start gap-2 px-3 py-2 border-b text-[11px] font-mono",
            isError
              ? "bg-destructive/10 border-destructive/20 text-destructive/80"
              : "bg-[color:var(--warning)]/8 border-[color:var(--warning)]/20 text-[color:var(--warning)]/80"
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span className="leading-snug">{index.statusNote}</span>
        </div>
      )}

      {/* Indexing progress banner */}
      {isIndexing && index.statusNote && (
        <div className="flex items-start gap-2 px-3 py-2 border-b border-primary/20 bg-primary/8 text-[11px] font-mono text-primary/80">
          <RefreshCw className="w-3.5 h-3.5 mt-0.5 shrink-0 animate-spin" />
          <span className="leading-snug">{index.statusNote}</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Name + status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-mono font-semibold text-white/85 leading-tight">
              {index.name}
            </h3>
            <p className="text-[11px] text-white/38 mt-0.5 leading-snug">
              {index.description}
            </p>
          </div>
          <IndexStatusBadge status={index.status} />
        </div>

        {/* Coverage progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-white/28 uppercase tracking-widest">
              Coverage
            </span>
            <span
              className={cn(
                "text-[11px] font-mono tabular-nums",
                index.coveragePct >= 95
                  ? "text-[color:var(--success)]"
                  : index.coveragePct >= 75
                  ? "text-[color:var(--warning)]"
                  : "text-destructive"
              )}
            >
              {index.coveragePct.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                index.coveragePct >= 95
                  ? "bg-[color:var(--success)]"
                  : index.coveragePct >= 75
                  ? "bg-[color:var(--warning)]"
                  : "bg-destructive"
              )}
              style={{ width: `${index.coveragePct}%`, opacity: 0.75 }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-white/25 shrink-0" />
            <div>
              <p className="text-white/25 font-mono">Chunks</p>
              <p className="font-mono text-white/65 tabular-nums">
                {formatNumber(index.chunkCount)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-white/25 shrink-0" />
            <div>
              <p className="text-white/25 font-mono">Dims</p>
              <p className="font-mono text-white/65 tabular-nums">
                {index.dimensions}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-white/25 shrink-0" />
            <div>
              <p className="text-white/25 font-mono">Search</p>
              <p className="font-mono text-white/65 tabular-nums">
                {index.avgSearchLatencyMs}ms
              </p>
            </div>
          </div>
        </div>

        {/* Model + last indexed */}
        <div className="flex items-center justify-between pt-1 border-t border-white/6">
          <span className="text-[10px] font-mono text-white/30 truncate">
            {index.embeddingModel.split("/").pop()}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-white/28 shrink-0">
            <Clock className="w-3 h-3" />
            {formatTime(index.lastIndexedAt)}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function IndexDetailPanel({ index }: { index: VectorIndex }) {
  const isWarning  = index.status === "stale" || index.status === "partial";
  const isError    = index.status === "drift_detected" || index.status === "failed";

  return (
    <Card className="dark-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-mono font-semibold text-white/85">
            {index.name}
          </h3>
          <p className="text-[11px] text-white/35 mt-0.5">{index.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <IndexStatusBadge status={index.status} />
          {(isWarning || isError) && (
            <Button
              size="sm"
              className="h-7 text-xs bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 font-mono"
              variant="outline"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" />
              Reindex
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { icon: <Layers    className="w-3.5 h-3.5" />, label: "Vector Count",        value: index.vectorCount.toLocaleString() },
            { icon: <Database  className="w-3.5 h-3.5" />, label: "Chunk Count",         value: index.chunkCount.toLocaleString() },
            { icon: <HardDrive className="w-3.5 h-3.5" />, label: "Index Size",          value: `${index.sizeMb.toFixed(1)} MB` },
            { icon: <Zap       className="w-3.5 h-3.5" />, label: "Avg Search Latency",  value: `${index.avgSearchLatencyMs}ms` },
            { icon: <Database  className="w-3.5 h-3.5" />, label: "Dimensions",          value: index.dimensions.toString() },
            { icon: <Cpu       className="w-3.5 h-3.5" />, label: "Embedding Model",     value: index.embeddingModel.split("/").pop() ?? "" },
            { icon: <Clock     className="w-3.5 h-3.5" />, label: "Last Indexed",        value: formatTime(index.lastIndexedAt) },
            { icon: <Clock     className="w-3.5 h-3.5" />, label: "Next Scheduled",      value: index.nextScheduledAt ? formatTime(index.nextScheduledAt) : "Manual" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-2.5 rounded-md bg-white/3 border border-white/6"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-white/25">{stat.icon}</span>
                <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
              <p className="font-mono text-sm text-white/75 tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Coverage bar (full) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-white/28 uppercase tracking-widest">
              Index Coverage
            </span>
            <span className="text-[11px] font-mono text-white/65 tabular-nums">
              {index.chunkCount.toLocaleString()} / {Math.round(index.chunkCount / (index.coveragePct / 100)).toLocaleString()} chunks indexed
            </span>
          </div>
          <div className="h-2.5 bg-white/6 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                index.coveragePct >= 95
                  ? "bg-[color:var(--success)]"
                  : index.coveragePct >= 75
                  ? "bg-[color:var(--warning)]"
                  : "bg-destructive"
              )}
              style={{ width: `${index.coveragePct}%`, opacity: 0.7 }}
            />
          </div>
          <p className="text-right text-[11px] font-mono mt-1 tabular-nums"
            style={{
              color: index.coveragePct >= 95
                ? "oklch(0.62 0.19 145 / 0.7)"
                : index.coveragePct >= 75
                ? "oklch(0.75 0.18 85 / 0.7)"
                : "oklch(0.577 0.245 27.325 / 0.7)"
            }}
          >
            {index.coveragePct.toFixed(1)}% covered
          </p>
        </div>

        {/* Status note */}
        {(isWarning || isError || index.status === "indexing") && index.statusNote && (
          <div
            className={cn(
              "mt-3 flex items-start gap-2 p-3 rounded-md border text-[11px] font-mono",
              isError
                ? "bg-destructive/8 border-destructive/20 text-destructive/85"
                : "bg-[color:var(--warning)]/8 border-[color:var(--warning)]/20 text-[color:var(--warning)]/85"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{index.statusNote}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Filter / sort options ─────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "all",            label: "All statuses" },
  { value: "ready",          label: "Ready" },
  { value: "indexing",       label: "Indexing" },
  { value: "stale",          label: "Stale" },
  { value: "partial",        label: "Partial" },
  { value: "drift_detected", label: "Drift Detected" },
  { value: "failed",         label: "Failed" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IndexesPage() {
  const [search,       setSearch]     = useState("");
  const [statusFilter, setStatus]     = useState("all");
  const [selectedId,   setSelectedId] = useState<string | null>(
    vectorIndexes[0]?.id ?? null
  );

  const displayed = useMemo(() => {
    return vectorIndexes.filter((idx) => {
      if (statusFilter !== "all" && idx.status !== statusFilter) return false;
      if (search !== "") {
        const q = search.toLowerCase();
        return (
          idx.name.toLowerCase().includes(q) ||
          idx.description.toLowerCase().includes(q) ||
          idx.embeddingModel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, statusFilter]);

  const selectedIndex = vectorIndexes.find((i) => i.id === selectedId);

  // Summary stats
  const readyCount    = vectorIndexes.filter((i) => i.status === "ready").length;
  const warningCount  = vectorIndexes.filter((i) => i.status === "stale" || i.status === "partial").length;
  const criticalCount = vectorIndexes.filter((i) => i.status === "drift_detected" || i.status === "failed").length;
  const totalVectors  = vectorIndexes.reduce((s, i) => s + i.vectorCount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white/90">
            Vectorize Indexes
          </h1>
          <p className="text-xs text-white/35 mt-0.5 font-mono">
            Index health, coverage, dimension config, and embedding model assignments
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 text-xs bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 font-mono"
          variant="outline"
        >
          <Database className="w-3 h-3 mr-1.5" />
          New Index
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Indexes",    value: vectorIndexes.length.toString(),    color: "text-white/85" },
          { label: "Ready",            value: readyCount.toString(),               color: "text-[color:var(--success)]" },
          { label: "Need Attention",   value: warningCount.toString(),             color: warningCount > 0 ? "text-[color:var(--warning)]" : "text-white/85" },
          { label: "Critical",         value: criticalCount.toString(),            color: criticalCount > 0 ? "text-destructive" : "text-white/85" },
        ].map((s) => (
          <Card key={s.label} className="dark-card p-3">
            <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-1">
              {s.label}
            </p>
            <p className={cn("text-2xl font-mono font-semibold tabular-nums", s.color)}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input
            placeholder="Search indexes by name or model…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-white/5 border-white/10 text-white/75 placeholder:text-white/22 focus:border-primary/40"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatus}>
          <SelectTrigger className="w-40 h-8 text-xs bg-white/5 border-white/10 text-white/65">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-white/10 text-white/75">
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs text-white/70">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-white/28 font-mono shrink-0">
          {displayed.length} / {vectorIndexes.length} indexes
        </span>
      </div>

      {/* Two-column layout: grid + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 items-start">
        {/* Index card grid */}
        <div className="space-y-3">
          {displayed.length === 0 ? (
            <div className="dark-card p-6 text-center text-xs text-white/28 font-mono rounded-lg">
              No indexes match this filter.
            </div>
          ) : (
            displayed.map((idx) => (
              <IndexCard
                key={idx.id}
                index={idx}
                isSelected={selectedId === idx.id}
                onClick={() => setSelectedId(idx.id)}
              />
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-4">
          {selectedIndex ? (
            <IndexDetailPanel index={selectedIndex} />
          ) : (
            <Card className="dark-card p-6 text-center text-xs text-white/28 font-mono">
              Select an index to inspect its configuration and health metrics.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
