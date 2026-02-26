"use client";

import type { ReactNode } from "react";
import type { Challenge } from "@/lib/types";
import { OutcomeStatement } from "./outcome-statement";

interface ChallengeListProps {
  challenges: Challenge[];
  visualizations?: Record<string, ReactNode>;
}

export function ChallengeList({
  challenges,
  visualizations = {},
}: ChallengeListProps) {
  return (
    <div className="flex flex-col gap-4">
      {challenges.map((challenge, index) => {
        const stepNumber = String(index + 1).padStart(2, "0");
        return (
          <div
            key={challenge.id}
            className="dark-card p-5 space-y-4"
            style={{
              animationDelay: `${index * 60}ms`,
            }}
          >
            {/* Header */}
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-sm font-medium tabular-nums shrink-0 w-7"
                  style={{ color: "color-mix(in oklch, var(--primary) 70%, transparent)" }}
                >
                  {stepNumber}
                </span>
                <h3 className="text-base font-semibold leading-tight">
                  {challenge.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                {challenge.description}
              </p>
            </div>

            {/* Visualization slot */}
            {visualizations[challenge.id] && (
              <div
                className="rounded-md p-4"
                style={{
                  background: "oklch(0.11 0.02 265)",
                  border: "1px solid oklch(1 0 0 / 0.06)",
                }}
              >
                {visualizations[challenge.id]}
              </div>
            )}

            {/* Outcome statement */}
            {challenge.outcome && (
              <OutcomeStatement outcome={challenge.outcome} index={index} />
            )}
          </div>
        );
      })}
    </div>
  );
}
