import type { Note } from "./note-schema.ts";
import { getNotePathParts, getNoteUrl } from "./note-utils.ts";

export function noteRoute(path: string | undefined, notes: readonly Note[]) {
  const parts = path?.split("/").filter(Boolean) ?? [];
  if (
    !parts.length ||
    (parts.length === 1 && /^[1-9]\d*$/.test(parts[0]) && parts[0].length !== 4)
  ) {
    const page = parts.length ? Number(parts[0]) : 1;
    const lastPage = Math.max(1, Math.ceil(notes.length / 20));
    return page <= lastPage
      ? { kind: "stream" as const, page, lastPage }
      : undefined;
  }
  if (
    /^\d{4}$/.test(parts[0]) &&
    parts.length <= 2 &&
    (parts.length === 1 || /^(0[1-9]|1[0-2])$/.test(parts[1]))
  ) {
    const items = notes
      .map((note) => ({ note, ...getNotePathParts(note) }))
      .filter(
        (item) =>
          item.year === parts[0] && (!parts[1] || item.month === parts[1]),
      );
    return items.length
      ? {
          kind: parts.length === 1 ? ("year" as const) : ("month" as const),
          year: parts[0],
          month: parts[1],
          items,
        }
      : undefined;
  }
  if (parts.length === 4) {
    const note = notes.find(
      (note) => getNoteUrl(note) === `/notes/${parts.join("/")}`,
    );
    if (note) return { kind: "detail" as const, note };
  }
  return undefined;
}
