import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Strip [n], [excerpt n], (excerpt n) markers from displayed text
function stripCitationMarkers(content) {
  if (!content) return "";
  return content
    .replace(
      /\[\s*(?:(?:excerpt|excerpts|source|sources|doc|docs|document|page|pages|ref|reference)s?\s*:?)?\s*#?\d+(?:\s*(?:,|and|&|–|-)\s*#?\d+)*\s*\]/gi,
      ""
    )
    .replace(
      /\(\s*(?:excerpt|excerpts|source|sources|doc|docs|document|page|pages|ref|reference)s?\s*:?\s*#?\d+(?:\s*(?:,|and|&|–|-)\s*#?\d+)*\s*\)/gi,
      ""
    )
    .replace(/\[\s*(?:excerpt|excerpts|source|sources|reference)s?\s*\]/gi, "")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const unanswerable = message.is_answerable === false;
  const [copied, setCopied] = useState(false);

  const cleanContent = stripCitationMarkers(message.content || "");

  function handleCopy() {
    if (!cleanContent) return;
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isUser) {
    return (
      <div className="flex animate-rise justify-end">
        <div className="max-w-[85%] md:max-w-xl text-right">
          <div className="inline-block px-4 py-2.5 text-[14px] leading-relaxed text-left rounded-2xl rounded-tr-sm bg-gradient-to-r from-moss to-moss-dark text-white shadow-sm font-sans whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-rise justify-start w-full">
      <div className="w-full max-w-prose">
        <div
          className={`w-full rounded-2xl rounded-tl-sm transition-all duration-200 ${
            unanswerable
              ? "bg-paper-card border border-dashed border-paper-line p-4 text-ink-soft italic text-[14px]"
              : "bg-paper-card border border-paper-line/90 border-l-[3px] border-l-brass dark:border-l-brass p-4 md:p-5 shadow-sm"
          }`}
        >
          {/* Header Bar for AI Answer */}
          {!unanswerable && (
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-paper-line/60">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-brass/10 dark:bg-brass/20 text-brass flex items-center justify-center text-[12px] font-bold">
                  ✨
                </span>
                <span className="text-[12px] font-medium tracking-wide text-ink font-sans">
                  Answer
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy response"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-ink-soft hover:text-ink hover:bg-paper-line/40 transition-colors"
                title="Copy answer"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-moss" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-moss">Copied</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Content Body */}
          {unanswerable ? (
            <p className="leading-relaxed">{message.content}</p>
          ) : (
            <div className="markdown-answer text-[14px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {cleanContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}