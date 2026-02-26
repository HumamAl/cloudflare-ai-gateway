"use client";

import { useState } from "react";
import { BarChart3, Server, Cpu, GitBranch, ChevronRight } from "lucide-react";

interface ArchNode {
  id: string;
  label: string;
  sublabel: string;
  type: "frontend" | "backend" | "ai" | "external";
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  detail: string;
}

const nodes: ArchNode[] = [
  {
    id: "worker",
    label: "CF Worker Edge",
    sublabel: "mcp-tool-dispatcher route",
    type: "backend",
    icon: Server,
    detail: "Validates MCP tool schema, routes dataset output to chart type, handles tool_dispatch stage in the pipeline trace",
  },
  {
    id: "llm",
    label: "Workers AI",
    sublabel: "@cf/meta/llama-3-8b-instruct",
    type: "ai",
    icon: Cpu,
    detail: "LLM returns a tool_call JSON with tool: \"generate_chart\" + dataset payload. Worker intercepts before returning to client.",
  },
  {
    id: "mcp",
    label: "MCP Charting Server",
    sublabel: "Anthropic open protocol",
    type: "external",
    icon: BarChart3,
    detail: "Receives dataset + chart_type from Worker. Returns rendered chart spec (Vega-Lite or PNG). Tool schema validated against ToolCallStatus.",
  },
  {
    id: "response",
    label: "Gateway Response",
    sublabel: "ToolCall record stored",
    type: "frontend",
    icon: GitBranch,
    detail: "Rendered chart embedded in response. ToolCall.status = \"success\" | \"schema_mismatch\". No manual export step.",
  },
];

const typeStyles: Record<string, React.CSSProperties> = {
  backend: {
    background: "color-mix(in oklch, var(--primary) 10%, transparent)",
    border: "1px solid color-mix(in oklch, var(--primary) 25%, transparent)",
  },
  ai: {
    background: "linear-gradient(135deg, color-mix(in oklch, var(--primary) 10%, transparent), color-mix(in oklch, var(--accent) 10%, transparent))",
    border: "1px solid color-mix(in oklch, var(--primary) 30%, transparent)",
  },
  external: {
    background: "oklch(0.16 0.02 265)",
    border: "1px solid oklch(1 0 0 / 0.10)",
  },
  frontend: {
    background: "color-mix(in oklch, var(--success) 8%, transparent)",
    border: "1px solid color-mix(in oklch, var(--success) 20%, transparent)",
  },
};

const typeIconColor: Record<string, string> = {
  backend: "var(--primary)",
  ai: "var(--primary)",
  external: "oklch(0.65 0.18 45)",
  frontend: "var(--success)",
};

export function VizMcpArchitecture() {
  const [activeNode, setActiveNode] = useState<string | null>("worker");

  const active = nodes.find((n) => n.id === activeNode);

  return (
    <div className="space-y-3">
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
        MCP tool-calling pipeline — click a component to inspect
      </p>

      {/* Node row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {nodes.map((node, i) => {
          const Icon = node.icon;
          const isActive = activeNode === node.id;

          return (
            <div key={node.id} className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setActiveNode(isActive ? null : node.id)
                }
                className="flex flex-col items-start px-3 py-2 rounded-md transition-all duration-100 text-left"
                style={
                  isActive
                    ? {
                        ...typeStyles[node.type],
                        boxShadow: `0 0 0 1px color-mix(in oklch, var(--primary) 35%, transparent), 0 0 10px oklch(0.60 0.22 265 / 0.15)`,
                      }
                    : {
                        background: "oklch(0.13 0.02 265)",
                        border: "1px solid oklch(1 0 0 / 0.07)",
                      }
                }
              >
                <Icon
                  className="h-3.5 w-3.5 mb-1.5"
                  style={{
                    color: isActive ? typeIconColor[node.type] : "oklch(0.55 0 0)",
                  }}
                />
                <p
                  className="text-xs font-semibold leading-tight"
                  style={{
                    color: isActive ? "oklch(0.92 0 0)" : "oklch(0.65 0 0)",
                  }}
                >
                  {node.label}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/60 leading-tight mt-0.5">
                  {node.sublabel}
                </p>
              </button>

              {/* Arrow connector */}
              {i < nodes.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {active && (
        <div
          className="rounded-md px-3 py-2.5 space-y-1 transition-all duration-100"
          style={{
            background: "oklch(0.09 0.02 265)",
            border: "1px solid oklch(1 0 0 / 0.07)",
          }}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
            {active.label}
          </p>
          <p className="text-xs leading-relaxed text-foreground/75">
            {active.detail}
          </p>
        </div>
      )}

      {/* Flow label footer */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: "Worker Edge", color: "var(--primary)" },
          { label: "AI Model", color: "oklch(0.65 0.18 45)" },
          { label: "MCP Server", color: "oklch(0.55 0 0)" },
          { label: "Response", color: "var(--success)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-[10px] font-mono text-muted-foreground/60">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
