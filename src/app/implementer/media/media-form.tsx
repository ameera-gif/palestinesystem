"use client";

import { useActionState, useState } from "react";
import { Field, Select, Textarea, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { uploadMediaAction, type MediaFormState } from "./actions";

export function MediaUploadForm({ children }: { children: { id: string; displayName: string }[] }) {
  const [state, formAction, isPending] = useActionState<MediaFormState, FormData>(uploadMediaAction, null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.fileUrl) {
        setFileUrl(data.fileUrl);
        setFileName(file.name);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="fileUrl" value={fileUrl ?? ""} />
      <Field label="Child" required>
        <Select name="childId" required>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.displayName}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Type">
        <Select name="type" defaultValue="PHOTO">
          <option value="PHOTO">Photo</option>
          <option value="VIDEO">Video</option>
          <option value="DOCUMENT">Document</option>
        </Select>
      </Field>
      <Field label="File" required hint={uploading ? "Uploading…" : fileName ? `Uploaded: ${fileName}` : undefined}>
        <Input
          type="file"
          accept="image/*,video/*,.pdf"
          required={!fileUrl}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </Field>
      <Field label="Description">
        <Textarea name="description" maxLength={300} />
      </Field>
      <Field label="Purpose">
        <Input name="purpose" placeholder="e.g. Education activity update" />
      </Field>
      <Field label="Requested visibility" hint="MyFundAction gives final approval">
        <Select name="visibility" defaultValue="SPONSOR_ONLY">
          <option value="INTERNAL">Internal only</option>
          <option value="SPONSOR_ONLY">Sponsor only</option>
          <option value="PUBLIC_APPROVED">Public approved</option>
        </Select>
      </Field>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="consentConfirmed" required className="h-4 w-4" />
        Consent for use of this media has been confirmed with the guardian.
      </label>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">Uploaded — awaiting MyFundAction review.</p>}
      <Button type="submit" disabled={isPending || uploading || !fileUrl}>
        {isPending ? "Saving…" : "Upload for Review"}
      </Button>
    </form>
  );
}
