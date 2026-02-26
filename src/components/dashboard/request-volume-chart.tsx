"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
  success: number;
  cached: number;
  errors: number;
}

function buildChartPoints(data: DailyMetrics[]): ChartPoint[] {
  return data.map((d) => {
    const cached = Math.round(d.requests * (d.cacheHitRate / 100));
    const errors = d.errors;
    const success = Math.max(0, d.requests - cached - errors);
    return {
      date: d.date.slice(5), // "MM-DD"
      success,
      cached,
      errors,
    };
  });
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  const total = (payload as { value: number }[]).reduce((acc, p) => acc + (p.value as number), 0);
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
            {(entry.value as number).toLocaleString()}
          </span>
        </p>
      ))}
      <p style={{ fontFamily: "var(--font-geist-mono)", color: "oklch(0.93 0 0)", marginTop: "0.375rem", borderTop: "1px solid oklch(1 0 0 / 0.08)", paddingTop: "0.375rem", fontSize: "0.7rem" }}>
        Total: {total.toLocaleString()}
      </p>
    </div>
  );
};

interface Props {
  data: DailyMetrics[];
}

export function RequestVolumeChart({ data }: Props) {
  const points = buildChartPoints(data);

  // Thin out labels for readability
  const tickInterval = Math.max(1, Math.floor(points.length / 8));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.30} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillCached" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.30} />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillErrors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.40} />
            <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          width={32}
        />
        <Tooltip content={(props) => <CustomTooltip {...props} />} />
        <Legend
          iconType="circle"
          iconSize={6}
          wrapperStyle={{ fontSize: "0.7rem", paddingTop: "0.5rem", color: "oklch(0.60 0 0)" }}
        />
        <Area
          type="monotone"
          dataKey="success"
          name="Success"
          stackId="1"
          stroke="var(--chart-1)"
          strokeWidth={1.5}
          fill="url(#fillSuccess)"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="cached"
          name="Cached"
          stackId="1"
          stroke="var(--chart-2)"
          strokeWidth={1.5}
          fill="url(#fillCached)"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="errors"
          name="Errors"
          stackId="1"
          stroke="var(--destructive)"
          strokeWidth={1.5}
          fill="url(#fillErrors)"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
