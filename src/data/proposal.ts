import type { Profile, PortfolioProject } from "@/lib/types";

// ---------------------------------------------------------------------------
// Legacy exports — kept for template compatibility with existing imports.
// The proposal page uses proposalData below (richer structure).
// ---------------------------------------------------------------------------

export const profile: Profile = {
  name: "Humam",
  tagline:
    "Full-stack TypeScript developer specializing in AI infrastructure, RAG pipelines, and Cloudflare edge deployment.",
  bio: "I build AI-powered backends and operational SaaS tools that solve real problems — not chatbot wrappers. My work ranges from Claude API pipelines with structured extraction to production monitoring dashboards, all shipped fast and maintained properly.",
  approach: [
    {
      title: "Map the Schema",
      description:
        "Understand your SaaS entity model and database structure before writing a line of code.",
    },
    {
      title: "Build the Pipeline",
      description:
        "Workers AI + Vectorize embedding pipeline, tested with real entity data.",
    },
    {
      title: "Wire the Edge",
      description:
        "Deploy to Cloudflare Workers with proper bindings, routing, and fallback handling.",
    },
    {
      title: "Iterate on Accuracy",
      description:
        "Text-to-SQL and RAG accuracy improve with schema grounding and evaluation loops.",
    },
  ],
  skillCategories: [
    {
      name: "Cloudflare Stack",
      skills: [
        "Cloudflare Workers",
        "Workers AI",
        "Vectorize",
        "R2",
        "AI Gateway",
      ],
    },
    {
      name: "AI & Pipelines",
      skills: [
        "RAG",
        "Embeddings",
        "Vector Search",
        "Text-to-SQL",
        "Claude API",
        "MCP Protocol",
      ],
    },
    {
      name: "Language & Runtime",
      skills: ["TypeScript", "Node.js", "PostgreSQL"],
    },
    {
      name: "Full-Stack",
      skills: ["Next.js", "React", "Tailwind CSS"],
    },
  ],
};

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "wmf-agent",
    title: "WMF Agent Dashboard",
    description:
      "AI pipeline with Claude API for email classification, RFQ data extraction with confidence scoring, and human-in-the-loop approval workflow.",
    outcome:
      "Replaced a 4-hour manual quote review process with a 20-minute structured extraction and approval flow",
    tech: ["Next.js", "TypeScript", "Claude API", "n8n", "Microsoft Graph"],
    liveUrl: "https://wmf-agent-dashboard.vercel.app",
    relevance:
      "Closest structural match to this job — Claude API + structured output pipeline in a real production context.",
  },
  {
    id: "medrecord-ai",
    title: "MedRecord AI",
    description:
      "Document processing pipeline that extracts structured clinical data — diagnoses, medications, and treatment timelines — from raw patient records.",
    outcome:
      "Document processing pipeline that extracts structured clinical data and generates a readable timeline summary",
    tech: ["Next.js", "TypeScript", "AI extraction pipeline"],
    liveUrl: "https://medrecord-ai-delta.vercel.app",
    relevance:
      "RAG-adjacent document chunking and structured extraction — same class of problem as Vectorize indexing.",
  },
  {
    id: "ebay-pokemon-monitor",
    title: "eBay Pokemon Monitor",
    description:
      "API monitoring tool for eBay Browse API with webhook-based Discord alerts and price trend tracking — built to handle high-frequency polling reliably.",
    outcome:
      "Real-time listing monitor with webhook-based Discord alerts and price trend tracking",
    tech: ["Next.js", "TypeScript", "eBay Browse API", "Discord webhooks"],
    liveUrl: "https://ebay-pokemon-monitor.vercel.app",
    relevance:
      "Shows production API reliability — webhook routing and real-time alerting at volume.",
  },
  {
    id: "data-intelligence",
    title: "Data Intelligence Platform",
    description:
      "Unified analytics dashboard pulling data from multiple sources with interactive charts and filterable insights for business intelligence.",
    outcome:
      "Unified analytics dashboard pulling data from multiple sources with interactive charts and filterable insights",
    tech: ["Next.js", "TypeScript", "Recharts", "shadcn/ui"],
    liveUrl: "https://data-intelligence-platform-sandy.vercel.app",
    relevance:
      "Covers the analytics layer — what sits above the AI Gateway toolchain to surface usage and cost insights.",
  },
];

// ---------------------------------------------------------------------------
// proposalData — full rich structure for the proposal page rendering.
// This is the authoritative source for page content.
// ---------------------------------------------------------------------------

export const proposalData = {
  hero: {
    name: "Humam",
    valueProp:
      "I build Cloudflare AI Gateway toolchains — RAG pipelines with Vectorize, Text-to-SQL agents, and MCP integrations — and I've already built a working version of yours in Tab 1.",
    badge: "Built this demo for your project",
    stats: [
      { value: "24+", label: "Projects Shipped" },
      { value: "< 48hr", label: "Demo Turnaround" },
      { value: "15+", label: "Industries" },
    ],
  },

  portfolioProjects: [
    {
      name: "WMF Agent Dashboard",
      description:
        "AI pipeline with Claude API — email classification, RFQ data extraction with confidence scoring, and human-in-the-loop approval flow. Built for a real manufacturing client.",
      outcome:
        "Replaced a 4-hour manual quote review process with a 20-minute structured extraction and approval flow",
      tech: ["Next.js", "TypeScript", "Claude API", "n8n", "Microsoft Graph"],
      url: "https://wmf-agent-dashboard.vercel.app",
      relevance:
        "Closest structural match to this job — Claude API pipeline with structured output in production.",
    },
    {
      name: "MedRecord AI",
      description:
        "Document processing pipeline that chunks raw medical records, extracts structured clinical data, and generates readable timelines. Document-in, structured-data-out.",
      outcome:
        "Document processing pipeline that extracts structured clinical data and generates a readable timeline summary",
      tech: ["Next.js", "TypeScript", "AI extraction pipeline"],
      url: "https://medrecord-ai-delta.vercel.app",
      relevance:
        "RAG-adjacent work — same chunking, embedding, and extraction pattern as Vectorize indexing.",
    },
    {
      name: "eBay Pokemon Monitor",
      description:
        "High-frequency eBay Browse API monitor with webhook-based Discord alerts and price trend tracking — built to be reliable under sustained polling load.",
      outcome:
        "Real-time listing monitor with webhook-based Discord alerts and price trend tracking",
      tech: ["Next.js", "TypeScript", "eBay Browse API", "Discord webhooks"],
      url: "https://ebay-pokemon-monitor.vercel.app",
      relevance:
        "Demonstrates production API reliability — webhook routing and real-time alerting patterns that apply directly to AI Gateway fallback handling.",
    },
    {
      name: "Data Intelligence Platform",
      description:
        "Multi-source analytics dashboard with interactive charts and filterable insights — the reporting layer that sits above any data pipeline.",
      outcome:
        "Unified analytics dashboard pulling data from multiple sources with interactive charts and filterable insights",
      tech: ["Next.js", "TypeScript", "Recharts", "shadcn/ui"],
      url: "https://data-intelligence-platform-sandy.vercel.app",
      relevance:
        "Covers the observability layer — cost tracking, usage charts, and latency visualization for the toolchain.",
    },
  ],

  approach: [
    {
      step: "01",
      title: "Map the Schema",
      description:
        "Start with your SaaS entity model — workspaces, projects, issues, members. Map the relationships before touching Vectorize. The schema is the grounding that makes Text-to-SQL accurate.",
      timeline: "Day 1–2",
    },
    {
      step: "02",
      title: "Build the Pipeline",
      description:
        "Workers AI embedding pipeline with Vectorize indexing, tested against real entity data. Chunk strategy, similarity thresholds, and reranking tuned to your schema before wiring the gateway.",
      timeline: "Week 1–2",
    },
    {
      step: "03",
      title: "Wire the Edge",
      description:
        "Deploy to Cloudflare Workers with proper AI Gateway bindings, routing rules, fallback to OpenAI when Workers AI is unavailable, and MCP tool dispatcher for structured queries.",
      timeline: "Week 2–3",
    },
    {
      step: "04",
      title: "Iterate on Accuracy",
      description:
        "Text-to-SQL and RAG accuracy improve through schema grounding and evaluation loops. Short cycles, visible accuracy metrics, no dark periods between updates.",
      timeline: "Week 3–6",
    },
  ],

  skills: [
    {
      category: "Cloudflare Stack",
      items: [
        "Cloudflare Workers",
        "Workers AI",
        "Vectorize",
        "R2",
        "AI Gateway",
      ],
    },
    {
      category: "AI & Pipelines",
      items: [
        "RAG",
        "Embeddings",
        "Vector Search",
        "Text-to-SQL",
        "Claude API",
        "MCP Protocol",
      ],
    },
    {
      category: "Language & Runtime",
      items: ["TypeScript", "Node.js", "PostgreSQL"],
    },
    {
      category: "Full-Stack",
      items: ["Next.js", "React", "Tailwind CSS"],
    },
  ],

  cta: {
    headline:
      "Ready to ship a working Cloudflare AI Gateway toolchain — not just a prototype.",
    body: "The demo in Tab 1 shows the full pipeline: gateway routing, Vectorize retrieval, Text-to-SQL, and MCP tool dispatch. The real thing ships in 4–6 weeks with your schema wired in.",
    action: "Reply on Upwork to start",
    availability: "Currently available for new projects",
  },
};
