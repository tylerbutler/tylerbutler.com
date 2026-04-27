import GitHubStore from "@benjifs/github-store";
import MicropubEndpoint from "@benjifs/micropub";

// Wrap GitHubStore so that notes posted via Micropub get a `slug:`
// frontmatter field. @benjifs/micropub does not write a slug field, but
// our notes schema and route helpers expect one. The slug is derived from
// the date-prefixed filename produced by `formatSlug` below.
class NoteSlugInjectingStore extends GitHubStore {
  /**
   * @param {string} filename
   * @param {string} content
   */
  async createFile(filename, content) {
    return super.createFile(filename, injectNoteSlug(filename, content));
  }
}

/**
 * @param {string} filename
 * @param {string} content
 */
function injectNoteSlug(filename, content) {
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

export const micropub = new MicropubEndpoint({
  store: new NoteSlugInjectingStore({
    token: process.env.GITHUB_TOKEN,
    user: "tylerbutler",
    repo: "tylerbutler.com",
  }),
  me: "https://tylerbutler.com/",
  tokenEndpoint: "https://tokens.indieauth.com/token",
  contentDir: "src/content",
  mediaDir: "public/uploads",
  /**
   * @param {"article" | string} type
   * @param {string} slug
   */
  formatSlug: (type, slug) => {
    const today = new Date().toISOString().split("T")[0];
    if (type === "article") {
      return `articles/${today}-${slug}`;
    }
    return `notes/${today}-${slug}`;
  },
  /**
   * @param {string} dir
   * @param {string} slug
   */
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
