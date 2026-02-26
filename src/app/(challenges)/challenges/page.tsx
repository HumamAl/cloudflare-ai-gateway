// Server component — no "use client"
import type { Metadata } from "next";
import { ExecutiveSummary } from "@/components/challenges/executive-summary";
import { ChallengePageContent } from "@/components/challenges/challenge-page-content";
import { CtaCloser } from "@/components/challenges/cta-closer";
import { challenges, executiveSummary } from "@/data/challenges";

export const metadata: Metadata = {
  title: "My Approach | CF AI Gateway Demo",
};

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 space-y-8">

        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            My Engineering Approach
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Three hard problems in this build — and how I'd solve each one on Cloudflare's edge toolchain
          </p>
        </div>

        {/* Executive summary — dark hero banner */}
        <ExecutiveSummary
          commonApproach={executiveSummary.commonApproach}
          differentApproach={executiveSummary.differentApproach}
          accentWord={executiveSummary.accentWord}
        />

        {/* Challenge cards with visualizations */}
        <ChallengePageContent challenges={challenges} />

        {/* CTA closer */}
        <CtaCloser />

      </div>
    </div>
  );
}
