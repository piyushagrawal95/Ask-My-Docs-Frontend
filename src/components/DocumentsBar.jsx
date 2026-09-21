import { useRef, useState } from "react";
import StatusBadge from "./StatusBadge";

function fileKind(fileName = "") {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "docx" || ext === "doc") return "DOC";
  return "TXT";
}

const MAX_DOCUMENTS_PER_CHAT = 5; // keep in sync with settings.max_documents_per_conversation on the backend

export default function DocumentsBar({ documents, onUpload, uploading, onDelete, onRetry }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const atLimit = documents.length >= MAX_DOCUMENTS_PER_CHAT;

  function handleFiles(files) {
    if (files && files[0]) onUpload(files[0]);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex items-center gap-3 px-8 py-3 border-b border-paper-line bg-paper shrink-0 transition-colors ${
        dragOver ? "bg-paper-card" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || atLimit}
        title={atLimit ? `Limit of ${MAX_DOCUMENTS_PER_CHAT} documents reached for this chat` : undefined}
        className="shrink-0 flex items-center gap-1.5 rounded-full border border-dashed border-paper-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:border-brass/70 hover:text-ink hover:bg-paper-card transition-colors disabled:opacity-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
          />
        </svg>
        {uploading ? "Uploading…" : atLimit ? `Limit reached (${MAX_DOCUMENTS_PER_CHAT})` : "Add document"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="h-5 w-px bg-paper-line shrink-0" />

      <span
        className={`shrink-0 text-[11px] font-medium tabular-nums px-2 py-1 rounded-full border ${
          atLimit
            ? "border-rust/40 bg-rust/10 text-rust"
            : "border-paper-line bg-paper-card text-ink-soft"
        }`}
        title={`${documents.length} of ${MAX_DOCUMENTS_PER_CHAT} documents used in this chat`}
      >
        {documents.length}/{MAX_DOCUMENTS_PER_CHAT} docs
      </span>

      <div className="h-5 w-px bg-paper-line shrink-0" />

      <div className="flex items-center gap-2 overflow-x-auto scroll-thin scroll-thin-paper min-w-0">
        {documents.length === 0 && (
          <span className="text-[12px] text-ink-soft/80 whitespace-nowrap">
            No documents in this conversation yet - upload one to get started.
          </span>
        )}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="group shrink-0 flex items-center gap-2 rounded-full pl-3 pr-1.5 py-1 border border-paper-line bg-paper-card"
          >
            <span className="text-[9px] font-semibold tracking-wide text-brass">{fileKind(doc.file_name)}</span>
            <span
              className="max-w-[140px] text-[12px] text-ink truncate"
              title={doc.status === "failed" ? doc.error_message : doc.file_name}
            >
              {doc.file_name}
            </span>
            <StatusBadge status={doc.status} pagesProcessed={doc.pages_processed} totalPages={doc.page_count} />
            {doc.status === "failed" && (
              <button
                onClick={() => onRetry(doc.id)}
                className="text-[11px] text-brass hover:text-brass-dark transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => onDelete(doc.id)}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-paper-line/70 text-ink-soft opacity-0 group-hover:opacity-100 hover:bg-rust hover:text-white transition-all"
              aria-label="Delete document"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}