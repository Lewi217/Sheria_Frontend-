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

function normalizeContent(raw: string): string {
  let text = raw;

  const sectionKeywords = [
    "Summary", "Key Points", "Key Point",
    "Legal Citation", "Legal Citations",
    "Specific Legal Citations", "Overview",
    "Background", "Conclusion", "Important Note", "Note",
  ];

  for (const kw of sectionKeywords) {
    text = text.replace(
      new RegExp(`\\*{1,2}\\s*${kw}\\s*:*\\s*\\*{1,2}:?`, "gi"),
      `${kw}:`
    );
  }
  for (const kw of sectionKeywords) {
    text = text.replace(
      new RegExp(`\\s*${kw}:\\s*`, "gi"),
      `\n\n${kw}:\n`
    );
  }
  text = text.replace(/\.\.\s*/g, "\n• ");
  text = text.replace(/\s+-\s+/g, "\n  • ");
  text = text.replace(/^\.+\s*/gm, "");
  text = text.replace(/^\s*\*+\s*$/gm, "");
  for (const kw of sectionKeywords) {
    text = text.replace(
      new RegExp(`(\\n\\n${kw}:\\n)\\s*\\n*${kw}:\\n`, "gi"),
      "$1"
    );
  }
  text = text.replace(/([^\n])\s*(\d+\.\s)/g, "$1\n$2");
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

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
              background: "rgba(99,102,241,0.12)",
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
  const normalized = normalizeContent(text);
  const lines = normalized.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      elements.push(<div key={key++} style={{ height: 8 }} />);
      continue;
    }

    const boldHeader = line.match(/^\*\*([^*]+?):?\*\*:?$/);
    if (boldHeader) {
      elements.push(
        <div key={key++} style={{
          marginTop: 16, marginBottom: 6, paddingBottom: 5,
          borderBottom: "1px solid rgba(99,102,241,0.2)",
        }}>
          <span style={{
            fontSize: "11px", fontWeight: 800, color: "var(--purple-400)",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            {boldHeader[1].replace(/:+$/, "")}
          </span>
        </div>
      );
      continue;
    }

    const plainHeader = line.match(
      /^(Summary|Key Points?|Legal Citations?|Specific Legal Citations?|Overview|Background|Conclusion|Important Note|Note):$/i
    );
    if (plainHeader) {
      elements.push(
        <div key={key++} style={{
          marginTop: elements.length > 0 ? 16 : 0, marginBottom: 6,
          paddingBottom: 5, borderBottom: "1px solid rgba(99,102,241,0.2)",
        }}>
          <span style={{
            fontSize: "11px", fontWeight: 800, color: "var(--purple-400)",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            {plainHeader[1]}
          </span>
        </div>
      );
      continue;
    }

    const indentedBullet = raw.match(/^\s{1,4}[•]\s+(.+)$/);
    if (indentedBullet) {
      elements.push(
        <div key={key++} style={{
          display: "flex", gap: 8, marginBottom: 5,
          alignItems: "flex-start", paddingLeft: 20,
        }}>
          <span style={{
            flexShrink: 0, width: 4, height: 4,
            background: "rgba(99,102,241,0.5)",
            borderRadius: "50%", marginTop: 9,
          }} />
          <span style={{ flex: 1, lineHeight: 1.65, fontSize: "13px", color: "var(--text-secondary)" }}>
            <InlineText text={indentedBullet[1]} />
          </span>
        </div>
      );
      continue;
    }

    const numbered = line.match(/^(\d+)\.\s+(.+)$/);
    if (numbered) {
      elements.push(
        <div key={key++} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
          <span style={{
            flexShrink: 0, width: 22, height: 22,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "11px", fontWeight: 700,
            color: "var(--purple-400)", marginTop: 2,
          }}>
            {numbered[1]}
          </span>
          <span style={{ flex: 1, lineHeight: 1.7, fontSize: "14px" }}>
            <InlineText text={numbered[2]} />
          </span>
        </div>
      );
      continue;
    }

    const bullet = line.match(/^[-•]\s+(.+)$/);
    if (bullet) {
      elements.push(
        <div key={key++} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
          <span style={{
            flexShrink: 0, width: 6, height: 6,
            background: "var(--purple-400)", borderRadius: "50%", marginTop: 8,
          }} />
          <span style={{ flex: 1, lineHeight: 1.7, fontSize: "14px" }}>
            <InlineText text={bullet[1]} />
          </span>
        </div>
      );
      continue;
    }

    const isSubHeader =
      line.endsWith(":") &&
      line.length <= 80 &&
      !line.match(/^\d+\./) &&
      !line.startsWith("•") &&
      !line.startsWith("  •");

    if (isSubHeader) {
      elements.push(
        <p key={key++} style={{
          fontWeight: 700, color: "var(--text-primary)",
          marginTop: 10, marginBottom: 4, fontSize: "13px",
        }}>
          <InlineText text={line} />
        </p>
      );
      continue;
    }

    elements.push(
      <p key={key++} style={{
        marginBottom: 8, lineHeight: 1.75, fontSize: "14px",
        color: "var(--text-primary)",
      }}>
        <InlineText text={line} />
      </p>
    );
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
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        background: "linear-gradient(135deg, #6366f1, #a855f7)",
        borderRadius: "50%", display: "flex", alignItems: "center",
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
          >
            <CopyIcon size={12} />
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}