"use client";

import { useState } from "react";
import { X, Check, ToggleLeft, ToggleRight } from "lucide-react";

const beforeItems = [
  "Analyst opens database GUI, recalls table name from memory",
  "Writes raw SQL referencing tbl_ws_pipeline_run — often wrong on first try",
  "Runs query, gets schema_mismatch or empty result, debugs JOIN",
  "~2-4 hours per non-trivial analytical question",
  "Knowledge locked to the one analyst who knows the schema",
  "No audit trail — query disappears when the tab closes",
];

const afterItems = [
  "Analyst types: \"Failed pipelines in production last week, grouped by environment\"",
  "text-to-sql-agent route injects schema-metadata index context into the prompt",
  "Generated SQL references correct tables and FK relationships — confidence score ≥0.87",
  "Query executes in <60 seconds including schema retrieval and LLM generation",
  "Any team member can run analytical questions without SQL knowledge",
  "SqlQuery record stored with naturalLanguageQuery + generatedSql for audit",
];

export function VizTextToSql() {
  const [view, setView] = useState<"before" | "after">("before");

  return (
    <div className="space-y-3">
      {/* Toggle header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
          {view === "before" ? "Without schema grounding" : "With schema-grounded agent route"}
        </p>
        <button
          onClick={() => setView(view === "before" ? "after" : "before")}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-100"
          style={
            view === "after"
              ? {
                  background: "color-mix(in oklch, var(--success) 12%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--success) 25%, transparent)",
                  color: "var(--success)",
                }
              : {
                  background: "color-mix(in oklch, var(--destructive) 12%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
                  color: "oklch(0.80 0 0)",
                }
          }
        >
          {view === "before" ? (
            <ToggleLeft className="h-3.5 w-3.5" />
          ) : (
            <ToggleRight className="h-3.5 w-3.5" />
          )}
          {view === "before" ? "Show the solution" : "Show the problem"}
        </button>
      </div>

      {/* Panel */}
      <div
        className="rounded-md p-4 space-y-2"
        style={
          view === "before"
            ? {
                background: "color-mix(in oklch, var(--destructive) 6%, transparent)",
                border: "1px solid color-mix(in oklch, var(--destructive) 18%, transparent)",
              }
            : {
                background: "color-mix(in oklch, var(--success) 6%, transparent)",
                border: "1px solid color-mix(in oklch, var(--success) 18%, transparent)",
              }
        }
      >
        {(view === "before" ? beforeItems : afterItems).map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {view === "before" ? (
              <X
                className="h-3.5 w-3.5 mt-0.5 shrink-0"
                style={{ color: "oklch(0.65 0.20 27)" }}
              />
            ) : (
              <Check
                className="h-3.5 w-3.5 mt-0.5 shrink-0"
                style={{ color: "var(--success)" }}
              />
            )}
            <p className="text-xs leading-relaxed text-foreground/80">{item}</p>
          </div>
        ))}
      </div>

      {/* Accuracy metric bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
            Text-to-SQL accuracy on proprietary schema
          </span>
          <span
            className="text-[10px] font-mono font-semibold"
            style={{ color: view === "after" ? "var(--success)" : "oklch(0.65 0.20 27)" }}
          >
            {view === "before" ? "~62%" : "~91%"}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "oklch(0.20 0.02 265)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: view === "before" ? "62%" : "91%",
              background:
                view === "after"
                  ? "var(--success)"
                  : "oklch(0.65 0.20 27)",
            }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground/60">
          Measured against 50 analyst queries on the SaaS schema. Schema-grounded route uses{" "}
          <span className="font-mono">schema-metadata</span> Vectorize index with 2,847 vectors.
        </p>
      </div>
    </div>
  );
}
