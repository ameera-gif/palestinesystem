"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * One shared upload control for every place Ufuk attaches evidence or
 * media — a real dropzone-style button with a visible uploading state and
 * a confirmed-filename state, instead of each screen wiring its own bare
 * `<input type="file">` plus ad-hoc "Uploading…" text. Posts straight to
 * `/api/upload` and writes the resulting URL into a hidden field named
 * `name`, so it drops into any existing `<form action={...}>` unchanged.
 */
export function FileUpload({
  name,
  accept,
  required,
  label = "Click to upload a file",
  onUploaded,
}: {
  name: string;
  accept?: string;
  required?: boolean;
  label?: string;
  onUploaded?: (fileUrl: string, fileName: string) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.fileUrl) {
        setFileUrl(data.fileUrl);
        setFileName(file.name);
        onUploaded?.(data.fileUrl, file.name);
      } else {
        setError("Upload failed. Try again.");
      }
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={fileUrl ?? ""} />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        required={required && !fileUrl}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors disabled:opacity-60",
          fileName ? "border-success/40 bg-success-light/40" : "border-border hover:border-brand hover:bg-brand-light/40",
        )}
      >
        {uploading ? (
          <span className="text-muted">Uploading…</span>
        ) : fileName ? (
          <>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0" aria-hidden="true">
              <path d="M3 8.5l3 3 7-7" />
            </svg>
            <span className="text-ink font-medium">
              {fileName} <span className="text-muted font-normal">(click to replace)</span>
            </span>
          </>
        ) : (
          <span className="text-muted">{label}</span>
        )}
      </button>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
