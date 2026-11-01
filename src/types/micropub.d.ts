declare module "@benjifs/github-store" {
  export interface GitHubFile {
    filename: string;
    content: string;
    sha: string;
  }
  export interface GitHubWrite {
    message: string;
    content?: string;
    sha?: string;
  }
  export default class GitHubStore {
    constructor(options: { token?: string; user: string; repo: string });
    createFile(filename: string, content: string): Promise<unknown>;
    getFile(filename: string): Promise<GitHubFile | undefined>;
    updateFile(
      filename: string,
      content: string,
      original: GitHubFile,
    ): Promise<unknown>;
    upload(
      method: string,
      filename: string,
      json: GitHubWrite,
    ): Promise<unknown>;
  }
}

declare module "@benjifs/micropub" {
  export default class MicropubEndpoint {
    constructor(options: {
      store: object;
      me: string;
      tokenEndpoint: string;
      contentDir: string;
      mediaDir: string;
      formatSlug: (type: string, slug: string) => string;
      formatFilename: (dir: string, slug: string) => string;
      translateProps: boolean;
      config: {
        "media-endpoint": string;
        "syndicate-to": { uid: string; name: string }[];
        "post-types": { type: string; name: string }[];
      };
    });
    micropubHandler(request: Request): Promise<Response>;
    mediaHandler(request: Request): Promise<Response>;
  }
}
