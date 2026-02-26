"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { traces, requests } from "@/data/mock-data";
import type {
  Trace,
  Request,
  RequestStatus,
  CacheStatus,
  PipelineStage,
} from "@/lib/types";
import {
  Card,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  RefreshCw,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  SkipForward,
  Zap,
} from "lucide-react";

// ── Status badge helpers ──────────────────────────────────────────────────────

function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const config: Record<RequestStatus, { label: string; colorClass: string }> = {
    success:           { label: "Success",          colorClass: "text-[color:var(--success)] bg-[color:var(--success)]/10 border-[color:var(--success)]/20" },
    cached:            { label: "Cached",           colorClass: "text-primary bg-primary/10 border-primary/20" },
    error:             { label: "Error",            colorClass: "text-destructive bg-destructive/10 border-destructive/20" },
    rate_limited:      { label: "Rate Limited",     colorClass: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/20" },
    timeout:           { label: "Timeout",          colorClass: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/20" },
    model_unavailable: { label: "Model Unavail.",   colorClass: "text-destructive bg-destructive/10 border-destructive/20" },
  };
  const c = config[status] ?? { label: status, colorClass: "text-muted-foreground bg-muted border-border" };
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded-sm border font-mono",
        c.colorClass
      )}
    >
      {c.label}
    </Badge>
  );
}

function CacheBadge({ status }: { status: CacheStatus }) {
  const config: Record<CacheStatus, { label: string; colorClass: string }> = {
    hit:    { label: "HIT",    colorClass: "text-[color:var(--success)] bg-[color:var(--success)]/10" },
    miss:   { label: "MISS",   colorClass: "text-white/30 bg-white/5" },
    bypass: { label: "BYPASS", colorClass: "text-[color:var(--warning)] bg-[color:var(--warning)]/10" },
  };
  const c = config[status];
  return (
    <span
      className={cn(
        "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm tracking-wide",
        c.colorClass
      )}
    >
      {c.label}
    </span>
  );
}

// ── Pipeline stage waterfall ──────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  cache_lookup:  "Cache Lookup",
  embed:         "Embed",
  retrieve:      "Retrieve",
  rerank:        "Rerank",
  generate:      "Generate",
  tool_dispatch: "Tool Dispatch",
  sql_parse:     "SQL Parse",
};

function StageWaterfall({
  stages,
  totalMs,
}: {
  stages: PipelineStage[];
  totalMs: number;
}) {
  return (
    <div className="space-y-1.5 pt-1">
      {stages.map((s, i) => {
        const widthPct =
          totalMs > 0 ? Math.max(2, (s.durationMs / totalMs) * 100) : 2;
        const barColor =
          s.status === "error"
            ? "bg-destructive/60"
            : s.status === "skipped"
            ? "bg-white/10"
            : s.cached
            ? "bg-primary/50"
            : "bg-primary/80";
        return (
          <div
            key={i}
            className="grid items-center gap-3 text-xs"
            style={{ gridTemplateColumns: "7rem 1fr 5rem 4rem auto" }}
          >
            <span className="font-mono text-white/50 text-[11px] truncate">
              {STAGE_LABELS[s.stage] ?? s.stage}
            </span>
            <div className="h-4 bg-white/5 rounded-sm overflow-hidden">
              <div
                className={cn("h-full rounded-sm transition-all", barColor)}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="font-mono text-white/70 text-right text-[11px] tabular-nums">
              {s.durationMs > 0 ? `${s.durationMs.toLocaleString()}ms` : "—"}
            </span>
            <span className="font-mono text-white/35 text-right text-[11px] tabular-nums">
              {s.tokens != null && s.tokens > 0
                ? `${s.tokens.toLocaleString()}t`
                : ""}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              {s.status === "ok" && (
                <CheckCircle2 className="w-3 h-3 text-[color:var(--success)] shrink-0" />
              )}
              {s.status === "error" && (
                <XCircle className="w-3 h-3 text-destructive shrink-0" />
              )}
              {s.status === "skipped" && (
                <SkipForward className="w-3 h-3 text-white/25 shrink-0" />
              )}
              {s.error && (
                <span
                  className="text-destructive/80 text-[10px] font-mono truncate"
                  title={s.error}
                >
                  {s.error.slice(0, 52)}…
                </span>
              )}
              {s.cached && !s.error && (
                <span className="text-primary/50 text-[10px] font-mono">
                  cache
                </span>
              )}
              {s.model && !s.cached && !s.error && (
                <span className="text-white/25 text-[10px] font-mono">
                  {s.model.split("/").pop()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Data setup ────────────────────────────────────────────────────────────────

interface TraceRow {
  trace: Trace;
  request: Request | undefined;
}

const traceRows: TraceRow[] = traces.map((t) => ({
  trace: t,
  request: requests.find((r) => r.id === t.requestId),
}));

function formatTs(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month:   "short",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
    second:  "2-digit",
    hour12:  false,
  });
}

const STATUS_OPTIONS = [
  { value: "all",              label: "All statuses" },
  { value: "success",          label: "Success" },
  { value: "cached",           label: "Cached" },
  { value: "error",            label: "Error" },
  { value: "timeout",          label: "Timeout" },
  { value: "rate_limited",     label: "Rate Limited" },
  { value: "model_unavailable",label: "Model Unavailable" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TracesPage() {
  const [search,       setSearch]     = useState("");
  const [statusFilter, setStatus]     = useState("all");
  const [expandedId,   setExpandedId] = useState<string | null>(null);
  const [sortKey,      setSortKey]    = useState<"createdAt" | "totalMs">("createdAt");
  const [sortDir,      setSortDir]    = useState<"asc" | "desc">("desc");

  const displayed = useMemo(() => {
    return traceRows
      .filter((row) => {
        const reqStatus = row.request?.status ?? "";
        if (statusFilter !== "all" && reqStatus !== statusFilter) return false;
        if (search !== "") {
          const q = search.toLowerCase();
          return (
            row.trace.id.toLowerCase().includes(q) ||
            row.trace.userPrompt.toLowerCase().includes(q) ||
            (row.request?.model ?? "").toLowerCase().includes(q) ||
            (row.request?.initiatedBy ?? "").toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const av =
          sortKey === "totalMs" ? a.trace.totalMs : a.trace.createdAt;
        const bv =
          sortKey === "totalMs" ? b.trace.totalMs : b.trace.createdAt;
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, statusFilter, sortKey, sortDir]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: typeof sortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white/90">
            Request Traces
          </h1>
          <p className="text-xs text-white/35 mt-0.5 font-mono">
            Full pipeline execution log — embed → retrieve → generate
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white/55 hover:text-white/85 hover:bg-white/8 text-xs h-7"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white/55 hover:text-white/85 hover:bg-white/8 text-xs h-7"
          >
            <Download className="w-3 h-3 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input
            placeholder="Search trace ID, prompt, model, initiator…"
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
              <SelectItem
                key={o.value}
                value={o.value}
                className="text-xs text-white/70"
              >
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-white/30 font-mono shrink-0">
          {displayed.length} / {traceRows.length} traces
        </span>
      </div>

      {/* Table */}
      <Card className="dark-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/8 hover:bg-transparent">
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 w-8" />
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 font-mono">
                  Trace ID
                </TableHead>
                <TableHead
                  className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 cursor-pointer select-none hover:text-white/55 transition-colors duration-[60ms]"
                  onClick={() => toggleSort("createdAt")}
                >
                  <div className="flex items-center gap-1">
                    Timestamp <SortIcon col="createdAt" />
                  </div>
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3">
                  Route
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3">
                  Gen Model
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 text-right">
                  In Tokens
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 text-right">
                  Out Tokens
                </TableHead>
                <TableHead
                  className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 cursor-pointer select-none hover:text-white/55 transition-colors duration-[60ms] text-right"
                  onClick={() => toggleSort("totalMs")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Latency <SortIcon col="totalMs" />
                  </div>
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3">
                  Cache
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-28 text-center text-xs text-white/28 font-mono"
                  >
                    No traces match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.flatMap(({ trace, request }) => {
                  const isExpanded = expandedId === trace.id;
                  const hasError =
                    request?.status === "error" ||
                    request?.status === "timeout" ||
                    request?.status === "model_unavailable";
                  return [
                    <TableRow
                      key={trace.id}
                      className={cn(
                        "border-white/5 cursor-pointer transition-colors duration-[60ms]",
                        isExpanded
                          ? "bg-white/5 border-primary/20"
                          : hasError
                          ? "bg-destructive/5 hover:bg-destructive/8"
                          : "hover:bg-[color:var(--surface-hover)]"
                      )}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : trace.id)
                      }
                    >
                      <TableCell className="w-8 pr-0 pl-3">
                        <ChevronRight
                          className={cn(
                            "w-3.5 h-3.5 text-white/25 transition-transform duration-[60ms]",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-primary/75 whitespace-nowrap">
                        {trace.id}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/38 whitespace-nowrap">
                        {formatTs(trace.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/45 max-w-[120px]">
                        <span className="truncate block">
                          {trace.routeId}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/45 max-w-[140px]">
                        <span className="truncate block">
                          {trace.generationModel.split("/").pop()}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/65 text-right tabular-nums">
                        {request?.inputTokens != null
                          ? request.inputTokens.toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/65 text-right tabular-nums">
                        {request?.outputTokens != null
                          ? request.outputTokens.toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-right tabular-nums">
                        <span
                          className={cn(
                            trace.totalMs > 2000
                              ? "text-destructive"
                              : trace.totalMs > 1000
                              ? "text-[color:var(--warning)]"
                              : "text-[color:var(--success)]"
                          )}
                        >
                          {trace.totalMs.toLocaleString()}ms
                        </span>
                      </TableCell>
                      <TableCell>
                        {request && (
                          <CacheBadge status={request.cacheStatus} />
                        )}
                      </TableCell>
                      <TableCell>
                        {request && (
                          <RequestStatusBadge status={request.status} />
                        )}
                      </TableCell>
                    </TableRow>,

                    isExpanded ? (
                      <TableRow
                        key={`${trace.id}-detail`}
                        className="border-white/5"
                      >
                        <TableCell
                          colSpan={10}
                          className="bg-white/3 px-5 py-4"
                        >
                          <div className="space-y-4">
                            {/* Prompt */}
                            <div>
                              <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-1">
                                User Prompt
                              </p>
                              <p className="text-xs text-white/65 leading-relaxed font-mono bg-white/5 rounded-md px-3 py-2 border border-white/8">
                                {trace.userPrompt}
                              </p>
                            </div>

                            {/* Metadata grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-0.5">
                                  Embedding Model
                                </p>
                                <p className="font-mono text-white/55 text-[11px]">
                                  {trace.embeddingModel.split("/").slice(-1)[0]}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-0.5">
                                  Reranker
                                </p>
                                <p className="font-mono text-white/55 text-[11px]">
                                  {trace.rerankerModel
                                    ? trace.rerankerModel.split("/").slice(-1)[0]
                                    : "none"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-0.5">
                                  Top Similarity
                                </p>
                                <p
                                  className={cn(
                                    "font-mono text-[11px]",
                                    trace.topSimilarityScore >= 0.8
                                      ? "text-[color:var(--success)]"
                                      : trace.topSimilarityScore >= 0.6
                                      ? "text-[color:var(--warning)]"
                                      : "text-destructive"
                                  )}
                                >
                                  {trace.topSimilarityScore.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-0.5">
                                  Initiated By
                                </p>
                                <p className="font-mono text-white/55 text-[11px]">
                                  {request?.initiatedBy ?? "—"}
                                </p>
                              </div>
                            </div>

                            {/* Stage waterfall */}
                            <div>
                              <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Layers className="w-3 h-3" />
                                Pipeline Stage Breakdown
                              </p>
                              <div className="bg-white/3 rounded-md px-3 py-3 border border-white/6">
                                <StageWaterfall
                                  stages={trace.stages}
                                  totalMs={trace.totalMs}
                                />
                              </div>
                            </div>

                            {/* Error detail */}
                            {request?.errorDetail && (
                              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/8 border border-destructive/20">
                                <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                                <p className="text-[11px] font-mono text-destructive/85">
                                  {request.errorDetail}
                                </p>
                              </div>
                            )}

                            {/* Response summary */}
                            <div>
                              <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-0.5">
                                Response Summary
                              </p>
                              <p className="text-xs text-white/45 font-mono leading-relaxed">
                                {trace.responseSummary}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null,
                  ];
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-[10px] text-white/22 font-mono flex-wrap">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-primary/50" />
          Click any row to expand pipeline stage waterfall
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[color:var(--warning)]/50" />
          <span className="text-[color:var(--warning)]/60">&gt;1s</span>
          {" / "}
          <span className="text-destructive/60">&gt;2s</span>
          {" latency thresholds"}
        </span>
      </div>
    </div>
  );
}
