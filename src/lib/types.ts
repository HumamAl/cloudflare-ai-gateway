import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Layout / Navigation
// ---------------------------------------------------------------------------

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// ---------------------------------------------------------------------------
// Challenge page types (Challenges Builder reads these)
// ---------------------------------------------------------------------------

export type VisualizationType =
  | "flow"
  | "before-after"
  | "metrics"
  | "architecture"
  | "risk-matrix"
  | "timeline"
  | "dual-kpi"
  | "tech-stack"
  | "decision-flow";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  visualizationType: VisualizationType;
  outcome?: string;
}

// ---------------------------------------------------------------------------
// Proposal page types (Proposal Builder reads these)
// ---------------------------------------------------------------------------

export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  approach: { title: string; description: string }[];
  skillCategories: { name: string; skills: string[] }[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  relevance?: string;
  outcome?: string;
  liveUrl?: string;
}

// ---------------------------------------------------------------------------
// Domain Status Unions — AI Gateway vocabulary
// ---------------------------------------------------------------------------

/** Outcome status of a request through the AI Gateway pipeline */
export type RequestStatus =
  | "success"
  | "cached"
  | "error"
  | "rate_limited"
  | "timeout"
  | "model_unavailable";

/** Health state of a Vectorize index */
export type IndexStatus =
  | "ready"
  | "indexing"
  | "stale"
  | "partial"
  | "failed"
  | "drift_detected";

/** Operational state of a configured gateway route */
export type RouteStatus =
  | "active"
  | "degraded"
  | "fallback_active"
  | "paused"
  | "disabled";

/** Outcome of an MCP server tool invocation */
export type ToolCallStatus =
  | "success"
  | "failed"
  | "timeout"
  | "schema_mismatch";

/** Status of a Text-to-SQL generated query */
export type SqlQueryStatus =
  | "executed"
  | "query_error"
  | "schema_mismatch"
  | "timeout"
  | "generated";

/** Cache disposition for a request */
export type CacheStatus = "hit" | "miss" | "bypass";

/** Cloudflare Workers AI embedding model identifiers */
export type EmbeddingModel =
  | "@cf/baai/bge-base-en-v1.5"
  | "@cf/baai/bge-small-en-v1.5";

/** Cloudflare Workers AI generation model identifiers */
export type GenerationModel =
  | "@cf/meta/llama-3-8b-instruct"
  | "@cf/mistral/mistral-7b-instruct-v0.2"
  | "gpt-4o-mini";

/** Reranker model identifier */
export type RerankerModel = "@cf/baai/bge-reranker-base";

/** Union of all model identifiers used in the pipeline */
export type ModelId = EmbeddingModel | GenerationModel | RerankerModel;

/** SaaS entity type resolved via semantic search */
export type SaasEntityType =
  | "workspace"
  | "organization"
  | "project"
  | "issue"
  | "member"
  | "integration"
  | "pipeline"
  | "environment"
  | "dataset"
  | "report"
  | "webhook"
  | "api_key";

/** Vectorize index names following Cloudflare lowercase-dash convention */
export type VectorIndexName =
  | "saas-entities-v2"
  | "product-terminology-en"
  | "user-docs-chunks"
  | "changelog-embeddings"
  | "support-kb-v3"
  | "schema-metadata";

/** Named gateway route slugs */
export type RouteSlug =
  | "production-workers-ai"
  | "fallback-openai-gpt4o"
  | "embeddings-bge-base"
  | "text-to-sql-agent"
  | "semantic-search-route"
  | "mcp-tool-dispatcher";

// ---------------------------------------------------------------------------
// Core Entity: Request
// Primary tracked record through the AI Gateway
// ---------------------------------------------------------------------------

export interface Request {
  /** Prefixed ID: "req_" + 5 alphanumeric chars */
  id: string;
  /** Links to a Trace record for full pipeline breakdown */
  traceId: string;
  /** Links to the VectorIndex used for retrieval */
  indexId: string;
  /** Route this request was dispatched through */
  routeId: string;
  /** Wall-clock latency for the full request */
  latencyMs: number;
  /** Tokens consumed from the input prompt */
  inputTokens: number;
  /** Tokens produced by the generation model */
  outputTokens: number;
  /** Total cost in USD to 4 decimal places */
  costUsd: number;
  /** Whether the response came from gateway cache */
  cacheStatus: CacheStatus;
  status: RequestStatus;
  /** Similarity score of the top retrieved chunk — 0.00 to 1.00 */
  similarityScore: number;
  /** Resolved SaaS entity type from semantic search */
  resolvedEntityType: SaasEntityType | null;
  /** Number of chunks retrieved above threshold */
  chunksRetrieved: number;
  /** Generation model used for this request */
  model: GenerationModel;
  /** User or service account that initiated the request */
  initiatedBy: string;
  /** Free-text error detail when status is "error" | "timeout" | "model_unavailable" */
  errorDetail?: string | null;
  /** True when the context window was filled to capacity */
  contextLengthExceeded?: boolean;
  /** ISO timestamp of request arrival */
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Core Entity: PipelineStage
// Individual stage within a request trace
// ---------------------------------------------------------------------------

export type PipelineStageType =
  | "embed"
  | "retrieve"
  | "rerank"
  | "generate"
  | "cache_lookup"
  | "tool_dispatch"
  | "sql_parse";

export interface PipelineStage {
  stage: PipelineStageType;
  /** Duration of this stage in milliseconds */
  durationMs: number;
  /** Model invoked at this stage, if any */
  model?: ModelId;
  /** Whether this stage hit the cache */
  cached: boolean;
  /** Tokens consumed at this stage (embed/generate stages) */
  tokens?: number;
  /** Stage-level status */
  status: "ok" | "error" | "skipped";
  /** Error message when status is "error" */
  error?: string;
}

// ---------------------------------------------------------------------------
// Core Entity: Trace
// Full pipeline execution record for one Request
// ---------------------------------------------------------------------------

export interface Trace {
  /** Prefixed ID: "trc_" + 5 alphanumeric chars */
  id: string;
  /** Parent Request.id */
  requestId: string;
  /** GatewayRoute.id this trace ran through */
  routeId: string;
  /** Ordered list of pipeline stages executed */
  stages: PipelineStage[];
  /** Total wall-clock duration (sum of stage durations + overhead) */
  totalMs: number;
  /** Embedding model used in the embed stage */
  embeddingModel: EmbeddingModel;
  /** Generation model used in the generate stage */
  generationModel: GenerationModel;
  /** Reranker applied, if any */
  rerankerModel: RerankerModel | null;
  /** Top similarity score from retrieval */
  topSimilarityScore: number;
  /** User prompt (truncated to 200 chars for display) */
  userPrompt: string;
  /** Brief summary of the generated response */
  responseSummary: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Core Entity: VectorIndex
// Cloudflare Vectorize index state
// ---------------------------------------------------------------------------

export interface VectorIndex {
  /** Prefixed ID: "idx_" + 5 alphanumeric chars */
  id: string;
  name: VectorIndexName;
  /** Human-readable description of index contents */
  description: string;
  status: IndexStatus;
  /** Total vectors stored */
  vectorCount: number;
  /** Total text chunks indexed */
  chunkCount: number;
  /** Percentage of the source corpus covered */
  coveragePct: number;
  /** Embedding model version this index was built with */
  embeddingModel: EmbeddingModel;
  /** ISO timestamp of last successful indexing run */
  lastIndexedAt: string;
  /** Scheduled next indexing run */
  nextScheduledAt: string | null;
  /** Average vector dimension size */
  dimensions: number;
  /** Index size on disk in MB */
  sizeMb: number;
  /** Average latency for a nearest-neighbor search */
  avgSearchLatencyMs: number;
  /** Present when status is "stale" or "drift_detected" */
  statusNote?: string;
}

// ---------------------------------------------------------------------------
// Core Entity: GatewayRoute
// Configured routing entry in the AI Gateway
// ---------------------------------------------------------------------------

export interface GatewayRoute {
  /** Prefixed ID: "rte_" + 5 alphanumeric chars */
  id: string;
  slug: RouteSlug;
  /** Display name for the route */
  name: string;
  status: RouteStatus;
  /** Primary model this route dispatches to */
  primaryModel: ModelId;
  /** Fallback model when primary is unavailable */
  fallbackModel: ModelId | null;
  /** Cache TTL in seconds (0 = no cache) */
  cacheTtlSeconds: number;
  /** Rate limit in requests per minute */
  rateLimitRpm: number;
  /** Requests served through this route today */
  requestsToday: number;
  /** Error rate for this route (0.00–1.00) */
  errorRate: number;
  /** p50 latency in ms over the last 24 hours */
  p50Ms: number;
  /** p95 latency in ms over the last 24 hours */
  p95Ms: number;
  /** Present when status is "degraded" or "fallback_active" */
  statusNote?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Core Entity: ToolCall
// MCP server tool invocation record
// ---------------------------------------------------------------------------

export type McpToolName =
  | "search_entities"
  | "get_schema"
  | "generate_chart"
  | "execute_sql"
  | "list_integrations"
  | "resolve_workspace"
  | "fetch_report"
  | "validate_query";

export interface ToolCall {
  /** Prefixed ID: "tcl_" + 5 alphanumeric chars */
  id: string;
  /** Parent Request.id */
  requestId: string;
  tool: McpToolName;
  status: ToolCallStatus;
  /** Wall-clock duration of the tool invocation */
  latencyMs: number;
  /** JSON-serialized input arguments (truncated display) */
  inputArgs: Record<string, unknown>;
  /** Output token count if applicable */
  outputTokens?: number;
  /** Present when status is "schema_mismatch" */
  schemaMismatchDetail?: string;
  /** Present when status is "failed" or "timeout" */
  errorMessage?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Core Entity: SqlQuery
// Text-to-SQL generated query record
// ---------------------------------------------------------------------------

export interface SqlQuery {
  /** Prefixed ID: "sql_" + 5 alphanumeric chars */
  id: string;
  /** Parent Request.id that triggered query generation */
  requestId: string;
  /** Natural language question that was parsed */
  naturalLanguageQuery: string;
  /** The SQL string produced by the Text-to-SQL agent */
  generatedSql: string;
  status: SqlQueryStatus;
  /** Execution time in ms (null if not yet executed) */
  executionMs: number | null;
  /** Number of rows returned (null if not executed or errored) */
  rowsReturned: number | null;
  /** Database table(s) referenced in the query */
  tablesReferenced: string[];
  /** Self-assessed accuracy confidence of the generated SQL — 0.00 to 1.00 */
  confidenceScore: number;
  /** Present when status is "query_error" */
  dbErrorMessage?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Dashboard Stats — GatewayStats
// Aggregate metrics for KPI stat cards
// ---------------------------------------------------------------------------

export interface GatewayStats {
  /** Total requests in the selected window */
  totalRequests: number;
  /** Percent change in requests vs prior period */
  requestsChange: number;
  /** Total tokens consumed (input + output) */
  totalTokens: number;
  tokensChange: number;
  /** Total cost in USD */
  totalCostUsd: number;
  costChange: number;
  /** Cache hit rate as a percentage — 0.00 to 100.00 */
  cacheHitRate: number;
  cacheHitRateChange: number;
  /** Error rate as a percentage */
  errorRate: number;
  errorRateChange: number;
  /** p95 latency across all requests in ms */
  p95LatencyMs: number;
  p95LatencyChange: number;
  /** Active Vectorize indexes */
  activeIndexes: number;
  activeIndexesChange: number;
}

// ---------------------------------------------------------------------------
// Chart Data Shapes
// ---------------------------------------------------------------------------

/** One day of gateway activity metrics — 90 days of daily data */
export interface DailyMetrics {
  /** ISO date string "YYYY-MM-DD" */
  date: string;
  /** Day-of-week label for display */
  dayLabel: string;
  /** Total requests (weekday vs weekend varies significantly) */
  requests: number;
  /** Input tokens consumed that day */
  inputTokens: number;
  /** Output tokens generated that day */
  outputTokens: number;
  /** Total cost for the day in USD */
  costUsd: number;
  /** Cache hit rate as a percentage */
  cacheHitRate: number;
  /** p50 latency in ms */
  p50Ms: number;
  /** p95 latency in ms */
  p95Ms: number;
  /** p99 latency in ms */
  p99Ms: number;
  /** Error count for the day */
  errors: number;
}

/** Request volume and error breakdown by route (categorical chart) */
export interface RouteMetrics {
  routeName: string;
  requests: number;
  errors: number;
  avgLatencyMs: number;
  cacheHits: number;
}

/** Token usage split by model (categorical chart) */
export interface ModelTokenUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

/** Index health snapshot for the indexes overview chart */
export interface IndexHealthSnapshot {
  indexName: string;
  coveragePct: number;
  vectorCount: number;
  avgSearchLatencyMs: number;
  status: IndexStatus;
}

/** Tool call success/failure breakdown (categorical chart) */
export interface ToolCallMetrics {
  tool: McpToolName;
  total: number;
  success: number;
  failed: number;
  avgLatencyMs: number;
}
