# URL Import Tests for Flat Classes

This directory contains comprehensive tests for the CSS Converter's URL import functionality, specifically testing flat class handling.

## Test Structure

### Files Created

1. **`flat-classes-url-import.test.ts`** - Main test suite with 9 comprehensive tests
2. **`fixtures/flat-classes-test-page.html`** - Test HTML page with flat classes and mixed styling
3. **`fixtures/styles-layout.css`** - External CSS file with layout and structure styles
4. **`fixtures/styles-components.css`** - External CSS file with component and visual styles

### Test Coverage

The test suite covers:

1. **URL Import Functionality** - Tests that the widget-converter endpoint can successfully import HTML from HTTP URLs
2. **Mixed Styling Sources** - Validates handling of:
   - Inline styles (style attributes)
   - Style block (in `<head>`)
   - External CSS files (linked stylesheets)
3. **Flat Class Processing** - Ensures flat classes (no nesting) are processed correctly
4. **Multiple Classes** - Tests elements with multiple CSS classes
5. **Complex Styling** - Validates complex CSS properties like gradients, shadows, flexbox
6. **External CSS Files** - Compares conversion with and without external CSS
7. **Widget Type Creation** - Verifies appropriate widget types are created for different HTML elements
8. **Styling Hierarchy** - Ensures visual hierarchy is preserved with flat classes
9. **Utility Classes** - Tests CSS utility class handling

### Test Page Features

The test HTML page includes:

- **Header section** with styled title
- **Intro text** with multiple paragraphs
- **Navigation links** (10 hyperlinks with various styles)
- **Banner section** with title and two buttons
- **Footer section** with copyright text

### Styling Distribution

- **Inline styles**: Applied to specific elements for colors, fonts, backgrounds
- **Style block**: Contains layout, typography, and component styles
- **External CSS files**:
  - `styles-layout.css`: Layout, spacing, responsive utilities
  - `styles-components.css`: Colors, typography, borders, shadows

### Class Naming Convention

All classes use flat naming (no nesting):
- `.page-header`, `.header-title`, `.main-heading`
- `.intro-text`, `.primary-text`, `.secondary-text`
- `.nav-link`, `.primary-link`, `.secondary-link`
- `.banner-section`, `.hero-area`, `.action-buttons`

## Running the Tests

```bash
# Run all URL import tests
npx playwright test tests/playwright/sanity/modules/css-converter/url-imports/

# Run specific test
npx playwright test tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts

# Run with specific grep pattern
npx playwright test --grep "URL Import - Flat Classes Test"
```

## Test Results

When successful, the tests verify:

- ✅ **35+ widgets created** from the HTML elements
- ✅ **HTTP URL import works** (not file:// URLs)
- ✅ **All styling sources processed** (inline, style block, external CSS)
- ✅ **Flat classes handled correctly** without nesting issues
- ✅ **Complex CSS properties supported** (gradients, shadows, flexbox)
- ✅ **Multiple widget types created** (headings, paragraphs, links, divs)
- ✅ **No errors or warnings** in the conversion process

## File Serving

The test files are served via WordPress HTTP server:
- Test files copied to `/wp-content/uploads/test-fixtures/`
- Accessed via HTTP URLs like `http://elementor.local/wp-content/uploads/test-fixtures/`
- CSS files linked with absolute paths in HTML

## Dependencies

- WordPress server running (elementor.local or configured base URL)
- Elementor CSS Converter plugin active
- Required experiments enabled:
  - `e_opt_in_v4_page: 'active'`
  - `e_atomic_elements: 'active'`
  - `e_nested_elements: 'active'`

## Test Configuration

The tests use **default parameters** to ensure realistic testing scenarios that match typical usage:

```typescript
// Uses default configuration from CssConverterHelper.convertFromUrl()
await helper.convertFromUrl(request, testPageUrl, [cssFile1Url, cssFile2Url]);

// This approach ensures tests reflect real-world usage patterns
// and don't rely on custom configurations that users might not use
```

### Benefits of Default Parameters:
- **Realistic testing**: Matches how most users will call the API
- **Simpler maintenance**: No custom configuration to maintain  
- **Better coverage**: Tests the default behavior that most users experience
- **Cleaner tests**: Focuses on functionality rather than configuration

## CSS Assertions

The tests include comprehensive `toHaveCSS` assertions to verify that styles are properly preserved during conversion. However, based on analysis, there are known style preservation issues in the CSS Converter that affect:

- Container background colors and layouts
- Custom font family specifications
- Brand color preservation
- Text transformations and typography
- Layout structure and semantic containers

See `STYLE-DIFFERENCES-ANALYSIS.md` for detailed analysis of conversion fidelity.

## Notes

- Tests use the existing `convertFromUrl` helper method
- Global classes creation depends on default threshold settings
- All tests include proper validation and skip logic for backend issues
- Tests are designed to be comprehensive yet maintainable
- CSS assertions may fail due to known converter limitations

