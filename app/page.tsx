"use client";

import { useState } from "react";
import { runOptimizer, type OptimizerResult } from "@/lib/api";
import MetricCard from "@/components/MetricCard";

const MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4"];

function fmt(n: number) {
  return n === 0 ? "$0.000000" : `$${n.toFixed(6)}`;
}

export default function Home() {
  const [model, setModel] = useState("gpt-4o");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizerResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userMessage.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runOptimizer(model, systemPrompt, userMessage);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const unoptContent = result?.unoptimized.response.choices?.[0]?.message?.content ?? "";
  const optContent   = result?.optimized.response.choices?.[0]?.message?.content ?? "";
  const cost         = result?.savings.cost;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold">T</div>
        <span className="text-lg font-semibold tracking-tight">LLM Token Optimizer</span>
        <span className="text-xs text-gray-500">v1</span>
        <a
          href="mailto:goodvibepublishing@gmail.com"
          className="ml-auto rounded-lg border border-gray-700 bg-gray-900 px-4 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          Give Feedback
        </a>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">

        {/* ── Input form ───────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium">Model</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || !userMessage.trim()}
              className="ml-auto rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Optimizing…" : "Run Optimizer →"}
            </button>
          </div>

          {/* System prompt */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">System Prompt</label>
            <textarea
              rows={2}
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant."
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* User message */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">User Message</label>
            <textarea
              rows={4}
              value={userMessage}
              onChange={e => setUserMessage(e.target.value)}
              placeholder="Type your prompt here…"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
            />
          </div>
        </form>

        {/* ── Error ────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* ── Cost metrics ─────────────────────────────────────── */}
        {cost && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Cost Breakdown</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MetricCard label="Unoptimized Tokens Cost"   value={fmt(cost.unoptimized_cost_usd)}    highlight="red" />
              <MetricCard label="Optimized Tokens Cost"     value={fmt(cost.optimized_cost_usd)}      highlight="blue" />
              <MetricCard label="Total Cost Saved"        value={fmt(cost.total_cost_saved_usd)}    highlight="green" sub="rule engine + model + cache" />
            </div>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {result?.savings.cache_hit && (
                <span className="rounded-full bg-emerald-900/60 border border-emerald-500/30 px-3 py-1 text-emerald-300">⚡ Cache hit</span>
              )}
              {result?.savings.model_downgraded && (
                <span className="rounded-full bg-violet-900/60 border border-violet-500/30 px-3 py-1 text-violet-300">
                  Model: {result.unoptimized.model} → {result.optimized.model}
                </span>
              )}
              <span className="rounded-full bg-gray-800 border border-gray-700 px-3 py-1 text-gray-400">
                Tokens saved: {result?.savings.tokens_saved ?? 0}
              </span>
            </div>
          </div>
        )}

        {/* ── Side-by-side responses ───────────────────────────── */}
        {result && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Unoptimized */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Unoptimized Response
                </h2>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  {result.unoptimized.model} · {result.unoptimized.usage.total_tokens} tokens
                </span>
              </div>
              <textarea
                readOnly
                value={unoptContent}
                rows={10}
                className="w-full rounded-lg border border-rose-500/20 bg-rose-950/20 px-4 py-3 text-sm text-gray-200 resize-y focus:outline-none"
              />
            </div>

            {/* Optimized */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Optimized Response
                </h2>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  {result.optimized.model} · {result.optimized.usage.total_tokens} tokens
                </span>
              </div>
              <textarea
                readOnly
                value={optContent}
                rows={10}
                className="w-full rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 text-sm text-gray-200 resize-y focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────── */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 py-20 text-gray-600">
            <p className="text-sm">Enter a prompt above and click <strong className="text-gray-400">Run Optimizer</strong></p>
            <p className="mt-1 text-xs">You will see both the unoptimized and optimized LLM responses side by side</p>
          </div>
        )}
      </div>
    </main>
  );
}
