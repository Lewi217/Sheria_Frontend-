"use client";

import React, { useState } from "react";
import { ChatMessage, Source } from "@/types";
import { CopyIcon, SparklesIcon, BookIcon } from "./Icons";

interface ChatBubbleProps {
  message: ChatMessage;
}

function SourceCitations({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
      {sources.map((src, i) => (
        <span key={i} className="source-pill">
          <BookIcon size={12} />
          {src.page != null ? `Page ${src.page}` : src.document || `Source ${i + 1}`}
        </span>
      ))}
    </div>
  );
}

function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return (
    <span className="markdown-content" style={{ display: "block" }}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        // Handle newlines
        return part.split("\n").map((line, j, arr) => (
          <React.Fragment key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </React.Fragment>
        ));
      })}
    </span>
  );
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12, padding: "0 4px" }}>
        <div className="chat-bubble-user">
          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "white", margin: 0 }}>
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20, padding: "0 4px", alignItems: "flex-start" }}>
      {/* AI Avatar */}
      <div style={{
        width: 36,
        height: 36,
        flexShrink: 0,
        background: "linear-gradient(135deg, #6366f1, #a855f7)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
      }}>
        <SparklesIcon size={18} style={{ color: "white" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--purple-400)" }}>
            SheriaSummary AI
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="chat-bubble-ai" style={{ maxWidth: "100%" }}>
          {message.isStreaming && !message.content ? (
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          ) : (
            <div style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--text-primary)" }}>
              <MarkdownText text={message.content} />
            </div>
          )}

          {message.sources && message.sources.length > 0 && (
            <SourceCitations sources={message.sources} />
          )}
        </div>

        {/* Copy button */}
        {message.content && !message.isStreaming && (
          <button
            className="btn-ghost"
            onClick={handleCopy}
            style={{ marginTop: 4, fontSize: "12px", padding: "4px 10px" }}
            title="Copy response"
          >
            <CopyIcon size={12} />
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}
