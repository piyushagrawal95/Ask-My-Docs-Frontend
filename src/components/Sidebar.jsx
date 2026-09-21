import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onToggleSidebar,
}) {
  const { user, signOut } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  function startEditing(c) {
    setEditingId(c.id);
    setDraftTitle(c.title || "");
  }

  function commitEdit() {
    const trimmed = draftTitle.trim();
    if (editingId && trimmed) {
      onRenameConversation(editingId, trimmed);
    }
    setEditingId(null);
  }

  return (
    <aside className="w-72 shrink-0 bg-shell flex flex-col h-full min-h-0">
      <div className="px-5 pt-6 pb-5 flex items-start justify-between">
        <div>
          <p className="font-serif text-[22px] leading-none text-ink-onshell">Ask My Docs</p>
          <p className="mt-1.5 text-[12px] text-ink-onshellsoft">Your desk for reading, at a glance</p>
        </div>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Close sidebar"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#25355a] border border-[#3b4f7d] text-ink-onshell shadow-md ring-1 ring-white/10 hover:bg-brass hover:border-brass hover:text-white hover:shadow-lg transition-all duration-200 shrink-0 cursor-pointer active:scale-90 group"
            title="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Conversations */}
      <div className="px-5 py-5 flex-1 overflow-y-auto min-h-0 scroll-thin scroll-thin-shell">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-medium text-ink-onshellsoft">Conversations</p>
          <button
            onClick={onNewConversation}
            className="text-[12px] font-medium text-brass hover:text-brass-dark transition-colors"
          >
            + New
          </button>
        </div>
        <ul className="space-y-0.5">
          {conversations.map((c) => (
            <li key={c.id} className="group flex items-center gap-1">
              {editingId === c.id ? (
                <div className="flex-1 flex items-center gap-1 min-w-0">
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 min-w-0 text-[13px] px-2.5 py-1.5 rounded-md bg-shell-light text-ink-onshell border border-brass/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      commitEdit();
                    }}
                    className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-moss-soft hover:bg-moss/30 hover:text-white transition-all text-[13px] font-bold"
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(null);
                    }}
                    className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-ink-onshellsoft hover:bg-rust/20 hover:text-rust transition-all text-[12px]"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onSelectConversation(c.id)}
                    className={`flex-1 min-w-0 text-left text-[13px] truncate px-3 py-2 rounded-md transition-colors ${
                      c.id === activeConversationId
                        ? "bg-moss text-white font-medium"
                        : "text-ink-onshellsoft hover:bg-shell-light hover:text-ink-onshell"
                    }`}
                  >
                    {c.title || "Untitled conversation"}
                  </button>
                  <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(c);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-ink-onshellsoft hover:bg-shell-light hover:text-ink-onshell transition-all"
                      aria-label="Rename conversation"
                      title="Rename"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this conversation and all its documents? This cannot be undone.")) {
                          onDeleteConversation(c.id);
                        }
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-rust/20 border border-rust/40 text-rust hover:bg-rust hover:border-rust hover:text-white transition-all shadow-xs active:scale-90"
                      aria-label="Delete conversation"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        className="w-3 h-3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* User footer */}
      <div className="px-5 py-4 border-t border-shell-line flex items-center justify-between gap-2 shrink-0">
        <span className="text-[12px] text-ink-onshellsoft truncate" title={user?.email}>
          {user?.email}
        </span>
        <button
          onClick={signOut}
          className="shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-ink-onshellsoft hover:bg-rust/15 hover:text-rust transition-colors"
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