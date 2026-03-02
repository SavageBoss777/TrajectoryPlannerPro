import { useEffect, useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

type ResultsChatProps = {
  /** Any object you want the assistant to use (simulation results, insights, etc.) */
  context: any;
  title?: string;
};

const SUGGESTED = [
  "Why is my burnout risk high?",
  "What is the biggest driver of GPA instability?",
  "What should I change first for the best improvement?",
  "Explain my results in simple terms.",
];

export default function ResultsChat({ context, title = "Ask about your results" }: ResultsChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    // auto-scroll on new messages
    listRef.current?.scrollTo({ top: 999999 });
  }, [messages, loading]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || loading) return;

    setError(null);
    setLoading(true);
    setInput("");

    // Optimistic add user message
    setMessages((m) => [...m, { role: "user", text: q }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Request failed");
      }

      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.answer || "No response." },
      ]);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry — I hit an error. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-white">{title}</div>
          <div className="text-xs text-white/60">
            Ask questions about your simulation + insights.
          </div>
        </div>
        <div className="text-xs text-white/50">{loading ? "Thinking…" : "Ready"}</div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {SUGGESTED.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            {q}
          </button>
        ))}
      </div>

      <div
        ref={listRef}
        className="max-h-80 overflow-auto rounded-xl bg-black/20 p-3"
      >
        {messages.length === 0 ? (
          <div className="text-sm text-white/60">
            Try: “What’s the biggest lever to reduce burnout?” or “Explain my chart.”
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={
                    "inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm " +
                    (m.role === "user"
                      ? "bg-white/15 text-white"
                      : "bg-black/30 text-white/90 border border-white/10")
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-left">
                <div className="inline-block rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/70">
                  Typing…
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-300">
          Error: {error}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSend && send(input)}
          placeholder="Ask a question…"
          className="w-full rounded-xl bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
        />
        <button
          type="button"
          onClick={() => send(input)}
          disabled={!canSend}
          className="rounded-xl bg-white/15 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}