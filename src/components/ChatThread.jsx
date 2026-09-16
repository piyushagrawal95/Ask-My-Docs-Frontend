import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

function EmptyState({ hasReadyDocuments }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-sm">
        <svg
          viewBox="0 0 64 64"
          className="w-14 h-14 mx-auto mb-4 text-brass"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 14a4 4 0 0 1 4-4h16v40H12a4 4 0 0 1-4-4V14Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M56 14a4 4 0 0 0-4-4H36v40h16a4 4 0 0 0 4-4V14Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M28 14v36M14 18h10M14 24h10M14 30h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <p className="font-serif text-2xl text-ink mb-2">Ask something</p>
        <p className="text-[14px] text-ink-soft leading-relaxed">
          {hasReadyDocuments
            ? "Ask a question about your uploaded documents. Answers are grounded in your files, with citations."
            : "Upload a document from the sidebar first, then ask questions about it here."}
        </p>
      </div>
    </div>
  );
}

export default function ChatThread({ messages, onAsk, asking, hasReadyDocuments, onSummarize }) {
  {messages.length==0 && hasReadyDocuments && (
    <button onClick={onSummarize} disabled={asking} className="text-[13px] px-3 py-1.5 rounded-lg border border-paper-line hover: bg-paper-card transition-colors">
      ✨ Summarize this document
    </button>
  )}
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
    <div className="flex flex-col h-full min-h-0 flex-1 bg-paper">
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-5 min-h-0 scroll-thin scroll-thin-paper">
        {messages.length === 0 && <EmptyState hasReadyDocuments={hasReadyDocuments} />}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {asking && (
          <div className="flex justify-start animate-rise">
            <div className="inline-flex items-center gap-1 px-4 py-3.5 rounded-lg rounded-bl-sm bg-paper-card border-l-2 border-brass">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-blink [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-blink [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-blink" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-paper-line px-8 py-5 shrink-0">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your documents…"
            className="flex-1 rounded-full border border-paper-line bg-paper-card px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-soft/70 focus:border-moss focus:ring-2 focus:ring-moss-soft outline-none transition-shadow"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="rounded-full bg-moss text-white px-6 py-2.5 text-[14px] font-medium shadow-sm hover:bg-moss-dark active:scale-[0.98] transition-all disabled:opacity-40"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}