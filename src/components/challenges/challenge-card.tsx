// NO "use client" — pure JSX, no hooks
// This component is kept for backwards compatibility.
// The challenges page uses ChallengeList directly, which renders
// dark-card styled containers with proper dark-premium treatment.

import type { ReactNode } from "react";

interface ChallengeCardProps {
  title: string;
  description: string;
  outcome?: string;
  children?: ReactNode;
  className?: string;
}

export function ChallengeCard({
  title,
  description,
  outcome,
  children,
  className,
}: ChallengeCardProps) {
  return (
    <div
      className={`dark-card p-5 space-y-4 ${className ?? ""}`}
    >
      <div>
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      {children}
      {outcome && (
        <div
          className="flex items-start gap-2 rounded-md px-3 py-2"
          style={{
            backgroundColor: "color-mix(in oklch, var(--success) 10%, transparent)",
            borderColor: "color-mix(in oklch, var(--success) 22%, transparent)",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--success)" }}
          >
            {outcome}
          </p>
        </div>
      )}
    </div>
  );
}
