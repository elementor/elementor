# Reset Styles Handling Tests

This directory contains comprehensive tests for the CSS Converter's reset styles handling functionality, based on the requirements outlined in `2-RESET-CLASSES.md`.

## Overview

Reset styles are CSS rules that normalize or reset default browser styling for HTML elements. Common examples include:
- `body { margin: 0; background: pink; }`
- `h1 { font-size: 20px; }`
- `* { box-sizing: border-box; }`

The CSS Converter must handle these reset styles when converting HTML/CSS content to Elementor v4 atomic widgets.

## Test Structure

### Files Created

1. **`reset-styles-handling.test.ts`** - Main test suite with 14 comprehensive tests
2. **`fixtures/reset-styles-test-page.html`** - Test HTML page with comprehensive reset styles
3. **`reset-normalize.css`** - External CSS file with normalize.css-style resets
4. **`reset-custom.css`** - External CSS file with Eric Meyer reset.css-style resets

### Test Coverage

The test suite covers all major reset style scenarios:

#### 1. **Comprehensive Reset Import** 
- Tests successful import of pages with multiple reset style sources
- Validates basic conversion metrics and success criteria

#### 2. **Element-Specific Reset Handling**
- **Body Element Resets**: `body { background: #f0f8ff; font-family: Georgia; }`
- **Heading Resets**: `h1-h6 { font-size, font-weight, color, margin }`
- **Paragraph Resets**: `p { font-size, line-height, margin, color }`
- **Link Resets**: `a { color, text-decoration, font-weight }`
- **Button Resets**: `button { background, color, border, padding }`
- **List Resets**: `ul, ol, li { margin, padding, list-style }`
- **Table Resets**: `table, th, td { border-collapse, padding }`

#### 3. **Universal Selector Resets**
- Tests handling of `* { margin: 0; padding: 0; box-sizing: border-box; }`
- Validates universal reset application across all elements

#### 4. **CSS Specificity & Priority**
- **Inline Style Priority**: Ensures inline styles override reset styles
- **Cascade Resolution**: Tests proper handling of conflicting reset rules
- **Multiple Source Conflicts**: Validates resolution when multiple CSS files have conflicting resets

#### 5. **Reset Style Patterns**
- **Normalize.css Pattern**: Modern, minimal resets that preserve useful defaults
- **Reset.css Pattern**: Aggressive resets that zero out all default styling
- **Comparison Testing**: Validates both approaches work correctly

#### 6. **Inheritance & Nesting**
- Tests reset style inheritance through nested HTML structures
- Validates proper cascade through parent-child relationships

#### 7. **Comprehensive Logging**
- Validates detailed conversion logging for reset styles
- Tests performance metrics and processing statistics

## Test Page Features

The test HTML page (`reset-styles-test-page.html`) includes:

### HTML Elements Tested
- **Headings**: `h1, h2, h3, h4, h5, h6` with different reset styles
- **Text Elements**: `p, a, span` with typography resets
- **Interactive Elements**: `button` with form resets
- **Lists**: `ul, ol, li` with list-style resets
- **Tables**: `table, th, td` with table resets
- **Containers**: `div, section` with layout resets

### Reset Style Sources
1. **Style Block** (in `<head>`):
   ```css
   * { margin: 0; padding: 0; box-sizing: border-box; }
   body { background-color: #f0f8ff; font-family: Georgia; }
   h1 { font-size: 2.5rem; color: #e74c3c; }
   ```

2. **External CSS File 1** (`reset-normalize.css`):
   - Normalize.css-inspired resets
   - Preserves useful defaults while fixing cross-browser inconsistencies
   - Modern approach to CSS resets

3. **External CSS File 2** (`reset-custom.css`):
   - Eric Meyer reset.css-inspired resets
   - Aggressive zeroing of all default styles
   - Traditional "blank slate" approach

4. **Inline Styles**:
   - Applied to specific elements to test priority handling
   - Should override reset styles per CSS specificity rules

## CSS Reset Patterns Tested

### Normalize.css Pattern
```css
html { line-height: 1.15; }
body { margin: 0; font-family: system-ui; }
h1 { font-size: 2em; margin: 0.67em 0; }
```

### Reset.css Pattern  
```css
* { margin: 0; padding: 0; border: 0; }
html, body, div, span, h1, h2, h3, h4, h5, h6, p { 
    font-size: 100%; font: inherit; vertical-align: baseline; 
}
```

### Custom Resets
```css
* { box-sizing: border-box; }
body { background: #f0f8ff; color: #2c3e50; }
h1 { font-size: 2.5rem; font-weight: 700; color: #e74c3c; }
```

## Running the Tests

```bash
# Run all reset styles tests
npx playwright test tests/playwright/sanity/modules/css-converter/reset-styles/

# Run specific test
npx playwright test tests/playwright/sanity/modules/css-converter/reset-styles/reset-styles-handling.test.ts

# Run with specific grep pattern
npx playwright test --grep "Reset Styles Handling Tests"

# Run specific reset scenario
npx playwright test --grep "should handle body element reset styles"
```

## Expected Test Results

When successful, the tests verify:

### Widget Creation
- ✅ **33+ widgets created** from HTML elements with reset styles
- ✅ **9+ heading widgets** (e-heading) with proper reset styling
- ✅ **10+ paragraph widgets** (e-paragraph) with typography resets
- ✅ **5+ link widgets** (e-link) with link resets
- ✅ **4+ button widgets** (e-button) with form resets
- ✅ **5+ container widgets** (e-div-block) with layout resets

### CSS Processing
- ✅ **Multiple CSS sources processed** (inline + style block + 2 external files)
- ✅ **Proper specificity handling** (inline styles override resets)
- ✅ **Conflict resolution** between different reset approaches
- ✅ **Universal selector handling** (`*` selectors processed correctly)

### Conversion Quality
- ✅ **No errors or warnings** in conversion process
- ✅ **Comprehensive logging** of reset style processing
- ✅ **Performance metrics** within acceptable ranges
- ✅ **Proper cascade inheritance** through nested elements

## Reset Style Challenges Addressed

### 1. **Body Element Mapping**
- **Challenge**: No direct "body" widget in Elementor
- **Solution**: Body styles applied through page-level settings or container styles

### 2. **Universal Selector Handling**
- **Challenge**: `* {}` selectors affect all elements
- **Solution**: Applied appropriately to all converted widgets

### 3. **CSS Specificity Conflicts**
- **Challenge**: Multiple reset sources with conflicting rules
- **Solution**: Proper cascade resolution following CSS specificity rules

### 4. **Element Type Mapping**
- **Challenge**: Mapping HTML elements to atomic widgets
- **Solution**: `h1-h6 → e-heading`, `p → e-paragraph`, `a → e-link`, etc.

### 5. **Performance Impact**
- **Challenge**: Processing large reset CSS files
- **Solution**: Efficient parsing and application (< 200ms processing time)

## Integration with Approaches from 2-RESET-CLASSES.md

The tests validate multiple approaches outlined in the research document:

### Approach 2: Custom CSS File Generation
- ✅ Tests validate external CSS file processing
- ✅ Verifies proper enqueue and priority handling

### Approach 6: Direct Widget Styling
- ✅ Tests confirm simple element selectors applied directly to widgets
- ✅ Validates conflict detection and fallback mechanisms

### Hybrid Approach
- ✅ Tests demonstrate multiple reset sources working together
- ✅ Validates priority cascade and conflict resolution

## File Serving

Test files are served via WordPress HTTP server:
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

## Performance Benchmarks

Based on test results:
- **Processing Time**: ~0.17 seconds for comprehensive reset styles
- **CSS Styles Processed**: 13 distinct reset rules
- **Elements Mapped**: 59 HTML elements
- **Memory Usage**: Minimal overhead for reset processing

## Future Enhancements

Areas for potential improvement based on test findings:

1. **Global Class Optimization**: More aggressive global class creation for repeated reset patterns
2. **Body Style Mapping**: Enhanced body-to-page-settings mapping
3. **Reset Profiles**: Predefined reset style profiles (normalize, reset, custom)
4. **Visual Regression**: Screenshot comparison tests for reset fidelity
5. **Performance Optimization**: Caching for repeated reset pattern processing

## Notes

- Tests use the existing `convertFromUrl` helper method
- All tests include proper validation and skip logic for backend issues
- Reset style processing is validated through conversion logs and widget creation metrics
- Tests are designed to be comprehensive yet maintainable
- Covers both modern (normalize.css) and traditional (reset.css) approaches
