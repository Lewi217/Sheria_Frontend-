"use client";

import React, { useCallback, useRef, useState } from "react";
import { UploadIcon, FileIcon, CheckCircleIcon, ErrorIcon } from "./Icons";
import { uploadDocument } from "@/services/api";
import { UploadedDocument } from "@/types";

interface UploadZoneProps {
  onUploadComplete: (doc: UploadedDocument) => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".pdf")) {
        setErrorMessage("Only PDF files are supported.");
        setUploadStatus("error");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage("File must be under 50MB.");
        setUploadStatus("error");
        return;
      }

      setIsUploading(true);
      setUploadStatus("idle");
      setErrorMessage("");
      setUploadedFileName(file.name);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      try {
        const response = await uploadDocument(file);
        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadStatus("success");

        const doc: UploadedDocument = {
          id: response.documentId || `doc_${Date.now()}`,
          filename: response.filename || file.name,
          uploadedAt: new Date(),
          size: file.size,
          status: "ready",
        };
        onUploadComplete(doc);
      } catch (err) {
        clearInterval(progressInterval);
        setUploadStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Upload failed. Please try again."
        );
      } finally {
        setIsUploading(false);
        setTimeout(() => {
          if (uploadStatus !== "error") {
            setUploadProgress(0);
          }
        }, 2000);
      }
    },
    [onUploadComplete, uploadStatus]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Drop Zone */}
      <div
        className={`upload-zone ${isDragging ? "dragging" : ""}`}
        style={{
          padding: "56px 32px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        aria-label="Upload PDF document"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload-input"
        />

        {/* Icon */}
        <div style={{
          width: 80,
          height: 80,
          background: "rgba(99, 102, 241, 0.1)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          transition: "all 0.3s",
        }}>
          <UploadIcon size={36} className="text-gradient" style={{ color: "#6366f1" }} />
        </div>

        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
          Drop your legal document here
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: 20 }}>
          or click to browse your files
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <span className="badge badge-purple">📄 PDF only</span>
          <span className="badge badge-cyan">⚡ Max 50MB</span>
          <span className="badge badge-emerald">🔒 Secure upload</span>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="glass-card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 36,
              height: 36,
              background: "rgba(99, 102, 241, 0.1)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <FileIcon size={18} style={{ color: "#818cf8" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {uploadedFileName}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Uploading & processing…
              </p>
            </div>
            <span style={{ fontSize: "13px", color: "var(--indigo-400)", fontWeight: 600, flexShrink: 0 }}>
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%`, transition: "width 0.3s ease" }} />
          </div>
        </div>
      )}

      {/* Success State */}
      {uploadStatus === "success" && !isUploading && (
        <div className="glass-card animate-fadeIn" style={{
          padding: "16px 20px",
          border: "1px solid rgba(52, 211, 153, 0.25)",
          background: "rgba(52, 211, 153, 0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CheckCircleIcon size={20} style={{ color: "var(--emerald-400)", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--emerald-400)" }}>
                Document uploaded successfully!
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Your document is ready. Switch to Chat to ask questions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {uploadStatus === "error" && (
        <div className="glass-card animate-fadeIn" style={{
          padding: "16px 20px",
          border: "1px solid rgba(251, 113, 133, 0.25)",
          background: "rgba(251, 113, 133, 0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ErrorIcon size={20} style={{ color: "var(--rose-400)", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--rose-400)" }}>
                Upload failed
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
