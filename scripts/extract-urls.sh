#!/bin/bash

# URL Extraction Script for tylerbutler.com
# Extracts all URLs from deployed site for link validation testing

set -e

SITE_URL="https://tylerbutler.com"
OUTPUT_DIR="url-audit"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🕷️  Crawling $SITE_URL to extract all URLs..."
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Method 1: sitemap-generator-cli (Recommended)
echo "Method 1: Using sitemap-generator-cli..."
if command -v npx &> /dev/null; then
    npx sitemap-generator-cli "$SITE_URL" \
        --filepath "$OUTPUT_DIR/sitemap_${TIMESTAMP}.xml" \
        --verbose \
        --max-depth 10 \
        --max-concurrency 5 \
        --no-respect-robots-txt

    # Extract URLs to text file
    grep -E '<loc>' "$OUTPUT_DIR/sitemap_${TIMESTAMP}.xml" | \
        sed 's/<loc>//g' | \
        sed 's/<\/loc>//g' | \
        sed 's/^[[:space:]]*//' | \
        sort -u > "$OUTPUT_DIR/urls_sitemap_${TIMESTAMP}.txt"

    URL_COUNT=$(wc -l < "$OUTPUT_DIR/urls_sitemap_${TIMESTAMP}.txt")
    echo "✅ Found $URL_COUNT URLs using sitemap-generator-cli"
else
    echo "❌ npx not found, skipping sitemap-generator-cli"
fi

echo ""

# Method 2: wget spider (Backup method)
echo "Method 2: Using wget spider..."
if command -v wget &> /dev/null; then
    wget --spider \
         --recursive \
         --no-verbose \
         --output-file="$OUTPUT_DIR/wget_crawl_${TIMESTAMP}.log" \
         --level=5 \
         --timeout=30 \
         --tries=2 \
         --no-directories \
         --reject="*.css,*.js,*.png,*.jpg,*.jpeg,*.gif,*.svg,*.ico,*.pdf" \
         "$SITE_URL" 2>/dev/null || true

    # Extract URLs from wget log
    grep -E "URL:$SITE_URL" "$OUTPUT_DIR/wget_crawl_${TIMESTAMP}.log" | \
        awk '{print $3}' | \
        cut -d' ' -f1 | \
        sort -u > "$OUTPUT_DIR/urls_wget_${TIMESTAMP}.txt"

    WGET_COUNT=$(wc -l < "$OUTPUT_DIR/urls_wget_${TIMESTAMP}.txt" || echo "0")
    echo "✅ Found $WGET_COUNT URLs using wget"
else
    echo "❌ wget not found, skipping wget method"
fi

echo ""

# Create combined and deduplicated list
echo "📋 Creating combined URL list..."
if [ -f "$OUTPUT_DIR/urls_sitemap_${TIMESTAMP}.txt" ] && [ -f "$OUTPUT_DIR/urls_wget_${TIMESTAMP}.txt" ]; then
    cat "$OUTPUT_DIR/urls_sitemap_${TIMESTAMP}.txt" "$OUTPUT_DIR/urls_wget_${TIMESTAMP}.txt" | \
        sort -u > "$OUTPUT_DIR/all_urls_${TIMESTAMP}.txt"
elif [ -f "$OUTPUT_DIR/urls_sitemap_${TIMESTAMP}.txt" ]; then
    cp "$OUTPUT_DIR/urls_sitemap_${TIMESTAMP}.txt" "$OUTPUT_DIR/all_urls_${TIMESTAMP}.txt"
elif [ -f "$OUTPUT_DIR/urls_wget_${TIMESTAMP}.txt" ]; then
    cp "$OUTPUT_DIR/urls_wget_${TIMESTAMP}.txt" "$OUTPUT_DIR/all_urls_${TIMESTAMP}.txt"
fi

if [ -f "$OUTPUT_DIR/all_urls_${TIMESTAMP}.txt" ]; then
    TOTAL_COUNT=$(wc -l < "$OUTPUT_DIR/all_urls_${TIMESTAMP}.txt")
    echo "✅ Combined total: $TOTAL_COUNT unique URLs"

    # Create latest symlinks
    ln -sf "all_urls_${TIMESTAMP}.txt" "$OUTPUT_DIR/latest_urls.txt"
    ln -sf "sitemap_${TIMESTAMP}.xml" "$OUTPUT_DIR/latest_sitemap.xml" 2>/dev/null || true

    echo ""
    echo "📄 Output files:"
    echo "  • Complete URL list: $OUTPUT_DIR/all_urls_${TIMESTAMP}.txt"
    echo "  • Latest URLs: $OUTPUT_DIR/latest_urls.txt"
    echo "  • XML Sitemap: $OUTPUT_DIR/sitemap_${TIMESTAMP}.xml"
    echo ""
    echo "📊 URL breakdown:"
    echo "  • Total URLs: $TOTAL_COUNT"
    echo "  • Articles: $(grep -c '/20[0-9][0-9]/' "$OUTPUT_DIR/all_urls_${TIMESTAMP}.txt" || echo "0")"
    echo "  • Tag pages: $(grep -c '/tags/' "$OUTPUT_DIR/all_urls_${TIMESTAMP}.txt" || echo "0")"
    echo "  • Projects: $(grep -c '/projects/' "$OUTPUT_DIR/all_urls_${TIMESTAMP}.txt" || echo "0")"
    echo "  • Pagination: $(grep -c '/page/' "$OUTPUT_DIR/all_urls_${TIMESTAMP}.txt" || echo "0")"

    echo ""
    echo "🔗 Next steps:"
    echo "  1. Review the URL list: cat $OUTPUT_DIR/latest_urls.txt"
    echo "  2. Test for broken links after Astro upgrade"
    echo "  3. Use tools like linkchecker or broken-link-checker for validation"
else
    echo "❌ No URLs extracted successfully"
    exit 1
fi