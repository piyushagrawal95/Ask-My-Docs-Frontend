import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    let detail = "Something went wrong.";
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    const error = new Error(detail);
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  async listDocuments(conversationId) {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_BASE_URL}/documents?conversation_id=${encodeURIComponent(conversationId)}`,
      { headers }
    );
    return handleResponse(res);
  },

  async uploadDocument(file, conversationId) {
    const headers = await getAuthHeaders();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversation_id", conversationId);
    const res = await fetch(`${API_BASE_URL}/documents`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  async getDocument(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/documents/${id}`, { headers });
    return handleResponse(res);
  },

  async deleteDocument(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse(res);
  },

  async reprocessDocument(id){
    const headers=await getAuthHeaders();
    const res=await fetch (`${API_BASE_URL}/documents/${id}/reprocess`,{
      method:"POST",
      headers
    });
    return handleResponse(res);
  },

  async listConversations() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/conversations`, { headers });
    return handleResponse(res);
  },

  async createConversation() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      method: "POST",
      headers,
    });
    return handleResponse(res);
  },

  async getConversation(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/conversations/${id}`, { headers });
    return handleResponse(res);
  },

  async deleteConversation(id){
    const headers=await getAuthHeaders();
    const res=await fetch(`${API_BASE_URL}/conversations/${id}`,
    {
      method:"DELETE",
      headers
    });
    return handleResponse(res);
  },

  async askQuestion(conversationId, question) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    return handleResponse(res);
  },
};