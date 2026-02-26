// App configuration — single source of truth for all identity/attribution text.
// Layout Builder populates these values from the Job Analyst brief.

// Aesthetic profiles correspond to [data-theme] blocks in globals.css.
// The Job Analyst selects the aesthetic based on industry + client tone.
// See references/design-diversity.md for the full industry-to-aesthetic routing map.
export type AestheticProfile =
  | "linear"               // Snappy, border-first, dev-tool feel (DEFAULT)
  | "bold-editorial"       // Type-as-design, dramatic whitespace, sharp edges
  | "warm-organic"         // Rounded, earth tones, soft shadows, breathing room
  | "corporate-enterprise" // Dense, structured, authoritative, max information
  | "dark-premium"         // Dark canvas, controlled accent glow, exclusive
  | "swiss-typographic"    // Grid-precise, zero ornament, type-driven
  | "glassmorphism"        // Frosted panels floating over colorful backgrounds
  | "neobrutalism"         // Thick borders, offset hard shadows, raw energy
  | "nature-wellness"      // Green, calm, generous space, anti-anxiety pacing
  | "data-dense"           // Compact, monospace metrics, max info per pixel
  | "saas-modern"          // Friendly gradients, approachable, conversion-focused
  | "e-commerce"           // Product-first, clean, conversion-optimized
  | "brand-forward"        // Personality-driven, expressive, soft neo-brutalism
  | "retrofuturism";       // Chrome, neon, dark canvas, high-energy iridescent

export const APP_CONFIG = {
  appName: "CF AI Gateway",              // Short branded name — sidebar header and logo initial
  projectName: "AI Gateway Toolchain",   // Client's project name — tab bar microtext, footer
  clientName: null as string | null,     // No client name found — omit from all surfaces
  domain: "ai-infrastructure",           // Domain classification from Job Analyst
  aesthetic: "dark-premium" as AestheticProfile, // Drives data-theme="..." on <html>
} as const;
