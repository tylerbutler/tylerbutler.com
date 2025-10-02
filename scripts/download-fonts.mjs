import fs from "fs";
import path from "path";

const fonts = [
	"PragmataPro_Mono_R_liga_0902.woff2",
	"PragmataPro_Mono_B_liga_0902.woff2",
	"PragmataPro_Mono_I_liga_0902.woff2",
	"PragmataPro_Mono_Z_liga_0902.woff2",
].map((p) => `fonts/PragmataPro0.902W/${p}`);

export async function downloadFonts() {
	console.log("Checking fonts...");

	const fontsDir = path.join(process.cwd(), "public", "fonts");
	const repo = `${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`;

	// Create fonts directory
	if (!fs.existsSync(fontsDir)) {
		fs.mkdirSync(fontsDir, { recursive: true });
	}

	// Check if all fonts already exist
	const allFontsExist = fonts.every((font) => {
		const fontName = path.basename(font);
		const outputPath = path.join(fontsDir, fontName);
		return fs.existsSync(outputPath);
	});

	if (allFontsExist) {
		console.log("All fonts already exist, skipping download");
		return;
	}

	if (!process.env.GITHUB_TOKEN) {
		throw new Error("GITHUB_TOKEN environment variable is required");
	}

	console.log("Downloading fonts using GitHub API...");

	const headers = {
		"Authorization": `token ${process.env.GITHUB_TOKEN}`,
		"Accept": "application/vnd.github.v3+json",
		"User-Agent": "Private-Font-Downloader",
	};

	try {
		for (const font of fonts) {
			const fontName = path.basename(font);
			const outputPath = path.join(fontsDir, fontName);
			if (fs.existsSync(outputPath)) {
				console.log(`Skipping ${fontName}...`);
				continue;
			}

			try {
				console.log(`Downloading ${fontName}...`);

				// Get file metadata from GitHub API
				const apiUrl = `https://api.github.com/repos/${repo}/contents/${font}`;
				const metaResponse = await fetch(apiUrl, { headers });

				if (!metaResponse.ok) {
					throw new Error(`GitHub API error: ${metaResponse.status} ${metaResponse.statusText}`);
				}

				const fileData = await metaResponse.json();
				const downloadUrl = fileData.download_url;

				if (!downloadUrl) {
					throw new Error("No download URL found in GitHub API response");
				}

				// Download file using the download URL
				const response = await fetch(downloadUrl, {
					headers: {
						"Authorization": `token ${process.env.GITHUB_TOKEN}`,
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
					`Failed to download font: ${font} - ${error.message}`,
				);
			}
		}
	} catch (error) {
		throw new Error(`Font download error: ${error.message}`);
	}
}
