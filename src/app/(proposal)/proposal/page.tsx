import Link from "next/link";
import { ExternalLink, TrendingUp } from "lucide-react";
import { proposalData } from "@/data/proposal";

export default function ProposalPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">

        {/* ================================================================
            SECTION 1: HERO — Project-first, dark premium treatment
            Near-black indigo panel, radial glow, stats shelf at bottom.
            ================================================================ */}
        <section
          className="relative rounded-[var(--radius)] overflow-hidden"
          style={{ background: "oklch(0.09 0.025 265)" }}
        >
          {/* Radial highlight — top-center glow, indigo accent */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.60 0.22 265 / 0.12), transparent 70%)",
            }}
          />

          <div className="relative z-10 px-8 py-10 md:px-12 md:py-12">
            {/* Effort badge — mandatory trust signal */}
            <span className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase border px-3 py-1.5 rounded-full mb-8"
              style={{
                color: "oklch(0.75 0.12 265)",
                borderColor: "oklch(0.60 0.22 265 / 0.30)",
                background: "oklch(0.60 0.22 265 / 0.08)",
              }}
            >
              <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: "oklch(0.60 0.22 265 / 0.60)" }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ background: "var(--primary)" }}
                />
              </span>
              Built this demo for your project
            </span>

            {/* Role prefix */}
            <p
              className="font-mono text-[10px] tracking-widest uppercase mb-4"
              style={{ color: "oklch(0.55 0.05 265)" }}
            >
              Full-Stack TypeScript · Cloudflare Edge · AI Infrastructure
            </p>

            {/* Weight-contrast headline */}
            <h1 className="text-5xl md:text-6xl tracking-tight leading-none mb-5">
              <span className="font-light" style={{ color: "oklch(0.70 0 0)" }}>
                Hi, I&apos;m
              </span>{" "}
              <span className="font-black text-white">
                {proposalData.hero.name}
              </span>
            </h1>

            {/* Tailored value prop — project-specific, one sentence */}
            <p
              className="text-lg md:text-xl leading-relaxed max-w-2xl"
              style={{ color: "oklch(0.65 0.03 265)" }}
            >
              {proposalData.hero.valueProp}
            </p>
          </div>

          {/* Stats shelf */}
          <div
            className="relative z-10 px-8 md:px-12 py-5"
            style={{
              borderTop: "1px solid oklch(1 0 0 / 0.08)",
              background: "oklch(1 0 0 / 0.03)",
            }}
          >
            <div className="grid grid-cols-3 gap-6">
              {proposalData.hero.stats.map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-2xl font-bold metric-value"
                    style={{ color: "oklch(0.92 0 0)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs font-mono mt-0.5"
                    style={{ color: "oklch(0.50 0.03 265)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 2: PROOF OF WORK — Single-column dark cards, luminous
            outcome statements. Dark premium portfolio treatment.
            ================================================================ */}
        <section className="space-y-5">
          <div>
            <p
              className="font-mono text-[10px] tracking-widest uppercase mb-2"
              style={{ color: "oklch(0.50 0.05 265)" }}
            >
              Proof of Work
            </p>
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "oklch(0.92 0 0)" }}
            >
              Relevant Projects
            </h2>
          </div>

          <div className="space-y-3">
            {proposalData.portfolioProjects.map((project) => (
              <div
                key={project.name}
                className="dark-card p-5 space-y-3"
              >
                {/* Project header */}
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className="text-base font-semibold leading-snug"
                    style={{ color: "oklch(0.92 0 0)" }}
                  >
                    {project.name}
                  </h3>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 opacity-40 hover:opacity-80 transition-opacity duration-75"
                      style={{ color: "var(--primary)" }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.58 0.03 265)" }}
                >
                  {project.description}
                </p>

                {/* Outcome — luminous accent moment */}
                <div
                  className="flex items-start gap-2 text-sm"
                  style={{ color: "var(--success)" }}
                >
                  <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="leading-snug">{project.outcome}</span>
                </div>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-xs font-mono rounded"
                      style={{
                        background: "oklch(0.60 0.22 265 / 0.08)",
                        color: "oklch(0.65 0.10 265)",
                        border: "1px solid oklch(0.60 0.22 265 / 0.18)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Relevance note */}
                {project.relevance && (
                  <p
                    className="text-xs italic leading-relaxed pt-0.5"
                    style={{ color: "oklch(0.55 0.08 265)" }}
                  >
                    {project.relevance}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            SECTION 3: HOW I WORK — Vertical numbered list, glowing accent
            step numbers. Adapted to AI infrastructure job type.
            Steps: Map → Build → Wire → Iterate
            ================================================================ */}
        <section className="space-y-5">
          <div>
            <p
              className="font-mono text-[10px] tracking-widest uppercase mb-2"
              style={{ color: "oklch(0.50 0.05 265)" }}
            >
              Process
            </p>
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "oklch(0.92 0 0)" }}
            >
              How I Work
            </h2>
          </div>

          <div className="space-y-3">
            {proposalData.approach.map((step, index) => (
              <div key={step.step} className="dark-card p-5">
                <div className="flex gap-4">
                  {/* Glowing step number */}
                  <div className="shrink-0 pt-0.5">
                    <span
                      className="font-mono text-lg font-bold leading-none"
                      style={{
                        color: "var(--primary)",
                        textShadow: "0 0 12px oklch(0.60 0.22 265 / 0.40)",
                      }}
                    >
                      {step.step}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: "oklch(0.92 0 0)" }}
                      >
                        {step.title}
                      </h3>
                      <span
                        className="font-mono text-[10px] tracking-wide shrink-0"
                        style={{ color: "oklch(0.45 0.04 265)" }}
                      >
                        {step.timeline}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "oklch(0.58 0.03 265)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector line between steps */}
                {index < proposalData.approach.length - 1 && (
                  <div
                    className="ml-[1.25rem] mt-3 w-px h-2"
                    style={{ background: "oklch(0.60 0.22 265 / 0.15)" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Timeline summary */}
          <p
            className="text-xs font-mono pl-1"
            style={{ color: "oklch(0.48 0.05 265)" }}
          >
            First working pipeline deployed in 1–2 weeks. Full toolchain with
            MCP integration in 4–6 weeks.
          </p>
        </section>

        {/* ================================================================
            SECTION 4: SKILLS — Dark pill tags, indigo tint.
            Filtered to Cloudflare AI toolchain stack only.
            ================================================================ */}
        <section className="space-y-5">
          <div>
            <p
              className="font-mono text-[10px] tracking-widest uppercase mb-2"
              style={{ color: "oklch(0.50 0.05 265)" }}
            >
              Tech Stack
            </p>
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "oklch(0.92 0 0)" }}
            >
              What I Build With
            </h2>
          </div>

          <div className="space-y-3">
            {proposalData.skills.map((category) => (
              <div key={category.category} className="dark-card p-4 space-y-3">
                <p
                  className="font-mono text-[10px] tracking-widest uppercase"
                  style={{ color: "oklch(0.50 0.05 265)" }}
                >
                  {category.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-sm font-mono rounded"
                      style={{
                        background: "oklch(0.16 0.02 265)",
                        color: "oklch(0.72 0.06 265)",
                        border: "1px solid oklch(1 0 0 / 0.08)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            SECTION 5: CTA — Ultra-dark panel, singular luminous element.
            Pulsing availability indicator. "Reply on Upwork" as the only
            bright element. Signed by Humam.
            ================================================================ */}
        <section
          className="relative rounded-[var(--radius)] overflow-hidden text-center"
          style={{ background: "oklch(0.07 0.025 265)" }}
        >
          {/* Subtle bottom glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 100%, oklch(0.60 0.22 265 / 0.08), transparent 70%)",
            }}
          />

          <div className="relative z-10 px-8 py-12 md:px-12 space-y-5">
            {/* Pulsing availability indicator */}
            <div className="flex items-center justify-center gap-2">
              <span className="relative inline-flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: "var(--success)" }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "var(--success)" }}
                />
              </span>
              <span
                className="text-sm font-mono"
                style={{ color: "var(--success)" }}
              >
                {proposalData.cta.availability}
              </span>
            </div>

            {/* Tailored headline */}
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "oklch(0.92 0 0)" }}
            >
              {proposalData.cta.headline}
            </h2>

            {/* Specific body — references the demo */}
            <p
              className="max-w-lg mx-auto text-sm leading-relaxed"
              style={{ color: "oklch(0.55 0.03 265)" }}
            >
              {proposalData.cta.body}
            </p>

            {/* Primary action — text, not a dead link */}
            <p
              className="text-base font-semibold pt-1"
              style={{ color: "oklch(0.92 0 0)" }}
            >
              {proposalData.cta.action}
            </p>

            {/* Binary offer */}
            <p
              className="text-xs font-mono"
              style={{ color: "oklch(0.48 0.05 265)" }}
            >
              10-minute call or I can scope the first milestone — your pick
            </p>

            {/* Back to demo */}
            <div className="pt-2">
              <Link
                href="/"
                className="text-xs opacity-40 hover:opacity-70 transition-opacity duration-75"
                style={{ color: "oklch(0.75 0.05 265)" }}
              >
                ← Back to the demo
              </Link>
            </div>

            {/* Signature */}
            <p
              className="text-sm pt-4 mt-4"
              style={{
                color: "oklch(0.38 0.03 265)",
                borderTop: "1px solid oklch(1 0 0 / 0.08)",
              }}
            >
              — Humam
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
