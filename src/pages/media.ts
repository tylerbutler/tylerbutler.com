import type { APIContext } from "astro";
import { publish } from "../lib/micropub/handler";

export const prerender = false;
export const ALL = (context: APIContext) => publish(context, true);
