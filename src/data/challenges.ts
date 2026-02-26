import type { Challenge } from "@/lib/types";

export interface ExecutiveSummaryData {
  commonApproach: string;
  differentApproach: string;
  accentWord?: string;
}

export const executiveSummary: ExecutiveSummaryData = {
  commonApproach:
    "Most developers building AI search over a SaaS product wire the LLM directly to a generic schema prompt and call it done — which works fine until the model starts inventing field names, confusing workspace IDs with project IDs, or producing SQL that joins on the wrong foreign key. By the time those errors surface in production, the trust in the AI layer is already gone.",
  differentApproach:
    "I build a grounded retrieval layer first: every LLM call is preceded by a Vectorize semantic search that injects the correct entity context — field names, table relationships, and SaaS-specific vocabulary — before the model ever generates a query or a response. The Workers edge layer handles the orchestration so no context escapes to an external server.",
  accentWord: "grounded retrieval layer",
};

export const challenges: Challenge[] = [
  {
    id: "challenge-1",
    title: "Grounding LLM Responses in Proprietary SaaS Entity Context",
    description:
      "LLMs hallucinate entity IDs, field names, and table relationships when they have no schema context. For a SaaS product with non-obvious naming conventions — workspaces, pipelines, environments — the error rate on raw LLM calls typically runs 25-35%. The fix is a Vectorize RAG layer that retrieves schema context before every generation call.",
    visualizationType: "flow",
    outcome:
      "Could reduce hallucinated entity IDs and incorrect API calls from ~30% to under 5% by embedding SaaS terminology into the Vectorize index as a retrieval layer before every LLM call",
  },
  {
    id: "challenge-2",
    title: "Reliable Text-to-SQL Over a Production SaaS Schema",
    description:
      "Generic Text-to-SQL benchmarks claim 80-90% accuracy — but those benchmarks use public schemas with readable table names. A proprietary SaaS schema with tables like tbl_ws_pipeline_run or columns like ext_ref_entity_id drops that accuracy sharply without schema grounding. The solution is a dedicated text-to-sql-agent gateway route that injects schema metadata at the prompt layer.",
    visualizationType: "before-after",
    outcome:
      "Could replace ad-hoc manual SQL queries with natural-language queries that generate verifiable SQL — cutting analyst query time from hours to under 60 seconds per request",
  },
  {
    id: "challenge-3",
    title: "MCP Server Integration for Dynamic Chart Rendering",
    description:
      "The Anthropic Model Context Protocol defines an open standard for tool-calling — but wiring an MCP charting server into a Cloudflare Workers edge layer requires handling tool schema validation, dataset routing to the correct chart type, and serializing rendered output back through the gateway response pipeline. Each step can silently fail without proper error surfacing.",
    visualizationType: "architecture",
    outcome:
      "Could eliminate the manual export-then-chart workflow entirely by wiring the MCP charting server into the tool-calling response pipeline at the Worker edge",
  },
];
