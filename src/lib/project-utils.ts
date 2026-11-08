import type { CollectionEntry } from "astro:content";
import { includeDraft } from "./draft-utils.ts";

export function getProjectRelationships(
  project: CollectionEntry<"projects">,
  projects: CollectionEntry<"projects">[],
) {
  const dependencyIds = new Set(project.data.dependsOn.map(({ id }) => id));
  for (const id of dependencyIds) {
    if (id === project.id) {
      throw new Error(`Project "${project.id}" cannot depend on itself.`);
    }
    if (!projects.some((candidate) => candidate.id === id)) {
      throw new Error(
        `Project "${project.id}" depends on unknown project "${id}".`,
      );
    }
  }

  const visibleProjects = projects.filter(
    ({ id, data }) => !id.startsWith("_") && includeDraft(data),
  );
  const byTitle = (
    a: CollectionEntry<"projects">,
    b: CollectionEntry<"projects">,
  ) => a.data.title.localeCompare(b.data.title);

  return {
    poweredBy: visibleProjects
      .filter(({ id }) => dependencyIds.has(id))
      .sort(byTitle),
    powers: visibleProjects
      .filter(({ data }) => data.dependsOn.some(({ id }) => id === project.id))
      .sort(byTitle),
  };
}
