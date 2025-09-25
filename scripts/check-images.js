#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Image optimization checker for Astro static site
 * Checks for proper image formats, sizes, and responsive image usage
 */

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function analyzeImage(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const metadata = await sharp(filePath).metadata();
    
    return {
      path: filePath,
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      channels: metadata.channels,
      aspectRatio: metadata.width / metadata.height,
    };
  } catch (error) {
    console.warn(`⚠️  Could not analyze ${filePath}: ${error.message}`);
    return null;
  }
}

function findImages(dir, extensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif']) {
  const images = [];
  
  if (!fs.existsSync(dir)) {
    return images;
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
          images.push(filePath);
        }
      }
    }
  }
  
  walkDir(dir);
  return images;
}

function checkHtmlForResponsiveImages(htmlDir) {
  const issues = [];
  const htmlFiles = findImages(htmlDir, ['.html']);
  
  for (const htmlFile of htmlFiles) {
    try {
      const content = fs.readFileSync(htmlFile, 'utf8');
      const relativePath = path.relative(process.cwd(), htmlFile);
      
      // Check for images without alt text
      const imgWithoutAlt = content.match(/<img[^>]*(?<!alt="[^"]*")(?<!alt='[^']*')>/gi);
      if (imgWithoutAlt) {
        issues.push({
          type: 'missing-alt',
          file: relativePath,
          count: imgWithoutAlt.length,
          issue: 'Images without alt text',
        });
      }
      
      // Check for images without responsive attributes
      const imgTags = content.match(/<img[^>]*>/gi) || [];
      const responsiveImages = content.match(/<img[^>]*(?:srcset|sizes)[^>]*>/gi) || [];
      
      if (imgTags.length > responsiveImages.length) {
        const nonResponsive = imgTags.length - responsiveImages.length;
        issues.push({
          type: 'non-responsive',
          file: relativePath,
          count: nonResponsive,
          total: imgTags.length,
          issue: 'Images without responsive attributes (srcset/sizes)',
        });
      }
      
      // Check for large images served at small sizes (potential over-serving)
      const imgSrcMatches = content.match(/<img[^>]*src="([^"]*)"[^>]*>/gi) || [];
      for (const match of imgSrcMatches) {
        const srcMatch = match.match(/src="([^"]*)"/);
        const widthMatch = match.match(/width="?(\d+)"?/);
        const heightMatch = match.match(/height="?(\d+)"?/);
        
        if (srcMatch && (widthMatch || heightMatch)) {
          const src = srcMatch[1];
          const displayWidth = widthMatch ? parseInt(widthMatch[1]) : null;
          const displayHeight = heightMatch ? parseInt(heightMatch[1]) : null;
          
          // This is a basic check - in a real implementation you'd need to
          // resolve the image path and check actual dimensions
          if (src.includes('.jpg') || src.includes('.png')) {
            issues.push({
              type: 'potential-overserving',
              file: relativePath,
              image: src,
              displayWidth,
              displayHeight,
              issue: 'Potential over-serving of images (check if source is larger than display size)',
            });
          }
        }
      }
      
    } catch (error) {
      console.warn(`⚠️  Could not read HTML file ${htmlFile}: ${error.message}`);
    }
  }
  
  return issues;
}

async function checkImages() {
  console.log('🖼️  Analyzing image optimization...\n');
  
  // Find all images in the static and public directories
  const staticImages = findImages(path.join(process.cwd(), 'static'));
  const publicImages = findImages(path.join(process.cwd(), 'public'));
  const allImages = [...new Set([...staticImages, ...publicImages])];
  
  console.log(`📊 Found ${allImages.length} images to analyze...\n`);
  
  const results = {
    totalImages: allImages.length,
    imagesByFormat: {},
    largeImages: [],
    unoptimizedImages: [],
    recommendations: [],
    issues: [],
  };
  
  // Analyze each image
  for (const imagePath of allImages) {
    const analysis = await analyzeImage(imagePath);
    if (!analysis) continue;
    
    const relativePath = path.relative(process.cwd(), imagePath);
    const format = analysis.format;
    
    // Count by format
    results.imagesByFormat[format] = (results.imagesByFormat[format] || 0) + 1;
    
    // Check for large images (>500KB)
    if (analysis.size > 500 * 1024) {
      results.largeImages.push({
        path: relativePath,
        size: analysis.size,
        sizeFormatted: formatBytes(analysis.size),
        dimensions: `${analysis.width}x${analysis.height}`,
        format: analysis.format,
      });
    }
    
    // Check for potentially unoptimized images
    const pixelCount = analysis.width * analysis.height;
    const bytesPerPixel = analysis.size / pixelCount;
    
    if (format === 'png' && !analysis.hasAlpha && analysis.size > 100 * 1024) {
      results.unoptimizedImages.push({
        path: relativePath,
        issue: 'PNG without transparency - consider JPEG',
        size: formatBytes(analysis.size),
        format: analysis.format,
      });
    }
    
    if (format === 'jpeg' && bytesPerPixel > 3) {
      results.unoptimizedImages.push({
        path: relativePath,
        issue: 'High bytes per pixel - consider compression',
        size: formatBytes(analysis.size),
        bytesPerPixel: bytesPerPixel.toFixed(2),
      });
    }
    
    if ((format === 'jpeg' || format === 'png') && analysis.width > 2000) {
      results.unoptimizedImages.push({
        path: relativePath,
        issue: 'Very large dimensions - consider resizing',
        dimensions: `${analysis.width}x${analysis.height}`,
        size: formatBytes(analysis.size),
      });
    }
  }
  
  // Check HTML for responsive image usage
  const htmlIssues = checkHtmlForResponsiveImages(path.join(process.cwd(), 'public'));
  results.issues = htmlIssues;
  
  // Generate recommendations
  if (results.largeImages.length > 0) {
    results.recommendations.push('Consider optimizing large images (>500KB)');
  }
  
  if (results.imagesByFormat['jpeg'] && !results.imagesByFormat['webp']) {
    results.recommendations.push('Consider using WebP format for better compression');
  }
  
  if (results.unoptimizedImages.length > 0) {
    results.recommendations.push('Optimize images flagged for format or compression issues');
  }
  
  const totalImageSize = allImages.reduce(async (sumPromise, imagePath) => {
    const sum = await sumPromise;
    try {
      const stats = fs.statSync(imagePath);
      return sum + stats.size;
    } catch {
      return sum;
    }
  }, Promise.resolve(0));
  
  // Display results
  console.log('📊 Image Analysis Results:');
  console.log('─'.repeat(70));
  console.log(`Total images: ${results.totalImages}`);
  console.log(`Total size: ${formatBytes(await totalImageSize)}`);
  console.log('');
  
  console.log('📊 Images by Format:');
  console.log('─'.repeat(70));
  Object.entries(results.imagesByFormat).forEach(([format, count]) => {
    console.log(`${count.toString().padStart(8)} │ ${format.toUpperCase()}`);
  });
  console.log('');
  
  if (results.largeImages.length > 0) {
    console.log('⚠️  Large Images (>500KB):');
    console.log('─'.repeat(70));
    results.largeImages.slice(0, 10).forEach(img => {
      console.log(`${img.sizeFormatted.padStart(8)} │ ${img.dimensions.padStart(12)} │ ${img.path}`);
    });
    if (results.largeImages.length > 10) {
      console.log(`         │              │ ... and ${results.largeImages.length - 10} more`);
    }
    console.log('');
  }
  
  if (results.unoptimizedImages.length > 0) {
    console.log('🔧 Optimization Opportunities:');
    console.log('─'.repeat(70));
    results.unoptimizedImages.slice(0, 10).forEach(img => {
      console.log(`${img.issue}`);
      console.log(`   ${img.path} (${img.size})`);
    });
    if (results.unoptimizedImages.length > 10) {
      console.log(`   ... and ${results.unoptimizedImages.length - 10} more`);
    }
    console.log('');
  }
  
  if (results.issues.length > 0) {
    console.log('🌐 HTML Image Issues:');
    console.log('─'.repeat(70));
    results.issues.forEach(issue => {
      if (issue.type === 'missing-alt') {
        console.log(`❌ ${issue.count} images without alt text in ${issue.file}`);
      } else if (issue.type === 'non-responsive') {
        console.log(`📱 ${issue.count}/${issue.total} images not responsive in ${issue.file}`);
      }
    });
    console.log('');
  }
  
  if (results.recommendations.length > 0) {
    console.log('🎯 Recommendations:');
    console.log('─'.repeat(70));
    results.recommendations.forEach(rec => {
      console.log(`💡 ${rec}`);
    });
    console.log('');
  }
  
  // Save metrics
  const metricsDir = path.join(process.cwd(), 'metrics');
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }
  
  const metrics = {
    timestamp: new Date().toISOString(),
    ...results,
    totalSize: await totalImageSize,
  };
  
  const metricsFile = path.join(metricsDir, 'image-analysis.json');
  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  
  console.log(`💾 Metrics saved to: ${path.relative(process.cwd(), metricsFile)}`);
  
  return results;
}

if (require.main === module) {
  checkImages().catch(console.error);
}

module.exports = { checkImages };