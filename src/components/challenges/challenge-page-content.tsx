"use client";

import type { ReactNode } from "react";
import type { Challenge } from "@/lib/types";
import { ChallengeList } from "./challenge-list";
import { VizRagFlow } from "./viz-rag-flow";
import { VizTextToSql } from "./viz-text-to-sql";
import { VizMcpArchitecture } from "./viz-mcp-architecture";

interface ChallengePageContentProps {
  challenges: Challenge[];
}

export function ChallengePageContent({ challenges }: ChallengePageContentProps) {
  const visualizations: Record<string, ReactNode> = {
    "challenge-1": <VizRagFlow />,
    "challenge-2": <VizTextToSql />,
    "challenge-3": <VizMcpArchitecture />,
  };

  return <ChallengeList challenges={challenges} visualizations={visualizations} />;
}
