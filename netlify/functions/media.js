import { micropub } from "../config.js";

/** @param {Request} request */
export default async function handler(request) {
  return micropub.mediaHandler(request);
}
