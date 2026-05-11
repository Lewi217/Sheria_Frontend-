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

// Renders inline bold/italic/code within a line
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} style={{ color: "var(--purple-400)", fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} style={{
              background: "rgba(99,102,241,0.1)",
              padding: "1px 5px",
              borderRadius: 4,
              fontSize: "13px",
              fontFamily: "monospace",
            }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

function MarkdownText({ text }: { text: string }) {
  // Split into lines and filter truly empty ones
  const lines = text.split("\n");

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip blank lines (just add spacing)
    if (!trimmed) {
      i++;
      continue;
    }

    // ── Section header: "Summary:", "Key Points:", "Legal Citation:"
    // Also handles "**Summary:**" markdown format
    const cleanedForHeader = trimmed.replace(/\*\*/g, "");
    const isHeader =
      (cleanedForHeader.endsWith(":") &&
        !trimmed.match(/^\d+\./) &&
        !trimmed.startsWith("-") &&
        !trimmed.startsWith("•") &&
        trimmed.length < 60);

    if (isHeader) {
      elements.push(
        <div key={i} style={{
          marginTop: elements.length > 0 ? 20 : 0,
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: "1px solid rgba(99,102,241,0.2)",
        }}>
          <span style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--purple-400)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            <InlineText text={cleanedForHeader} />
          </span>
        </div>
      );
      i++;
      continue;
    }

    // ── Numbered list item: "1. text", "2. text"
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      elements.push(
        <div key={i} style={{
          display: "flex",
          gap: 10,
          marginBottom: 8,
          alignItems: "flex-start",
        }}>
          <span style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--purple-400)",
            marginTop: 1,
          }}>
            {numberedMatch[1]}
          </span>
          <span style={{ flex: 1, lineHeight: 1.7, fontSize: "14px" }}>
            <InlineText text={numberedMatch[2]} />
          </span>
        </div>
      );
      i++;
      continue;
    }

    // ── Bullet point: "- text" or "• text"
    const bulletMatch = trimmed.match(/^[-•]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        <div key={i} style={{
          display: "flex",
          gap: 10,
          marginBottom: 8,
          alignItems: "flex-start",
        }}>
          <span style={{
            flexShrink: 0,
            color: "var(--purple-400)",
            fontWeight: 700,
            fontSize: "16px",
            lineHeight: 1.5,
          }}>
            ·
          </span>
          <span style={{ flex: 1, lineHeight: 1.7, fontSize: "14px" }}>
            <InlineText text={bulletMatch[1]} />
          </span>
        </div>
      );
      i++;
      continue;
    }

    // ── Regular paragraph
    elements.push(
      <p key={i} style={{
        marginBottom: 10,
        lineHeight: 1.75,
        fontSize: "14px",
        color: "var(--text-primary)",
      }}>
        <InlineText text={trimmed} />
      </p>
    );
    i++;
  }

  return <div className="markdown-content">{elements}</div>;
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
            <MarkdownText text={message.content} />
          )}

          {message.sources && message.sources.length > 0 && (
            <SourceCitations sources={message.sources} />
          )}
        </div>

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