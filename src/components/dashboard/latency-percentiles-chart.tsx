"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import type { DailyMetrics } from "@/lib/types";

interface ChartPoint {
  date: string;
  p50: number;
  p95: number;
  p99: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "oklch(0.13 0.02 265)",
        border: "1px solid oklch(1 0 0 / 0.12)",
        borderRadius: "0.5rem",
        padding: "0.625rem 0.75rem",
        fontSize: "0.75rem",
        boxShadow: "0 4px 16px oklch(0 0 0 / 0.40)",
      }}
    >
      <p style={{ fontFamily: "var(--font-geist-mono)", color: "oklch(0.93 0 0)", marginBottom: "0.375rem", fontWeight: 600 }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: "oklch(0.60 0 0)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.125rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "50%",
              background: entry.color as string,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "oklch(0.75 0 0)" }}>{entry.name}:</span>
          <span style={{ fontFamily: "var(--font-geist-mono)", color: "oklch(0.93 0 0)", fontWeight: 600 }}>
            {(entry.value as number).toLocaleString()}ms
          </span>
        </p>
      ))}
    </div>
  );
};

interface Props {
  data: DailyMetrics[];
}

export function LatencyPercentilesChart({ data }: Props) {
  const points: ChartPoint[] = data.map((d) => ({
    date: d.date.slice(5),
    p50: d.p50Ms,
    p95: d.p95Ms,
    p99: d.p99Ms,
  }));

  const tickInterval = Math.max(1, Math.floor(points.length / 6));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid
          strokeDasharray="2 4"
          stroke="oklch(1 0 0 / 0.06)"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "oklch(0.55 0 0)", fontFamily: "var(--font-geist-mono)" }}
          axisLine={false}
          tickLine={false}
          interval={tickInterval}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "oklch(0.55 0 0)", fontFamily: "var(--font-geist-mono)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}ms`}
          width={44}
        />
        <Tooltip content={(props) => <CustomTooltip {...props} />} />
        <Legend
          iconType="plainline"
          iconSize={12}
          wrapperStyle={{ fontSize: "0.7rem", paddingTop: "0.5rem", color: "oklch(0.60 0 0)" }}
        />
        <Line
          type="monotone"
          dataKey="p50"
          name="p50"
          stroke="var(--chart-5)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="p95"
          name="p95"
          stroke="var(--chart-4)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="p99"
          name="p99"
          stroke="var(--destructive)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
          strokeDasharray="3 2"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
