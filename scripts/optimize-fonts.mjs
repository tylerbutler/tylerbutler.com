import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const fontsDir = path.join(process.cwd(), "public", "fonts");
const distDir = path.join(process.cwd(), "dist");

export async function optimizeFonts() {
	console.log("Optimizing fonts with glyphhanger...");

	// Check if fonts exist
	if (!fs.existsSync(fontsDir)) {
		console.warn("⚠️  No fonts directory found, skipping optimization");
		return;
	}

	// Check if dist directory exists (build must run first)
	if (!fs.existsSync(distDir)) {
		throw new Error("dist/ directory not found. Run build first.");
	}

	const fontFiles = fs
		.readdirSync(fontsDir)
		.filter((f) => f.endsWith(".woff2"));

	if (fontFiles.length === 0) {
		console.warn("⚠️  No .woff2 fonts found, skipping optimization");
		return;
	}

	console.log(`Found ${fontFiles.length} font files to optimize`);

	// Create backup directory for original fonts
	const backupDir = path.join(fontsDir, "originals");
	if (!fs.existsSync(backupDir)) {
		fs.mkdirSync(backupDir, { recursive: true });
	}

	for (const fontFile of fontFiles) {
		const fontPath = path.join(fontsDir, fontFile);
		const backupPath = path.join(backupDir, fontFile);

		try {
			console.log(`  Subsetting ${fontFile}...`);

			// Backup original font if not already backed up
			if (!fs.existsSync(backupPath)) {
				fs.copyFileSync(fontPath, backupPath);
			}

			// Use glyphhanger to analyze HTML and subset font
			// Note: glyphhanger requires pyftsubset to be installed
			const command = `npx glyphhanger "${distDir}/**/*.html" --subset="${fontPath}" --formats=woff2`;

			execSync(command, { stdio: "inherit", cwd: process.cwd() });

			// Replace original font with optimized version
			const generatedFile = fontPath.replace(".woff2", "-subset.woff2");
			if (fs.existsSync(generatedFile)) {
				fs.renameSync(generatedFile, fontPath);
				console.log(`  ✓ Optimized ${fontFile}`);
			}
		} catch (error) {
			console.warn(
				`  ⚠️  Failed to optimize ${fontFile}: ${error.message}`,
			);
		}
	}

	console.log("Font optimization complete!");
	console.log(`Original fonts backed up to: ${backupDir}`);
	console.log("Optimized fonts replaced originals - no CSS changes needed");
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
	optimizeFonts().catch((error) => {
		console.error("Font optimization failed:", error.message);
		process.exit(1);
	});
}
