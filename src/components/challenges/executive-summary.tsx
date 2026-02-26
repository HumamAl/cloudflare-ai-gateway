// NO "use client" — pure JSX, no hooks

interface ExecutiveSummaryProps {
  commonApproach: string;
  differentApproach: string;
  accentWord?: string;
}

export function ExecutiveSummary({
  commonApproach,
  differentApproach,
  accentWord,
}: ExecutiveSummaryProps) {
  const renderDifferentApproach = () => {
    if (!accentWord) return <span>{differentApproach}</span>;
    const escaped = accentWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = differentApproach.split(new RegExp(`(${escaped})`, "i"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === accentWord.toLowerCase() ? (
            <span key={i} className="text-primary font-semibold">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg p-6 md:p-8"
      style={{
        background: "oklch(0.10 0.02 var(--primary-h, 265))",
        backgroundImage:
          "radial-gradient(ellipse at 30% 50%, oklch(0.60 0.22 265 / 0.07), transparent 70%)",
        border: "1px solid oklch(1 0 0 / 0.08)",
        boxShadow:
          "inset 0 1px 0 oklch(1 0 0 / 0.08), 0 0 0 1px oklch(1 0 0 / 0.04)",
      }}
    >
      {/* Subtle top-edge glow — dark premium signature */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.60 0.22 265 / 0.40), transparent)",
        }}
      />

      <p className="text-sm md:text-base leading-relaxed text-white/50">
        {commonApproach}
      </p>
      <hr className="my-4 border-white/10" />
      <p className="text-base md:text-lg leading-relaxed font-medium text-white/90">
        {renderDifferentApproach()}
      </p>
      <p className="text-xs text-white/40 mt-4">
        {"← "}
        <a
          href="/"
          className="hover:text-white/70 transition-colors duration-100 underline underline-offset-2"
        >
          Back to the live demo
        </a>
      </p>
    </div>
  );
}
