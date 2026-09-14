import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatThread from "../components/ChatThread";
import { api } from "../lib/api";

export default function WorkspacePage() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");

  const loadDocuments = useCallback(async () => {
    if (!activeConversationId) {
      setDocuments([]);
      return;
    }
    try {
      const res = await api.listDocuments(activeConversationId);
      setDocuments(res.documents);
    } catch {
      // ignore
    }
  }, [activeConversationId]);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.listConversations();
      setConversations(res.conversations);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadConversations();
  }, [loadDocuments, loadConversations]);

  // Poll documents while any are still pending/processing, so status updates without a refresh.
  useEffect(() => {
    const hasActive = documents.some((d) => d.status === "pending" || d.status === "processing");
    if (!hasActive) return;
    const interval = setInterval(loadDocuments, 3000);
    return () => clearInterval(interval);
  }, [documents, loadDocuments]);

  async function handleUpload(file) {
    setUploading(true);
    setUploadError("");
    try {
      let conversationId = activeConversationId;
      if (!conversationId) {
        const conv = await api.createConversation();
        setConversations((prev) => [conv, ...prev]);
        conversationId = conv.id;
        setActiveConversationId(conversationId);
      }
      await api.uploadDocument(file, conversationId);
      await loadDocuments();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!uploadError) {
      return;
    }
    const timer = setTimeout(() => setUploadError(""), 5000);
    return () => clearTimeout(timer);
  }, [uploadError]);

  async function handleDelete(id) {
    try {
      await api.deleteDocument(id);
      await loadDocuments();
    } catch (err) {
      setUploadError(err.message);
    }
  }

  async function handleRetry(id) {
    try {
      await api.reprocessDocument(id);
      await loadDocuments();
    } catch (err) {
      setUploadError(err.message);
    }
  }

  async function handleSelectConversation(id) {
    setActiveConversationId(id);
    setAskError("");
    try {
      const res = await api.getConversation(id);
      setMessages(res.messages);
    } catch (err) {
      setAskError(err.message);
    }
  }

  async function handleNewConversation() {
    try {
      const conv = await api.createConversation();
      setConversations((prev) => [conv, ...prev]);
      setActiveConversationId(conv.id);
      setMessages([]);
    } catch (err) {
      setAskError(err.message);
    }
  }

  async function handleDeleteConversation(id) {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === activeConversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      setAskError(err.message);
    }
  }

  async function handleAsk(question) {
    let conversationId = activeConversationId;
    const isFirstMessage = messages.length === 0;

    // No conversation selected yet — create one on the fly.
    if (!conversationId) {
      try {
        const conv = await api.createConversation();
        setConversations((prev) => [conv, ...prev]);
        conversationId = conv.id;
        setActiveConversationId(conversationId);
      } catch (err) {
        setAskError(err.message);
        return;
      }
    }

    // Optimistically show the user's question right away.
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: "user", content: question, citations: [] },
    ]);

    setAsking(true);
    setAskError("");
    try {
      const assistantMessage = await api.askQuestion(conversationId, question);
      setMessages((prev) => [...prev, assistantMessage]);
      if (isFirstMessage) {
        loadConversations();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-error-${Date.now()}`,
          role: "assistant",
          content: "Something went wrong sending your question. Please try again.",
          citations: [],
          is_answerable: false,
        },
      ]);
      setAskError(err.message);
    } finally {
      setAsking(false);
    }
  }

  const hasReadyDocuments = documents.some((d) => d.status === "ready");

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <Sidebar
          documents={documents}
          onUpload={handleUpload}
          uploading={uploading}
          onDelete={handleDelete}
          onRetry={handleRetry}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      )}
      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-stone-line shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-soft hover:bg-stone-bg hover:text-ink transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col h-full min-h-0">
          {uploadError && (
            <p className="px-8 py-2 text-xs text-rust bg-rust/5 border-b border-stone-line shrink-0">
              {uploadError}
            </p>
          )}

          {askError && (
            <p className="px-8 py-2 text-xs text-rust bg-rust/5 border-b border-stone-line shrink-0">
              {askError}
            </p>
          )}

          <ChatThread
            messages={messages}
            onAsk={handleAsk}
            asking={asking}
            hasReadyDocuments={hasReadyDocuments}
          />
        </div>
      </div>
    </div>
  );
}