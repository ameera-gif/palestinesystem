"use client";

import { useActionState } from "react";
import { Field, Select, Textarea, Input } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { uploadMediaAction, type MediaFormState } from "./actions";

export function MediaUploadForm({ childOptions }: { childOptions: { id: string; displayName: string }[] }) {
  const [state, formAction, isPending] = useActionState<MediaFormState, FormData>(uploadMediaAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Child" required>
        <Select name="childId" required>
          {childOptions.map((c) => (
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
      <Field label="File" required>
        <FileUpload name="fileUrl" accept="image/*,video/*,.pdf" required label="Click to upload a photo, video, or document" />
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
      {state?.success && <p className="text-sm text-success">Uploaded. Awaiting MyFundAction review.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Upload for Review"}
      </Button>
    </form>
  );
}
