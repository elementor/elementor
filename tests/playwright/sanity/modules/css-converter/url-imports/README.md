# HTML Import Tests with Flat Classes

This directory contains tests for importing HTML pages with flat CSS classes into the widget-converter endpoint.

## Test Files

### Fixtures
- `fixtures/flat-classes-test-page.html` - Main test HTML page with flat CSS classes
- `fixtures/external-styles-1.css` - External stylesheet #1 (inlined during test)
- `fixtures/external-styles-2.css` - External stylesheet #2 (inlined during test)

### Tests
- `flat-classes-url-import.test.ts` - Comprehensive test suite for HTML import functionality

## Implementation Note

**Why not URL import?**
The `file://` protocol is blocked by WordPress's `wp_remote_get()` for security reasons. Instead, the tests:
1. Read HTML and CSS files from the filesystem
2. Inline the CSS content into `<style>` blocks
3. Send as `type: 'html'` to the widget-converter endpoint

This still tests all styling sources (inline, style blocks, multiple CSS files) in one comprehensive test.

## Test Coverage

The test suite verifies:

### 1. HTML Import Functionality
- ✅ Processing HTML with mixed styling sources (inline + multiple style blocks)
- ✅ Widget creation from imported content
- ✅ CSS extraction from inline styles and style blocks

### 2. CSS Extraction
- ✅ **Inline styles** - Direct style attributes on elements
- ✅ **Style block** - Styles defined in `<style>` tag in `<head>`
- ✅ **External CSS files** - Styles from linked `.css` files

### 3. Flat Classes Support
- ✅ **Flat class selectors** - Single-level classes like `.header-title`
- ✅ **No nested selectors** - Avoids `.parent .child` patterns
- ✅ **ID selectors** - Handles `#header`, `#banner`, etc.
- ✅ **Multiple classes** - Elements with multiple classes like `.button .button-primary`

### 4. CSS Property Mappings
- ✅ Layout properties (padding, margin, max-width, display, flex)
- ✅ Typography (font-size, font-weight, line-height, text-align, color)
- ✅ Background (background-color, gradients)
- ✅ Border properties (border-radius, border)
- ✅ Box model (padding, margin)
- ✅ Visual effects (box-shadow, text-shadow)

### 5. Widget Types
- ✅ Container widgets (div elements)
- ✅ Heading widgets (h1, h2 elements)
- ✅ Paragraph widgets (p elements)
- ✅ Link widgets (a elements)
- ✅ Section widgets (section elements)

### 6. Global Classes
- ✅ Creation of global classes from flat CSS classes
- ✅ Verification of global class count
- ✅ Global class application to widgets

### 7. Visual Regression
- ✅ Editor screenshot verification
- ✅ Frontend screenshot verification
- ✅ Full-page rendering tests

## Test Structure

### Test 1: Complete Page Import
```typescript
'should import page from URL and verify all styling sources'
```
- Imports the HTML page via URL
- Verifies all CSS from inline, style block, and external files
- Tests specific CSS properties on each element
- Takes screenshots of editor and frontend

### Test 2: Global Classes Verification
```typescript
'should verify global classes creation from flat classes'
```
- Verifies global classes are created from flat CSS classes
- Checks global class count
- Logs conversion statistics

### Test 3: ID Selectors and Multiple Classes
```typescript
'should handle ID selectors and multiple classes per element'
```
- Verifies ID selectors (#header, #banner, etc.) work correctly
- Tests elements with multiple classes (.button .button-primary)
- Ensures combined styles are applied correctly

## HTML Test Page Structure

### Components:
1. **Header Section** - div with h1 and styling from style block + inline
2. **Intro Text** - Two paragraphs with mixed inline and external styling
3. **Hyperlinks Block** - 10 links with various style combinations
4. **Banner Section** - Section with title and 2 buttons, gradient background

### Styling Distribution:
- **Inline**: Colors, padding, font-sizes on specific elements
- **Style Block**: Layout, typography, container styles
- **External CSS 1**: Link styles, button styles, utility classes
- **External CSS 2**: ID selector styles, body styles, additional properties

## Running the Tests

### Prerequisites
```bash
# Ensure Elementor experiments are enabled
wp elementor experiment activate e_opt_in_v4_page
wp elementor experiment activate e_atomic_elements
wp elementor experiment activate e_nested_elements
```

### Run All URL Import Tests
```bash
npm run test:playwright -- url-imports
```

### Run Specific Test
```bash
npm run test:playwright -- flat-classes-url-import
```

### Run with UI
```bash
npm run test:playwright -- --ui url-imports
```

### Debug Mode
```bash
npm run test:playwright -- --debug url-imports
```

## Expected Results

### API Response:
```json
{
  "success": true,
  "widgets_created": 15+,
  "global_classes_created": 20+,
  "post_id": 123,
  "edit_url": "/wp-admin/post.php?post=123&action=elementor"
}
```

### Widget Types Created:
- Container widgets for div elements
- Heading widgets for h1, h2
- Paragraph widgets for p elements
- Link widgets for a elements (inside containers)

### CSS Properties Verified:
- All inline styles preserved
- Style block styles applied
- External CSS files loaded and applied
- Flat classes converted to Elementor global classes

## Notes

### Limitations:
- ❌ No `:hover` pseudo-class testing (deferred to future)
- ❌ No image support yet (planned for future tests)
- ❌ No nested class selectors (by design - flat classes only)
- ❌ No element selectors like `body {}`, `a {}` (by design)

### Implementation Details:
- HTML and CSS files are read from the filesystem using Node.js `fs` module
- External CSS is inlined into `<style>` blocks before sending to API
- Tests run without requiring a web server
- This approach tests the same CSS processing as URL import would

### Future Enhancements:
- Add tests for HTTP(S) URL imports (requires web server)
- Add error scenario testing (404, malformed HTML)
- Add tests for CSS file loading failures
- Add tests with images and background images
- Add tests with `<header>`, `<nav>`, etc. semantic HTML elements
- Add actual URL import tests when web server is available

## Troubleshooting

### Test Skips
If tests are skipped with "backend property mapper issues":
- Check PHP error logs for CSS property mapping errors
- Verify atomic widget prop types support the CSS properties used
- Review conversion_log in API response for details

### Screenshot Failures
- Update snapshots with: `npm run test:playwright -- --update-snapshots url-imports`
- Screenshots are platform-specific (Linux/Mac/Windows)
- Full-page screenshots may vary based on viewport size

### CSS Not Applied
- Verify external CSS files exist in fixtures directory
- Check file permissions on CSS files
- Ensure CSS file paths are correct (relative to HTML file)
- Review browser console for CSS loading errors

