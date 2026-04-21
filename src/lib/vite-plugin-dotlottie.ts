/**
 * Vite plugin that converts Lottie JSON files under src/lottie/constellations/
 * to dotLottie (.lottie) format at build time. Source JSON files remain untouched.
 *
 * Runs the conversion in `buildStart` (before module loading), writing .lottie
 * files alongside the JSON sources. These are gitignored and imported via
 * `import.meta.glob("*.lottie", { query: "?url" })`.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, join, resolve } from "node:path";

const require = createRequire(import.meta.url);

const CONSTELLATIONS_DIR = "src/lottie/constellations";

export function viteDotLottie(): import("vite").Plugin {
  return {
    name: "vite-plugin-dotlottie",

    async buildStart() {
      const { DotLottie } = require("@dotlottie/dotlottie-js") as {
        DotLottie: new () => {
          addAnimation(opts: { id: string; data: unknown }): unknown;
          build(): Promise<void>;
          toArrayBuffer(): Promise<ArrayBuffer>;
        };
      };

      const dir = resolve(CONSTELLATIONS_DIR);
      const jsonFiles = readdirSync(dir).filter((f) => f.endsWith(".json"));

      await Promise.all(
        jsonFiles.map(async (file) => {
          const name = basename(file, ".json");
          const jsonPath = join(dir, file);
          const lottiePath = join(dir, `${name}.lottie`);

          const animationData = JSON.parse(readFileSync(jsonPath, "utf-8"));
          const dotLottie = new DotLottie();
          dotLottie.addAnimation({ id: name, data: animationData });
          await dotLottie.build();
          const buffer = await dotLottie.toArrayBuffer();

          writeFileSync(lottiePath, new Uint8Array(buffer));
        }),
      );
    },
  };
}
