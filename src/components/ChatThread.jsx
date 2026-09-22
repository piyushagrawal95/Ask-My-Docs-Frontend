import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

function EmptyState({ hasReadyDocuments }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brass/10 dark:bg-brass/15 flex items-center justify-center text-brass border border-brass/20 shadow-sm">
          <svg
            viewBox="0 0 64 64"
            className="w-10 h-10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 14a4 4 0 0 1 4-4h16v40H12a4 4 0 0 1-4-4V14Z"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M56 14a4 4 0 0 0-4-4H36v40h16a4 4 0 0 0 4-4V14Z"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path d="M28 14v36M14 18h10M14 24h10M14 30h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-serif text-2xl text-ink mb-2">Ask something</p>
        <p className="text-[14px] text-ink-soft leading-relaxed">
          {hasReadyDocuments
            ? "Ask a question about your uploaded documents. Answers are grounded in your files, with citations."
            : "Upload a document from the top bar first, then ask questions about it here."}
        </p>
      </div>
    </div>
  );
}

export default function ChatThread({
  messages,
  onAsk,
  asking,
  hasReadyDocuments,
  onSummarize,
  documents,
  showSummarizePicker,
  onSelectSummarizeDoc,
  onCloseSummarizePicker,
  loadingConversation,
}) {
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
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 min-h-0 scroll-thin scroll-thin-paper">
        {loadingConversation ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-paper-line border-t-moss rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {messages.length === 0 && <EmptyState hasReadyDocuments={hasReadyDocuments} />}

            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </>
        )}

        {asking && (
          <div className="flex justify-start animate-rise">
            <div className="inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-paper-card border border-paper-line/80 border-l-[3px] border-l-brass shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-moss animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-brass animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-moss animate-bounce" />
              </div>
              <span className="text-[12px] font-medium text-ink-soft">Analyzing documents…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Summarize action — prominent gradient button with glow and hover animation */}
      {hasReadyDocuments && (
        <div className="flex justify-center relative px-8 pt-3 shrink-0">
          <button
            type="button"
            onClick={onSummarize}
            disabled={asking}
            className="group relative inline-flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-moss/10 hover:from-amber-500/20 hover:via-amber-400/15 hover:to-moss/20 text-amber-700 dark:text-amber-300 shadow-sm hover:shadow-md hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>✨ Summarize a document</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showSummarizePicker && (
            <div className="absolute bottom-full mb-3 w-72 bg-paper-card/95 backdrop-blur-md border border-paper-line rounded-xl shadow-2xl z-20 py-2 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 animate-rise">
              <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                Choose Target Document
              </div>
              <button
                type="button"
                onClick={() => onSelectSummarizeDoc(null)}
                className="w-full text-left px-3.5 py-2 text-[13px] hover:bg-paper text-ink transition-colors font-medium flex items-center gap-2.5 cursor-pointer"
              >
                <span>📚</span>
                <span>All documents</span>
              </button>
              <div className="border-t border-paper-line my-1" />
              <div className="max-h-48 overflow-y-auto scroll-thin scroll-thin-paper">
                {documents
                  .filter((d) => d.status === "ready")
                  .map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onSelectSummarizeDoc(d.id)}
                      className="w-full text-left px-3.5 py-2 text-[13px] hover:bg-paper text-ink transition-colors truncate flex items-center gap-2.5 cursor-pointer"
                      title={d.file_name}
                    >
                      <span>📄</span>
                      <span className="truncate">{d.file_name}</span>
                    </button>
                  ))}
              </div>
              <div className="border-t border-paper-line my-1" />
              <button
                type="button"
                onClick={onCloseSummarizePicker}
                className="w-full text-left px-3.5 py-1.5 text-[12px] text-ink-soft hover:bg-paper hover:text-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input Form with modern glowing focus ring */}
      <form onSubmit={handleSubmit} className="border-t border-paper-line px-4 md:px-8 py-4 bg-paper/80 backdrop-blur-sm shrink-0">
        <div className="flex gap-2.5 max-w-3xl mx-auto items-center">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your documents…"
            className="flex-1 rounded-full border border-paper-line bg-paper-card px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-soft/70 focus:border-moss focus:ring-2 focus:ring-moss/20 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="rounded-full bg-moss text-white px-5 py-2.5 text-[14px] font-medium shadow-sm hover:bg-moss-dark active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Ask</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
