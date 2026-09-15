import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Local filesystem storage for the demo, deliberately shaped so it can be
 * swapped for S3/R2 by rewriting only this module:
 *  - `saveUpload()` -> would become a putObject call, returning an object key
 *  - files are served via /api/files/[name], an authenticated route handler,
 *    which mirrors the shape of a signed-URL fetch even though today it just
 *    checks the Node session directly. No uploaded file is ever placed under
 *    /public — that's reserved for generated, non-sensitive placeholder art
 *    (avatars, illustrative photos) used to keep this demo free of any real
 *    or fabricated depictions of real children.
 */

const PRIVATE_DIR = path.join(process.cwd(), "storage", "uploads");
const PUBLIC_DIR = path.join(process.cwd(), "public", "generated");

export async function saveUpload(fileName: string, buffer: Buffer): Promise<string> {
  await mkdir(PRIVATE_DIR, { recursive: true });
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await writeFile(path.join(PRIVATE_DIR, safeName), buffer);
  return `/api/files/${safeName}`;
}

export function privateFilePath(name: string): string {
  return path.join(PRIVATE_DIR, name);
}

export async function saveGeneratedAsset(subdir: string, fileName: string, contents: string): Promise<string> {
  const dir = path.join(PUBLIC_DIR, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), contents, "utf-8");
  return `/generated/${subdir}/${fileName}`;
}
