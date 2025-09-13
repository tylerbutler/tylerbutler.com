// Sonda configuration for Hugo static site bundle analysis
export default {
  // Build command to generate the site with source maps
  build: 'hugo --minify',
  
  // Public directory where built files are located
  publicDir: './public',
  
  // Output configuration
  output: {
    format: ['html', 'json'],
    filename: 'bundle-analysis',
    open: false, // Don't auto-open in CI
  },
  
  // Analysis options
  analyze: {
    // Include CSS files in analysis
    includeCss: true,
    
    // File size thresholds (in bytes)
    thresholds: {
      error: 500 * 1024,   // 500KB
      warning: 200 * 1024,  // 200KB
    },
    
    // Exclude certain files from analysis
    exclude: [
      '**/fonts/**',
      '**/images/**',
      '**/*.svg',
      '**/manifest.json',
    ],
  },
  
  // Historical tracking
  tracking: {
    enabled: true,
    dataFile: './metrics/bundle-history.json',
  },
};