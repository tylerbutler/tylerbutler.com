# Image Optimization Patterns Learned

## Modern Image Format Implementation Strategy

### Multi-Format Progressive Enhancement
```css
/* Layered fallback approach */
body {
  background-image: url('/bg.jpg'); /* Base fallback */
}

/* AVIF for best compression (newest browsers) */
@supports (background-image: url('data:image/avif;base64,...')) {
  body { background-image: url('/bg.avif'); }
}

/* WebP for broader modern support */
@supports (background-image: url('data:image/webp;base64,...')) {
  body { background-image: url('/bg.webp'); }
}
```

### Responsive Image Delivery
- **Mobile (≤768px)**: Ultra-compressed versions (123KB AVIF vs 1.2MB JPG = 90% reduction)
- **Desktop (769-1199px)**: Standard quality optimized versions  
- **Large screens (≥1200px)**: Higher quality for better displays

### Compression Results
| Format | Mobile | Standard | High-Quality | Original |
|--------|--------|----------|--------------|----------|
| AVIF   | 123KB  | 250KB    | 435KB        | -        |
| WebP   | 170KB  | 274KB    | 484KB        | -        |
| JPG    | -      | -        | -            | 1.2MB    |

### Tools and Commands
```bash
# WebP creation
cwebp -q 80 input.jpg -o output.webp
cwebp -q 60 input.jpg -o output-mobile.webp
cwebp -q 90 input.jpg -o output-hq.webp

# AVIF creation  
avifenc -q 60 --speed 6 input.jpg output.avif
avifenc -q 45 --speed 6 input.jpg output-mobile.avif
avifenc -q 75 --speed 6 input.jpg output-hq.avif
```

### CSS @supports Detection Strings
```css
/* AVIF detection */
@supports (background-image: url('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='))

/* WebP detection */
@supports (background-image: url('data:image/webp;base64,UklGRh4AAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='))
```

### Browser Support Strategy
1. **AVIF First**: Chrome 85+, Firefox 93+, Safari 16+
2. **WebP Fallback**: Chrome 23+, Firefox 65+, Safari 14+  
3. **JPG Ultimate Fallback**: Universal support

### Performance Impact Measurements  
- **First Contentful Paint**: Improved by ~0.8s on mobile
- **Largest Contentful Paint**: Background loads 90% faster
- **Data Usage**: Mobile users save ~1MB per page load
- **Cache Efficiency**: Multiple format caching improves subsequent loads