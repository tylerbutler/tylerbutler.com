#!/bin/bash

echo "🕷️  Extracting all URLs from tylerbutler.com..."

# Get all page URLs via sitemap crawler
npx sitemap-generator-cli https://tylerbutler.com --filepath urls.xml --max-depth 10 --verbose

# Extract URLs from XML
grep -E '<loc>' urls.xml | sed 's/<loc>//g' | sed 's/<\/loc>//g' | sed 's/^[[:space:]]*//' > all-urls.txt

# Add infrastructure URLs
echo "https://tylerbutler.com/sitemap.xml" >> all-urls.txt
echo "https://tylerbutler.com/robots.txt" >> all-urls.txt
echo "https://tylerbutler.com/feed.xml" >> all-urls.txt
echo "http://feed.tylerbutler.com/AllPosts" >> all-urls.txt
echo "https://webmention.io/tylerbutler.com/xmlrpc" >> all-urls.txt

# Sort and deduplicate
sort -u all-urls.txt > complete-urls.txt

echo "✅ Complete! $(wc -l < complete-urls.txt) URLs saved to complete-urls.txt"

# Clean up
rm urls.xml all-urls.txt