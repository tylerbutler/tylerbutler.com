/**
 * Shared prop types for the tinylytics Astro components. Astro `.astro`
 * files cannot re-export their `Props` interface through a barrel `index.ts`
 * (only the default component export is forwarded), so the types live here
 * for consumers that need them.
 */

export interface ScriptProps {
  embedCode: string;
  min?: boolean;
  spa?: boolean;
  ignore?: boolean;
  hits?: boolean | "unique";
  kudos?: boolean | "custom" | string;
  uptime?: boolean;
  countries?: boolean;
  webring?: boolean | "avatars";
  events?: boolean;
  beacon?: boolean;
  defer?: boolean;
}

export interface WidgetProps {
  /** HTML element to render. */
  as?: keyof HTMLElementTagNameMap;
  /** Optional class name(s) to append. */
  class?: string;
  /** Sets `data-ignore="true"` so this instance is excluded from tracking. */
  ignore?: boolean;
}

export interface KudosProps {
  /** Path the kudos count is associated with. Required for multi-button pages. */
  path?: string;
  /** Render kudos privately (count visible only to the site owner). */
  private?: boolean;
  ignore?: boolean;
  class?: string;
}

export interface WebringProps {
  avatar?: boolean;
  avatarPosition?: "before" | "after";
  newTab?: boolean;
  class?: string;
  avatarAlt?: string;
}

export interface PixelProps {
  embedCode: string;
  path?: string;
}

export interface EventProps {
  /** Event name in `category.action` format. */
  name: string;
  /** Optional event value stored as `event_properties["value"]`. */
  value?: string;
  /** Element to render. Defaults to `a` when `href` is present, else `button`. */
  as?: "a" | "button" | "div" | "span";
}
