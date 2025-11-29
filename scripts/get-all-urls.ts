#!/usr/bin/env node

import { spawn } from "child_process";
import { readFile, writeFile, unlink } from "fs/promises";
import { URL } from "url";

/**
 * Extract URLs from sitemap and optionally rewrite hosts
 */
async function getAllUrls(
  baseUrl = "https://tylerbutler.com",
  newHost?: string,
): Promise<void> {
  console.log(`🕷️  Extracting all URLs from ${baseUrl}...`);

  const tempSitemapFile = "urls.xml";
  const tempUrlsFile = "all-urls.txt";
  const outputFile = "complete-urls.txt";

  try {
    // Generate sitemap using sitemap-generator-cli
    console.log("📊 Generating sitemap...");
    await runCommand("npx", [
      "sitemap-generator-cli",
      baseUrl,
      "--filepath",
      tempSitemapFile,
      "--max-depth",
      "10",
      "--verbose",
    ]);

    // Extract URLs from XML sitemap
    console.log("🔍 Extracting URLs from sitemap...");
    const xmlContent = await readFile(tempSitemapFile, "utf-8");
    const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g) || [];

    const extractedUrls = urlMatches.map((match) =>
      match.replace(/<\/?loc>/g, "").trim(),
    );

    // Add infrastructure URLs
    console.log("🏗️  Adding infrastructure URLs...");
    const baseUrlObj = new URL(baseUrl);
    const infrastructureUrls = [
      `${baseUrlObj.protocol}//${baseUrlObj.host}/sitemap.xml`,
      `${baseUrlObj.protocol}//${baseUrlObj.host}/robots.txt`,
      `${baseUrlObj.protocol}//${baseUrlObj.host}/feed.xml`,
      "http://feed.tylerbutler.com/AllPosts",
      `https://webmention.io/${baseUrlObj.hostname}/xmlrpc`,
    ];

    // Combine all URLs
    let allUrls = [...extractedUrls, ...infrastructureUrls];

    // Rewrite hosts if specified
    if (newHost) {
      console.log(`🔄 Rewriting URLs to host: ${newHost}`);
      let rewrittenCount = 0;

      allUrls = allUrls.map((url) => {
        try {
          const urlObj = new URL(url);
          // Only rewrite if it's the original host
          if (urlObj.hostname === baseUrlObj.hostname) {
            // Parse newHost as a proper URL for safety
            try {
              // If newHost doesn't include protocol, add one
              const hostWithProtocol = newHost.includes("://")
                ? newHost
                : `${urlObj.protocol}//${newHost}`;
              const newHostObj = new URL(hostWithProtocol);

              urlObj.hostname = newHostObj.hostname;
              urlObj.port = newHostObj.port;
              urlObj.protocol = newHostObj.protocol;
            } catch (error) {
              console.warn(
                `⚠️  Invalid newHost format: ${newHost}, skipping URL: ${url}`,
              );
              return url;
            }
            rewrittenCount++;
            return urlObj.toString();
          }
          return url;
        } catch (error) {
          console.warn(`⚠️  Invalid URL skipped: ${url}`);
          return url;
        }
      });

      console.log(`🎯 Rewritten ${rewrittenCount} URLs to use ${newHost}`);
    }

    // Sort and deduplicate
    console.log("🧹 Sorting and deduplicating URLs...");
    const uniqueUrls = [...new Set(allUrls)].sort();

    // Write to output file
    await writeFile(outputFile, uniqueUrls.join("\n") + "\n", "utf-8");

    console.log(
      `✅ Complete! ${uniqueUrls.length} URLs saved to ${outputFile}`,
    );

    if (newHost) {
      console.log(
        `🎯 Host rewritten from ${baseUrlObj.hostname} to ${newHost}`,
      );
    }

    // Clean up temporary files
    console.log("🗑️  Cleaning up temporary files...");
    await Promise.all([
      unlink(tempSitemapFile).catch(() => {}),
      unlink(tempUrlsFile).catch(() => {}),
    ]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", errorMessage);
    process.exit(1);
  }
}

/**
 * Run a command and return a promise
 */
function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, { stdio: "inherit" });

    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    childProcess.on("error", reject);
  });
}

interface ParsedArgs {
  baseUrl: string;
  newHost?: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  let baseUrl = "https://tylerbutler.com";
  let newHost: string | undefined = undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: node get-all-urls.js [baseUrl] [options]

Arguments:
  baseUrl                    Base URL to crawl (default: https://tylerbutler.com)

Options:
  --host <hostname>          Rewrite URLs to use this hostname
  --help, -h                 Show this help message

Examples:
  node get-all-urls.js
  node get-all-urls.js https://example.com
  node get-all-urls.js https://tylerbutler.com --host localhost:3000
  node get-all-urls.js https://tylerbutler.com --host staging.example.com
`);
      process.exit(0);
    }

    if (arg === "--host") {
      newHost = args[i + 1];
      i++; // Skip next argument
    } else if (!arg.startsWith("--") && !baseUrl.includes(arg)) {
      baseUrl = arg;
    }
  }

  return { baseUrl, newHost };
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const { baseUrl, newHost } = parseArgs();
  getAllUrls(baseUrl, newHost);
}

export { getAllUrls };
