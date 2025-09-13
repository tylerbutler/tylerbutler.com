#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Bundle analyzer for Hugo static site
 * Analyzes CSS and JS files in the public directory
 */

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function scanDirectory(dir, extensions) {
  const results = [];
  
  if (!fs.existsSync(dir)) {
    return results;
  }

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (extensions.includes(ext)) {
          const size = getFileSizeInBytes(filePath);
          const relativePath = path.relative(dir, filePath);
          results.push({
            file: relativePath,
            size: size,
            sizeFormatted: formatBytes(size),
          });
        }
      }
    }
  }
  
  walkDir(dir);
  return results.sort((a, b) => b.size - a.size);
}

function analyzeBundle() {
  console.log('🔍 Analyzing bundle sizes...\n');
  
  // Build the site first
  try {
    console.log('📦 Building site...');
    execSync('hugo --minify', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }

  const publicDir = path.join(process.cwd(), 'public');
  
  // Analyze CSS files
  const cssFiles = scanDirectory(publicDir, ['.css']);
  const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
  
  console.log('📊 CSS Files:');
  console.log('─'.repeat(60));
  cssFiles.forEach(file => {
    console.log(`${file.sizeFormatted.padStart(8)} │ ${file.file}`);
  });
  console.log('─'.repeat(60));
  console.log(`${formatBytes(totalCssSize).padStart(8)} │ Total CSS\n`);

  // Analyze JS files
  const jsFiles = scanDirectory(publicDir, ['.js']);
  const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
  
  console.log('📊 JavaScript Files:');
  console.log('─'.repeat(60));
  if (jsFiles.length === 0) {
    console.log('         │ No JavaScript files found');
  } else {
    jsFiles.forEach(file => {
      console.log(`${file.sizeFormatted.padStart(8)} │ ${file.file}`);
    });
  }
  console.log('─'.repeat(60));
  console.log(`${formatBytes(totalJsSize).padStart(8)} │ Total JS\n`);

  // Analyze images
  const imageFiles = scanDirectory(publicDir, ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif']);
  const totalImageSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
  const largeImages = imageFiles.filter(file => file.size > 500 * 1024); // > 500KB
  
  console.log('📊 Images Summary:');
  console.log('─'.repeat(60));
  console.log(`${imageFiles.length.toString().padStart(8)} │ Total images`);
  console.log(`${formatBytes(totalImageSize).padStart(8)} │ Total image size`);
  console.log(`${largeImages.length.toString().padStart(8)} │ Large images (>500KB)\n`);

  if (largeImages.length > 0) {
    console.log('⚠️  Large Images (consider optimizing):');
    console.log('─'.repeat(60));
    largeImages.slice(0, 10).forEach(file => {
      console.log(`${file.sizeFormatted.padStart(8)} │ ${file.file}`);
    });
    if (largeImages.length > 10) {
      console.log(`         │ ... and ${largeImages.length - 10} more`);
    }
    console.log('');
  }

  // Overall summary
  const totalSize = totalCssSize + totalJsSize;
  console.log('📈 Bundle Summary:');
  console.log('─'.repeat(60));
  console.log(`${formatBytes(totalCssSize).padStart(8)} │ CSS`);
  console.log(`${formatBytes(totalJsSize).padStart(8)} │ JavaScript`);
  console.log(`${formatBytes(totalImageSize).padStart(8)} │ Images`);
  console.log('─'.repeat(60));
  console.log(`${formatBytes(totalSize).padStart(8)} │ Total (CSS + JS)`);
  console.log(`${formatBytes(totalSize + totalImageSize).padStart(8)} │ Grand Total\n`);

  // Save metrics for tracking
  const metrics = {
    timestamp: new Date().toISOString(),
    css: {
      files: cssFiles.length,
      totalSize: totalCssSize,
      files: cssFiles,
    },
    js: {
      files: jsFiles.length,
      totalSize: totalJsSize,
      files: jsFiles,
    },
    images: {
      files: imageFiles.length,
      totalSize: totalImageSize,
      largeFiles: largeImages.length,
      largeFiles: largeImages,
    },
    totals: {
      assetsSize: totalSize,
      grandTotal: totalSize + totalImageSize,
    },
  };

  const metricsDir = path.join(process.cwd(), 'metrics');
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  const metricsFile = path.join(metricsDir, 'bundle-analysis.json');
  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  
  console.log(`💾 Metrics saved to: ${path.relative(process.cwd(), metricsFile)}`);

  // Performance recommendations
  console.log('\n🎯 Recommendations:');
  console.log('─'.repeat(60));
  
  if (totalCssSize > 100 * 1024) {
    console.log('⚠️  CSS size > 100KB - consider code splitting');
  }
  
  if (totalJsSize > 200 * 1024) {
    console.log('⚠️  JS size > 200KB - consider code splitting');
  }
  
  if (largeImages.length > 0) {
    console.log(`⚠️  ${largeImages.length} large images - consider optimization`);
  }
  
  if (totalCssSize + totalJsSize < 50 * 1024) {
    console.log('✅ Excellent bundle size!');
  } else if (totalCssSize + totalJsSize < 200 * 1024) {
    console.log('✅ Good bundle size');
  }
}

if (require.main === module) {
  analyzeBundle();
}

module.exports = { analyzeBundle };