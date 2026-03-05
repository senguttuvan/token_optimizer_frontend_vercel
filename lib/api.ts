const FUNCTION_URL =
  process.env.NEXT_PUBLIC_OPTIMIZER_URL ||
  "https://us-central1-claude-wrapper-2b76e.cloudfunctions.net/token_optimizer";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  id: string;
  model: string;
  choices: { message: { role: string; content: string }; finish_reason: string }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface CostBreakdown {
  rule_engine_saving_usd: number;
  model_switch_saving_usd: number;
  cache_saving_usd: number;
  total_cost_saved_usd: number;
  unoptimized_cost_usd: number;
  optimized_cost_usd: number;
}

export interface OptimizedSide {
  model: string;
  response: LLMResponse;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  cost_usd: number;
}

export interface OptimizerResult {
  unoptimized: OptimizedSide;
  optimized: OptimizedSide;
  savings: {
    tokens_saved: number;
    rule_engine_tokens_removed: number;
    model_downgraded: boolean;
    cache_hit: boolean;
    cost: CostBreakdown;
  };
}

export async function runOptimizer(
  model: string,
  systemPrompt: string,
  userMessage: string,
  temperature = 0.7,
  maxTokens = 512
): Promise<OptimizerResult> {
  const messages: Message[] = [];
  if (systemPrompt.trim()) {
    messages.push({ role: "system", content: systemPrompt.trim() });
  }
  messages.push({ role: "user", content: userMessage.trim() });

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as OptimizerResult;
}
