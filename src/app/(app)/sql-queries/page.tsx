"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { sqlQueries } from "@/data/mock-data";
import type { SqlQuery, SqlQueryStatus } from "@/lib/types";
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
  Play,
  Download,
  Clock,
  Database,
  Rows3,
  Activity,
  Gauge,
} from "lucide-react";

// ── Status badge ──────────────────────────────────────────────────────────────

function SqlStatusBadge({ status }: { status: SqlQueryStatus }) {
  const config: Record<SqlQueryStatus, { label: string; colorClass: string }> = {
    executed:      { label: "Executed",      colorClass: "text-[color:var(--success)] bg-[color:var(--success)]/10 border-[color:var(--success)]/25" },
    generated:     { label: "Generated",     colorClass: "text-primary bg-primary/10 border-primary/25" },
    query_error:   { label: "Query Error",   colorClass: "text-destructive bg-destructive/10 border-destructive/25" },
    schema_mismatch:{ label: "Schema Mismatch", colorClass: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/25" },
    timeout:       { label: "Timeout",       colorClass: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/25" },
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

// ── Confidence score indicator ────────────────────────────────────────────────

function ConfidenceBar({ score }: { score: number }) {
  const pct  = Math.round(score * 100);
  const color =
    pct >= 90 ? "bg-[color:var(--success)]" :
    pct >= 75 ? "bg-[color:var(--warning)]" :
                "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${pct}%`, opacity: 0.75 }}
        />
      </div>
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums",
          pct >= 90
            ? "text-[color:var(--success)]"
            : pct >= 75
            ? "text-[color:var(--warning)]"
            : "text-destructive"
        )}
      >
        {pct}%
      </span>
    </div>
  );
}

// ── SQL code block ────────────────────────────────────────────────────────────

function SqlBlock({ sql }: { sql: string }) {
  // Very minimal keyword highlighting using spans
  const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "ON", "GROUP BY", "ORDER BY",
                    "HAVING", "LIMIT", "LEFT", "INNER", "COUNT", "DISTINCT", "AS",
                    "AND", "OR", "NOT", "IS", "NULL", "DESC", "ASC", "DATE_TRUNC",
                    "INTERVAL", "NOW", "COALESCE", "CASE", "WHEN", "THEN", "END", "MAX",
                    "MIN", "SUM", "WITH"];

  const lines = sql.split("\n");
  return (
    <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto text-white/60 bg-transparent">
      {lines.map((line, li) => {
        // Simple pass — highlight SQL keywords
        let result = line;
        keywords.forEach((kw) => {
          result = result.replace(
            new RegExp(`\\b(${kw})\\b`, "g"),
            `\x00KW\x00${kw}\x00/KW\x00`
          );
        });
        const parts = result.split(/\x00KW\x00|\x00\/KW\x00/);
        return (
          <div key={li}>
            {parts.map((part, pi) => {
              const isKw = keywords.includes(part);
              return (
                <span
                  key={pi}
                  style={isKw ? { color: "oklch(0.60 0.22 265 / 0.9)" } : undefined}
                >
                  {part}
                </span>
              );
            })}
          </div>
        );
      })}
    </pre>
  );
}

// ── Format helpers ────────────────────────────────────────────────────────────

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

function truncateQuestion(q: string, max = 60): string {
  return q.length > max ? q.slice(0, max) + "…" : q;
}

// ── Filter options ────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "all",             label: "All statuses" },
  { value: "executed",        label: "Executed" },
  { value: "generated",       label: "Generated (not run)" },
  { value: "query_error",     label: "Query Error" },
  { value: "schema_mismatch", label: "Schema Mismatch" },
  { value: "timeout",         label: "Timeout" },
];

// ── Summary stats ─────────────────────────────────────────────────────────────

function computeSummary(queries: SqlQuery[]) {
  const total     = queries.length;
  const executed  = queries.filter((q) => q.status === "executed").length;
  const errors    = queries.filter((q) => q.status === "query_error" || q.status === "schema_mismatch").length;
  const execTimes = queries
    .filter((q) => q.executionMs != null)
    .map((q) => q.executionMs!);
  const avgExec   = execTimes.length > 0
    ? Math.round(execTimes.reduce((s, v) => s + v, 0) / execTimes.length)
    : 0;
  const successRate = total > 0 ? ((executed / total) * 100).toFixed(1) : "0.0";
  return { total, executed, errors, avgExec, successRate };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SqlQueriesPage() {
  const [search,       setSearch]     = useState("");
  const [statusFilter, setStatus]     = useState("all");
  const [expandedId,   setExpandedId] = useState<string | null>(null);
  const [sortKey,      setSortKey]    = useState<"createdAt" | "executionMs" | "confidenceScore">("createdAt");
  const [sortDir,      setSortDir]    = useState<"asc" | "desc">("desc");

  const displayed = useMemo(() => {
    return sqlQueries
      .filter((q) => {
        if (statusFilter !== "all" && q.status !== statusFilter) return false;
        if (search !== "") {
          const s = search.toLowerCase();
          return (
            q.id.toLowerCase().includes(s) ||
            q.naturalLanguageQuery.toLowerCase().includes(s) ||
            q.generatedSql.toLowerCase().includes(s) ||
            q.tablesReferenced.some((t) => t.toLowerCase().includes(s))
          );
        }
        return true;
      })
      .sort((a, b) => {
        let av: number | string, bv: number | string;
        if (sortKey === "executionMs") {
          av = a.executionMs ?? -1;
          bv = b.executionMs ?? -1;
        } else if (sortKey === "confidenceScore") {
          av = a.confidenceScore;
          bv = b.confidenceScore;
        } else {
          av = a.createdAt;
          bv = b.createdAt;
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, statusFilter, sortKey, sortDir]);

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

  const summary = computeSummary(sqlQueries);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white/90">
            SQL Query History
          </h1>
          <p className="text-xs text-white/35 mt-0.5 font-mono">
            Text-to-SQL generation log — natural language → SQL → execution result
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/8 text-xs h-7"
        >
          <Download className="w-3 h-3 mr-1.5" />
          Export History
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon:  <Activity className="w-4 h-4" />,
            label: "Total Queries",
            value: summary.total.toString(),
            accent: false,
          },
          {
            icon:  <CheckCircle2 className="w-4 h-4" />,
            label: "Execution Success",
            value: `${summary.successRate}%`,
            accent: false,
          },
          {
            icon:  <Gauge className="w-4 h-4" />,
            label: "Avg Exec Time",
            value: `${summary.avgExec}ms`,
            accent: summary.avgExec > 1500,
          },
          {
            icon:  <XCircle className="w-4 h-4" />,
            label: "DB Errors",
            value: summary.errors.toString(),
            accent: summary.errors > 0,
          },
        ].map((card) => (
          <Card key={card.label} className="dark-card p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={cn(
                  "text-white/28",
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

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input
            placeholder="Search question, SQL, table name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-white/5 border-white/10 text-white/75 placeholder:text-white/22 focus:border-primary/40"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatus}>
          <SelectTrigger className="w-44 h-8 text-xs bg-white/5 border-white/10 text-white/65">
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
          {displayed.length} / {sqlQueries.length} queries
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
                  Query ID
                </TableHead>
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3">
                  Natural Language Question
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
                <TableHead className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 text-right">
                  Rows
                </TableHead>
                <TableHead
                  className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 cursor-pointer select-none hover:text-white/55 transition-colors duration-[60ms] text-right"
                  onClick={() => toggleSort("executionMs")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Exec Time <SortIcon col="executionMs" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-[10px] font-medium text-white/28 uppercase tracking-widest bg-white/3 cursor-pointer select-none hover:text-white/55 transition-colors duration-[60ms]"
                  onClick={() => toggleSort("confidenceScore")}
                >
                  <div className="flex items-center gap-1">
                    Confidence <SortIcon col="confidenceScore" />
                  </div>
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
                    No SQL queries match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.flatMap((query) => {
                  const isExpanded   = expandedId === query.id;
                  const isError      = query.status === "query_error";
                  const isUnsafe     = query.status === "schema_mismatch" || query.status === "timeout";

                  return [
                    <TableRow
                      key={query.id}
                      className={cn(
                        "border-white/5 cursor-pointer transition-colors duration-[60ms]",
                        isExpanded
                          ? "bg-white/5"
                          : isError
                          ? "bg-destructive/5 hover:bg-destructive/8"
                          : isUnsafe
                          ? "bg-[color:var(--warning)]/5 hover:bg-[color:var(--warning)]/8"
                          : "hover:bg-[color:var(--surface-hover)]"
                      )}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : query.id)
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
                        {query.id}
                      </TableCell>
                      <TableCell className="text-[11px] text-white/65 max-w-[280px]">
                        <span className="truncate block leading-snug">
                          {truncateQuestion(query.naturalLanguageQuery)}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/38 whitespace-nowrap">
                        {formatTs(query.createdAt)}
                      </TableCell>
                      <TableCell>
                        <SqlStatusBadge status={query.status} />
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-white/60 text-right tabular-nums">
                        {query.rowsReturned != null
                          ? query.rowsReturned.toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-right tabular-nums">
                        {query.executionMs != null ? (
                          <span
                            className={cn(
                              query.executionMs > 2000
                                ? "text-destructive"
                                : query.executionMs > 1000
                                ? "text-[color:var(--warning)]"
                                : "text-[color:var(--success)]"
                            )}
                          >
                            {query.executionMs.toLocaleString()}ms
                          </span>
                        ) : (
                          <span className="text-white/25">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ConfidenceBar score={query.confidenceScore} />
                      </TableCell>
                    </TableRow>,

                    isExpanded ? (
                      <TableRow key={`${query.id}-detail`} className="border-white/5">
                        <TableCell colSpan={8} className="bg-white/3 px-5 py-4">
                          <div className="space-y-4">
                            {/* Natural language question */}
                            <div>
                              <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-1">
                                Natural Language Question
                              </p>
                              <p className="text-sm text-white/70 leading-relaxed">
                                {query.naturalLanguageQuery}
                              </p>
                            </div>

                            {/* Generated SQL */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest">
                                  Generated SQL
                                </p>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-mono text-white/28">
                                    Tables: {query.tablesReferenced.join(", ")}
                                  </span>
                                  {query.status === "generated" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-[10px] border-primary/25 bg-primary/10 text-primary hover:bg-primary/20 font-mono"
                                    >
                                      <Play className="w-2.5 h-2.5 mr-1" />
                                      Execute
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="bg-black/40 rounded-md border border-white/8 px-4 py-3">
                                <SqlBlock sql={query.generatedSql} />
                              </div>
                            </div>

                            {/* Error from DB */}
                            {query.dbErrorMessage && (
                              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/8 border border-destructive/20">
                                <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[10px] font-mono text-destructive/70 uppercase tracking-widest mb-1">
                                    PostgreSQL Error
                                  </p>
                                  <pre className="text-[11px] font-mono text-destructive/80 whitespace-pre-wrap leading-relaxed">
                                    {query.dbErrorMessage}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Execution result */}
                            {query.status === "executed" && (
                              <div className="flex items-center gap-4 text-[11px] font-mono text-[color:var(--success)]/70">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  Executed successfully
                                </div>
                                {query.rowsReturned != null && (
                                  <div className="flex items-center gap-1.5 text-white/40">
                                    <Rows3 className="w-3.5 h-3.5 shrink-0" />
                                    {query.rowsReturned.toLocaleString()} rows returned
                                  </div>
                                )}
                                {query.executionMs != null && (
                                  <div className="flex items-center gap-1.5 text-white/40">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    {query.executionMs.toLocaleString()}ms
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Parent request */}
                            <div className="pt-1 border-t border-white/6 flex items-center gap-3 flex-wrap">
                              <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                                Parent Request:
                              </span>
                              <span className="font-mono text-[11px] text-primary/55">
                                {query.requestId}
                              </span>
                              <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                                Confidence:
                              </span>
                              <span className="font-mono text-[11px] text-white/55">
                                {(query.confidenceScore * 100).toFixed(0)}%
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
        Click any row to view the generated SQL with syntax highlighting and full PostgreSQL error messages.
        Rows with &ldquo;Generated&rdquo; status have not been executed yet.
      </p>
    </div>
  );
}
