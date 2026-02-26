"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaCloser() {
  return (
    <section
      className="rounded-lg p-6 relative overflow-hidden"
      style={{
        background: "oklch(0.12 0.02 265)",
        border: "1px solid oklch(1 0 0 / 0.08)",
        boxShadow:
          "inset 0 1px 0 oklch(1 0 0 / 0.08), 0 0 0 1px oklch(1 0 0 / 0.04)",
      }}
    >
      {/* Top-edge accent glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.60 0.22 265 / 0.50), transparent)",
        }}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Ready to discuss how to build this?
          </h3>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            I've thought through the Vectorize grounding, the text-to-sql agent route, and the
            MCP wiring. Happy to walk through any piece of this on a call or over Upwork messages.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/proposal"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            See the proposal
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <span
            className="text-xs font-medium px-3 py-1.5 rounded-md"
            style={{
              background: "color-mix(in oklch, var(--primary) 12%, transparent)",
              border: "1px solid color-mix(in oklch, var(--primary) 25%, transparent)",
              color: "var(--primary)",
              boxShadow: "0 0 6px oklch(0.60 0.22 265 / 0.15)",
            }}
          >
            Reply on Upwork to start
          </span>
        </div>
      </div>
    </section>
  );
}
