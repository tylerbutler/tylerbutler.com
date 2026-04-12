/**
 * Vite plugin that converts Lottie JSON files under src/lottie/constellations/
 * to dotLottie (.lottie) format at build time. Source JSON files remain untouched.
 *
 * Uses the generateBundle hook to replace emitted .json assets with .lottie
 * equivalents and update all references in JS chunks.
 */
import { createRequire } from "node:module";
import { basename } from "node:path";

const require = createRequire(import.meta.url);

const CONSTELLATION_RE = /^assets\/[a-z][-a-z]*\.[A-Za-z0-9_-]+\.json$/;

const CONSTELLATION_NAMES = new Set([
  "aquarius",
  "aries",
  "berenices-hair",
  "camelopardus",
  "cancer",
  "cepheus",
  "crater",
  "crow",
  "crux",
  "dolphin",
  "gemini",
  "harp",
  "leo",
  "libra",
  "little-bear",
  "pavo",
  "pisces",
  "queen-cassiopeia",
  "sagittarius",
  "scorpio",
  "southern-fish",
  "taurus",
  "telescopium",
  "triangulum-australe",
  "ursa-minor",
  "virgo",
  "volans",
]);

function isConstellationAsset(fileName: string): boolean {
  if (!CONSTELLATION_RE.test(fileName)) return false;
  const name = basename(fileName).split(".")[0]!;
  return CONSTELLATION_NAMES.has(name);
}

interface BundleAsset {
  type: "asset";
  source: string | Uint8Array;
  name?: string;
  fileName: string;
  originalFileNames: string[];
  names: string[];
  needsCodeReference: boolean;
}

interface BundleChunk {
  type: "chunk";
  code: string;
}

type BundleEntry = BundleAsset | BundleChunk;

export function viteDotLottie() {
  return {
    name: "vite-plugin-dotlottie",

    async generateBundle(
      _options: unknown,
      bundle: Record<string, BundleEntry>,
    ) {
      const { DotLottie } = require("@dotlottie/dotlottie-js") as {
        DotLottie: new () => {
          addAnimation(opts: { id: string; data: unknown }): unknown;
          build(): Promise<void>;
          toArrayBuffer(): Promise<ArrayBuffer>;
        };
      };

      const replacements = new Map<string, string>();

      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type !== "asset" || !isConstellationAsset(fileName)) {
          continue;
        }

        const jsonContent =
          typeof asset.source === "string"
            ? asset.source
            : new TextDecoder().decode(asset.source);
        const animationData = JSON.parse(jsonContent);
        const name = basename(fileName, ".json").split(".")[0]!;

        const dotLottie = new DotLottie();
        dotLottie.addAnimation({ id: name, data: animationData });
        await dotLottie.build();
        const buffer = await dotLottie.toArrayBuffer();

        const newFileName = fileName.replace(/\.json$/, ".lottie");
        replacements.set(fileName, newFileName);

        bundle[newFileName] = {
          type: "asset",
          fileName: newFileName,
          name: asset.name?.replace(/\.json$/, ".lottie"),
          needsCodeReference: false,
          originalFileNames: asset.originalFileNames,
          names: asset.names,
          source: new Uint8Array(buffer),
        };

        delete bundle[fileName];
      }

      // Update references in JS chunks
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type !== "chunk") continue;
        let code = chunk.code;
        let changed = false;
        for (const [oldName, newName] of replacements) {
          if (code.includes(oldName)) {
            code = code.replaceAll(oldName, newName);
            changed = true;
          }
        }
        if (changed) {
          chunk.code = code;
        }
      }
    },
  };
}
