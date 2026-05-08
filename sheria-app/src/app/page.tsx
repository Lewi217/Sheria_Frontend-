"use client";

import React, { useState, useCallback } from "react";
import { UploadedDocument } from "@/types";
import Sidebar from "@/components/Sidebar";
import UploadZone from "@/components/UploadZone";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upload" | "chat">("upload");
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [streamingMode, setStreamingMode] = useState(true);

  const handleUploadComplete = useCallback((doc: UploadedDocument) => {
    setDocuments((prev) => [...prev, doc]);
    setSelectedDocumentId(doc.id);
    setActiveTab("chat");
  }, []);

  const handleRemoveDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocumentId((prev) => (prev === id ? null : prev));
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative", zIndex: 1 }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documents={documents}
        selectedDocumentId={selectedDocumentId}
        onSelectDocument={setSelectedDocumentId}
        onRemoveDocument={handleRemoveDocument}
        streamingMode={streamingMode}
        onToggleStreaming={() => setStreamingMode((v) => !v)}
      />

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "32px 40px",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28, flexShrink: 0 }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            {activeTab === "upload" ? "Upload Document" : "Chat with AI"}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {activeTab === "upload"
              ? "Upload a PDF legal document to get started"
              : "Ask questions about your uploaded legal documents"}
          </p>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minHeight: 0, overflowY: activeTab === "upload" ? "auto" : "hidden" }}>
          {activeTab === "upload" ? (
            <UploadZone onUploadComplete={handleUploadComplete} />
          ) : (
            <ChatInterface
              documents={documents}
              selectedDocumentId={selectedDocumentId}
              onSelectDocument={setSelectedDocumentId}
              streamingMode={streamingMode}
            />
          )}
        </div>
      </main>
    </div>
  );
}