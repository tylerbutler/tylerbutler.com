import GitHubStore from "@benjifs/github-store";
import MicropubEndpoint from "@benjifs/micropub";

export const micropub = new MicropubEndpoint({
  store: new GitHubStore({
    token: process.env.GITHUB_TOKEN,
    user: "tylerbutler",
    repo: "tylerbutler.com",
  }),
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
});
