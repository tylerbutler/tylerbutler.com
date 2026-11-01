import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export async function prepareNotes(): Promise<void> {
  const hashes: Record<string, string> = {};
  async function walk(dir: string): Promise<void> {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const filename = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(filename);
      else if (!entry.name.startsWith("_") && entry.name.endsWith(".md")) {
        const bytes = await fs.readFile(filename);
        hashes[filename.split(path.sep).join("/")] = createHash("sha1")
          .update(`blob ${bytes.length}\0`)
          .update(bytes)
          .digest("hex");
      }
    }
  }
  await walk("src/content/notes");
  await fs.mkdir(".cache", { recursive: true });
  await fs.writeFile(".cache/notes-source-hashes.json", JSON.stringify(hashes));
}
