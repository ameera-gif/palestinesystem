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
    <tr className="border-b border-border last:border-0 align-top">
      <td className="p-3">
        <p className="font-medium text-ink">{record.childDisplayName}</p>
        <p className="text-xs text-muted">{record.childCode}</p>
      </td>
      <td className="p-3 text-muted">{formatMoney(record.expectedAmount, record.currency)}</td>
      <td className="p-3">
        <StatusBadge status={record.status} />
      </td>
      <td className="p-3">
        {record.status === "PLANNED" && (
          <form
            action={(formData) => startTransition(() => recordDeliveryAction(batchId, record.id, formData))}
            className="flex flex-wrap items-center gap-2"
          >
            <Input type="number" name="actualAmount" defaultValue={record.expectedAmount} className="w-24" required min={0} />
            <Input type="date" name="distributionDate" className="w-40" required />
            <Select name="method" className="w-44" defaultValue="Cash assistance via guardian">
              <option>Cash assistance via guardian</option>
              <option>In-kind support</option>
              <option>Bank transfer</option>
            </Select>
            <Button type="submit" size="sm" variant="outline" disabled={isPending}>
              Record Delivery
            </Button>
          </form>
        )}
        {(record.status === "DISTRIBUTED" || record.status === "EVIDENCE_SUBMITTED") && (
          <div className="flex items-center gap-2">
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
        {record.status === "VERIFIED" && <span className="text-xs text-success">Verified by MyFundAction</span>}
        {record.status === "ISSUE_FLAGGED" && <span className="text-xs text-danger">Flagged — see MyFundAction notes</span>}
      </td>
    </tr>
  );
}
