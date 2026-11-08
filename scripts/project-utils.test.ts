import type { CollectionEntry } from "astro:content";
import assert from "node:assert/strict";
import { test } from "node:test";
import { getProjectRelationships } from "../src/lib/project-utils.ts";

function project(
  id: string,
  dependencies: string[] = [],
  draft = false,
): CollectionEntry<"projects"> {
  return {
    id,
    collection: "projects",
    data: {
      title: id,
      draft,
      dependsOn: dependencies.map((id) => ({ collection: "projects", id })),
    },
  };
}

test("project relationships are direct, unique, sorted, and bidirectional", () => {
  const site = project("site", ["zebra", "alpha", "alpha"]);
  const projects = [
    project("zebra", ["indirect"]),
    site,
    project("z-dependent", ["site", "site"]),
    project("indirect"),
    project("alpha"),
    project("a-dependent", ["site"]),
  ];
  const originalOrder = [...projects];
  const { poweredBy, powers } = getProjectRelationships(site, projects);

  assert.deepEqual(
    poweredBy.map(({ id }) => id),
    ["alpha", "zebra"],
  );
  assert.deepEqual(
    powers.map(({ id }) => id),
    ["a-dependent", "z-dependent"],
  );
  assert.deepEqual(
    getProjectRelationships(projects[0], projects).powers.map(({ id }) => id),
    ["site"],
  );
  assert.deepEqual(projects, originalOrder);
  assert.deepEqual(getProjectRelationships(project("alone"), projects), {
    poweredBy: [],
    powers: [],
  });
});

test("both directions respect draft visibility and exclude private IDs", () => {
  const site = project("site", ["draft-library", "_private"]);
  const projects = [
    site,
    project("draft-library", [], true),
    project("draft-dependent", ["site"], true),
    project("_private", ["site"]),
  ];
  const { poweredBy, powers } = getProjectRelationships(site, projects);
  const showDrafts = process.env.SHOW_DRAFTS === "1";
  assert.deepEqual(
    poweredBy.map(({ id }) => id),
    showDrafts ? ["draft-library"] : [],
  );
  assert.deepEqual(
    powers.map(({ id }) => id),
    showDrafts ? ["draft-dependent"] : [],
  );
});

test("unknown and self-references fail with actionable errors", () => {
  const self = project("self", ["self"]);
  assert.throws(
    () => getProjectRelationships(self, [self]),
    /Project "self" cannot depend on itself/,
  );
  assert.throws(
    () => getProjectRelationships(project("site", ["missing"]), []),
    /Project "site" depends on unknown project "missing"/,
  );
});
