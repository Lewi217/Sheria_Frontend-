"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChatMessage, UploadedDocument } from "@/types";
import { sendChatMessage, sendChatMessageStream } from "@/services/api";
import ChatBubble from "./ChatBubble";
import {
  SendIcon,
  SparklesIcon,
  RefreshIcon,
  ZapIcon,
  FileIcon,
} from "./Icons";

interface ChatInterfaceProps {
  documents: UploadedDocument[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  streamingMode: boolean;
}

const STARTER_QUESTIONS = [
  "What are the key obligations in this contract?",
  "Summarize the termination clauses",
  "What are the penalties for breach of contract?",
  "Identify any unusual or risky clauses",
  "What are the payment terms?",
  "Who are the parties involved and their roles?",
];

export default function ChatInterface({
  documents,
  selectedDocumentId,
  onSelectDocument,
  streamingMode,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedDoc = useMemo(
    () => documents.find((d) => d.id === selectedDocumentId),
    [documents, selectedDocumentId]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputValue]);

  const buildHistory = useCallback(() => {
    return messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsLoading(true);

      const placeholderMsg: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, placeholderMsg]);

      // Fixed: use "question" and "documentId" to match Java backend DTO
      const payload = {
        question: text.trim(),
        documentId: selectedDocumentId || null,
      };

      try {
        if (streamingMode) {
          let accumulatedContent = "";
          for await (const token of sendChatMessageStream(payload)) {
            accumulatedContent += token;
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.isStreaming) {
                updated[updated.length - 1] = {
                  ...last,
                  content: accumulatedContent,
                };
              }
              return updated;
            });
          }
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.isStreaming) {
              updated[updated.length - 1] = { ...last, isStreaming: false };
            }
            return updated;
          });
        } else {
          const response = await sendChatMessage(payload);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.isStreaming) {
              updated[updated.length - 1] = {
                ...last,
                content: Array.isArray(response.answer)
                  ? response.answer.join("\n")
                  : response.answer || "I couldn't process that request.",
                sources: response.sources,
                isStreaming: false,
              };
            }
            return updated;
          });
        }
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.isStreaming) {
            updated[updated.length - 1] = {
              ...last,
              content:
                err instanceof Error
                  ? `Error: ${err.message}`
                  : "An unexpected error occurred. Please try again.",
              isStreaming: false,
            };
          }
          return updated;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, selectedDocumentId, streamingMode, buildHistory]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(inputValue);
    },
    [inputValue, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputValue);
      }
    },
    [inputValue, sendMessage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Document Selector */}
      {documents.length > 0 && (
        <div style={{ padding: "12px 0 16px", flexShrink: 0 }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            Active document
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: `1px solid ${selectedDocumentId === doc.id ? "rgba(99, 102, 241, 0.5)" : "var(--color-border)"}`,
                  background: selectedDocumentId === doc.id ? "rgba(99, 102, 241, 0.12)" : "transparent",
                  color: selectedDocumentId === doc.id ? "var(--indigo-400)" : "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <FileIcon size={12} />
                <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {doc.filename}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        paddingRight: 4,
        minHeight: 0,
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
            padding: "32px 24px",
          }}>
            <div style={{
              width: 64,
              height: 64,
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              animation: "float 6s ease-in-out infinite",
            }}>
              <SparklesIcon size={28} style={{ color: "#818cf8" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              {selectedDoc ? `Analyzing "${selectedDoc.filename}"` : "Ask anything"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: 320, lineHeight: 1.6 }}>
              {selectedDoc
                ? "Ask questions about your document and get instant AI-powered answers with source citations."
                : "Upload a legal document first, then ask questions about its contents."}
            </p>

            {selectedDoc && (
              <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 480 }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 4 }}>
                  Suggested questions
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {STARTER_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      className="btn-ghost"
                      onClick={() => sendMessage(q)}
                      style={{
                        fontSize: "12px",
                        padding: "7px 14px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "100px",
                        color: "var(--text-secondary)",
                        textAlign: "left",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ paddingTop: 8 }}>
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div style={{ flexShrink: 0, paddingTop: 16 }}>
        {messages.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button className="btn-ghost" onClick={clearChat} style={{ fontSize: "12px", padding: "4px 10px" }}>
              <RefreshIcon size={12} />
              Clear chat
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: "flex",
            gap: 12,
            padding: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            transition: "border-color 0.2s",
          }}>
            <textarea
              ref={textareaRef}
              id="chat-input"
              className="input-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedDoc
                  ? `Ask about "${selectedDoc.filename}"…`
                  : "Ask a legal question…"
              }
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                background: "transparent",
                border: "none",
                padding: "4px 8px",
                outline: "none",
                boxShadow: "none",
                overflowY: "hidden",
                lineHeight: "1.6",
              }}
              disabled={isLoading}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={!inputValue.trim() || isLoading}
                style={{ padding: "10px", borderRadius: "12px", flexShrink: 0 }}
                title="Send message (Enter)"
              >
                {isLoading ? (
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white",
                    animation: "spin 0.8s linear infinite",
                  }} />
                ) : (
                  <SendIcon size={18} />
                )}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, padding: "0 4px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Press <kbd style={{ padding: "1px 5px", background: "rgba(255,255,255,0.06)", borderRadius: 4, border: "1px solid var(--color-border)", fontFamily: "monospace" }}>Enter</kbd> to send, <kbd style={{ padding: "1px 5px", background: "rgba(255,255,255,0.06)", borderRadius: 4, border: "1px solid var(--color-border)", fontFamily: "monospace" }}>Shift+Enter</kbd> for newline
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ZapIcon size={12} style={{ color: streamingMode ? "var(--amber-400)" : "var(--text-muted)" }} />
              <span style={{ fontSize: "11px", color: streamingMode ? "var(--amber-400)" : "var(--text-muted)" }}>
                {streamingMode ? "Streaming" : "Standard"}
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}