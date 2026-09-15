import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { auth } from "@/auth";
import { privateFilePath } from "@/lib/storage";

// Mirrors a signed-URL fetch: nothing under storage/uploads is reachable
// without a valid portal session. Swap this handler's internals for a
// redirect to a real signed S3/R2 URL in production; callers never notice.
export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { name } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  try {
    const buffer = await readFile(privateFilePath(name));
    const ext = name.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "mp4"
              ? "video/mp4"
              : "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": contentType } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
