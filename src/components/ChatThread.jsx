import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatThread({ messages, onAsk, asking, hasReadyDocuments }) {
  const [question, setQuestion] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim() || asking) return;
    onAsk(question.trim());
    setQuestion("");
  }

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <p className="font-serif text-2xl text-ink mb-2">Ask something</p>
              <p className="text-sm text-ink-soft">
                {hasReadyDocuments
                  ? "Ask a question about your uploaded documents. Answers are grounded in your files, with citations."
                  : "Upload a document from the sidebar first, then ask questions about it here."}
              </p>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {asking && (
          <div className="flex justify-start">
            <div className="inline-block px-4 py-3 text-sm rounded-2xl bg-stone-card border border-stone-line text-ink-soft italic">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-stone-line px-8 py-5">
        <div className="flex gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your documents…"
            className="flex-1 rounded-full border border-stone-line bg-white px-4 py-2.5 text-sm text-ink focus:border-brass focus:ring-2 focus:ring-brass-soft outline-none transition-shadow"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="rounded-full bg-brass text-white px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-brass-dark active:scale-[0.98] transition-all disabled:opacity-40"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}