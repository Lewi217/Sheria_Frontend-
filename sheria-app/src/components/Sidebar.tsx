"use client";

import React from "react";
import { UploadedDocument } from "@/types";
import {
  ScaleIcon,
  UploadIcon,
  ChatIcon,
  FileIcon,
  TrashIcon,
} from "./Icons";

interface SidebarProps {
  activeTab: "upload" | "chat";
  onTabChange: (tab: "upload" | "chat") => void;
  documents: UploadedDocument[];
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onRemoveDocument: (id: string) => void;
  streamingMode: boolean;
  onToggleStreaming: () => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  documents,
  selectedDocumentId,
  onSelectDocument,
  onRemoveDocument,
  streamingMode,
  onToggleStreaming,
}: SidebarProps) {
  return (
    <aside className="sidebar" style={{ zIndex: 1 }}>
      {/* Logo */}
      <div style={{
        padding: "28px 24px 20px",
        borderBottom: "1px solid var(--color-border)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
          }}>
            <ScaleIcon size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
              Sheria<span className="text-gradient">Summary</span>
            </h1>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
              AI Legal Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "16px 12px", flexShrink: 0 }}>
        <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>
          Navigation
        </p>
        {[
          { id: "upload", label: "Upload Document", icon: UploadIcon, badge: null },
          { id: "chat", label: "Chat with AI", icon: ChatIcon, badge: documents.length || null },
        ].map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => onTabChange(id as "upload" | "chat")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: activeTab === id
                ? "rgba(99, 102, 241, 0.12)"
                : "transparent",
              color: activeTab === id
                ? "var(--indigo-400)"
                : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: 2,
              textAlign: "left",
              borderLeft: activeTab === id
                ? "2px solid var(--indigo-500)"
                : "2px solid transparent",
            }}
          >
            <Icon size={16} />
            <span style={{ flex: 1 }}>{label}</span>
            {badge != null && (
              <span style={{
                background: "var(--gradient-primary)",
                color: "white",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "100px",
                minWidth: 20,
                textAlign: "center",
              }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Documents List */}
      {documents.length > 0 && (
        <div style={{ padding: "0 12px 16px", flexShrink: 0 }}>
          <div className="divider" style={{ marginBottom: 14 }} />
          <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>
            Documents ({documents.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: "var(--radius-md)",
                  background: selectedDocumentId === doc.id
                    ? "rgba(99, 102, 241, 0.08)"
                    : "transparent",
                  border: `1px solid ${selectedDocumentId === doc.id ? "rgba(99, 102, 241, 0.2)" : "transparent"}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => onSelectDocument(doc.id)}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  background: "rgba(99, 102, 241, 0.1)",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <FileIcon size={14} style={{ color: "#818cf8" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: selectedDocumentId === doc.id ? "var(--indigo-400)" : "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.3,
                  }}>
                    {doc.filename}
                  </p>
                  {doc.size && (
                    <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {formatFileSize(doc.size)}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveDocument(doc.id); }}
                  style={{
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    opacity: 0,
                    transition: "opacity 0.2s, color 0.2s",
                  }}
                  className="delete-btn"
                  title="Remove document"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "1";
                    (e.currentTarget as HTMLElement).style.color = "var(--rose-400)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "0";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  }}
                >
                  <TrashIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Streaming Toggle */}
      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid var(--color-border)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Streaming mode
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Real-time token output
            </p>
          </div>
          <button
            onClick={onToggleStreaming}
            role="switch"
            aria-checked={streamingMode}
            style={{
              width: 44,
              height: 24,
              borderRadius: 100,
              background: streamingMode
                ? "linear-gradient(135deg, #6366f1, #a855f7)"
                : "rgba(255,255,255,0.08)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.3s",
              flexShrink: 0,
            }}
          >
            <div style={{
              position: "absolute",
              top: 2,
              left: streamingMode ? 22 : 2,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "white",
              transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)", flexShrink: 0 }}>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
          Powered by{" "}
          <a
            href="https://urbanroof.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--indigo-400)", textDecoration: "none" }}
          >
            urbanroof.app
          </a>
        </p>
      </div>
    </aside>
  );
}
