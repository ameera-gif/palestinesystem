"use client";

import { useRef, useState, useTransition } from "react";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-pill";
import { formatMoney } from "@/lib/format";
import { recordDeliveryAction, attachEvidenceAction } from "./actions";

type RecordRowData = {
  id: string;
  childDisplayName: string;
  childCode: string;
  status: string;
  expectedAmount: number;
  currency: string;
  evidenceCount: number;
};

// A card, not a table row — the PLANNED state's form alone has three
// inputs plus a submit button, which never fit in a table cell at phone
// width. A stacked card adapts at every breakpoint on its own, so there's
// no separate desktop/mobile layout to keep in sync.
export function RecordRow({ batchId, record }: { batchId: string; record: RecordRowData }) {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleEvidenceUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.fileUrl) {
        const actionData = new FormData();
        actionData.set("fileUrl", data.fileUrl);
        actionData.set("description", "Support delivery evidence");
        startTransition(() => attachEvidenceAction(batchId, record.id, actionData));
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-4 sm:p-5 border-b border-border last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{record.childDisplayName}</p>
          <p className="text-xs text-muted">{record.childCode}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{formatMoney(record.expectedAmount, record.currency)}</span>
          <StatusBadge status={record.status} />
        </div>
      </div>

      {record.status === "PLANNED" && (
        <form
          action={(formData) => startTransition(() => recordDeliveryAction(batchId, record.id, formData))}
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          <Input type="number" name="actualAmount" defaultValue={record.expectedAmount} className="w-full sm:w-24" required min={0} />
          <Input type="date" name="distributionDate" className="w-full sm:w-40" required />
          <Select name="method" className="w-full sm:w-44" defaultValue="Cash assistance via guardian">
            <option>Cash assistance via guardian</option>
            <option>In-kind support</option>
            <option>Bank transfer</option>
          </Select>
          <Button type="submit" size="sm" variant="outline" disabled={isPending} className="w-full sm:w-auto">
            Record Delivery
          </Button>
        </form>
      )}
      {(record.status === "DISTRIBUTED" || record.status === "EVIDENCE_SUBMITTED") && (
        <div className="mt-3 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleEvidenceUpload(e.target.files[0])}
          />
          <Button type="button" size="sm" variant="outline" disabled={uploading || isPending} onClick={() => fileInputRef.current?.click()}>
            {uploading ? "Uploading…" : `Attach Evidence${record.evidenceCount ? ` (${record.evidenceCount})` : ""}`}
          </Button>
        </div>
      )}
      {record.status === "VERIFIED" && <p className="mt-2 text-xs text-success">Verified by MyFundAction</p>}
      {record.status === "ISSUE_FLAGGED" && <p className="mt-2 text-xs text-danger">Flagged: see MyFundAction notes</p>}
    </div>
  );
}
