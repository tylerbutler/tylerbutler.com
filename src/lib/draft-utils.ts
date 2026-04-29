// Drafts are hidden by default. Set SHOW_DRAFTS=1 (e.g. `SHOW_DRAFTS=1 pnpm dev`)
// to include them in collection queries, listing pages, the feed, etc.
const showDrafts = process.env.SHOW_DRAFTS === "1";

export function includeDraft(data: { draft?: boolean }): boolean {
  return showDrafts || !data.draft;
}
