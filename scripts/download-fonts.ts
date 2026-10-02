import fs from "fs";
import path from "path";
import {
  FONT_FAMILIES,
  FONT_SERVICE_ORIGIN,
  FONT_SITE,
} from "./font-config.ts";

export async function downloadFonts(): Promise<void> {
  console.log("Checking fonts...");

  const fontsDir = path.join(process.cwd(), "public", "fonts");
  // Create fonts directory
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  const allFontsExist = FONT_FAMILIES.every((family) =>
    family.faces.every((face) =>
      fs.existsSync(path.join(fontsDir, face.fileName)),
    ),
  );

  if (allFontsExist) {
    console.log("All fonts already exist, skipping download");
    return;
  }

  try {
    for (const family of FONT_FAMILIES) {
      for (const face of family.faces) {
        const outputPath = path.join(fontsDir, face.fileName);
        if (fs.existsSync(outputPath)) {
          console.log(`Skipping ${face.fileName}...`);
          continue;
        }

        try {
          console.log(`Downloading ${face.fileName}...`);

          const response = await fetch(
            `${FONT_SERVICE_ORIGIN}/fonts/${face.fileName}`,
            { headers: { Origin: `https://${FONT_SITE}` } },
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const buffer = await response.arrayBuffer();
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, Buffer.from(buffer));

          console.log(`✓ Downloaded: ${face.fileName}`);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          throw new Error(
            `Failed to download font: ${face.fileName} - ${errorMessage}`,
          );
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Font download error: ${errorMessage}`);
  }
}
