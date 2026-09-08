import { useRef, useState } from "react";
import StatusBadge from "./StatusBadge";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  documents,
  onUpload,
  uploading,
  onDelete,
  onRetry,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const { user, signOut } = useAuth();

  function handleFiles(files) {
    if (files && files[0]) onUpload(files[0]);
  }

  return (
    <aside className="w-72 shrink-0 border-r border-stone-line bg-stone-card flex flex-col h-full min-h-0">
      <div className="px-5 py-5 border-b border-stone-line">
        <p className="font-serif text-xl text-ink">Ask My Docs</p>
      </div>

      {/* Upload zone */}
      <div className="px-5 py-4 border-b border-stone-line shrink-0">
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
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed px-3 py-5 text-center transition-colors ${
            dragOver
              ? "border-brass bg-brass-soft/30"
              : "border-stone-line hover:border-brass/60 hover:bg-brass-soft/10"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-6 h-6 mx-auto mb-1.5 text-brass-dark"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>
          <p className="text-xs font-medium text-ink">
            {uploading ? "Uploading…" : "Drop a document, or click to browse"}
          </p>
          <p className="mt-1 text-[11px] text-ink-soft/70">PDF, DOCX or TXT</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Document list */}
      <div className="px-5 py-4 border-b border-stone-line overflow-y-auto max-h-56 shrink-0">
        <p className="text-[11px] text-ink-soft mb-2">Documents</p>
        {documents.length === 0 && (
          <p className="text-xs text-ink-soft/70">No documents uploaded yet.</p>
        )}
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-2">
              <span
                className="text-sm text-ink truncate"
                title={doc.status === "failed" ? doc.error_message : doc.file_name}
              >
                {doc.file_name}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={doc.status} />
                {doc.status === "failed" && (
                  <button
                    onClick={() => onRetry(doc.id)}
                    className="text-xs text-brass-dark hover:text-brass transition-colors"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={() => onDelete(doc.id)}
                  className="text-xs text-ink-soft hover:text-rust transition-colors"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Conversations */}
      <div className="px-5 py-4 flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-ink-soft">Conversations</p>
          <button
            onClick={onNewConversation}
            className="text-xs text-brass-dark hover:text-brass transition-colors"
          >
            + New
          </button>
        </div>
        <ul className="space-y-1">
          {conversations.map((c) => (
            <li key={c.id} className="group flex items-center gap-1">
              <button
                onClick={() => onSelectConversation(c.id)}
                className={`flex-1 min-w-0 text-left text-sm truncate px-2 py-1.5 transition-colors  ${
                  c.id === activeConversationId
                    ? "bg-brass-soft/50 text-ink"
                    : "text-ink-soft hover:bg-stone-bg"
                }`}
              >
                {c.title || "Untitled conversation"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* User footer */}
      <div className="px-5 py-4 border-t border-stone-line flex items-center justify-between gap-2 shrink-0">
        <span className="text-xs text-ink-soft truncate" title={user?.email}>
          {user?.email}
        </span>
        <button
          onClick={signOut}
          className="shrink-0 flex items-center gap-1.5 rounded-full border border-rust/30 bg-rust/10 px-3 py-1.5 text-xs font-medium text-rust hover:bg-rust hover:text-white hover:border-rust transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M6 10a.75.75 0 01.75-.75h9.19l-2.72-2.72a.75.75 0 111.06-1.06l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 11-1.06-1.06l2.72-2.72H6.75A.75.75 0 016 10z"
              clipRule="evenodd"
            />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}