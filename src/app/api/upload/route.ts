import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { saveUpload } from "@/lib/storage";

// Used by Ufuk's report/media/distribution-evidence forms. Kept deliberately
// simple (single-file, direct-to-disk) for the demo; the brief's guidance on
// resumable/chunked upload for unstable Gaza connectivity is a production
// concern noted in ARCHITECTURE.md rather than implemented here.
export async function POST(req: NextRequest) {
  try {
    await requireRole("UFUK", "MYFUNDACTION_PC", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (25MB limit in this demo)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileUrl = await saveUpload(file.name, buffer);
  return NextResponse.json({ fileUrl, fileName: file.name });
}
