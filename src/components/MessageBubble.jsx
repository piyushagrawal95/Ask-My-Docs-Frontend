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

  return (
    <div className={`flex animate-rise ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-prose ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block px-4 py-3 text-[14px] leading-relaxed text-left rounded-lg ${
            isUser
              ? "bg-moss text-white rounded-br-sm"
              : unanswerable
              ? "bg-paper-card border border-dashed border-paper-line text-ink-soft italic rounded-bl-sm"
              : "bg-paper-card border-l-2 border-brass text-ink rounded-bl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <div className="markdown-answer">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {stripCitationMarkers(message.content)}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}