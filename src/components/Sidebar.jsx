import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-72 shrink-0 bg-shell flex flex-col h-full min-h-0">
      <div className="px-5 pt-6 pb-5">
        <p className="font-serif text-[22px] leading-none text-ink-onshell">Ask My Docs</p>
        <p className="mt-1.5 text-[12px] text-ink-onshellsoft">Your desk for reading, at a glance</p>
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this conversation and all its documents? This cannot be undone.")) {
                    onDeleteConversation(c.id);
                  }
                }}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-ink-onshellsoft opacity-0 group-hover:opacity-100 hover:bg-rust/20 hover:text-rust transition-all"
                aria-label="Delete conversation"
              >
                ✕
              </button>
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