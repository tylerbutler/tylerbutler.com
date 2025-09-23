// TypeScript interfaces for content management
export interface ArticleMeta {
  title: string;
  date: string;
  tags?: string[];
  slug: string;
  excerpt?: string;
  draft?: boolean;
  year: string;
  month: string;
}

export interface ProjectMeta {
  title: string;
  description?: string;
  slug: string;
  tags?: string[];
  url?: string;
  github?: string;
}

export interface ProcessedContent {
  metadata: ArticleMeta;
  html: string;
  excerpt: string;
}

export interface ProcessedProjectContent {
  metadata: ProjectMeta;
  html: string;
  excerpt: string;
}

export interface PageMeta {
  title: string;
  description?: string;
  slug: string;
}