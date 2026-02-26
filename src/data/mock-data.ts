/**
 * Mock data for the Cloudflare AI Gateway demo.
 *
 * All timestamps are ISO strings anchored to 2026-02-26 (today).
 * Metric ranges follow production AI gateway baselines:
 *   - Weekday requests: 1,800–3,200 / day
 *   - Weekend requests: 80–240 / day
 *   - Latency p50: 380–620ms, p95: 980–2,100ms, p99: 2,400–4,200ms
 *   - Cost: $0.0008–$0.0042 per request
 *   - Cache hit rate: 18–34% (semantic caching on embeddings)
 */

import type {
  Request,
  Trace,
  VectorIndex,
  GatewayRoute,
  ToolCall,
  SqlQuery,
  GatewayStats,
  DailyMetrics,
  RouteMetrics,
  ModelTokenUsage,
  IndexHealthSnapshot,
  ToolCallMetrics,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Dataset 1: Gateway Routes (6 routes)
// ---------------------------------------------------------------------------

export const gatewayRoutes: GatewayRoute[] = [
  {
    id: "rte_a4m9x",
    slug: "production-workers-ai",
    name: "Production Workers AI",
    status: "active",
    primaryModel: "@cf/meta/llama-3-8b-instruct",
    fallbackModel: "gpt-4o-mini",
    cacheTtlSeconds: 3600,
    rateLimitRpm: 600,
    requestsToday: 2847,
    errorRate: 0.018,
    p50Ms: 487,
    p95Ms: 1342,
    createdAt: "2025-11-03T10:14:22Z",
  },
  {
    id: "rte_b7p2k",
    slug: "fallback-openai-gpt4o",
    name: "Fallback — OpenAI GPT-4o",
    status: "fallback_active",
    primaryModel: "gpt-4o-mini",
    fallbackModel: null,
    cacheTtlSeconds: 1800,
    rateLimitRpm: 200,
    requestsToday: 341,
    errorRate: 0.029,
    p50Ms: 812,
    p95Ms: 2184,
    statusNote:
      "Receiving overflow traffic — production-workers-ai at 94% capacity",
    createdAt: "2025-11-03T10:14:22Z",
  },
  {
    id: "rte_c1n7z",
    slug: "embeddings-bge-base",
    name: "Embeddings — BGE Base",
    status: "active",
    primaryModel: "@cf/baai/bge-base-en-v1.5",
    fallbackModel: "@cf/baai/bge-small-en-v1.5",
    cacheTtlSeconds: 86400,
    rateLimitRpm: 1200,
    requestsToday: 5318,
    errorRate: 0.004,
    p50Ms: 189,
    p95Ms: 441,
    createdAt: "2025-11-03T10:14:22Z",
  },
  {
    id: "rte_d3q8w",
    slug: "text-to-sql-agent",
    name: "Text-to-SQL Agent",
    status: "active",
    primaryModel: "@cf/meta/llama-3-8b-instruct",
    fallbackModel: "gpt-4o-mini",
    cacheTtlSeconds: 0,
    rateLimitRpm: 120,
    requestsToday: 428,
    errorRate: 0.071,
    p50Ms: 1284,
    p95Ms: 3947,
    createdAt: "2025-12-08T14:32:07Z",
  },
  {
    id: "rte_e9f4r",
    slug: "semantic-search-route",
    name: "Semantic Search Route",
    status: "degraded",
    primaryModel: "@cf/meta/llama-3-8b-instruct",
    fallbackModel: "@cf/mistral/mistral-7b-instruct-v0.2",
    cacheTtlSeconds: 7200,
    rateLimitRpm: 400,
    requestsToday: 892,
    errorRate: 0.143,
    p50Ms: 614,
    p95Ms: 2841,
    statusNote:
      "p95 latency 2.84s — saas-entities-v2 index partial state causing degraded retrieval",
    createdAt: "2025-11-03T10:14:22Z",
  },
  {
    id: "rte_f2t6m",
    slug: "mcp-tool-dispatcher",
    name: "MCP Tool Dispatcher",
    status: "active",
    primaryModel: "@cf/meta/llama-3-8b-instruct",
    fallbackModel: null,
    cacheTtlSeconds: 300,
    rateLimitRpm: 300,
    requestsToday: 1174,
    errorRate: 0.034,
    p50Ms: 376,
    p95Ms: 1089,
    createdAt: "2026-01-14T09:08:41Z",
  },
];

// ---------------------------------------------------------------------------
// Dataset 2: Vector Indexes (6 indexes — all names from spec)
// ---------------------------------------------------------------------------

export const vectorIndexes: VectorIndex[] = [
  {
    id: "idx_k4p1n",
    name: "saas-entities-v2",
    description:
      "SaaS domain entity embeddings — workspaces, orgs, projects, integrations",
    status: "partial",
    vectorCount: 284_712,
    chunkCount: 318_447,
    coveragePct: 74.3,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    lastIndexedAt: "2026-02-24T03:12:48Z",
    nextScheduledAt: "2026-02-28T03:00:00Z",
    dimensions: 768,
    sizeMb: 1842.7,
    avgSearchLatencyMs: 38,
    statusNote:
      "Re-indexing paused at 74.3% — 83,735 entities pending batch job",
  },
  {
    id: "idx_m7r2s",
    name: "product-terminology-en",
    description:
      "Product feature terminology and SaaS jargon for semantic matching",
    status: "ready",
    vectorCount: 48_219,
    chunkCount: 51_084,
    coveragePct: 99.1,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    lastIndexedAt: "2026-02-26T01:47:23Z",
    nextScheduledAt: "2026-03-02T01:00:00Z",
    dimensions: 768,
    sizeMb: 312.4,
    avgSearchLatencyMs: 12,
  },
  {
    id: "idx_b9v5t",
    name: "user-docs-chunks",
    description: "End-user documentation chunked at 512 tokens with overlap",
    status: "stale",
    vectorCount: 127_483,
    chunkCount: 134_291,
    coveragePct: 91.8,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    lastIndexedAt: "2026-02-23T18:30:11Z",
    nextScheduledAt: "2026-02-26T18:00:00Z",
    dimensions: 768,
    sizeMb: 824.6,
    avgSearchLatencyMs: 24,
    statusNote:
      "Last indexed 60+ hours ago — 3 documentation releases not reflected",
  },
  {
    id: "idx_c3w8q",
    name: "changelog-embeddings",
    description: "Product changelog entries for recency-weighted retrieval",
    status: "ready",
    vectorCount: 9_847,
    chunkCount: 10_213,
    coveragePct: 100.0,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    lastIndexedAt: "2026-02-26T06:15:09Z",
    nextScheduledAt: "2026-02-27T06:00:00Z",
    dimensions: 768,
    sizeMb: 63.8,
    avgSearchLatencyMs: 6,
  },
  {
    id: "idx_x1j9h",
    name: "support-kb-v3",
    description: "Support knowledge base articles — troubleshooting and FAQs",
    status: "drift_detected",
    vectorCount: 73_128,
    chunkCount: 78_904,
    coveragePct: 96.4,
    embeddingModel: "@cf/baai/bge-small-en-v1.5",
    lastIndexedAt: "2026-02-25T22:44:37Z",
    nextScheduledAt: "2026-02-26T22:00:00Z",
    dimensions: 384,
    sizeMb: 237.1,
    avgSearchLatencyMs: 19,
    statusNote:
      "Model version mismatch — index built with bge-small-en-v1.5 but route now uses bge-base-en-v1.5; re-index required",
  },
  {
    id: "idx_p5n4k",
    name: "schema-metadata",
    description: "Database schema metadata for Text-to-SQL context injection",
    status: "indexing",
    vectorCount: 3_412,
    chunkCount: 4_100,
    coveragePct: 83.2,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    lastIndexedAt: "2026-02-26T09:03:17Z",
    nextScheduledAt: null,
    dimensions: 768,
    sizeMb: 22.1,
    avgSearchLatencyMs: 8,
    statusNote: "Active indexing run — 688 schema chunks queued",
  },
];

// ---------------------------------------------------------------------------
// Dataset 3: Requests (18 records)
// Distributions: ~55% success, ~20% cached, ~10% error, ~7% rate_limited,
//                ~5% timeout, ~3% model_unavailable
// ---------------------------------------------------------------------------

export const requests: Request[] = [
  {
    id: "req_h4k9m",
    traceId: "trc_a1b2c",
    indexId: "idx_m7r2s",
    routeId: "rte_a4m9x",
    latencyMs: 487,
    inputTokens: 1_842,
    outputTokens: 318,
    costUsd: 0.0024,
    cacheStatus: "miss",
    status: "success",
    similarityScore: 0.87,
    resolvedEntityType: "integration",
    chunksRetrieved: 5,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Rohan Mehta",
    createdAt: "2026-02-26T09:47:13Z",
  },
  {
    id: "req_p7n3w",
    traceId: "trc_d4e5f",
    indexId: "idx_k4p1n",
    routeId: "rte_e9f4r",
    latencyMs: 1_284,
    inputTokens: 2_417,
    outputTokens: 512,
    costUsd: 0.0038,
    cacheStatus: "miss",
    status: "success",
    similarityScore: 0.74,
    resolvedEntityType: "project",
    chunksRetrieved: 4,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Priya Krishnamurthy",
    createdAt: "2026-02-26T09:31:44Z",
  },
  {
    id: "req_t2b8v",
    traceId: "trc_g7h8i",
    indexId: "idx_m7r2s",
    routeId: "rte_a4m9x",
    latencyMs: 203,
    inputTokens: 1_103,
    outputTokens: 287,
    costUsd: 0.0017,
    cacheStatus: "hit",
    status: "cached",
    similarityScore: 0.91,
    resolvedEntityType: "workspace",
    chunksRetrieved: 5,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Callum Fraser",
    createdAt: "2026-02-26T09:18:02Z",
  },
  {
    id: "req_r5f1z",
    traceId: "trc_j1k2l",
    indexId: "idx_b9v5t",
    routeId: "rte_e9f4r",
    latencyMs: 3_847,
    inputTokens: 3_214,
    outputTokens: 0,
    costUsd: 0.0019,
    cacheStatus: "miss",
    status: "timeout",
    similarityScore: 0.62,
    resolvedEntityType: null,
    chunksRetrieved: 2,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Sofia Andersen",
    errorDetail:
      "Generation stage exceeded 4s deadline — no response from @cf/meta/llama-3-8b-instruct worker",
    createdAt: "2026-02-26T08:54:29Z",
  },
  {
    id: "req_m8x4q",
    traceId: "trc_m4n5o",
    indexId: "idx_x1j9h",
    routeId: "rte_a4m9x",
    latencyMs: 521,
    inputTokens: 1_688,
    outputTokens: 403,
    costUsd: 0.0028,
    cacheStatus: "miss",
    status: "success",
    similarityScore: 0.81,
    resolvedEntityType: "member",
    chunksRetrieved: 5,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Marcus Webb",
    createdAt: "2026-02-26T08:43:17Z",
  },
  // Edge case: low similarity — no chunks passed threshold
  {
    id: "req_k9j5r",
    traceId: "trc_p7q8r",
    indexId: "idx_k4p1n",
    routeId: "rte_e9f4r",
    latencyMs: 892,
    inputTokens: 1_241,
    outputTokens: 187,
    costUsd: 0.0014,
    cacheStatus: "miss",
    status: "error",
    similarityScore: 0.41,
    resolvedEntityType: null,
    chunksRetrieved: 0,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Yuki Tanaka",
    errorDetail:
      "No chunks passed similarity threshold (0.45) — retrieval returned 0 results; generation skipped",
    createdAt: "2026-02-26T08:29:51Z",
  },
  // Edge case: context length exceeded
  {
    id: "req_w3c7p",
    traceId: "trc_s1t2u",
    indexId: "idx_k4p1n",
    routeId: "rte_a4m9x",
    latencyMs: 2_143,
    inputTokens: 7_841,
    outputTokens: 94,
    costUsd: 0.0041,
    cacheStatus: "miss",
    status: "error",
    similarityScore: 0.78,
    resolvedEntityType: "pipeline",
    chunksRetrieved: 8,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Daniela Reyes",
    errorDetail:
      "Context length exceeded — 7,841 tokens exceeds model limit of 8,192; prompt truncated but truncation degraded generation quality",
    contextLengthExceeded: true,
    createdAt: "2026-02-26T07:58:34Z",
  },
  // Rate limited pair — same ~2min apart
  {
    id: "req_n1v6b",
    traceId: "trc_v4w5x",
    indexId: "idx_m7r2s",
    routeId: "rte_a4m9x",
    latencyMs: 12,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0.0,
    cacheStatus: "bypass",
    status: "rate_limited",
    similarityScore: 0.0,
    resolvedEntityType: null,
    chunksRetrieved: 0,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Aleksei Volkov",
    errorDetail: "Rate limit exceeded — 600 RPM cap on production-workers-ai",
    createdAt: "2026-02-26T07:41:08Z",
  },
  {
    id: "req_q4d2h",
    traceId: "trc_y7z8a",
    indexId: "idx_m7r2s",
    routeId: "rte_a4m9x",
    latencyMs: 11,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0.0,
    cacheStatus: "bypass",
    status: "rate_limited",
    similarityScore: 0.0,
    resolvedEntityType: null,
    chunksRetrieved: 0,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Aleksei Volkov",
    errorDetail: "Rate limit exceeded — 600 RPM cap on production-workers-ai",
    createdAt: "2026-02-26T07:39:23Z",
  },
  {
    id: "req_j6e8s",
    traceId: "trc_b2c3d",
    indexId: "idx_c3w8q",
    routeId: "rte_a4m9x",
    latencyMs: 441,
    inputTokens: 2_084,
    outputTokens: 441,
    costUsd: 0.0031,
    cacheStatus: "miss",
    status: "success",
    similarityScore: 0.94,
    resolvedEntityType: "report",
    chunksRetrieved: 5,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Rohan Mehta",
    createdAt: "2026-02-25T16:12:48Z",
  },
  {
    id: "req_x2f9t",
    traceId: "trc_e5f6g",
    indexId: "idx_m7r2s",
    routeId: "rte_b7p2k",
    latencyMs: 987,
    inputTokens: 1_547,
    outputTokens: 389,
    costUsd: 0.0037,
    cacheStatus: "miss",
    status: "success",
    similarityScore: 0.83,
    resolvedEntityType: "webhook",
    chunksRetrieved: 4,
    model: "gpt-4o-mini",
    initiatedBy: "Marcus Webb",
    createdAt: "2026-02-25T15:37:19Z",
  },
  {
    id: "req_u5g3l",
    traceId: "trc_h8i9j",
    indexId: "idx_b9v5t",
    routeId: "rte_e9f4r",
    latencyMs: 312,
    inputTokens: 1_082,
    outputTokens: 291,
    costUsd: 0.0018,
    cacheStatus: "hit",
    status: "cached",
    similarityScore: 0.88,
    resolvedEntityType: "environment",
    chunksRetrieved: 5,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Priya Krishnamurthy",
    createdAt: "2026-02-25T14:51:07Z",
  },
  {
    id: "req_o9k4n",
    traceId: "trc_k1l2m",
    indexId: "idx_p5n4k",
    routeId: "rte_d3q8w",
    latencyMs: 2_387,
    inputTokens: 3_847,
    outputTokens: 712,
    costUsd: 0.0042,
    cacheStatus: "miss",
    status: "success",
    similarityScore: 0.76,
    resolvedEntityType: "dataset",
    chunksRetrieved: 6,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Callum Fraser",
    createdAt: "2026-02-25T11:28:33Z",
  },
  {
    id: "req_v7m1w",
    traceId: "trc_n3o4p",
    indexId: "idx_m7r2s",
    routeId: "rte_a4m9x",
    latencyMs: 178,
    inputTokens: 987,
    outputTokens: 224,
    costUsd: 0.0014,
    cacheStatus: "hit",
    status: "cached",
    similarityScore: 0.96,
    resolvedEntityType: "api_key",
    chunksRetrieved: 5,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Sofia Andersen",
    createdAt: "2026-02-24T19:44:02Z",
  },
  {
    id: "req_l3p8q",
    traceId: "trc_q6r7s",
    indexId: "idx_x1j9h",
    routeId: "rte_e9f4r",
    latencyMs: 4_187,
    inputTokens: 1_329,
    outputTokens: 0,
    costUsd: 0.0009,
    cacheStatus: "miss",
    status: "model_unavailable",
    similarityScore: 0.69,
    resolvedEntityType: null,
    chunksRetrieved: 3,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Yuki Tanaka",
    errorDetail:
      "Workers AI inference endpoint returned 503 — model capacity exhausted in this region; fallback to gpt-4o-mini attempted but also rate-limited",
    createdAt: "2026-02-24T17:13:55Z",
  },
  {
    id: "req_a8s2r",
    traceId: "trc_t9u1v",
    indexId: "idx_c3w8q",
    routeId: "rte_a4m9x",
    latencyMs: 563,
    inputTokens: 1_714,
    outputTokens: 388,
    costUsd: 0.0027,
    cacheStatus: "miss",
    status: "success",
    similarityScore: 0.89,
    resolvedEntityType: "organization",
    chunksRetrieved: 5,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Daniela Reyes",
    createdAt: "2026-02-24T14:22:41Z",
  },
  {
    id: "req_c6h7n",
    traceId: "trc_w2x3y",
    indexId: "idx_k4p1n",
    routeId: "rte_f2t6m",
    latencyMs: 419,
    inputTokens: 1_483,
    outputTokens: 312,
    costUsd: 0.0022,
    cacheStatus: "miss",
    status: "success",
    similarityScore: 0.85,
    resolvedEntityType: "issue",
    chunksRetrieved: 5,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Marcus Webb",
    createdAt: "2026-02-23T10:07:18Z",
  },
  {
    id: "req_e4t5k",
    traceId: "trc_z5a6b",
    indexId: "idx_m7r2s",
    routeId: "rte_a4m9x",
    latencyMs: 348,
    inputTokens: 1_247,
    outputTokens: 341,
    costUsd: 0.0021,
    cacheStatus: "hit",
    status: "cached",
    similarityScore: 0.93,
    resolvedEntityType: "member",
    chunksRetrieved: 5,
    model: "@cf/meta/llama-3-8b-instruct",
    initiatedBy: "Priya Krishnamurthy",
    createdAt: "2026-02-22T08:31:44Z",
  },
];

// ---------------------------------------------------------------------------
// Dataset 4: Traces (8 detailed traces)
// ---------------------------------------------------------------------------

export const traces: Trace[] = [
  {
    id: "trc_a1b2c",
    requestId: "req_h4k9m",
    routeId: "rte_a4m9x",
    stages: [
      { stage: "cache_lookup", durationMs: 8, cached: false, status: "ok" },
      {
        stage: "embed",
        durationMs: 47,
        model: "@cf/baai/bge-base-en-v1.5",
        cached: false,
        tokens: 84,
        status: "ok",
      },
      { stage: "retrieve", durationMs: 38, cached: false, status: "ok" },
      {
        stage: "rerank",
        durationMs: 22,
        model: "@cf/baai/bge-reranker-base",
        cached: false,
        status: "ok",
      },
      {
        stage: "generate",
        durationMs: 372,
        model: "@cf/meta/llama-3-8b-instruct",
        cached: false,
        tokens: 318,
        status: "ok",
      },
    ],
    totalMs: 487,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    generationModel: "@cf/meta/llama-3-8b-instruct",
    rerankerModel: "@cf/baai/bge-reranker-base",
    topSimilarityScore: 0.87,
    userPrompt:
      "Show me all Stripe integrations that were enabled in the last 30 days",
    responseSummary:
      "Retrieved 5 Stripe integration records matching query. Top result: Stripe Billing v3 integration enabled 2026-02-14.",
    createdAt: "2026-02-26T09:47:13Z",
  },
  {
    id: "trc_j1k2l",
    requestId: "req_r5f1z",
    routeId: "rte_e9f4r",
    stages: [
      { stage: "cache_lookup", durationMs: 11, cached: false, status: "ok" },
      {
        stage: "embed",
        durationMs: 52,
        model: "@cf/baai/bge-base-en-v1.5",
        cached: false,
        tokens: 141,
        status: "ok",
      },
      { stage: "retrieve", durationMs: 84, cached: false, status: "ok" },
      {
        stage: "rerank",
        durationMs: 31,
        model: "@cf/baai/bge-reranker-base",
        cached: false,
        status: "ok",
      },
      {
        stage: "generate",
        durationMs: 3_669,
        model: "@cf/meta/llama-3-8b-instruct",
        cached: false,
        tokens: 0,
        status: "error",
        error: "Generation exceeded 4s deadline — worker timeout",
      },
    ],
    totalMs: 3_847,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    generationModel: "@cf/meta/llama-3-8b-instruct",
    rerankerModel: "@cf/baai/bge-reranker-base",
    topSimilarityScore: 0.62,
    userPrompt:
      "List all pipeline configurations for the data-processing environment across every organization with more than 50 active members",
    responseSummary: "Timeout — no response generated",
    createdAt: "2026-02-26T08:54:29Z",
  },
  {
    id: "trc_p7q8r",
    requestId: "req_k9j5r",
    routeId: "rte_e9f4r",
    stages: [
      { stage: "cache_lookup", durationMs: 7, cached: false, status: "ok" },
      {
        stage: "embed",
        durationMs: 49,
        model: "@cf/baai/bge-base-en-v1.5",
        cached: false,
        tokens: 72,
        status: "ok",
      },
      {
        stage: "retrieve",
        durationMs: 836,
        cached: false,
        status: "error",
        error:
          "0 chunks passed similarity threshold 0.45 — top score 0.41 on saas-entities-v2",
      },
      { stage: "rerank", durationMs: 0, cached: false, status: "skipped" },
      { stage: "generate", durationMs: 0, cached: false, status: "skipped" },
    ],
    totalMs: 892,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    generationModel: "@cf/meta/llama-3-8b-instruct",
    rerankerModel: null,
    topSimilarityScore: 0.41,
    userPrompt: "Find datasets with anomaly_detection_enabled flag set",
    responseSummary:
      "No results — similarity below threshold; retrieval stage aborted",
    createdAt: "2026-02-26T08:29:51Z",
  },
  {
    id: "trc_s1t2u",
    requestId: "req_w3c7p",
    routeId: "rte_a4m9x",
    stages: [
      { stage: "cache_lookup", durationMs: 9, cached: false, status: "ok" },
      {
        stage: "embed",
        durationMs: 51,
        model: "@cf/baai/bge-base-en-v1.5",
        cached: false,
        tokens: 128,
        status: "ok",
      },
      { stage: "retrieve", durationMs: 44, cached: false, status: "ok" },
      {
        stage: "rerank",
        durationMs: 28,
        model: "@cf/baai/bge-reranker-base",
        cached: false,
        status: "ok",
      },
      {
        stage: "generate",
        durationMs: 2_011,
        model: "@cf/meta/llama-3-8b-instruct",
        cached: false,
        tokens: 94,
        status: "error",
        error:
          "Context window overflow — 7,841 input tokens exceeds 8,192 limit",
      },
    ],
    totalMs: 2_143,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    generationModel: "@cf/meta/llama-3-8b-instruct",
    rerankerModel: "@cf/baai/bge-reranker-base",
    topSimilarityScore: 0.78,
    userPrompt:
      "Summarize all pipeline configurations, member activity logs, environment variables, and webhook events for the Nexora Systems organization over the last 90 days",
    responseSummary: "Context length exceeded — partial response only",
    createdAt: "2026-02-26T07:58:34Z",
  },
  {
    id: "trc_b2c3d",
    requestId: "req_j6e8s",
    routeId: "rte_a4m9x",
    stages: [
      { stage: "cache_lookup", durationMs: 6, cached: false, status: "ok" },
      {
        stage: "embed",
        durationMs: 44,
        model: "@cf/baai/bge-base-en-v1.5",
        cached: false,
        tokens: 91,
        status: "ok",
      },
      { stage: "retrieve", durationMs: 29, cached: false, status: "ok" },
      {
        stage: "rerank",
        durationMs: 19,
        model: "@cf/baai/bge-reranker-base",
        cached: false,
        status: "ok",
      },
      {
        stage: "generate",
        durationMs: 343,
        model: "@cf/meta/llama-3-8b-instruct",
        cached: false,
        tokens: 441,
        status: "ok",
      },
    ],
    totalMs: 441,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    generationModel: "@cf/meta/llama-3-8b-instruct",
    rerankerModel: "@cf/baai/bge-reranker-base",
    topSimilarityScore: 0.94,
    userPrompt:
      "What changed in the API rate limiting behavior in the February 2026 changelog?",
    responseSummary:
      "Located 3 changelog entries for rate limiting changes in Feb 2026. Key change: per-endpoint limits now apply independently.",
    createdAt: "2026-02-25T16:12:48Z",
  },
  {
    id: "trc_k1l2m",
    requestId: "req_o9k4n",
    routeId: "rte_d3q8w",
    stages: [
      { stage: "cache_lookup", durationMs: 7, cached: false, status: "ok" },
      {
        stage: "embed",
        durationMs: 63,
        model: "@cf/baai/bge-base-en-v1.5",
        cached: false,
        tokens: 184,
        status: "ok",
      },
      { stage: "retrieve", durationMs: 41, cached: false, status: "ok" },
      { stage: "sql_parse", durationMs: 1_847, cached: false, status: "ok" },
      {
        stage: "generate",
        durationMs: 429,
        model: "@cf/meta/llama-3-8b-instruct",
        cached: false,
        tokens: 712,
        status: "ok",
      },
    ],
    totalMs: 2_387,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    generationModel: "@cf/meta/llama-3-8b-instruct",
    rerankerModel: null,
    topSimilarityScore: 0.76,
    userPrompt: "How many datasets were created per organization last month?",
    responseSummary:
      "Generated SQL: SELECT org_id, COUNT(*) FROM datasets WHERE created_at >= '2026-01-01' GROUP BY org_id ORDER BY COUNT(*) DESC. Query executed, 47 rows returned.",
    createdAt: "2026-02-25T11:28:33Z",
  },
  {
    id: "trc_w2x3y",
    requestId: "req_c6h7n",
    routeId: "rte_f2t6m",
    stages: [
      { stage: "cache_lookup", durationMs: 8, cached: false, status: "ok" },
      {
        stage: "embed",
        durationMs: 48,
        model: "@cf/baai/bge-base-en-v1.5",
        cached: false,
        tokens: 103,
        status: "ok",
      },
      { stage: "retrieve", durationMs: 36, cached: false, status: "ok" },
      {
        stage: "tool_dispatch",
        durationMs: 281,
        cached: false,
        status: "ok",
      },
      {
        stage: "generate",
        durationMs: 46,
        model: "@cf/meta/llama-3-8b-instruct",
        cached: false,
        tokens: 312,
        status: "ok",
      },
    ],
    totalMs: 419,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    generationModel: "@cf/meta/llama-3-8b-instruct",
    rerankerModel: null,
    topSimilarityScore: 0.85,
    userPrompt: "List all open issues assigned to members of the Prism workspace",
    responseSummary:
      "Tool search_entities dispatched. Retrieved 12 open issues across 3 projects in Prism workspace.",
    createdAt: "2026-02-23T10:07:18Z",
  },
  {
    id: "trc_g7h8i",
    requestId: "req_t2b8v",
    routeId: "rte_a4m9x",
    stages: [
      {
        stage: "cache_lookup",
        durationMs: 203,
        cached: true,
        status: "ok",
      },
      { stage: "embed", durationMs: 0, cached: true, status: "skipped" },
      { stage: "retrieve", durationMs: 0, cached: true, status: "skipped" },
      { stage: "rerank", durationMs: 0, cached: true, status: "skipped" },
      { stage: "generate", durationMs: 0, cached: true, status: "skipped" },
    ],
    totalMs: 203,
    embeddingModel: "@cf/baai/bge-base-en-v1.5",
    generationModel: "@cf/meta/llama-3-8b-instruct",
    rerankerModel: null,
    topSimilarityScore: 0.91,
    userPrompt:
      "What is the structure of the main workspace for Bytecraft Labs?",
    responseSummary: "Cache hit — response served from gateway cache (TTL: 3600s)",
    createdAt: "2026-02-26T09:18:02Z",
  },
];

// ---------------------------------------------------------------------------
// Dataset 5: Tool Calls (16 records)
// Distributions: ~70% success, ~15% failed, ~10% schema_mismatch, ~5% timeout
// ---------------------------------------------------------------------------

export const toolCalls: ToolCall[] = [
  {
    id: "tcl_p2k8m",
    requestId: "req_c6h7n",
    tool: "search_entities",
    status: "success",
    latencyMs: 247,
    inputArgs: { entity_type: "issue", workspace: "prism", status: "open" },
    outputTokens: 1_284,
    createdAt: "2026-02-23T10:07:18Z",
  },
  {
    id: "tcl_r4n9w",
    requestId: "req_h4k9m",
    tool: "list_integrations",
    status: "success",
    latencyMs: 183,
    inputArgs: { integration_type: "stripe", days_since_enabled: 30 },
    outputTokens: 847,
    createdAt: "2026-02-26T09:47:13Z",
  },
  // Edge case: schema_mismatch
  {
    id: "tcl_f7q3s",
    requestId: "req_m8x4q",
    tool: "fetch_report",
    status: "schema_mismatch",
    latencyMs: 94,
    inputArgs: {
      report_id: "RPT-2847",
      format: "csv",
      include_archived: true,
    },
    schemaMismatchDetail:
      "Tool schema v2.1 expects 'report_uuid' (UUID) but caller passed 'report_id' (string). Schema updated 2026-02-10 — client needs to regenerate tool bindings.",
    createdAt: "2026-02-26T08:43:17Z",
  },
  {
    id: "tcl_h1v6t",
    requestId: "req_j6e8s",
    tool: "get_schema",
    status: "success",
    latencyMs: 128,
    inputArgs: { table: "api_rate_limits", include_indexes: true },
    outputTokens: 412,
    createdAt: "2026-02-25T16:12:48Z",
  },
  {
    id: "tcl_k3b7r",
    requestId: "req_p7n3w",
    tool: "resolve_workspace",
    status: "success",
    latencyMs: 312,
    inputArgs: { workspace_slug: "nexora-prod", include_members: true },
    outputTokens: 2_187,
    createdAt: "2026-02-26T09:31:44Z",
  },
  {
    id: "tcl_m9x4q",
    requestId: "req_x2f9t",
    tool: "list_integrations",
    status: "success",
    latencyMs: 208,
    inputArgs: { integration_type: "webhook", status: "active" },
    outputTokens: 673,
    createdAt: "2026-02-25T15:37:19Z",
  },
  {
    id: "tcl_n2c8p",
    requestId: "req_a8s2r",
    tool: "search_entities",
    status: "success",
    latencyMs: 289,
    inputArgs: { entity_type: "organization", name_contains: "nexora" },
    outputTokens: 1_047,
    createdAt: "2026-02-24T14:22:41Z",
  },
  {
    id: "tcl_q5d1h",
    requestId: "req_o9k4n",
    tool: "execute_sql",
    status: "success",
    latencyMs: 1_413,
    inputArgs: {
      sql: "SELECT org_id, COUNT(*) FROM datasets WHERE created_at >= '2026-01-01' GROUP BY org_id",
      timeout_ms: 5000,
    },
    outputTokens: 892,
    createdAt: "2026-02-25T11:28:33Z",
  },
  {
    id: "tcl_s8f2w",
    requestId: "req_v7m1w",
    tool: "get_schema",
    status: "success",
    latencyMs: 89,
    inputArgs: { table: "api_keys", include_constraints: true },
    outputTokens: 287,
    createdAt: "2026-02-24T19:44:02Z",
  },
  {
    id: "tcl_t4g6n",
    requestId: "req_e4t5k",
    tool: "resolve_workspace",
    status: "success",
    latencyMs: 198,
    inputArgs: { workspace_id: "ws_m4p9q", include_members: false },
    outputTokens: 583,
    createdAt: "2026-02-22T08:31:44Z",
  },
  {
    id: "tcl_v1j3k",
    requestId: "req_u5g3l",
    tool: "generate_chart",
    status: "failed",
    latencyMs: 4_200,
    inputArgs: {
      chart_type: "timeseries",
      metric: "active_members",
      group_by: "organization",
    },
    errorMessage:
      "Chart generation service returned 500 — R2 bucket read timeout on chart-templates/timeseries-base.json",
    createdAt: "2026-02-25T14:51:07Z",
  },
  {
    id: "tcl_w7n5m",
    requestId: "req_l3p8q",
    tool: "validate_query",
    status: "timeout",
    latencyMs: 5_000,
    inputArgs: {
      sql: "SELECT * FROM events JOIN members ON events.actor_id = members.id WHERE events.type = 'login'",
    },
    errorMessage: "Validation tool exceeded 5s timeout — query planner unresponsive",
    createdAt: "2026-02-24T17:13:55Z",
  },
  {
    id: "tcl_x3p1r",
    requestId: "req_w3c7p",
    tool: "search_entities",
    status: "success",
    latencyMs: 334,
    inputArgs: {
      entity_type: "pipeline",
      environment: "data-processing",
      min_members: 50,
    },
    outputTokens: 1_841,
    createdAt: "2026-02-26T07:58:34Z",
  },
  {
    id: "tcl_y6q2t",
    requestId: "req_r5f1z",
    tool: "search_entities",
    status: "failed",
    latencyMs: 3_800,
    inputArgs: {
      entity_type: "pipeline",
      environment: "data-processing",
      min_members: 50,
    },
    errorMessage:
      "Tool execution aborted — parent request timeout exceeded before tool result could be incorporated",
    createdAt: "2026-02-26T08:54:29Z",
  },
  {
    id: "tcl_z8h4s",
    requestId: "req_c6h7n",
    tool: "search_entities",
    status: "success",
    latencyMs: 261,
    inputArgs: { entity_type: "member", workspace: "prism", limit: 100 },
    outputTokens: 2_341,
    createdAt: "2026-02-23T10:07:18Z",
  },
  {
    id: "tcl_a2m7b",
    requestId: "req_j6e8s",
    tool: "fetch_report",
    status: "success",
    latencyMs: 147,
    inputArgs: { report_uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", format: "json" },
    outputTokens: 618,
    createdAt: "2026-02-25T16:12:48Z",
  },
];

// ---------------------------------------------------------------------------
// Dataset 6: SQL Queries — Text-to-SQL history (15 records)
// Distributions: ~60% executed, ~20% generated (not yet run), ~13% query_error,
//                ~5% schema_mismatch, ~2% timeout
// ---------------------------------------------------------------------------

export const sqlQueries: SqlQuery[] = [
  {
    id: "sql_b4n9s",
    requestId: "req_o9k4n",
    naturalLanguageQuery: "How many datasets were created per organization last month?",
    generatedSql:
      "SELECT org_id, COUNT(*) AS dataset_count\nFROM datasets\nWHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'\nGROUP BY org_id\nORDER BY dataset_count DESC;",
    status: "executed",
    executionMs: 1_413,
    rowsReturned: 47,
    tablesReferenced: ["datasets"],
    confidenceScore: 0.91,
    createdAt: "2026-02-25T11:28:33Z",
  },
  // Edge case: real SQL error — relation does not exist
  {
    id: "sql_k7m3p",
    requestId: "req_p7n3w",
    naturalLanguageQuery:
      "Show me all active subscription plans with more than 500 subscribers",
    generatedSql:
      "SELECT plan_name, subscriber_count, monthly_price\nFROM subscription_plans\nWHERE subscriber_count > 500 AND status = 'active'\nORDER BY subscriber_count DESC;",
    status: "query_error",
    executionMs: 28,
    rowsReturned: null,
    tablesReferenced: ["subscription_plans"],
    confidenceScore: 0.67,
    dbErrorMessage:
      'ERROR: relation "subscription_plans" does not exist\nLINE 3: FROM subscription_plans\n             ^\nHINT: Did you mean "subscriptions" or "billing_plans"?',
    createdAt: "2026-02-26T09:31:44Z",
  },
  {
    id: "sql_r1x6t",
    requestId: "req_h4k9m",
    naturalLanguageQuery:
      "Which integrations were enabled in the last 30 days by organization?",
    generatedSql:
      "SELECT o.name AS org_name, i.integration_type, i.enabled_at\nFROM integrations i\nJOIN organizations o ON i.org_id = o.id\nWHERE i.enabled_at >= NOW() - INTERVAL '30 days'\nORDER BY i.enabled_at DESC;",
    status: "executed",
    executionMs: 847,
    rowsReturned: 23,
    tablesReferenced: ["integrations", "organizations"],
    confidenceScore: 0.94,
    createdAt: "2026-02-26T09:47:13Z",
  },
  {
    id: "sql_m4j8w",
    requestId: "req_a8s2r",
    naturalLanguageQuery: "Count members per workspace grouped by role",
    generatedSql:
      "SELECT w.slug AS workspace, m.role, COUNT(m.id) AS member_count\nFROM workspace_members m\nJOIN workspaces w ON m.workspace_id = w.id\nGROUP BY w.slug, m.role\nORDER BY w.slug, m.role;",
    status: "executed",
    executionMs: 512,
    rowsReturned: 84,
    tablesReferenced: ["workspace_members", "workspaces"],
    confidenceScore: 0.96,
    createdAt: "2026-02-24T14:22:41Z",
  },
  {
    id: "sql_q9v2n",
    requestId: "req_v7m1w",
    naturalLanguageQuery:
      "List API keys created more than 90 days ago that have not been rotated",
    generatedSql:
      "SELECT key_id, org_id, created_at, last_rotated_at\nFROM api_keys\nWHERE created_at < NOW() - INTERVAL '90 days'\n  AND (last_rotated_at IS NULL OR last_rotated_at < created_at + INTERVAL '90 days')\nORDER BY created_at ASC;",
    status: "executed",
    executionMs: 1_087,
    rowsReturned: 12,
    tablesReferenced: ["api_keys"],
    confidenceScore: 0.88,
    createdAt: "2026-02-24T19:44:02Z",
  },
  {
    id: "sql_c2p7r",
    requestId: "req_j6e8s",
    naturalLanguageQuery:
      "What are the top 10 most active webhooks by event volume this month?",
    generatedSql:
      "SELECT w.id, w.endpoint_url, COUNT(e.id) AS events_dispatched\nFROM webhook_events e\nJOIN webhooks w ON e.webhook_id = w.id\nWHERE e.created_at >= DATE_TRUNC('month', NOW())\nGROUP BY w.id, w.endpoint_url\nORDER BY events_dispatched DESC\nLIMIT 10;",
    status: "executed",
    executionMs: 724,
    rowsReturned: 10,
    tablesReferenced: ["webhook_events", "webhooks"],
    confidenceScore: 0.93,
    createdAt: "2026-02-25T16:12:48Z",
  },
  {
    id: "sql_f5h1q",
    requestId: "req_m8x4q",
    naturalLanguageQuery:
      "How many members per organization have logged in within the last 7 days?",
    generatedSql:
      "SELECT o.name, COUNT(DISTINCT m.user_id) AS active_members\nFROM member_sessions ms\nJOIN members m ON ms.member_id = m.id\nJOIN organizations o ON m.org_id = o.id\nWHERE ms.created_at >= NOW() - INTERVAL '7 days'\nGROUP BY o.name\nORDER BY active_members DESC;",
    status: "executed",
    executionMs: 1_342,
    rowsReturned: 31,
    tablesReferenced: ["member_sessions", "members", "organizations"],
    confidenceScore: 0.89,
    createdAt: "2026-02-26T08:43:17Z",
  },
  {
    id: "sql_n8b3k",
    requestId: "req_c6h7n",
    naturalLanguageQuery:
      "Show open issues assigned to any member of the Prism workspace",
    generatedSql:
      "SELECT i.id, i.title, i.status, i.assignee_id, m.email\nFROM issues i\nJOIN members m ON i.assignee_id = m.id\nJOIN workspace_members wm ON m.id = wm.member_id\nJOIN workspaces w ON wm.workspace_id = w.id\nWHERE w.slug = 'prism' AND i.status = 'open';",
    status: "generated",
    executionMs: null,
    rowsReturned: null,
    tablesReferenced: ["issues", "members", "workspace_members", "workspaces"],
    confidenceScore: 0.85,
    createdAt: "2026-02-23T10:07:18Z",
  },
  {
    id: "sql_s3w9m",
    requestId: "req_e4t5k",
    naturalLanguageQuery:
      "List members who have not logged in for more than 30 days but whose subscription is still active",
    generatedSql:
      "SELECT m.id, m.email, s.plan, s.status, MAX(ms.created_at) AS last_login\nFROM members m\nJOIN subscriptions s ON m.org_id = s.org_id\nLEFT JOIN member_sessions ms ON m.id = ms.member_id\nWHERE s.status = 'active'\nGROUP BY m.id, m.email, s.plan, s.status\nHAVING MAX(ms.created_at) < NOW() - INTERVAL '30 days' OR MAX(ms.created_at) IS NULL;",
    status: "executed",
    executionMs: 2_187,
    rowsReturned: 19,
    tablesReferenced: ["members", "subscriptions", "member_sessions"],
    confidenceScore: 0.82,
    createdAt: "2026-02-22T08:31:44Z",
  },
  {
    id: "sql_u6t4p",
    requestId: "req_x2f9t",
    naturalLanguageQuery:
      "Find webhooks that have failed more than 5 times in the last 24 hours",
    generatedSql:
      "SELECT w.id, w.endpoint_url, COUNT(e.id) AS failed_deliveries\nFROM webhook_events e\nJOIN webhooks w ON e.webhook_id = w.id\nWHERE e.status = 'failed'\n  AND e.created_at >= NOW() - INTERVAL '24 hours'\nGROUP BY w.id, w.endpoint_url\nHAVING COUNT(e.id) > 5\nORDER BY failed_deliveries DESC;",
    status: "executed",
    executionMs: 893,
    rowsReturned: 4,
    tablesReferenced: ["webhook_events", "webhooks"],
    confidenceScore: 0.97,
    createdAt: "2026-02-25T15:37:19Z",
  },
  {
    id: "sql_w9n1r",
    requestId: "req_u5g3l",
    naturalLanguageQuery:
      "Show environments grouped by type across all organizations with their pipeline count",
    generatedSql:
      "SELECT env_type, COUNT(DISTINCT e.id) AS env_count, COUNT(p.id) AS pipeline_count\nFROM environments e\nLEFT JOIN pipelines p ON p.environment_id = e.id\nGROUP BY env_type\nORDER BY env_count DESC;",
    status: "schema_mismatch",
    executionMs: 41,
    rowsReturned: null,
    tablesReferenced: ["environments", "pipelines"],
    confidenceScore: 0.71,
    dbErrorMessage:
      'ERROR: column e.env_type does not exist\nLINE 1: SELECT env_type, COUNT...\nHINT: Column is named "environment_type" in the environments table.',
    createdAt: "2026-02-25T14:51:07Z",
  },
  {
    id: "sql_y2q8s",
    requestId: "req_l3p8q",
    naturalLanguageQuery:
      "Show me login events for all members in the last 7 days grouped by day",
    generatedSql:
      "SELECT DATE(created_at) AS login_date, COUNT(*) AS login_count\nFROM member_sessions\nWHERE created_at >= NOW() - INTERVAL '7 days'\nGROUP BY DATE(created_at)\nORDER BY login_date;",
    status: "timeout",
    executionMs: null,
    rowsReturned: null,
    tablesReferenced: ["member_sessions"],
    confidenceScore: 0.95,
    dbErrorMessage: "Query execution timeout after 30s — member_sessions table missing index on created_at",
    createdAt: "2026-02-24T17:13:55Z",
  },
  {
    id: "sql_z4k7v",
    requestId: "req_t2b8v",
    naturalLanguageQuery:
      "List all workspaces created in the last quarter with their owner details",
    generatedSql:
      "SELECT w.id, w.slug, w.name, w.created_at, u.email AS owner_email\nFROM workspaces w\nJOIN users u ON w.owner_id = u.id\nWHERE w.created_at >= DATE_TRUNC('quarter', NOW()) - INTERVAL '3 months'\nORDER BY w.created_at DESC;",
    status: "executed",
    executionMs: 387,
    rowsReturned: 68,
    tablesReferenced: ["workspaces", "users"],
    confidenceScore: 0.93,
    createdAt: "2026-02-26T09:18:02Z",
  },
  {
    id: "sql_b1m6p",
    requestId: "req_w3c7p",
    naturalLanguageQuery:
      "Which organizations have pipelines in more than 3 environments?",
    generatedSql:
      "SELECT o.name, COUNT(DISTINCT p.environment_id) AS env_count\nFROM pipelines p\nJOIN environments e ON p.environment_id = e.id\nJOIN organizations o ON e.org_id = o.id\nGROUP BY o.name\nHAVING COUNT(DISTINCT p.environment_id) > 3\nORDER BY env_count DESC;",
    status: "generated",
    executionMs: null,
    rowsReturned: null,
    tablesReferenced: ["pipelines", "environments", "organizations"],
    confidenceScore: 0.87,
    createdAt: "2026-02-26T07:58:34Z",
  },
  {
    id: "sql_d3r9q",
    requestId: "req_k9j5r",
    naturalLanguageQuery:
      "Show report generation counts per user over the last 60 days",
    generatedSql:
      "SELECT u.email, COUNT(r.id) AS reports_generated\nFROM reports r\nJOIN users u ON r.created_by = u.id\nWHERE r.created_at >= NOW() - INTERVAL '60 days'\nGROUP BY u.email\nORDER BY reports_generated DESC\nLIMIT 25;",
    status: "executed",
    executionMs: 614,
    rowsReturned: 25,
    tablesReferenced: ["reports", "users"],
    confidenceScore: 0.91,
    createdAt: "2026-02-26T08:29:51Z",
  },
];

// ---------------------------------------------------------------------------
// Gateway Stats — KPI card data
// ---------------------------------------------------------------------------

export const gatewayStats: GatewayStats = {
  totalRequests: 284_731,
  requestsChange: 12.4,
  totalTokens: 847_293_441,
  tokensChange: 18.7,
  totalCostUsd: 1_247.83,
  costChange: 14.2,
  cacheHitRate: 24.8,
  cacheHitRateChange: 3.1,
  errorRate: 4.7,
  errorRateChange: -1.8,
  p95LatencyMs: 1_847,
  p95LatencyChange: -8.3,
  activeIndexes: 4,
  activeIndexesChange: 0,
};

// ---------------------------------------------------------------------------
// Chart Data 1: DailyMetrics — 90 days of daily gateway activity
// Today = 2026-02-26. Start = 2025-11-28 (90 days ago).
// Weekday pattern: 1,800–3,200 requests. Weekend: 80–240.
// Gradual growth trend in requests and tokens over the 90-day window.
// ---------------------------------------------------------------------------

export const dailyMetrics: DailyMetrics[] = [
  // Week 1 — late Nov 2025 (post-Thanksgiving US weekend dip)
  { date: "2025-11-28", dayLabel: "Fri", requests: 1_842, inputTokens: 3_247_841, outputTokens: 712_394, costUsd: 4.84, cacheHitRate: 18.2, p50Ms: 512, p95Ms: 1_487, p99Ms: 3_241, errors: 87 },
  { date: "2025-11-29", dayLabel: "Sat", requests: 94, inputTokens: 167_412, outputTokens: 36_847, costUsd: 0.25, cacheHitRate: 31.4, p50Ms: 441, p95Ms: 1_142, p99Ms: 2_487, errors: 4 },
  { date: "2025-11-30", dayLabel: "Sun", requests: 112, inputTokens: 198_347, outputTokens: 43_218, costUsd: 0.29, cacheHitRate: 28.7, p50Ms: 458, p95Ms: 1_218, p99Ms: 2_614, errors: 5 },
  { date: "2025-12-01", dayLabel: "Mon", requests: 2_147, inputTokens: 3_784_291, outputTokens: 831_478, costUsd: 5.63, cacheHitRate: 19.4, p50Ms: 498, p95Ms: 1_524, p99Ms: 3_187, errors: 102 },
  { date: "2025-12-02", dayLabel: "Tue", requests: 2_384, inputTokens: 4_208_347, outputTokens: 924_871, costUsd: 6.27, cacheHitRate: 20.1, p50Ms: 487, p95Ms: 1_498, p99Ms: 3_142, errors: 113 },
  { date: "2025-12-03", dayLabel: "Wed", requests: 2_291, inputTokens: 4_047_182, outputTokens: 888_347, costUsd: 6.02, cacheHitRate: 21.3, p50Ms: 492, p95Ms: 1_512, p99Ms: 3_214, errors: 108 },
  { date: "2025-12-04", dayLabel: "Thu", requests: 2_418, inputTokens: 4_272_841, outputTokens: 937_218, costUsd: 6.35, cacheHitRate: 20.8, p50Ms: 484, p95Ms: 1_487, p99Ms: 3_098, errors: 116 },
  // Week 2
  { date: "2025-12-05", dayLabel: "Fri", requests: 2_184, inputTokens: 3_858_472, outputTokens: 847_391, costUsd: 5.74, cacheHitRate: 22.4, p50Ms: 501, p95Ms: 1_542, p99Ms: 3_287, errors: 98 },
  { date: "2025-12-06", dayLabel: "Sat", requests: 138, inputTokens: 244_187, outputTokens: 53_841, costUsd: 0.36, cacheHitRate: 29.8, p50Ms: 447, p95Ms: 1_187, p99Ms: 2_541, errors: 7 },
  { date: "2025-12-07", dayLabel: "Sun", requests: 121, inputTokens: 214_387, outputTokens: 47_218, costUsd: 0.32, cacheHitRate: 27.4, p50Ms: 462, p95Ms: 1_241, p99Ms: 2_698, errors: 6 },
  { date: "2025-12-08", dayLabel: "Mon", requests: 2_387, inputTokens: 4_218_471, outputTokens: 927_384, costUsd: 6.28, cacheHitRate: 20.7, p50Ms: 489, p95Ms: 1_512, p99Ms: 3_187, errors: 108 },
  { date: "2025-12-09", dayLabel: "Tue", requests: 2_514, inputTokens: 4_441_287, outputTokens: 974_841, costUsd: 6.61, cacheHitRate: 21.4, p50Ms: 481, p95Ms: 1_487, p99Ms: 3_142, errors: 119 },
  { date: "2025-12-10", dayLabel: "Wed", requests: 2_447, inputTokens: 4_318_472, outputTokens: 947_391, costUsd: 6.43, cacheHitRate: 22.1, p50Ms: 494, p95Ms: 1_524, p99Ms: 3_241, errors: 112 },
  { date: "2025-12-11", dayLabel: "Thu", requests: 2_587, inputTokens: 4_567_841, outputTokens: 1_002_384, costUsd: 6.79, cacheHitRate: 21.8, p50Ms: 479, p95Ms: 1_471, p99Ms: 3_098, errors: 122 },
  // Week 3 — mid Dec
  { date: "2025-12-12", dayLabel: "Fri", requests: 2_314, inputTokens: 4_087_341, outputTokens: 897_218, costUsd: 6.08, cacheHitRate: 23.2, p50Ms: 507, p95Ms: 1_558, p99Ms: 3_314, errors: 104 },
  { date: "2025-12-13", dayLabel: "Sat", requests: 147, inputTokens: 259_841, outputTokens: 57_218, costUsd: 0.39, cacheHitRate: 30.4, p50Ms: 438, p95Ms: 1_147, p99Ms: 2_487, errors: 7 },
  { date: "2025-12-14", dayLabel: "Sun", requests: 134, inputTokens: 237_412, outputTokens: 52_184, costUsd: 0.35, cacheHitRate: 28.1, p50Ms: 451, p95Ms: 1_198, p99Ms: 2_614, errors: 6 },
  { date: "2025-12-15", dayLabel: "Mon", requests: 2_618, inputTokens: 4_621_847, outputTokens: 1_014_287, costUsd: 6.87, cacheHitRate: 22.3, p50Ms: 482, p95Ms: 1_498, p99Ms: 3_187, errors: 118 },
  { date: "2025-12-16", dayLabel: "Tue", requests: 2_741, inputTokens: 4_837_412, outputTokens: 1_061_847, costUsd: 7.19, cacheHitRate: 22.8, p50Ms: 474, p95Ms: 1_471, p99Ms: 3_142, errors: 128 },
  { date: "2025-12-17", dayLabel: "Wed", requests: 2_684, inputTokens: 4_738_472, outputTokens: 1_040_391, costUsd: 7.04, cacheHitRate: 23.1, p50Ms: 487, p95Ms: 1_512, p99Ms: 3_241, errors: 124 },
  { date: "2025-12-18", dayLabel: "Thu", requests: 2_847, inputTokens: 5_028_471, outputTokens: 1_102_384, costUsd: 7.47, cacheHitRate: 22.7, p50Ms: 471, p95Ms: 1_458, p99Ms: 3_098, errors: 133 },
  // Week 4 — pre-Christmas slowdown
  { date: "2025-12-19", dayLabel: "Fri", requests: 2_184, inputTokens: 3_858_472, outputTokens: 847_391, costUsd: 5.74, cacheHitRate: 24.8, p50Ms: 512, p95Ms: 1_587, p99Ms: 3_387, errors: 97 },
  { date: "2025-12-20", dayLabel: "Sat", requests: 118, inputTokens: 208_841, outputTokens: 45_841, costUsd: 0.31, cacheHitRate: 32.1, p50Ms: 431, p95Ms: 1_118, p99Ms: 2_441, errors: 5 },
  { date: "2025-12-21", dayLabel: "Sun", requests: 104, inputTokens: 184_387, outputTokens: 40_418, costUsd: 0.27, cacheHitRate: 30.7, p50Ms: 442, p95Ms: 1_152, p99Ms: 2_541, errors: 5 },
  { date: "2025-12-22", dayLabel: "Mon", requests: 1_987, inputTokens: 3_510_412, outputTokens: 770_218, costUsd: 5.21, cacheHitRate: 24.1, p50Ms: 504, p95Ms: 1_558, p99Ms: 3_287, errors: 88 },
  { date: "2025-12-23", dayLabel: "Tue", requests: 1_742, inputTokens: 3_077_841, outputTokens: 675_387, costUsd: 4.57, cacheHitRate: 25.8, p50Ms: 518, p95Ms: 1_614, p99Ms: 3_441, errors: 78 },
  { date: "2025-12-24", dayLabel: "Wed", requests: 847, inputTokens: 1_498_472, outputTokens: 328_841, costUsd: 2.23, cacheHitRate: 27.4, p50Ms: 487, p95Ms: 1_487, p99Ms: 3_142, errors: 38 },
  { date: "2025-12-25", dayLabel: "Thu", requests: 183, inputTokens: 323_441, outputTokens: 70_984, costUsd: 0.48, cacheHitRate: 35.2, p50Ms: 421, p95Ms: 1_087, p99Ms: 2_387, errors: 8 },
  { date: "2025-12-26", dayLabel: "Fri", requests: 412, inputTokens: 728_347, outputTokens: 159_841, costUsd: 1.08, cacheHitRate: 31.4, p50Ms: 448, p95Ms: 1_187, p99Ms: 2_541, errors: 19 },
  { date: "2025-12-27", dayLabel: "Sat", requests: 147, inputTokens: 259_841, outputTokens: 57_218, costUsd: 0.39, cacheHitRate: 33.7, p50Ms: 433, p95Ms: 1_132, p99Ms: 2_487, errors: 7 },
  { date: "2025-12-28", dayLabel: "Sun", requests: 128, inputTokens: 226_347, outputTokens: 49_684, costUsd: 0.34, cacheHitRate: 31.8, p50Ms: 447, p95Ms: 1_187, p99Ms: 2_614, errors: 6 },
  { date: "2025-12-29", dayLabel: "Mon", requests: 1_284, inputTokens: 2_268_472, outputTokens: 497_841, costUsd: 3.37, cacheHitRate: 26.4, p50Ms: 498, p95Ms: 1_541, p99Ms: 3_287, errors: 57 },
  { date: "2025-12-30", dayLabel: "Tue", requests: 1_487, inputTokens: 2_626_841, outputTokens: 576_387, costUsd: 3.90, cacheHitRate: 25.8, p50Ms: 491, p95Ms: 1_512, p99Ms: 3_214, errors: 67 },
  { date: "2025-12-31", dayLabel: "Wed", requests: 987, inputTokens: 1_743_847, outputTokens: 382_618, costUsd: 2.59, cacheHitRate: 27.1, p50Ms: 482, p95Ms: 1_487, p99Ms: 3_142, errors: 43 },
  // Jan 2026 — post-holiday ramp-up + new year budget release
  { date: "2026-01-01", dayLabel: "Thu", requests: 214, inputTokens: 378_441, outputTokens: 83_018, costUsd: 0.56, cacheHitRate: 34.8, p50Ms: 418, p95Ms: 1_082, p99Ms: 2_387, errors: 9 },
  { date: "2026-01-02", dayLabel: "Fri", requests: 1_847, inputTokens: 3_262_841, outputTokens: 715_818, costUsd: 4.85, cacheHitRate: 23.4, p50Ms: 497, p95Ms: 1_524, p99Ms: 3_241, errors: 82 },
  { date: "2026-01-03", dayLabel: "Sat", requests: 147, inputTokens: 259_841, outputTokens: 57_018, costUsd: 0.38, cacheHitRate: 31.2, p50Ms: 441, p95Ms: 1_141, p99Ms: 2_487, errors: 6 },
  { date: "2026-01-04", dayLabel: "Sun", requests: 128, inputTokens: 226_347, outputTokens: 49_618, costUsd: 0.34, cacheHitRate: 29.8, p50Ms: 454, p95Ms: 1_198, p99Ms: 2_614, errors: 6 },
  { date: "2026-01-05", dayLabel: "Mon", requests: 2_418, inputTokens: 4_272_841, outputTokens: 937_418, costUsd: 6.35, cacheHitRate: 21.8, p50Ms: 487, p95Ms: 1_498, p99Ms: 3_187, errors: 114 },
  { date: "2026-01-06", dayLabel: "Tue", requests: 2_614, inputTokens: 4_618_472, outputTokens: 1_013_818, costUsd: 6.86, cacheHitRate: 22.4, p50Ms: 479, p95Ms: 1_471, p99Ms: 3_142, errors: 121 },
  { date: "2026-01-07", dayLabel: "Wed", requests: 2_587, inputTokens: 4_567_841, outputTokens: 1_001_618, costUsd: 6.79, cacheHitRate: 22.9, p50Ms: 482, p95Ms: 1_487, p99Ms: 3_214, errors: 119 },
  { date: "2026-01-08", dayLabel: "Thu", requests: 2_741, inputTokens: 4_837_412, outputTokens: 1_061_618, costUsd: 7.18, cacheHitRate: 22.1, p50Ms: 474, p95Ms: 1_458, p99Ms: 3_098, errors: 129 },
  { date: "2026-01-09", dayLabel: "Fri", requests: 2_484, inputTokens: 4_388_472, outputTokens: 962_418, costUsd: 6.52, cacheHitRate: 23.7, p50Ms: 494, p95Ms: 1_524, p99Ms: 3_287, errors: 111 },
  { date: "2026-01-10", dayLabel: "Sat", requests: 162, inputTokens: 286_347, outputTokens: 62_818, costUsd: 0.43, cacheHitRate: 30.8, p50Ms: 437, p95Ms: 1_142, p99Ms: 2_487, errors: 7 },
  { date: "2026-01-11", dayLabel: "Sun", requests: 143, inputTokens: 252_841, outputTokens: 55_418, costUsd: 0.38, cacheHitRate: 28.4, p50Ms: 451, p95Ms: 1_198, p99Ms: 2_614, errors: 6 },
  { date: "2026-01-12", dayLabel: "Mon", requests: 2_847, inputTokens: 5_028_471, outputTokens: 1_102_618, costUsd: 7.46, cacheHitRate: 22.7, p50Ms: 471, p95Ms: 1_447, p99Ms: 3_087, errors: 134 },
  { date: "2026-01-13", dayLabel: "Tue", requests: 2_984, inputTokens: 5_270_841, outputTokens: 1_155_618, costUsd: 7.82, cacheHitRate: 23.1, p50Ms: 464, p95Ms: 1_431, p99Ms: 3_042, errors: 140 },
  { date: "2026-01-14", dayLabel: "Wed", requests: 2_918, inputTokens: 5_154_472, outputTokens: 1_130_418, costUsd: 7.65, cacheHitRate: 23.4, p50Ms: 468, p95Ms: 1_441, p99Ms: 3_098, errors: 137 },
  { date: "2026-01-15", dayLabel: "Thu", requests: 3_047, inputTokens: 5_381_841, outputTokens: 1_180_618, costUsd: 7.97, cacheHitRate: 22.8, p50Ms: 461, p95Ms: 1_421, p99Ms: 3_014, errors: 144 },
  { date: "2026-01-16", dayLabel: "Fri", requests: 2_784, inputTokens: 4_918_472, outputTokens: 1_078_418, costUsd: 7.29, cacheHitRate: 24.2, p50Ms: 477, p95Ms: 1_471, p99Ms: 3_142, errors: 128 },
  { date: "2026-01-17", dayLabel: "Sat", requests: 178, inputTokens: 314_547, outputTokens: 68_918, costUsd: 0.47, cacheHitRate: 31.4, p50Ms: 434, p95Ms: 1_132, p99Ms: 2_487, errors: 8 },
  { date: "2026-01-18", dayLabel: "Sun", requests: 154, inputTokens: 272_047, outputTokens: 59_618, costUsd: 0.40, cacheHitRate: 29.1, p50Ms: 448, p95Ms: 1_187, p99Ms: 2_614, errors: 7 },
  // Mid-Jan MLK day dip then ramp
  { date: "2026-01-19", dayLabel: "Mon", requests: 1_947, inputTokens: 3_440_841, outputTokens: 754_618, costUsd: 5.10, cacheHitRate: 24.8, p50Ms: 498, p95Ms: 1_541, p99Ms: 3_287, errors: 87 },
  { date: "2026-01-20", dayLabel: "Tue", requests: 2_984, inputTokens: 5_270_841, outputTokens: 1_155_618, costUsd: 7.81, cacheHitRate: 23.4, p50Ms: 462, p95Ms: 1_431, p99Ms: 3_042, errors: 141 },
  { date: "2026-01-21", dayLabel: "Wed", requests: 3_084, inputTokens: 5_447_812, outputTokens: 1_194_418, costUsd: 8.07, cacheHitRate: 23.8, p50Ms: 458, p95Ms: 1_421, p99Ms: 3_014, errors: 145 },
  { date: "2026-01-22", dayLabel: "Thu", requests: 3_147, inputTokens: 5_559_441, outputTokens: 1_218_618, costUsd: 8.24, cacheHitRate: 23.2, p50Ms: 454, p95Ms: 1_407, p99Ms: 2_987, errors: 148 },
  { date: "2026-01-23", dayLabel: "Fri", requests: 2_914, inputTokens: 5_148_172, outputTokens: 1_128_618, costUsd: 7.64, cacheHitRate: 24.7, p50Ms: 467, p95Ms: 1_458, p99Ms: 3_098, errors: 131 },
  { date: "2026-01-24", dayLabel: "Sat", requests: 187, inputTokens: 330_547, outputTokens: 72_518, costUsd: 0.49, cacheHitRate: 32.1, p50Ms: 431, p95Ms: 1_121, p99Ms: 2_441, errors: 8 },
  { date: "2026-01-25", dayLabel: "Sun", requests: 162, inputTokens: 286_347, outputTokens: 62_718, costUsd: 0.42, cacheHitRate: 30.4, p50Ms: 444, p95Ms: 1_164, p99Ms: 2_541, errors: 7 },
  { date: "2026-01-26", dayLabel: "Mon", requests: 3_084, inputTokens: 5_447_812, outputTokens: 1_194_618, costUsd: 8.07, cacheHitRate: 23.9, p50Ms: 456, p95Ms: 1_414, p99Ms: 3_014, errors: 144 },
  { date: "2026-01-27", dayLabel: "Tue", requests: 3_184, inputTokens: 5_624_741, outputTokens: 1_232_418, costUsd: 8.33, cacheHitRate: 24.1, p50Ms: 452, p95Ms: 1_401, p99Ms: 2_987, errors: 150 },
  { date: "2026-01-28", dayLabel: "Wed", requests: 3_147, inputTokens: 5_559_441, outputTokens: 1_218_318, costUsd: 8.24, cacheHitRate: 24.4, p50Ms: 454, p95Ms: 1_407, p99Ms: 2_998, errors: 148 },
  { date: "2026-01-29", dayLabel: "Thu", requests: 3_214, inputTokens: 5_677_412, outputTokens: 1_243_918, costUsd: 8.41, cacheHitRate: 23.8, p50Ms: 449, p95Ms: 1_394, p99Ms: 2_974, errors: 152 },
  { date: "2026-01-30", dayLabel: "Fri", requests: 2_987, inputTokens: 5_278_441, outputTokens: 1_157_318, costUsd: 7.82, cacheHitRate: 25.1, p50Ms: 461, p95Ms: 1_441, p99Ms: 3_042, errors: 136 },
  { date: "2026-01-31", dayLabel: "Sat", requests: 198, inputTokens: 350_047, outputTokens: 76_718, costUsd: 0.52, cacheHitRate: 32.8, p50Ms: 428, p95Ms: 1_108, p99Ms: 2_414, errors: 8 },
  // Feb 2026 — continued growth + index issues affecting semantic-search-route
  { date: "2026-02-01", dayLabel: "Sun", requests: 174, inputTokens: 307_547, outputTokens: 67_418, costUsd: 0.46, cacheHitRate: 31.2, p50Ms: 441, p95Ms: 1_151, p99Ms: 2_514, errors: 7 },
  { date: "2026-02-02", dayLabel: "Mon", requests: 3_187, inputTokens: 5_629_841, outputTokens: 1_233_418, costUsd: 8.34, cacheHitRate: 24.2, p50Ms: 451, p95Ms: 1_401, p99Ms: 2_987, errors: 153 },
  { date: "2026-02-03", dayLabel: "Tue", requests: 3_247, inputTokens: 5_736_041, outputTokens: 1_256_518, costUsd: 8.50, cacheHitRate: 24.5, p50Ms: 447, p95Ms: 1_387, p99Ms: 2_964, errors: 156 },
  { date: "2026-02-04", dayLabel: "Wed", requests: 3_184, inputTokens: 5_624_741, outputTokens: 1_232_418, costUsd: 8.33, cacheHitRate: 24.8, p50Ms: 451, p95Ms: 1_401, p99Ms: 2_987, errors: 151 },
  { date: "2026-02-05", dayLabel: "Thu", requests: 3_214, inputTokens: 5_677_412, outputTokens: 1_243_718, costUsd: 8.41, cacheHitRate: 24.3, p50Ms: 449, p95Ms: 1_394, p99Ms: 2_974, errors: 153 },
  { date: "2026-02-06", dayLabel: "Fri", requests: 2_984, inputTokens: 5_270_841, outputTokens: 1_155_418, costUsd: 7.81, cacheHitRate: 25.4, p50Ms: 462, p95Ms: 1_441, p99Ms: 3_042, errors: 137 },
  { date: "2026-02-07", dayLabel: "Sat", requests: 204, inputTokens: 360_547, outputTokens: 79_018, costUsd: 0.53, cacheHitRate: 33.1, p50Ms: 426, p95Ms: 1_104, p99Ms: 2_401, errors: 9 },
  { date: "2026-02-08", dayLabel: "Sun", requests: 182, inputTokens: 321_647, outputTokens: 70_518, costUsd: 0.47, cacheHitRate: 31.7, p50Ms: 438, p95Ms: 1_147, p99Ms: 2_498, errors: 8 },
  { date: "2026-02-09", dayLabel: "Mon", requests: 3_284, inputTokens: 5_801_941, outputTokens: 1_271_418, costUsd: 8.59, cacheHitRate: 25.1, p50Ms: 446, p95Ms: 1_381, p99Ms: 2_951, errors: 158 },
  // Spike: index issues causing elevated errors on Feb 10-11
  { date: "2026-02-10", dayLabel: "Tue", requests: 3_147, inputTokens: 5_559_441, outputTokens: 1_218_218, costUsd: 8.42, cacheHitRate: 23.8, p50Ms: 521, p95Ms: 1_847, p99Ms: 4_012, errors: 287 },
  { date: "2026-02-11", dayLabel: "Wed", requests: 3_184, inputTokens: 5_624_741, outputTokens: 1_232_318, costUsd: 8.44, cacheHitRate: 22.4, p50Ms: 614, p95Ms: 2_184, p99Ms: 4_187, errors: 341 },
  { date: "2026-02-12", dayLabel: "Thu", requests: 3_214, inputTokens: 5_677_412, outputTokens: 1_243_618, costUsd: 8.51, cacheHitRate: 23.1, p50Ms: 487, p95Ms: 1_598, p99Ms: 3_487, errors: 201 },
  { date: "2026-02-13", dayLabel: "Fri", requests: 2_947, inputTokens: 5_206_441, outputTokens: 1_140_318, costUsd: 7.72, cacheHitRate: 24.8, p50Ms: 468, p95Ms: 1_458, p99Ms: 3_142, errors: 138 },
  { date: "2026-02-14", dayLabel: "Sat", requests: 218, inputTokens: 385_147, outputTokens: 84_418, costUsd: 0.57, cacheHitRate: 33.8, p50Ms: 424, p95Ms: 1_098, p99Ms: 2_387, errors: 9 },
  { date: "2026-02-15", dayLabel: "Sun", requests: 187, inputTokens: 330_547, outputTokens: 72_418, costUsd: 0.49, cacheHitRate: 32.1, p50Ms: 436, p95Ms: 1_141, p99Ms: 2_487, errors: 8 },
  { date: "2026-02-16", dayLabel: "Mon", requests: 3_147, inputTokens: 5_559_441, outputTokens: 1_217_918, costUsd: 8.24, cacheHitRate: 25.4, p50Ms: 449, p95Ms: 1_394, p99Ms: 2_974, errors: 142 },
  { date: "2026-02-17", dayLabel: "Tue", requests: 3_214, inputTokens: 5_677_412, outputTokens: 1_243_218, costUsd: 8.41, cacheHitRate: 25.7, p50Ms: 447, p95Ms: 1_387, p99Ms: 2_964, errors: 146 },
  { date: "2026-02-18", dayLabel: "Wed", requests: 3_284, inputTokens: 5_801_941, outputTokens: 1_270_918, costUsd: 8.59, cacheHitRate: 25.9, p50Ms: 444, p95Ms: 1_374, p99Ms: 2_941, errors: 150 },
  { date: "2026-02-19", dayLabel: "Thu", requests: 3_147, inputTokens: 5_559_441, outputTokens: 1_217_818, costUsd: 8.23, cacheHitRate: 26.2, p50Ms: 448, p95Ms: 1_387, p99Ms: 2_964, errors: 143 },
  { date: "2026-02-20", dayLabel: "Fri", requests: 2_914, inputTokens: 5_148_172, outputTokens: 1_128_218, costUsd: 7.64, cacheHitRate: 26.8, p50Ms: 461, p95Ms: 1_441, p99Ms: 3_042, errors: 127 },
  { date: "2026-02-21", dayLabel: "Sat", requests: 228, inputTokens: 402_847, outputTokens: 88_318, costUsd: 0.60, cacheHitRate: 34.2, p50Ms: 421, p95Ms: 1_091, p99Ms: 2_374, errors: 9 },
  { date: "2026-02-22", dayLabel: "Sun", requests: 198, inputTokens: 350_047, outputTokens: 76_618, costUsd: 0.52, cacheHitRate: 32.7, p50Ms: 433, p95Ms: 1_132, p99Ms: 2_487, errors: 8 },
  { date: "2026-02-23", dayLabel: "Mon", requests: 3_214, inputTokens: 5_677_412, outputTokens: 1_243_018, costUsd: 8.40, cacheHitRate: 26.1, p50Ms: 447, p95Ms: 1_381, p99Ms: 2_951, errors: 147 },
  { date: "2026-02-24", dayLabel: "Tue", requests: 3_284, inputTokens: 5_801_941, outputTokens: 1_270_718, costUsd: 8.58, cacheHitRate: 26.4, p50Ms: 444, p95Ms: 1_374, p99Ms: 2_941, errors: 149 },
  { date: "2026-02-25", dayLabel: "Wed", requests: 3_187, inputTokens: 5_629_841, outputTokens: 1_233_018, costUsd: 8.34, cacheHitRate: 26.7, p50Ms: 449, p95Ms: 1_387, p99Ms: 2_964, errors: 144 },
  // Today: partial day data (morning only)
  { date: "2026-02-26", dayLabel: "Thu", requests: 1_247, inputTokens: 2_202_841, outputTokens: 482_318, costUsd: 3.27, cacheHitRate: 27.1, p50Ms: 441, p95Ms: 1_367, p99Ms: 2_914, errors: 54 },
];

// ---------------------------------------------------------------------------
// Chart Data 2: Route Metrics — categorical breakdown by route
// ---------------------------------------------------------------------------

export const routeMetrics: RouteMetrics[] = [
  {
    routeName: "production-workers-ai",
    requests: 128_471,
    errors: 2_312,
    avgLatencyMs: 487,
    cacheHits: 31_892,
  },
  {
    routeName: "fallback-openai-gpt4o",
    requests: 14_284,
    errors: 414,
    avgLatencyMs: 812,
    cacheHits: 2_847,
  },
  {
    routeName: "embeddings-bge-base",
    requests: 87_412,
    errors: 350,
    avgLatencyMs: 189,
    cacheHits: 52_094,
  },
  {
    routeName: "text-to-sql-agent",
    requests: 18_247,
    errors: 1_296,
    avgLatencyMs: 1_284,
    cacheHits: 847,
  },
  {
    routeName: "semantic-search-route",
    requests: 24_184,
    errors: 3_463,
    avgLatencyMs: 614,
    cacheHits: 4_837,
  },
  {
    routeName: "mcp-tool-dispatcher",
    requests: 12_133,
    errors: 412,
    avgLatencyMs: 376,
    cacheHits: 1_947,
  },
];

// ---------------------------------------------------------------------------
// Chart Data 3: Model Token Usage breakdown
// ---------------------------------------------------------------------------

export const modelTokenUsage: ModelTokenUsage[] = [
  {
    model: "@cf/meta/llama-3-8b-instruct",
    inputTokens: 587_241_847,
    outputTokens: 128_472_318,
    costUsd: 874.32,
  },
  {
    model: "@cf/baai/bge-base-en-v1.5",
    inputTokens: 214_847_312,
    outputTokens: 0,
    costUsd: 107.42,
  },
  {
    model: "gpt-4o-mini",
    inputTokens: 32_418_471,
    outputTokens: 7_184_312,
    costUsd: 198.47,
  },
  {
    model: "@cf/mistral/mistral-7b-instruct-v0.2",
    inputTokens: 8_247_312,
    outputTokens: 1_847_312,
    costUsd: 41.24,
  },
  {
    model: "@cf/baai/bge-small-en-v1.5",
    inputTokens: 4_538_499,
    outputTokens: 0,
    costUsd: 13.62,
  },
  {
    model: "@cf/baai/bge-reranker-base",
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 12.76,
  },
];

// ---------------------------------------------------------------------------
// Chart Data 4: Index Health Snapshot
// ---------------------------------------------------------------------------

export const indexHealthSnapshots: IndexHealthSnapshot[] = [
  {
    indexName: "saas-entities-v2",
    coveragePct: 74.3,
    vectorCount: 284_712,
    avgSearchLatencyMs: 38,
    status: "partial",
  },
  {
    indexName: "product-terminology-en",
    coveragePct: 99.1,
    vectorCount: 48_219,
    avgSearchLatencyMs: 12,
    status: "ready",
  },
  {
    indexName: "user-docs-chunks",
    coveragePct: 91.8,
    vectorCount: 127_483,
    avgSearchLatencyMs: 24,
    status: "stale",
  },
  {
    indexName: "changelog-embeddings",
    coveragePct: 100.0,
    vectorCount: 9_847,
    avgSearchLatencyMs: 6,
    status: "ready",
  },
  {
    indexName: "support-kb-v3",
    coveragePct: 96.4,
    vectorCount: 73_128,
    avgSearchLatencyMs: 19,
    status: "drift_detected",
  },
  {
    indexName: "schema-metadata",
    coveragePct: 83.2,
    vectorCount: 3_412,
    avgSearchLatencyMs: 8,
    status: "indexing",
  },
];

// ---------------------------------------------------------------------------
// Chart Data 5: Tool Call Metrics breakdown
// ---------------------------------------------------------------------------

export const toolCallMetrics: ToolCallMetrics[] = [
  { tool: "search_entities", total: 4_847, success: 4_612, failed: 235, avgLatencyMs: 287 },
  { tool: "get_schema", total: 2_184, success: 2_147, failed: 37, avgLatencyMs: 118 },
  { tool: "execute_sql", total: 1_847, success: 1_634, failed: 213, avgLatencyMs: 1_413 },
  { tool: "generate_chart", total: 987, success: 841, failed: 146, avgLatencyMs: 2_847 },
  { tool: "list_integrations", total: 1_284, success: 1_241, failed: 43, avgLatencyMs: 198 },
  { tool: "resolve_workspace", total: 2_418, success: 2_374, failed: 44, avgLatencyMs: 247 },
  { tool: "fetch_report", total: 847, success: 798, failed: 49, avgLatencyMs: 143 },
  { tool: "validate_query", total: 418, success: 347, failed: 71, avgLatencyMs: 1_847 },
];

// ---------------------------------------------------------------------------
// Lookup helpers — downstream Feature Builder components use these
// ---------------------------------------------------------------------------

export const getRequestById = (id: string): Request | undefined =>
  requests.find((r) => r.id === id);

export const getTraceByRequestId = (requestId: string): Trace | undefined =>
  traces.find((t) => t.requestId === requestId);

export const getTraceById = (id: string): Trace | undefined =>
  traces.find((t) => t.id === id);

export const getIndexById = (id: string): VectorIndex | undefined =>
  vectorIndexes.find((i) => i.id === id);

export const getRouteById = (id: string): GatewayRoute | undefined =>
  gatewayRoutes.find((r) => r.id === id);

export const getToolCallsByRequestId = (requestId: string): ToolCall[] =>
  toolCalls.filter((t) => t.requestId === requestId);

export const getSqlQueriesByRequestId = (requestId: string): SqlQuery[] =>
  sqlQueries.filter((q) => q.requestId === requestId);

export const getRequestsByStatus = (status: Request["status"]): Request[] =>
  requests.filter((r) => r.status === status);

export const getIndexesByStatus = (status: VectorIndex["status"]): VectorIndex[] =>
  vectorIndexes.filter((i) => i.status === status);

export const getRoutesByStatus = (status: GatewayRoute["status"]): GatewayRoute[] =>
  gatewayRoutes.filter((r) => r.status === status);

// ---------------------------------------------------------------------------
// Aggregate constants for filter UIs
// ---------------------------------------------------------------------------

export const REQUEST_STATUSES: Request["status"][] = [
  "success",
  "cached",
  "error",
  "rate_limited",
  "timeout",
  "model_unavailable",
];

export const INDEX_STATUSES: VectorIndex["status"][] = [
  "ready",
  "indexing",
  "stale",
  "partial",
  "failed",
  "drift_detected",
];

export const ROUTE_STATUSES: GatewayRoute["status"][] = [
  "active",
  "degraded",
  "fallback_active",
  "paused",
  "disabled",
];

export const SQL_QUERY_STATUSES: SqlQuery["status"][] = [
  "executed",
  "query_error",
  "schema_mismatch",
  "timeout",
  "generated",
];

export const TOOL_CALL_STATUSES: ToolCall["status"][] = [
  "success",
  "failed",
  "timeout",
  "schema_mismatch",
];
