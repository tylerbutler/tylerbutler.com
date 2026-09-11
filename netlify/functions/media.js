import { micropub } from "../config.js";
import { sanitizeRequest } from "../sanitize-request.js";

export default async (request) =>
  micropub.mediaHandler(await sanitizeRequest(request));
