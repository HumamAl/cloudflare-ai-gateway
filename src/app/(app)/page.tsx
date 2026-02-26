"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { APP_CONFIG } from "@/lib/config";
import { gatewayStats, dailyMetrics, requests } from "@/data/mock-data";
import type { Request } from "@/lib/types";

// ── Dynamic chart imports (SSR disabled — Recharts requires browser APIs) ──
const RequestVolumeChart = dynamic(
  () =>
    import("@/components/dashboard/request-volume-chart").then(
      (m) => m.RequestVolumeChart
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-pulse rounded-lg"
        style={{ height: "260px", background: "oklch(1 0 0 / 0.04)" }}
      />
    ),
  }
);

const LatencyPercentilesChart = dynamic(
  () =>
    import("@/components/dashboard/latency-percentiles-chart").then(
      (m) => m.LatencyPercentilesChart
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-pulse rounded-lg"
        style={{ height: "220px", background: "oklch(1 0 0 / 0.04)" }}
      />
    ),
  }
);

// ── Animated count-up hook ────────────────────────────────────────────────
function useCountUp(target: number, duration: number = 1100) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Number formatting helpers ─────────────────────────────────────────────
function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function formatRequests(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function latencyColor(ms: number): string {
  if (ms < 800) return "var(--success)";
  if (ms <= 2000) return "var(--warning)";
  return "var(--destructive)";
}

// ── Period filter ─────────────────────────────────────────────────────────
type Period = "7d" | "30d" | "90d";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

// ── Request status badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: Request["status"] }) {
  const cfg: Record<Request["status"], { label: string; bg: string; color: string }> = {
    success: { label: "success", bg: "oklch(0.62 0.19 145 / 0.15)", color: "var(--success)" },
    cached: { label: "cached", bg: "oklch(0.62 0.18 200 / 0.15)", color: "var(--chart-2)" },
    error: { label: "error", bg: "oklch(0.577 0.245 27 / 0.18)", color: "var(--destructive)" },
    rate_limited: { label: "rate limited", bg: "oklch(0.75 0.18 85 / 0.18)", color: "var(--warning)" },
    timeout: { label: "timeout", bg: "oklch(0.577 0.245 27 / 0.15)", color: "var(--destructive)" },
    model_unavailable: { label: "unavailable", bg: "oklch(0.577 0.245 27 / 0.15)", color: "var(--destructive)" },
  };
  const { label, bg, color } = cfg[status];
  return (
    <span
      style={{
        background: bg,
        color,
        fontFamily: "var(--font-geist-mono)",
        fontSize: "0.625rem",
        fontWeight: 500,
        padding: "0.125rem 0.4rem",
        borderRadius: "0.3rem",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ── Cache disposition label ───────────────────────────────────────────────
function CacheBadge({ status }: { status: Request["cacheStatus"] }) {
  const cfg = {
    hit: { label: "HIT", color: "var(--chart-2)" },
    miss: { label: "MISS", color: "oklch(0.45 0 0)" },
    bypass: { label: "BYPASS", color: "var(--warning)" },
  };
  const { label, color } = cfg[status];
  return (
    <span
      style={{
        color,
        fontFamily: "var(--font-geist-mono)",
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </span>
  );
}

// ── Timestamp formatter ───────────────────────────────────────────────────
function shortTs(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mn = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mn}:${ss}`;
}

// ── Route ID to slug ──────────────────────────────────────────────────────
function routeLabel(routeId: string): string {
  const map: Record<string, string> = {
    rte_a4m9x: "prod-workers-ai",
    rte_b7p2k: "fallback-gpt4o",
    rte_c1n7z: "embeddings-bge",
    rte_d3q8w: "text-to-sql",
    rte_e9f4r: "semantic-search",
    rte_f2t6m: "mcp-dispatcher",
  };
  return map[routeId] ?? routeId;
}

// ── Model display ─────────────────────────────────────────────────────────
function shortModel(model: string): string {
  if (model.includes("llama-3-8b")) return "llama-3-8b";
  if (model.includes("mistral-7b")) return "mistral-7b";
  if (model.includes("gpt-4o-mini")) return "gpt-4o-mini";
  return model.split("/").pop() ?? model;
}

// ── Stat card ─────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  rawValue: number;
  formatter: (n: number) => string;
  delta?: number;
  deltaLabel?: string;
  index: number;
  valueColor?: string;
}

function StatCard({ title, rawValue, formatter, delta, deltaLabel, index, valueColor }: StatCardProps) {
  const { count, ref } = useCountUp(rawValue, 1100);

  const deltaPositive = delta !== undefined && delta > 0;
  const deltaNegative = delta !== undefined && delta < 0;

  return (
    <div
      ref={ref}
      className="dark-card animate-fade-up-in"
      style={{
        padding: "0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        animationDelay: `${index * 50}ms`,
        animationDuration: "150ms",
      }}
    >
      <span
        style={{
          fontSize: "0.6rem",
          fontWeight: 500,
          color: "oklch(0.48 0 0)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      <span
        className="metric-value"
        style={{
          fontSize: "1.4rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: valueColor ?? "oklch(0.93 0 0)",
        }}
      >
        {formatter(count)}
      </span>
      {delta !== undefined && (
        <span style={{ fontSize: "0.6rem", display: "flex", gap: "0.25rem", alignItems: "center", marginTop: "0.1rem" }}>
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontWeight: 600,
              color: deltaPositive
                ? "var(--success)"
                : deltaNegative
                ? "var(--destructive)"
                : "oklch(0.55 0 0)",
            }}
          >
            {deltaPositive ? "+" : ""}{delta.toFixed(1)}%
          </span>
          {deltaLabel && (
            <span style={{ color: "oklch(0.45 0 0)" }}>{deltaLabel}</span>
          )}
        </span>
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("30d");

  // Period-filtered data for the request volume chart
  const chartData = useMemo(() => {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    return dailyMetrics.slice(-days);
  }, [period]);

  // Last 30 days for latency percentiles (always fixed)
  const latencyData = useMemo(() => dailyMetrics.slice(-30), []);

  // Last 15 requests for the trace log
  const recentRequests = useMemo(() => requests.slice(0, 15), []);

  const displayName = APP_CONFIG.clientName ?? APP_CONFIG.projectName;
  const stats = gatewayStats;

  return (
    <div
      className="page-container"
      style={{ display: "flex", flexDirection: "column", gap: "var(--section-gap, 1rem)" }}
    >
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div>
        <h1
          className="aesthetic-heading"
          style={{ fontSize: "1.1rem", margin: 0, color: "oklch(0.93 0 0)" }}
        >
          Gateway Monitor
        </h1>
        <p
          style={{
            fontSize: "0.65rem",
            color: "oklch(0.45 0 0)",
            marginTop: "0.2rem",
            fontFamily: "var(--font-geist-mono)",
          }}
        >
          Cloudflare AI Gateway · 24h window ·{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ── Stat Cards (6) ──────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
          gap: "var(--grid-gap, 0.75rem)",
        }}
      >
        <StatCard
          index={0}
          title="Total Requests"
          rawValue={stats.totalRequests}
          formatter={formatRequests}
          delta={stats.requestsChange}
          deltaLabel="vs prior 24h"
        />
        <StatCard
          index={1}
          title="Cache Hit Rate"
          rawValue={Math.round(stats.cacheHitRate * 10)}
          formatter={(n) => `${(n / 10).toFixed(1)}%`}
          delta={stats.cacheHitRateChange}
          deltaLabel="vs prior 24h"
          valueColor="var(--chart-2)"
        />
        <StatCard
          index={2}
          title="P95 Latency"
          rawValue={stats.p95LatencyMs}
          formatter={(n) => `${n.toLocaleString()}ms`}
          delta={stats.p95LatencyChange}
          deltaLabel="vs prior 24h"
          valueColor={latencyColor(stats.p95LatencyMs)}
        />
        <StatCard
          index={3}
          title="Token Usage"
          rawValue={stats.totalTokens}
          formatter={formatTokens}
          delta={stats.tokensChange}
          deltaLabel="vs prior 24h"
        />
        <StatCard
          index={4}
          title="Error Rate"
          rawValue={Math.round(stats.errorRate * 10)}
          formatter={(n) => `${(n / 10).toFixed(1)}%`}
          delta={stats.errorRateChange}
          deltaLabel="vs prior 24h"
          valueColor={
            stats.errorRate < 2
              ? "var(--success)"
              : stats.errorRate < 5
              ? "var(--warning)"
              : "var(--destructive)"
          }
        />
        <StatCard
          index={5}
          title="Est. Cost (24h)"
          rawValue={Math.round(stats.totalCostUsd * 100)}
          formatter={(n) => `$${(n / 100).toFixed(2)}`}
          delta={stats.costChange}
          deltaLabel="vs prior 24h"
          valueColor="var(--chart-4)"
        />
      </div>

      {/* ── Primary Chart: Request Volume ────────────────────────────── */}
      <div className="dark-card" style={{ padding: 0 }}>
        {/* Header + filter toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            padding: "0.8rem 1rem 0.6rem",
            borderBottom: "1px solid oklch(1 0 0 / 0.06)",
          }}
        >
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "oklch(0.88 0 0)", margin: 0 }}>
              Request Volume
            </p>
            <p
              style={{
                fontSize: "0.6rem",
                color: "oklch(0.48 0 0)",
                margin: "0.1rem 0 0",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              Stacked: Success · Cached · Errors
            </p>
          </div>
          {/* Working filter — changes chartData via period state */}
          <div style={{ display: "flex", gap: "0.375rem" }}>
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "0.2rem 0.55rem",
                  fontSize: "0.625rem",
                  fontFamily: "var(--font-geist-mono)",
                  borderRadius: "0.375rem",
                  border: `1px solid ${
                    period === p ? "oklch(0.60 0.22 265 / 0.60)" : "oklch(1 0 0 / 0.12)"
                  }`,
                  background: period === p ? "oklch(0.60 0.22 265 / 0.18)" : "transparent",
                  color: period === p ? "var(--primary)" : "oklch(0.50 0 0)",
                  cursor: "pointer",
                  transition: "all 60ms cubic-bezier(0.16, 1, 0.3, 1)",
                  letterSpacing: "0.03em",
                  fontWeight: period === p ? 600 : 400,
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "0.75rem 0.25rem 0.75rem 0" }}>
          <RequestVolumeChart data={chartData} />
        </div>
      </div>

      {/* ── Latency Percentiles Chart ────────────────────────────────── */}
      <div className="dark-card" style={{ padding: 0 }}>
        <div
          style={{
            padding: "0.8rem 1rem 0.6rem",
            borderBottom: "1px solid oklch(1 0 0 / 0.06)",
          }}
        >
          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "oklch(0.88 0 0)", margin: 0 }}>
            Latency Percentiles
          </p>
          <p
            style={{
              fontSize: "0.6rem",
              color: "oklch(0.48 0 0)",
              margin: "0.1rem 0 0",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            p50 · p95 · p99 — last 30 days, lines only
          </p>
        </div>
        <div style={{ padding: "0.75rem 0.25rem 0.75rem 0" }}>
          <LatencyPercentilesChart data={latencyData} />
        </div>
      </div>

      {/* ── Request Trace Log ────────────────────────────────────────── */}
      <div className="dark-card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Table header */}
        <div
          style={{
            padding: "0.8rem 1rem 0.6rem",
            borderBottom: "1px solid oklch(1 0 0 / 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "oklch(0.88 0 0)", margin: 0 }}>
              Request Trace Log
            </p>
            <p
              style={{
                fontSize: "0.6rem",
                color: "oklch(0.48 0 0)",
                margin: "0.1rem 0 0",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              Latest {recentRequests.length} requests through the AI Gateway pipeline
            </p>
          </div>
          {/* Live indicator */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.58rem",
              color: "var(--success)",
              fontFamily: "var(--font-geist-mono)",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            <span
              style={{
                width: "0.4rem",
                height: "0.4rem",
                borderRadius: "50%",
                background: "var(--success)",
                display: "inline-block",
                boxShadow: "0 0 6px var(--success)",
              }}
            />
            LIVE
          </span>
        </div>

        {/* Scrollable table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.68rem",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(1 0 0 / 0.06)", background: "oklch(1 0 0 / 0.02)" }}>
                {["Timestamp", "Route", "Model", "In Tokens", "Out Tokens", "Latency", "Cache", "Status"].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        padding: "0.45rem 0.625rem",
                        textAlign: col === "In Tokens" || col === "Out Tokens" || col === "Latency" ? "right" : "left",
                        color: "oklch(0.42 0 0)",
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        fontSize: "0.58rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req, i) => (
                <tr
                  key={req.id}
                  className="aesthetic-hover"
                  style={{
                    borderBottom: "1px solid oklch(1 0 0 / 0.03)",
                    background: i % 2 === 0 ? "transparent" : "oklch(1 0 0 / 0.015)",
                  }}
                >
                  <td style={{ padding: "0.4rem 0.625rem", color: "oklch(0.48 0 0)", whiteSpace: "nowrap" }}>
                    {shortTs(req.createdAt)}
                  </td>
                  <td style={{ padding: "0.4rem 0.625rem", color: "oklch(0.68 0 0)", whiteSpace: "nowrap" }}>
                    {routeLabel(req.routeId)}
                  </td>
                  <td style={{ padding: "0.4rem 0.625rem", color: "oklch(0.62 0 0)", whiteSpace: "nowrap" }}>
                    {shortModel(req.model)}
                  </td>
                  <td style={{ padding: "0.4rem 0.625rem", color: "oklch(0.72 0 0)", textAlign: "right" }}>
                    {req.inputTokens.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.4rem 0.625rem", color: "oklch(0.72 0 0)", textAlign: "right" }}>
                    {req.outputTokens.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.4rem 0.625rem", textAlign: "right", whiteSpace: "nowrap" }}>
                    <span style={{ color: latencyColor(req.latencyMs), fontWeight: 600 }}>
                      {req.latencyMs >= 1000
                        ? `${(req.latencyMs / 1000).toFixed(2)}s`
                        : `${req.latencyMs}ms`}
                    </span>
                  </td>
                  <td style={{ padding: "0.4rem 0.625rem", textAlign: "center" }}>
                    <CacheBadge status={req.cacheStatus} />
                  </td>
                  <td style={{ padding: "0.4rem 0.625rem" }}>
                    <StatusBadge status={req.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Proposal Banner ──────────────────────────────────────────── */}
      <div
        style={{
          background: "oklch(0.13 0.03 265)",
          border: "1px solid oklch(1 0 0 / 0.08)",
          borderLeft: "3px solid var(--primary)",
          borderRadius: "var(--radius)",
          padding: "0.875rem 1rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.06)",
        }}
      >
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "oklch(0.88 0 0)", margin: 0 }}>
            This is a live demo built for {displayName}
          </p>
          <p
            style={{
              fontSize: "0.6rem",
              color: "oklch(0.48 0 0)",
              margin: "0.25rem 0 0",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            Humam · Full-Stack Developer · Available now
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
          <a
            href="/challenges"
            style={{
              fontSize: "0.625rem",
              color: "oklch(0.50 0 0)",
              textDecoration: "none",
              fontFamily: "var(--font-geist-mono)",
              transition: "color 60ms",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.80 0 0)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.50 0 0)")}
          >
            My approach →
          </a>
          <a
            href="/proposal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.625rem",
              fontWeight: 600,
              background: "var(--primary)",
              color: "oklch(0.985 0 0)",
              padding: "0.35rem 0.75rem",
              borderRadius: "0.375rem",
              textDecoration: "none",
              fontFamily: "var(--font-geist-mono)",
              transition: "opacity 60ms",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
          >
            Work with me
          </a>
        </div>
      </div>

    </div>
  );
}
