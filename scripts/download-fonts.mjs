import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const fonts = [
	"PragmataPro_Mono_R_liga_0902.woff2",
	"PragmataPro_Mono_B_liga_0902.woff2",
	"PragmataPro_Mono_I_liga_0902.woff2",
	"PragmataPro_Mono_Z_liga_0902.woff2",
].map((p) => `fonts/PragmataPro0.902W/${p}`);

export async function downloadFonts() {
	console.log("Downloading fonts using GitHub CLI...");

	const fontsDir = path.join(process.cwd(), "public", "fonts");
	const repo = `${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`;

	// Create fonts directory
	if (!fs.existsSync(fontsDir)) {
		fs.mkdirSync(fontsDir, { recursive: true });
	}

	try {
		// Check if already authenticated, if not authenticate with GitHub CLI
		try {
			execSync("gh auth status", { stdio: "pipe" });
			console.log("GitHub CLI already authenticated");
		} catch {
			console.log("Authenticating with GitHub CLI...");
			execSync(
				`echo ${process.env.GITHUB_TOKEN} | gh auth login --with-token`,
				{ stdio: "pipe" },
			);
		}

		for (const font of fonts) {
			const fontName = path.basename(font);
			const outputPath = path.join(fontsDir, fontName);
			if (fs.existsSync(outputPath)) {
				console.log(`Skipping ${fontName}...`);
				continue;
			}

			try {
				console.log(`Downloading ${fontName}...`);

				// Get download URL from GitHub API
				const urlResponse = execSync(
					`gh api repos/${repo}/contents/${font} --jq '.download_url'`,
					{
						encoding: "utf8",
						stdio: "pipe",
					},
				).trim();

				// Download file using fetch
				const response = await fetch(urlResponse, {
					headers: {
						// Authorization: `token ${process.env.GITHUB_TOKEN}`,
						"User-Agent": "Private-Font-Downloader",
					},
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const buffer = await response.arrayBuffer();
				fs.writeFileSync(outputPath, Buffer.from(buffer));

				console.log(`✓ Downloaded: ${font}`);
			} catch (error) {
				throw new Error(
					`Failed to download font: ${font} - ${error.message} - ${error.stack}`,
				);
			}
		}
	} catch (error) {
		throw new Error(`GitHub CLI error: ${error.message}`);
	}
}
