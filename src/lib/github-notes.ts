import { parseFrontmatter } from "@astrojs/markdown-remark";
import { type Note, noteSchema } from "./note-schema.ts";

export const NOTES_DIR = "src/content/notes/";
export const UPLOADS_DIR = "public/uploads/";
const API = "https://api.github.com/repos/tylerbutler/tylerbutler.com";
interface TreeEntry {
  path: string;
  sha: string;
  type: string;
}
interface Tree {
  sha: string;
  truncated: boolean;
  tree: TreeEntry[];
}
const parsed = new Map<string, Note>();

export function sourceRevision(): string {
  return process.env.CONTEXT && process.env.CONTEXT !== "production"
    ? process.env.COMMIT_REF || "main"
    : "main";
}

export async function githubJson<T>(path: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("The notes runtime requires GITHUB_TOKEN");
  const response = await fetch(`${API}/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok)
    throw new Error(`GitHub notes request failed (${response.status})`);
  return response.json();
}

export async function githubTree(ref = sourceRevision()): Promise<TreeEntry[]> {
  const root = await githubJson<Tree>(
    `git/trees/${encodeURIComponent(ref)}?recursive=1`,
  );
  if (!root.truncated) return root.tree;
  const entries: TreeEntry[] = [];
  async function walk(sha: string, prefix: string): Promise<void> {
    const tree = await githubJson<Tree>(`git/trees/${encodeURIComponent(sha)}`);
    if (tree.truncated)
      throw new Error("GitHub returned an incomplete notes tree");
    for (const entry of tree.tree) {
      const path = `${prefix}${entry.path}`;
      if (entry.type === "blob") entries.push({ ...entry, path });
      else if (
        entry.type === "tree" &&
        (NOTES_DIR.startsWith(`${path}/`) ||
          path.startsWith(NOTES_DIR) ||
          UPLOADS_DIR.startsWith(`${path}/`) ||
          path.startsWith(UPLOADS_DIR))
      )
        await walk(entry.sha, `${path}/`);
    }
  }
  await walk(root.sha, "");
  return entries;
}

export async function githubBytes(
  sha: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const blob = await githubJson<{ content: string; encoding: string }>(
    `git/blobs/${encodeURIComponent(sha)}`,
  );
  if (blob.encoding !== "base64")
    throw new Error("Unsupported GitHub blob encoding");
  return Uint8Array.from(atob(blob.content.replace(/\s/g, "")), (c) =>
    c.charCodeAt(0),
  );
}

export function parseNote(path: string, markdown: string): Note {
  const { frontmatter, content } = parseFrontmatter(markdown);
  return {
    id: path.replace(NOTES_DIR, "").replace(/\.md$/, ""),
    data: noteSchema.parse(frontmatter),
    body: content,
  };
}

export async function readNotes(
  baseline: readonly Note[],
  hashes: Record<string, string>,
  tree: readonly TreeEntry[],
): Promise<Note[]> {
  const originals = new Map(
    baseline.map((note) => [`${NOTES_DIR}${note.id}.md`, note]),
  );
  const files = tree.filter(
    (file) =>
      file.type === "blob" &&
      file.path.startsWith(NOTES_DIR) &&
      /\/[^_/][^/]*\.md$/.test(file.path),
  );
  const notes: Note[] = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(8, files.length) }, async () => {
      while (cursor < files.length) {
        const file = files[cursor++];
        const key = `${file.path}:${file.sha}`;
        let note =
          hashes[file.path] === file.sha
            ? originals.get(file.path)
            : parsed.get(key);
        if (!note) {
          note = parseNote(
            file.path,
            new TextDecoder().decode(await githubBytes(file.sha)),
          );
          parsed.set(key, note);
          const oldest = parsed.keys().next().value;
          if (parsed.size > 1024 && oldest !== undefined) parsed.delete(oldest);
        }
        notes.push(note);
      }
    }),
  );
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
