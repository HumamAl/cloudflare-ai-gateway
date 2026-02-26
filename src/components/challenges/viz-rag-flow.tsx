"use client";

import { useState } from "react";
import { Search, Database, Cpu, Zap, ArrowRight, ChevronDown } from "lucide-react";

interface FlowStep {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  highlight: boolean;
  detail: string;
}

const steps: FlowStep[] = [
  {
    id: "query",
    label: "User Query",
    sublabel: "natural language",
    icon: Search,
    highlight: false,
    detail: "e.g. \"Show me failed pipelines in the prod environment last week\"",
  },
  {
    id: "embed",
    label: "BGE Embed",
    sublabel: "@cf/baai/bge-base-en-v1.5",
    icon: Zap,
    highlight: false,
    detail: "Query converted to a 768-dim vector for nearest-neighbor search",
  },
  {
    id: "vectorize",
    label: "Vectorize Search",
    sublabel: "saas-entities-v2 + schema-metadata",
    icon: Database,
    highlight: true,
    detail: "Top-k chunks retrieved: table names, FK relationships, SaaS entity vocabulary injected into context window",
  },
  {
    id: "generate",
    label: "LLM Generate",
    sublabel: "@cf/meta/llama-3-8b-instruct",
    icon: Cpu,
    highlight: false,
    detail: "Context-grounded prompt: entity IDs, field names, and schema constraints are pre-loaded before generation",
  },
];

export function VizRagFlow() {
  const [expandedStep, setExpandedStep] = useState<string | null>("vectorize");

  return (
    <div className="space-y-3">
      {/* Label */}
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
        RAG retrieval pipeline — per request
      </p>

      {/* Flow steps */}
      <div className="flex flex-col md:flex-row md:items-start gap-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isExpanded = expandedStep === step.id;

          return (
            <div key={step.id} className="flex md:flex-col items-center md:items-stretch gap-2 flex-1">
              {/* Arrow between steps (horizontal on desktop, vertical arrow handled by layout gap) */}
              {i > 0 && (
                <div className="shrink-0 flex items-center justify-center md:justify-start md:pl-1 md:mb-1">
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 md:hidden" />
                  <div
                    className="hidden md:block h-px w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, oklch(0.25 0.02 265), transparent)",
                    }}
                  />
                </div>
              )}

              {/* Step card */}
              <button
                onClick={() =>
                  setExpandedStep(isExpanded ? null : step.id)
                }
                className="text-left flex-1 rounded-md px-3 py-2.5 transition-all duration-100 group"
                style={
                  step.highlight
                    ? {
                        background: "color-mix(in oklch, var(--primary) 12%, transparent)",
                        border: "1px solid color-mix(in oklch, var(--primary) 30%, transparent)",
                        boxShadow: "0 0 8px oklch(0.60 0.22 265 / 0.12)",
                      }
                    : {
                        background: "oklch(0.13 0.02 265)",
                        border: "1px solid oklch(1 0 0 / 0.08)",
                      }
                }
              >
                <div className="flex items-center gap-2 md:flex-col md:items-start md:gap-1.5">
                  <Icon
                    className="h-3.5 w-3.5 shrink-0"
                    style={{
                      color: step.highlight
                        ? "var(--primary)"
                        : "oklch(0.60 0 0)",
                    }}
                  />
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold leading-tight"
                      style={{
                        color: step.highlight
                          ? "var(--primary)"
                          : "oklch(0.90 0 0)",
                      }}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground/70 leading-tight mt-0.5 truncate">
                      {step.sublabel}
                    </p>
                  </div>
                  <ChevronDown
                    className="h-3 w-3 ml-auto shrink-0 text-muted-foreground/40 transition-transform duration-100"
                    style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 pt-2 border-t border-white/8">
                    {step.detail}
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Highlight callout */}
      <div
        className="flex items-start gap-2 rounded-md px-3 py-2"
        style={{
          background: "oklch(0.08 0.02 265)",
          border: "1px solid oklch(1 0 0 / 0.06)",
        }}
      >
        <span className="font-mono text-[10px] text-primary/60 uppercase tracking-widest shrink-0 mt-0.5">
          KEY
        </span>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          The Vectorize retrieval step is what separates this from a naive LLM call.
          Schema context arrives in the prompt window before any token is generated.
          Click any step above to expand its role.
        </p>
      </div>
    </div>
  );
}
