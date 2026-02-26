"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toolCalls, toolCallMetrics } from "@/data/mock-data";
import type { ToolCall, ToolCallStatus, McpToolName, ToolCallMetrics } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Wrench,
  Activity,
  Gauge,
} from "lucide-react";

// ── Status badge ──────────────────────────────────────────────────────────────

function ToolStatusBadge({ status }: { status: ToolCallStatus }) {
  const config: Record<ToolCallStatus, { label: string; colorClass: string }> = {
    success:        { label: "Success",        colorClass: "text-[color:var(--success)] bg-[color:var(--success)]/10 border-[color:var(--success)]/25" },
    failed:         { label: "Failed",         colorClass: "text-destructive bg-destructive/10 border-destructive/25" },
    timeout:        { label: "Timeout",        colorClass: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/25" },
    schema_mismatch:{ label: "Schema Mismatch",colorClass: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/25" },
  };
  const c = config[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded-sm border", c.colorClass)}
    >
      {c.label}
    </Badge>
  );
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatArgs(args: Record<string, unknown>): string {
  try {
    const s = JSON.stringify(args);
    return s.length > 72 ? s.slice(0, 72) + "…" : s;
  } catch {
    return "—";
  }
}

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

// ── Tool name label map ───────────────────────────────────────────────────────

const TOOL_LABELS: Record<McpToolName, string> = {
  search_entities:   "search_entities",
  get_schema:        "get_schema",
  generate_chart:    "generate_chart",
  execute_sql:       "execute_sql",
  list_integrations: "list_integrations",
  resolve_workspace: "resolve_workspace",
  fetch_report:      "fetch_report",
  validate_query:    "validate_query",
};

const TOOL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All tools" },
  ...Object.entries(TOOL_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

const STATUS_OPTIONS = [
  { value: "all",             label: "All statuses" },
  { value: "success",         label: "Success" },
  { value: "failed",          label: "Failed" },
  { value: "timeout",         label: "Timeout" },
  { value: "schema_mismatch", label: "Schema Mismatch" },
];

// ── Summary stats ─────────────────────────────────────────────────────────────

function computeSummary(calls: ToolCall[]) {
  const total      = calls.length;
  const successful = calls.filter((c) => c.status === "success").length;
  const avgLatency = total > 0
    ? Math.round(calls.reduce((s, c) => s + c.latencyMs, 0) / total)
    : 0;
  const schemaErrors = calls.filter((c) => c.status === "schema_mismatch").length;
  const successRate  = total > 0 ? ((successful / total) * 100).toFixed(1) : "0.0";
  return { total, successful, successRate, avgLatency, schemaErrors };
}

// ── Per-tool metrics (from mock toolCallMetrics) ──────────────────────────────

function ToolMetricBar({ metric }: { metric: ToolCallMetrics }) {
  const successRate = metric.total > 0
    ? ((metric.success / metric.total) * 100).toFixed(0)
    : "0";
  return (
    <div className="flex items-center gap-3 text-xs py-1.5 px-2 rounded-md hover:bg-white/3 transition-colors duration-[60ms]">
      <span className="font-mono text-[11px] text-white/45 w-36 shrink-0 truncate">
        {metric.tool}
      </span>
      <div className="flex-1 h-3 bg-white/6 rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm bg-primary/70"
          style={{ width: `${Math.max(2, Number(successRate))}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-white/60 w-10 text-right tabular-nums shrink-0">
        {successRate}%
      </span>
      <span className="font-mono text-[11px] text-white/35 w-14 text-right tabular-nums shrink-0">
        {metric.avgLatencyMs}ms
      </span>
      <span className="font-mono text-[11px] text-white/28 w-10 text-right tabular-nums shrink-0">
        {metric.total}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ToolCallsPage() {
  const [search,       setSearch]     = useState("");
  const [statusFilter, setStatus]     = useState("all");
  const [toolFilter,   setTool]       = useState("all");
  const [expandedId,   setExpandedId] = useState<string | null>(null);
  const [sortKey,      setSortKey]    = useState<"createdAt" | "latencyMs">("createdAt");
  const [sortDir,      setSortDir]    = useState<"asc" | "desc">("desc");

  const displayed = useMemo(() => {
    return toolCalls
      .filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (toolFilter   !== "all" && c.tool   !== toolFilter)   return false;
        if (search !== "") {
          const q = search.toLowerCase();
          return (
            c.id.toLowerCase().includes(q) ||
            c.tool.toLowerCase().includes(q) ||
            c.requestId.toLowerCase().includes(q) ||
            JSON.stringify(c.inputArgs).toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const av = sortKey === "latencyMs" ? a.latencyMs : a.createdAt;
        const bv = sortKey === "latencyMs" ? b.latencyMs : b.createdAt;
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, statusFilter, toolFilter, sortKey, sortDir]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ col }: { col: typeof sortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />;
  }

  const summary = computeSummary(toolCalls);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white/90">
            MCP Tool Calls
          </h1>
          <p className="text-xs text-white/35 mt-0.5 font-mono">
            Model Context Protocol tool invocation log — inputs, outputs, schema errors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/8 text-xs h-7"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/8 text-xs h-7"
          >
            <Download className="w-3 h-3 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon:  <Activity className="w-4 h-4" />,
            label: "Total Calls",
            value: summary.total.toString(),
            accent: false,
          },
          {
            icon:  <CheckCircle2 className="w-4 h-4" />,
            label: "Success Rate",
            value: `${summary.successRate}%`,
            accent: false,
          },
          {
            icon:  <Gauge className="w-4 h-4" />,
            label: "Avg Latency",
            value: `${summary.avgLatency}ms`,
            accent: summary.avgLatency > 1000,
          },
          {
            icon:  <AlertTriangle className="w-4 h-4" />,
            label: "Schema Errors",
            value: summary.schemaErrors.toString(),
            accent: summary.schemaErrors > 0,
          },
        ].map((card) => (
          <Card key={card.label} className="dark-card p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={cn(
                  "text-white/30",
                  card.accent && "text-[color:var(--warning)]"
                )}
              >
                {card.icon}
              </span>
              <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest">
                {card.label}
              </p>
            </div>
            <p
              className={cn(
                "text-2xl font-mono font-semibold tabular-nums",
                card.accent ? "text-[color:var(--warning)]" : "text-white/88"
              )}
            >
              {card.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Per-tool success rate breakdown */}
      <Card className="dark-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest">
            Tool Success Rate / Avg Latency
          </p>
          <div className="flex items-center gap-4 text-[9px] font-mono text-white/25">
            <span>Success%</span>
            <span>Avg Lat.</span>
            <span>Calls</span>
          </div>
        </div>
        <div className="space-y-0.5">
          {toolCallMetrics.map((m) => (
            <ToolMetricBar key={m.tool} metric={m} />
          ))}
        </div>
      </Card>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input
            placeholder="Search by tool name, call ID, request ID, args…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-white/5 border-white/10 text-white/75 placeholder:text-white/22 focus:border-primary/40"
          />
        </div>
        <Select value={toolFilter} onValueChange={setTool}>
          <SelectTrigger className="w-44 h-8 text-xs bg-white/5 border-white/10 text-white/65">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-white/10 text-white/75">
            {TOOL_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs text-white/70 font-mono">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {displayed.length} / {toolCalls.length} calls
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
                  Call ID
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 font-mono">
                  Tool Name
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
                  Status
                </TableHead>
                <TableHead
                  className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 cursor-pointer select-none hover:text-white/55 transition-colors duration-[60ms] text-right"
                  onClick={() => toggleSort("latencyMs")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Latency <SortIcon col="latencyMs" />
                  </div>
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3">
                  Input Args (truncated)
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 text-right">
                  Out Tokens
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-28 text-center text-xs text-white/28 font-mono"
                  >
                    No tool calls match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.flatMap((call) => {
                  const isExpanded = expandedId === call.id;
                  const isSchemaMismatch = call.status === "schema_mismatch";
                  const isError = call.status === "failed" || call.status === "timeout";

                  return [
                    <TableRow
                      key={call.id}
                      className={cn(
                        "border-white/5 cursor-pointer transition-colors duration-[60ms]",
                        isExpanded
                          ? "bg-white/5"
                          : isSchemaMismatch || isError
                          ? "bg-[color:var(--warning)]/5 hover:bg-[color:var(--warning)]/8"
                          : "hover:bg-[color:var(--surface-hover)]"
                      )}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : call.id)
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
                      <TableCell className="font-mono text-[11px] text-primary/70 whitespace-nowrap">
                        {call.id}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/65 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Wrench className="w-3 h-3 text-white/25 shrink-0" />
                          {call.tool}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/38 whitespace-nowrap">
                        {formatTs(call.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ToolStatusBadge status={call.status} />
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-right tabular-nums">
                        <span
                          className={cn(
                            call.latencyMs > 3000
                              ? "text-destructive"
                              : call.latencyMs > 1000
                              ? "text-[color:var(--warning)]"
                              : "text-[color:var(--success)]"
                          )}
                        >
                          {call.latencyMs.toLocaleString()}ms
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/38 max-w-[200px]">
                        <span className="truncate block">
                          {formatArgs(call.inputArgs)}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/50 text-right tabular-nums">
                        {call.outputTokens != null
                          ? call.outputTokens.toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>,

                    isExpanded ? (
                      <TableRow key={`${call.id}-detail`} className="border-white/5">
                        <TableCell colSpan={8} className="bg-white/3 px-5 py-4">
                          <div className="space-y-3">
                            {/* Full input args */}
                            <div>
                              <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-1">
                                Input Arguments
                              </p>
                              <pre className="text-[11px] font-mono text-white/60 bg-white/5 rounded-md px-3 py-2.5 border border-white/8 overflow-x-auto">
                                {JSON.stringify(call.inputArgs, null, 2)}
                              </pre>
                            </div>

                            {/* Schema mismatch detail */}
                            {call.schemaMismatchDetail && (
                              <div className="flex items-start gap-2 p-3 rounded-md bg-[color:var(--warning)]/8 border border-[color:var(--warning)]/20">
                                <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--warning)] mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[10px] font-mono text-[color:var(--warning)]/70 uppercase tracking-widest mb-0.5">
                                    Schema Mismatch Detail
                                  </p>
                                  <p className="text-[11px] font-mono text-[color:var(--warning)]/85 leading-relaxed">
                                    {call.schemaMismatchDetail}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Error message */}
                            {call.errorMessage && (
                              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/8 border border-destructive/20">
                                <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[10px] font-mono text-destructive/70 uppercase tracking-widest mb-0.5">
                                    Error Message
                                  </p>
                                  <p className="text-[11px] font-mono text-destructive/85 leading-relaxed">
                                    {call.errorMessage}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Success metadata */}
                            {call.status === "success" && (
                              <div className="flex items-center gap-2 text-[11px] font-mono text-[color:var(--success)]/70">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                Tool executed successfully
                                {call.outputTokens != null && (
                                  <span className="text-white/35">
                                    — {call.outputTokens.toLocaleString()} output tokens returned
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Parent request */}
                            <div className="flex items-center gap-2 pt-1">
                              <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                                Parent Request:
                              </p>
                              <span className="font-mono text-[11px] text-primary/60">
                                {call.requestId}
                              </span>
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

      {/* Footer hint */}
      <p className="text-[10px] text-white/20 font-mono">
        Click any row to expand full input args and error details. Schema mismatch rows require tool binding regeneration.
      </p>
    </div>
  );
}
