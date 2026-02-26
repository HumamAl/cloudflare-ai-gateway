"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { traces } from "@/data/mock-data";
import type { PipelineStageType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  SkipForward,
  Clock,
  Zap,
  Database,
  Layers,
  GitBranch,
  Cpu,
  Search,
  SortAsc,
  AlertTriangle,
} from "lucide-react";

// ── Pipeline stage definitions (canonical RAG order) ─────────────────────────

interface PipelineStageConfig {
  id: PipelineStageType;
  label: string;
  description: string;
  icon: React.ReactNode;
  model?: string;
  accentColor: string;
}

const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id:          "cache_lookup",
    label:       "Cache Lookup",
    description: "Check gateway semantic cache before invoking models",
    icon:        <Zap className="w-4 h-4" />,
    accentColor: "oklch(0.65 0.18 45)",   // amber
  },
  {
    id:          "embed",
    label:       "Embed",
    description: "Vectorize query with BGE Base embedding model",
    icon:        <Layers className="w-4 h-4" />,
    model:       "@cf/baai/bge-base-en-v1.5",
    accentColor: "oklch(0.60 0.22 265)",   // indigo primary
  },
  {
    id:          "retrieve",
    label:       "Retrieve",
    description: "ANN search against Vectorize index for top-k chunks",
    icon:        <Search className="w-4 h-4" />,
    accentColor: "oklch(0.62 0.18 200)",   // teal
  },
  {
    id:          "rerank",
    label:       "Rerank",
    description: "Cross-encoder reranking with BGE Reranker Base",
    icon:        <SortAsc className="w-4 h-4" />,
    model:       "@cf/baai/bge-reranker-base",
    accentColor: "oklch(0.55 0.20 290)",   // violet
  },
  {
    id:          "generate",
    label:       "Generate",
    description: "LLM generation with retrieved context injected",
    icon:        <Cpu className="w-4 h-4" />,
    model:       "@cf/meta/llama-3-8b-instruct",
    accentColor: "oklch(0.62 0.19 145)",   // green
  },
];

const EXTRA_STAGES: PipelineStageConfig[] = [
  {
    id:          "tool_dispatch",
    label:       "Tool Dispatch",
    description: "MCP server tool invocation via function calling",
    icon:        <GitBranch className="w-4 h-4" />,
    accentColor: "oklch(0.70 0.18 45)",
  },
  {
    id:          "sql_parse",
    label:       "SQL Parse",
    description: "Text-to-SQL generation and schema injection",
    icon:        <Database className="w-4 h-4" />,
    accentColor: "oklch(0.60 0.22 265)",
  },
];

// ── Compute per-stage metrics from traces data ────────────────────────────────

interface StageMetrics {
  stageId: PipelineStageType;
  avgLatencyMs:   number;
  maxLatencyMs:   number;
  minLatencyMs:   number;
  errorRate:      number;
  skipRate:       number;
  totalInvocations: number;
  totalErrors:    number;
  totalSkipped:   number;
  p95LatencyMs:   number;
}

function computeStageMetrics(): Map<PipelineStageType, StageMetrics> {
  const buckets = new Map<PipelineStageType, {
    durations: number[];
    errors: number;
    skipped: number;
    total: number;
  }>();

  for (const trace of traces) {
    for (const stage of trace.stages) {
      const b = buckets.get(stage.stage) ?? { durations: [], errors: 0, skipped: 0, total: 0 };
      b.total++;
      if (stage.status === "error")   b.errors++;
      if (stage.status === "skipped") b.skipped++;
      if (stage.durationMs > 0)       b.durations.push(stage.durationMs);
      buckets.set(stage.stage, b);
    }
  }

  const result = new Map<PipelineStageType, StageMetrics>();
  for (const [stageId, b] of buckets) {
    const sorted = [...b.durations].sort((a, c) => a - c);
    const avg    = sorted.length > 0 ? sorted.reduce((s, v) => s + v, 0) / sorted.length : 0;
    const p95Idx = Math.floor(sorted.length * 0.95);
    result.set(stageId, {
      stageId,
      avgLatencyMs:     Math.round(avg),
      maxLatencyMs:     sorted.at(-1) ?? 0,
      minLatencyMs:     sorted[0] ?? 0,
      errorRate:        b.total > 0 ? b.errors / b.total : 0,
      skipRate:         b.total > 0 ? b.skipped / b.total : 0,
      totalInvocations: b.total,
      totalErrors:      b.errors,
      totalSkipped:     b.skipped,
      p95LatencyMs:     sorted[p95Idx] ?? sorted.at(-1) ?? 0,
    });
  }
  return result;
}

const stageMetrics = computeStageMetrics();

// Total pipeline latency for bar proportions
const maxAvgLatency = Math.max(
  ...[...PIPELINE_STAGES, ...EXTRA_STAGES].map(
    (s) => stageMetrics.get(s.id)?.avgLatencyMs ?? 0
  )
);

// ── Stage metric card ─────────────────────────────────────────────────────────

function StageCard({
  stage,
  metrics,
  isSelected,
  onClick,
}: {
  stage: PipelineStageConfig;
  metrics: StageMetrics | undefined;
  isSelected: boolean;
  onClick: () => void;
}) {
  const errorPct     = metrics ? (metrics.errorRate * 100).toFixed(1) : "0.0";
  const barWidth     = metrics && maxAvgLatency > 0
    ? Math.max(4, (metrics.avgLatencyMs / maxAvgLatency) * 100)
    : 4;
  const hasErrors    = (metrics?.totalErrors ?? 0) > 0;
  const allSkipped   = metrics ? metrics.skipRate === 1 : false;

  return (
    <div
      onClick={onClick}
      className={cn(
        "dark-card cursor-pointer p-3 transition-all duration-[60ms] select-none",
        isSelected
          ? "border-primary/40 bg-primary/8"
          : "hover:border-white/15"
      )}
      style={{
        borderColor: isSelected ? `${stage.accentColor}55` : undefined,
      }}
    >
      {/* Icon + label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{
              background: `${stage.accentColor}18`,
              color: stage.accentColor,
              border: `1px solid ${stage.accentColor}28`,
            }}
          >
            {stage.icon}
          </div>
          <span className="text-sm font-medium text-white/85">
            {stage.label}
          </span>
        </div>
        {hasErrors && !allSkipped && (
          <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--warning)]" />
        )}
      </div>

      {/* Latency bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-[60ms]"
          style={{
            width: `${barWidth}%`,
            background: stage.accentColor,
            opacity: allSkipped ? 0.2 : 0.7,
          }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-1 text-[10px]">
        <div>
          <p className="text-white/25 font-mono uppercase tracking-wide text-[9px]">Avg</p>
          <p className="font-mono text-white/70 tabular-nums">
            {metrics ? `${metrics.avgLatencyMs}ms` : "—"}
          </p>
        </div>
        <div>
          <p className="text-white/25 font-mono uppercase tracking-wide text-[9px]">p95</p>
          <p className="font-mono text-white/70 tabular-nums">
            {metrics ? `${metrics.p95LatencyMs}ms` : "—"}
          </p>
        </div>
        <div>
          <p className="text-white/25 font-mono uppercase tracking-wide text-[9px]">Err%</p>
          <p
            className={cn(
              "font-mono tabular-nums",
              hasErrors ? "text-[color:var(--warning)]" : "text-[color:var(--success)]"
            )}
          >
            {errorPct}%
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function StageDetailPanel({
  stage,
  metrics,
}: {
  stage: PipelineStageConfig;
  metrics: StageMetrics | undefined;
}) {
  if (!metrics) {
    return (
      <Card className="dark-card p-4">
        <p className="text-xs text-white/30 font-mono">
          No execution data for this stage in the current trace window.
        </p>
      </Card>
    );
  }

  const successCount = metrics.totalInvocations - metrics.totalErrors - metrics.totalSkipped;
  const successRate  = metrics.totalInvocations > 0
    ? ((successCount / metrics.totalInvocations) * 100).toFixed(1)
    : "0.0";

  const detailStats = [
    { label: "Total Invocations",   value: metrics.totalInvocations.toString(),  accent: false },
    { label: "Successful",          value: successCount.toString(),               accent: false },
    { label: "Errors",              value: metrics.totalErrors.toString(),        accent: metrics.totalErrors > 0 },
    { label: "Skipped (cache hit)", value: metrics.totalSkipped.toString(),       accent: false },
    { label: "Success Rate",        value: `${successRate}%`,                     accent: false },
    { label: "Avg Latency",         value: `${metrics.avgLatencyMs}ms`,           accent: false },
    { label: "p95 Latency",         value: `${metrics.p95LatencyMs}ms`,           accent: false },
    { label: "Max Latency",         value: `${metrics.maxLatencyMs}ms`,           accent: metrics.maxLatencyMs > 2000 },
  ];

  return (
    <Card className="dark-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `${stage.accentColor}18`,
              color: stage.accentColor,
              border: `1px solid ${stage.accentColor}30`,
            }}
          >
            {stage.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90">
              {stage.label}
            </h3>
            <p className="text-[11px] text-white/35 font-mono">
              {stage.description}
            </p>
          </div>
        </div>
        {metrics.totalErrors > 0 ? (
          <Badge
            variant="outline"
            className="text-[10px] border-[color:var(--warning)]/30 text-[color:var(--warning)] bg-[color:var(--warning)]/8"
          >
            {metrics.totalErrors} error{metrics.totalErrors !== 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] border-[color:var(--success)]/30 text-[color:var(--success)] bg-[color:var(--success)]/8"
          >
            Healthy
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Model info */}
        {stage.model && (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-white/4 border border-white/8">
            <Cpu className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            <div>
              <p className="text-[10px] text-white/25 font-mono uppercase tracking-widest">
                Model
              </p>
              <p className="text-[11px] font-mono text-white/70">
                {stage.model}
              </p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {detailStats.map((stat) => (
            <div
              key={stat.label}
              className="p-2.5 rounded-md bg-white/3 border border-white/6"
            >
              <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-0.5">
                {stat.label}
              </p>
              <p
                className={cn(
                  "font-mono text-sm tabular-nums",
                  stat.accent
                    ? "text-[color:var(--warning)]"
                    : "text-white/75"
                )}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Latency distribution bar */}
        <div>
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">
            Latency Distribution (sample window)
          </p>
          <div className="space-y-1.5">
            {[
              { label: "Min",     value: metrics.minLatencyMs,   max: metrics.maxLatencyMs },
              { label: "Avg",     value: metrics.avgLatencyMs,   max: metrics.maxLatencyMs },
              { label: "p95",     value: metrics.p95LatencyMs,   max: metrics.maxLatencyMs },
              { label: "Max",     value: metrics.maxLatencyMs,   max: metrics.maxLatencyMs },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-[10px]">
                <span className="font-mono text-white/30 w-8 shrink-0">{row.label}</span>
                <div className="flex-1 h-3 bg-white/5 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${row.max > 0 ? Math.max(2, (row.value / row.max) * 100) : 2}%`,
                      background: stage.accentColor,
                      opacity: 0.65,
                    }}
                  />
                </div>
                <span className="font-mono text-white/55 w-14 text-right tabular-nums">
                  {row.value}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [selectedStage, setSelectedStage] = useState<PipelineStageType>("generate");
  const [viewMode, setViewMode] = useState<"rag" | "extended">("rag");

  const activeStages = viewMode === "rag" ? PIPELINE_STAGES : [...PIPELINE_STAGES, ...EXTRA_STAGES];
  const selectedConfig = [...PIPELINE_STAGES, ...EXTRA_STAGES].find(
    (s) => s.id === selectedStage
  );

  // Summary stats
  const totalTraces = traces.length;
  const cacheHitTraces = traces.filter((t) =>
    t.stages.some((s) => s.stage === "cache_lookup" && s.cached)
  ).length;
  const avgTotalLatency = Math.round(
    traces.reduce((sum, t) => sum + t.totalMs, 0) / traces.length
  );
  const errorTraces = traces.filter((t) =>
    t.stages.some((s) => s.status === "error")
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white/90">
            RAG Pipeline
          </h1>
          <p className="text-xs text-white/35 mt-0.5 font-mono">
            Retrieval-augmented generation stage breakdown — avg latency, error rates, model assignments
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-md p-1 border border-white/8">
          <button
            onClick={() => setViewMode("rag")}
            className={cn(
              "text-xs px-3 py-1 rounded-sm font-mono transition-colors duration-[60ms]",
              viewMode === "rag"
                ? "bg-primary/15 text-primary border border-primary/25"
                : "text-white/40 hover:text-white/65"
            )}
          >
            Core RAG
          </button>
          <button
            onClick={() => setViewMode("extended")}
            className={cn(
              "text-xs px-3 py-1 rounded-sm font-mono transition-colors duration-[60ms]",
              viewMode === "extended"
                ? "bg-primary/15 text-primary border border-primary/25"
                : "text-white/40 hover:text-white/65"
            )}
          >
            + Extended
          </button>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Traces Sampled",   value: totalTraces.toString(),     sub: "in window",            accent: false },
          { label: "Cache Hit Rate",   value: `${Math.round((cacheHitTraces / totalTraces) * 100)}%`, sub: `${cacheHitTraces} hits`, accent: false },
          { label: "Avg Total Latency",value: `${avgTotalLatency}ms`,      sub: "end-to-end",           accent: avgTotalLatency > 1500 },
          { label: "Traces w/ Errors", value: errorTraces.toString(),      sub: `${Math.round((errorTraces / totalTraces) * 100)}% error rate`, accent: errorTraces > 0 },
        ].map((card) => (
          <Card key={card.label} className="dark-card p-3">
            <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-1">
              {card.label}
            </p>
            <p
              className={cn(
                "text-2xl font-mono font-semibold tabular-nums",
                card.accent ? "text-[color:var(--warning)]" : "text-white/90"
              )}
            >
              {card.value}
            </p>
            <p className="text-[10px] text-white/30 font-mono mt-0.5">{card.sub}</p>
          </Card>
        ))}
      </div>

      {/* Pipeline flow diagram */}
      <Card className="dark-card p-4">
        <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-3">
          Pipeline Flow — click a stage to inspect
        </p>
        <div className="flex items-stretch gap-0 flex-wrap">
          {activeStages.map((stage, idx) => {
            const metrics = stageMetrics.get(stage.id);
            const isSelected = selectedStage === stage.id;
            const isLast = idx === activeStages.length - 1;

            return (
              <div key={stage.id} className="flex items-center gap-0">
                <div
                  className="min-w-[7.5rem]"
                  style={{ flex: "0 0 auto" }}
                >
                  <StageCard
                    stage={stage}
                    metrics={metrics}
                    isSelected={isSelected}
                    onClick={() => setSelectedStage(stage.id)}
                  />
                </div>
                {!isLast && (
                  <ArrowRight className="w-4 h-4 text-white/20 shrink-0 mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected stage detail */}
      {selectedConfig && (
        <StageDetailPanel
          stage={selectedConfig}
          metrics={stageMetrics.get(selectedStage)}
        />
      )}

      {/* Stage-by-stage latency comparison bar chart */}
      <Card className="dark-card p-4">
        <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-3">
          Avg Latency by Stage (ms)
        </p>
        <div className="space-y-2">
          {activeStages.map((stage) => {
            const m = stageMetrics.get(stage.id);
            const avg = m?.avgLatencyMs ?? 0;
            const barPct = maxAvgLatency > 0 ? Math.max(1, (avg / maxAvgLatency) * 100) : 1;
            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors duration-[60ms] cursor-pointer",
                  selectedStage === stage.id ? "bg-white/5" : "hover:bg-white/3"
                )}
                onClick={() => setSelectedStage(stage.id)}
              >
                <span className="font-mono text-[11px] text-white/45 w-28 shrink-0">
                  {stage.label}
                </span>
                <div className="flex-1 h-4 bg-white/5 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all duration-[60ms]"
                    style={{
                      width: `${barPct}%`,
                      background: stage.accentColor,
                      opacity: 0.65,
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] text-white/65 w-14 text-right tabular-nums shrink-0">
                  {avg > 0 ? `${avg}ms` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
