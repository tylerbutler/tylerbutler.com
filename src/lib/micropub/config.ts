import type { GitHubFile, GitHubWrite } from "@benjifs/github-store";
import GitHubStore from "@benjifs/github-store";
import MicropubEndpoint from "@benjifs/micropub";
import { NOTES_DIR, parseNote, UPLOADS_DIR } from "../github-notes.ts";
import type { Note } from "../note-schema.ts";

// Wrap GitHubStore so that notes posted via Micropub get a `slug:`
// frontmatter field. @benjifs/micropub does not write a slug field, but
// our notes schema and route helpers expect one. The slug is derived from
// the date-prefixed filename produced by `formatSlug` below.
class NoteSlugInjectingStore extends GitHubStore {
  createdNote?: Note;
  resolveNote: (url: string) => Promise<Note | undefined>;
  constructor(
    options: ConstructorParameters<typeof GitHubStore>[0],
    resolveNote: (url: string) => Promise<Note | undefined>,
  ) {
    super(options);
    this.resolveNote = resolveNote;
  }

  async createFile(filename: string, content: string) {
    const output = injectNoteSlug(
      filename,
      normalizeNoteContent(filename, content),
    );
    if (filename.startsWith(NOTES_DIR))
      this.createdNote = parseNote(filename, output);
    return super.createFile(filename, output);
  }

  async storagePath(filename: string) {
    if (!/^src\/content\/notes\/\d{4}\/\d{2}\/\d{2}\/.+\.md$/.test(filename))
      return filename;
    const url = filename.replace("src/content", "").replace(/\.md$/, "");
    const note = await this.resolveNote(url);
    return note ? `${NOTES_DIR}${note.id}.md` : filename;
  }

  async getFile(filename: string) {
    return super.getFile(await this.storagePath(filename));
  }

  async updateFile(filename: string, content: string, original: GitHubFile) {
    const path = await this.storagePath(filename);
    content = normalizeNoteContent(path, content);
    if (path.startsWith(NOTES_DIR)) parseNote(path, content);
    return super.updateFile(path, content, original);
  }

  async upload(method: string, filename: string, json: GitHubWrite) {
    return super.upload(method, filename, {
      ...json,
      message: publishCommitMessage(filename, json.message),
    });
  }
}

export function publishCommitMessage(filename: string, message: string) {
  return filename.startsWith(NOTES_DIR) || filename.startsWith(UPLOADS_DIR)
    ? `${message} [skip netlify]`
    : message;
}

function normalizeNoteContent(filename: string, content: string): string {
  return filename.startsWith(NOTES_DIR)
    ? content.replaceAll(
        "https://tylerbutler.com/public/uploads/",
        "https://tylerbutler.com/uploads/",
      )
    : content;
}

function injectNoteSlug(filename: string, content: string) {
  const match = filename.match(/\/notes\/\d{4}-\d{2}-\d{2}-(.+)\.md$/);
  if (!match) return content;
  const slug = match[1];
  // Look for an existing `slug:` line inside the opening frontmatter block.
  const fmEnd = content.indexOf("\n---", 4);
  const fmBlock = fmEnd > 0 ? content.slice(0, fmEnd) : "";
  if (/^slug:\s/m.test(fmBlock)) return content;
  const escaped = slug.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return content.replace(/^---\n/, `---\nslug: "${escaped}"\n`);
}

export function createMicropub(
  resolveNote: (url: string) => Promise<Note | undefined>,
) {
  const store = new NoteSlugInjectingStore(
    {
      token: process.env.GITHUB_TOKEN,
      user: "tylerbutler",
      repo: "tylerbutler.com",
    },
    resolveNote,
  );
  const endpoint = new MicropubEndpoint({
    store,
    me: "https://tylerbutler.com/",
    tokenEndpoint: "https://tokens.indieauth.com/token",
    contentDir: "src/content",
    mediaDir: "public/uploads",
    formatSlug: (type, slug) => {
      const today = new Date().toISOString().split("T")[0];
      if (type === "article") {
        return `articles/${today}-${slug}`;
      }
      return `notes/${today}-${slug}`;
    },
    formatFilename: (dir, slug) => `${dir}/${slug}.md`,
    translateProps: true,
    // Advertised via GET /micropub?q=config (and individual q=media-endpoint,
    // q=syndicate-to, q=post-types queries). Structured so additional
    // syndication targets (Mastodon, Bluesky) can be added later without
    // changing the shape clients see.
    config: {
      "media-endpoint": "https://tylerbutler.com/media",
      "syndicate-to": [
        {
          uid: "https://micro.blog/",
          name: "micro.blog",
        },
      ],
      "post-types": [
        { type: "note", name: "Note" },
        { type: "article", name: "Article" },
        { type: "photo", name: "Photo" },
        { type: "reply", name: "Reply" },
        { type: "like", name: "Like" },
        { type: "repost", name: "Repost" },
        { type: "bookmark", name: "Bookmark" },
        { type: "rsvp", name: "RSVP" },
      ],
    },
  });
  return { store, endpoint };
}
