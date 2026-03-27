# Task Completion Workflow

## Quality Checks Before Completion
When completing any development task, run these validation commands:

### 1. Build Verification
```bash
# Ensure site builds successfully
npm run build
```

### 2. Test Suite Execution
```bash
# Run full test suite to verify no regressions
npm test
```

### 3. Individual Quality Gates
```bash
# Performance validation
npm run test:lighthouse

# Accessibility compliance
npm run test:accessibility

# Bundle size verification
npm run test:bundle

# Visual regression check
npm run test:visual
```

## Post-Change Validation
After making content or code changes:

1. **Content Changes**: Verify build succeeds and content renders correctly
2. **Style Changes**: Run visual tests and update baselines if intentional
3. **Performance Changes**: Verify Lighthouse scores meet thresholds
4. **Accessibility Changes**: Ensure Pa11y tests pass
5. **Asset Changes**: Check bundle analysis for size impacts

## Thresholds to Maintain
- **Performance**: 90% (desktop), 85% (mobile)
- **Accessibility**: 95%
- **Best Practices**: 90%
- **SEO**: 95%
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Bundle Size**: CSS <407KB, JS <119KB

## Git Workflow
```bash
# Before committing changes
git status
git diff
git submodule update --recursive --init  # If submodules changed

# Standard commit workflow
git add .
git commit -m "feat: description of changes"
git push
```

## Deployment Verification
After pushing to main branch:
1. Netlify build should trigger automatically
2. Verify deployment succeeds at tylerbutler.com
3. Spot-check key pages and functionality

## Emergency Rollback
If deployment issues occur:
```bash
git revert <commit-hash>
git push
```

## Documentation Updates
When making significant changes:
1. Update README.md if commands change
2. Update TRANSITION_PLAN.md if affecting migration
3. Document any new testing procedures