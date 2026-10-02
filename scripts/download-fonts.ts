import fs from "fs";
import path from "path";
import {
  FONT_FAMILIES,
  FONT_SERVICE_ORIGIN,
  FONT_SITE,
} from "./font-config.ts";

interface GitHubFileData {
  download_url?: string;
}

export async function downloadFonts(): Promise<void> {
  console.log("Checking fonts...");

  const fontsDir = path.join(process.cwd(), "public", "fonts");
  const repo = `${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`;

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

  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Private-Font-Downloader",
  };

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

          let response: Response;
          if (family.id === "idlewild") {
            response = await fetch(
              `${FONT_SERVICE_ORIGIN}/fonts/${face.fileName}`,
              { headers: { Origin: `https://${FONT_SITE}` } },
            );
          } else {
            if (!process.env.GITHUB_TOKEN) {
              throw new Error("GITHUB_TOKEN environment variable is required");
            }
            const apiUrl = `https://api.github.com/repos/${repo}/contents/fonts/PragmataPro0.902W/${face.fileName}`;
            const metaResponse = await fetch(apiUrl, { headers });

            if (!metaResponse.ok) {
              throw new Error(
                `GitHub API error: ${metaResponse.status} ${metaResponse.statusText}`,
              );
            }

            const fileData = (await metaResponse.json()) as GitHubFileData;
            const downloadUrl = fileData.download_url;

            if (!downloadUrl) {
              throw new Error("No download URL found in GitHub API response");
            }

            // Download file using the download URL
            response = await fetch(downloadUrl, {
              headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                "User-Agent": "Private-Font-Downloader",
              },
            });
          }

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
