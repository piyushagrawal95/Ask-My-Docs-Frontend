import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function withCitationMarkers(content) {
  return content.replace(/\[(\d+)\]/g, '<sup class="citation-marker">$1</sup>');
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-prose ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block px-4 py-3 text-sm leading-relaxed text-left rounded-2xl shadow-sm ${
            isUser
              ? "bg-brass text-white rounded-br-md"
              : message.is_answerable === false
              ? "bg-stone-card border border-stone-line text-ink-soft italic rounded-bl-md"
              : "bg-white border border-stone-line text-ink rounded-bl-md"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <div className="markdown-answer">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {withCitationMarkers(message.content)}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-2 space-y-1 text-left">
            {message.citations.map((c, i) => (
              <p key={c.id || i} className="text-xs text-ink-soft border-l-2 border-brass-soft pl-2">
                <span className="text-brass font-medium">[{i + 1}]</span>{" "}
                {c.page_number ? `Page ${c.page_number} — ` : ""}
                {c.snippet}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}