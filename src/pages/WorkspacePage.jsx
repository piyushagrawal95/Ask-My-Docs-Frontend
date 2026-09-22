import { useCallback, useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import DocumentsBar from "../components/DocumentsBar";
import ChatThread from "../components/ChatThread";
import { api } from "../lib/api";
import { useDarkMode } from "../hooks/useDarkMode";

export default function WorkspacePage() {
  const [isDark, setIsDark]=useDarkMode();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");
  const [showSummarizePicker, setShowSummarizePicker] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [switchingConversation, setSwitchingConversation] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);

  // In-memory cache to make conversation switching 0ms instant (optimistic)
  const conversationCacheRef = useRef({});

  // Keep in-memory cache synchronized with latest messages & documents
  useEffect(() => {
    if (activeConversationId && !switchingConversation) {
      conversationCacheRef.current[activeConversationId] = {
        messages,
        documents,
      };
    }
  }, [activeConversationId, messages, documents, switchingConversation]);

  const loadDocuments = useCallback(async (convId) => {
    const id = convId || activeConversationId;
    if (!id) {
      setDocuments([]);
      return;
    }
    try {
      const res = await api.listDocuments(id);
      const docs = res.documents || [];
      setDocuments(docs);
      if (conversationCacheRef.current[id]) {
        conversationCacheRef.current[id].documents = docs;
      }
    } catch {
      // ignore
    }
  }, [activeConversationId]);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.listConversations();
      let convs = res.conversations || [];

      // Auto-close empty conversations on new login session:
      const CLEANUP_KEY = "cleaned_empty_chats_session";
      if (!sessionStorage.getItem(CLEANUP_KEY)) {
        sessionStorage.setItem(CLEANUP_KEY, "true");
        const emptyConvs = convs.filter((c) => (c.document_count || 0) === 0);
        if (emptyConvs.length > 0) {
          for (const empty of emptyConvs) {
            api.deleteConversation(empty.id).catch(() => {});
          }
          convs = convs.filter((c) => (c.document_count || 0) > 0);
        }
      }

      setConversations(convs);
    } catch {
      // ignore
    }
  }, []);

  // Initial load only: run once when mounting
  useEffect(() => {
    let mounted = true;
    loadConversations().finally(() => {
      if (mounted) setInitializing(false);
    });
    return () => {
      mounted = false;
    };
  }, [loadConversations]);

  // Poll documents ONLY while any are actively pending or processing
  useEffect(() => {
    const hasActive = documents.some((d) => d.status === "pending" || d.status === "processing");
    if (!hasActive || !activeConversationId) return;
    const interval = setInterval(() => loadDocuments(activeConversationId), 3000);
    return () => clearInterval(interval);
  }, [documents, activeConversationId, loadDocuments]);

  async function handleUpload(file) {
    setUploading(true);
    setUploadError("");
    try {
      let conversationId = activeConversationId;
      if (!conversationId) {
        const conv = await api.createConversation();
        setConversations((prev) => [{ ...conv, document_count: 0 }, ...prev]);
        conversationId = conv.id;
        setActiveConversationId(conversationId);
      }
      const newDoc = await api.uploadDocument(file, conversationId);
      if (newDoc) {
        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, document_count: (c.document_count || 0) + 1 }
              : c
          )
        );
        delete conversationCacheRef.current[conversationId];
      }
      
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
    // Optimistically update UI immediately
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, document_count: Math.max(0, (c.document_count || 1) - 1) }
          : c
      )
    );
    delete conversationCacheRef.current[activeConversationId];
    try {
      await api.deleteDocument(id);
      await loadDocuments();
    } catch (err) {
      setUploadError(err.message);
      await loadDocuments();
    }
  }

  async function handleRetry(id) {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status: "pending", error_message: null } : doc
      )
    );
    try {
      await api.reprocessDocument(id);
      await loadDocuments();
    } catch (err) {
      setUploadError(err.message);
      await loadDocuments();
    }
  }

  async function handleSelectConversation(id) {
    if (id === activeConversationId) return;

    setActiveConversationId(id);
    setAskError("");

    // Optimistic loading: If user already visited this conversation, show cached messages instantly!
    const cached = conversationCacheRef.current[id];
    if (cached) {
      setMessages(cached.messages);
      setDocuments(cached.documents);
    } else {
      setSwitchingConversation(true);
      setMessages([]);
      setDocuments([]);
    }

    try {
      // Parallel flight for messages and documents
      const [convRes, docRes] = await Promise.all([
        api.getConversation(id),
        api.listDocuments(id),
      ]);

      const freshMessages = convRes.messages || [];
      const freshDocs = docRes.documents || [];

      // Update in-memory cache
      conversationCacheRef.current[id] = {
        messages: freshMessages,
        documents: freshDocs,
      };

      setMessages(freshMessages);
      setDocuments(freshDocs);
    } catch (err) {
      setAskError(err.message);
    } finally {
      setSwitchingConversation(false);
    }
  }

  async function handleNewConversation() {
    if (creatingConversation) return;
    setCreatingConversation(true);
    try {
      const conv = await api.createConversation();
      setConversations((prev) => [{ ...conv, document_count: 0 }, ...prev]);
      setActiveConversationId(conv.id);
      setMessages([]);
      setDocuments([]);
      conversationCacheRef.current[conv.id] = { messages: [], documents: [] };
    } catch (err) {
      setAskError(err.message);
    } finally {
      setCreatingConversation(false);
    }
  }

  async function handleDeleteConversation(id) {
    // Optimistic UI update: Remove immediately from list
    delete conversationCacheRef.current[id];
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (id === activeConversationId) {
      setActiveConversationId(null);
      setMessages([]);
      setDocuments([]);
    }
    try {
      await api.deleteConversation(id);
    } catch (err) {
      setAskError(err.message);
      loadConversations();
    }
  }

  async function handleRenameConversation(id, title) {
    try {
      await api.renameConversation(id, title);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
    } catch (err) {
      setAskError(err.message);
    }
  }

  async function handleAsk(question, documentId = null) {
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
      const assistantMessage = await api.askQuestion(conversationId, question, documentId);
      const cached=conversationCacheRef.current[conversationId];
      const updatedMessages=cached?[...cached.messages,assistantMessage]:[assistantMessage];
      conversationCacheRef.current[conversationId]={
        ...cached,
        messages:updatedMessages
      }
      if(conversationId === activeConversationId){
        setMessages((prev)=>[...prev,assistantMessage]);
      }
      if(isFirstMessage){
        loadConversations();
      }
      
      
    } catch (err) {
      const errorMessage={
        id:`local-error-${Date.now()}`,
        role:"assistant",
        content:"Something went wrong sending your question. Please try again.",
        citations:[],
        is_answerable:false,
      }
      const cached=conversationCacheRef.current[conversationId];
      if(cached){
        conversationCacheRef.current[conversationId]={
          ...cached,messages:[...cached.messages,errorMessage]
        }
      }
      if(conversationId  === activeConversationId){
        setMessages((prev)=>[...prev,errorMessage]);
        setAskError(err.message);
      }
      
    }
    finally{
      setAsking(false);
    }
  }

  function handleSummarizeClick() {
    const readyDocs = documents.filter((d) => d.status === "ready");
    if (readyDocs.length === 1) {
      handleAsk(`Please summarize this document (${readyDocs[0].file_name})`, readyDocs[0].id);
    } else {
      setShowSummarizePicker(true);
    }
  }

  function handleSummarizeSelect(documentId) {
    setShowSummarizePicker(false);
    if(!documentId){
      handleAsk("Please summarize all documents",null);
      return;
    }
    const doc=documents.find((d)=>d.id===documentId);
    const label=doc?doc.file_name:"this document"
    handleAsk(`Please summarize this document (${label})`,documentId)
  }


  const hasReadyDocuments = documents.some((d) => d.status === "ready");
  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-paper-line border-t-moss rounded-full animate-spin" />
          <p className="text-[13px] text-ink-soft">Waking things up — this can take a moment…</p>
        </div>
      </div>
    );
  }

 
  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          creatingConversation={creatingConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onToggleSidebar={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-paper border-b border-paper-line shrink-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-soft hover:bg-paper-card hover:text-ink transition-colors"
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
          )}
          <span className="text-[13px] text-ink-soft">
            {hasReadyDocuments ? "Documents ready — ask away." : "Upload a document to get started."}
          </span>

          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-paper-line bg-paper-card text-ink-soft hover:text-ink hover:border-moss/40 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer group"
          >
            {isDark ? (
              <>
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                </span>
                <span className="text-[12px] font-medium text-ink">Dark</span>
              </>
            ) : (
              <>
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-slate-700">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-[12px] font-medium text-ink">Light</span>
              </>
            )}
          </button>
        </div>

        <DocumentsBar
          documents={documents}
          onUpload={handleUpload}
          uploading={uploading}
          onDelete={handleDelete}
          onRetry={handleRetry}
        />

        <div className="flex-1 flex flex-col h-full min-h-0">
          {uploadError && (
            <p className="px-8 py-2 text-[13px] text-rust bg-rust/5 border-b border-paper-line shrink-0">
              {uploadError}
            </p>
          )}

          {askError && (
            <p className="px-8 py-2 text-[13px] text-rust bg-rust/5 border-b border-paper-line shrink-0">
              {askError}
            </p>
          )}

          <ChatThread
            messages={messages}
            onAsk={handleAsk}
            asking={asking}
            hasReadyDocuments={hasReadyDocuments}
            onSummarize={handleSummarizeClick}
            documents={documents}
            showSummarizePicker={showSummarizePicker}
            onSelectSummarizeDoc={handleSummarizeSelect}
            onCloseSummarizePicker={() => setShowSummarizePicker(false)}
            loadingConversation={switchingConversation}
          />
        </div>
      </div>
    </div>
  );
}