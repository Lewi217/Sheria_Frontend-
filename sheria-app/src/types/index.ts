// ========================
// API Types
// ========================

export interface UploadResponse {
  message: string;
  document_id?: string;
  filename?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Source {
  page?: number;
  content?: string;
  score?: number;
  document?: string;
  [key: string]: unknown;
}

export interface ChatRequest {
  query: string;
  document_id?: string;
  conversation_history?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  answer: string;
  sources?: Source[];
  query?: string;
  [key: string]: unknown;
}

// ========================
// UI State Types
// ========================

export type AppTab = "upload" | "chat";

export interface UploadedDocument {
  id: string;
  filename: string;
  uploadedAt: Date;
  size?: number;
  status: "uploaded" | "processing" | "ready" | "error";
}

export interface AppState {
  activeTab: AppTab;
  uploadedDocuments: UploadedDocument[];
  selectedDocumentId: string | null;
  messages: ChatMessage[];
  isUploading: boolean;
  isChatLoading: boolean;
  uploadProgress: number;
  streamingMode: boolean;
}

// ========================
// API Config
// ========================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://urbanroof.app";

export const API_ENDPOINTS = {
  uploadDocument: `${API_BASE_URL}/api/documents/upload`,
  chat: `${API_BASE_URL}/api/chat`,
  chatStream: `${API_BASE_URL}/api/chat/stream`,
} as const;
