# Nested Variables Playwright Tests

Integration tests for the nested CSS variables extraction and renaming API.

## Overview

These tests validate the complete nested variables workflow through HTTP API endpoints, ensuring proper:
- Variable extraction from CSS
- Scope-aware variable grouping
- Value normalization
- Suffix generation and collision detection
- Error handling

## Test File

**File**: `nested-variables.test.ts`

## Test Cases (13 total)

### 1. Extract and Rename Nested Variables
Tests basic extraction of variables across multiple scopes (`:root`, `.theme-dark`, `.theme-light`).

**Validates:**
- ✅ Multiple theme variables extracted
- ✅ Variables properly suffixed
- ✅ Correct API response structure

### 2. Identical Color Values and Reuse
Tests deduplication of variables with identical values.

**Input CSS:**
- `:root --color: #ff0000`
- `.theme-1 --color: #ff0000`
- `.theme-2 --color: #00ff00`

**Expected Output:**
- `--color` (shared by :root and .theme-1)
- `--color-1` (unique to .theme-2)

**Validates:**
- ✅ Identical values reuse variables
- ✅ Unique values get suffixes

### 3. Media Query Variables as Separate Scope
Tests handling of variables in media queries as distinct scopes.

**Validates:**
- ✅ Media query variables detected
- ✅ Separate suffix generation for media scopes
- ✅ Desktop and mobile versions tracked

### 4. Color Format Normalization (Hex to RGB)
Tests normalization of different color formats.

**Validates:**
- ✅ Hex colors normalized
- ✅ Short hex normalized
- ✅ RGB formats handled

### 5. Class Selector Variables
Tests variables in class selectors (`.card`, `.card-large`, `.badge`).

**Validates:**
- ✅ Class variables extracted
- ✅ Multiple class variants handled
- ✅ Proper suffix generation for variants

### 6. Complex Theme System with Multiple Scopes
Tests comprehensive theme system with:
- Root variables
- Media queries
- Multiple theme classes
- Card component variants
- @supports feature queries

**Validates:**
- ✅ 10+ variables processed
- ✅ 4+ primary color variants
- ✅ 7+ spacing variants
- ✅ Proper scope tracking

### 7. Empty CSS Error Handling
Tests graceful handling of empty CSS.

**Expected:**
- HTTP 422 status
- Error message in response

**Validates:**
- ✅ Proper error responses
- ✅ No crashes on empty input

### 8. CSS with No Variables
Tests CSS that has no custom properties.

**Validates:**
- ✅ Returns empty variables array
- ✅ No false positives
- ✅ Success response

### 9. Whitespace Normalization
Tests normalization of spacing in values.

**Input CSS:**
- `--spacing-a: 16px;`
- `--spacing-b:  16  px  ;` (extra spaces)
- `--color-a: #007bff;`
- `--color-b:  #007bff  ;` (extra spaces)

**Validates:**
- ✅ Values normalized
- ✅ Identical after normalization
- ✅ Whitespace not affecting comparison

### 10. Statistics Tracking
Tests that statistics are properly generated.

**Validates:**
- ✅ `stats.converted` > 0
- ✅ `stats.extracted` > 0
- ✅ `stats.skipped` >= 0
- ✅ Math: converted + skipped <= extracted

### 11. Debug Logs
Tests that debug information is returned.

**Validates:**
- ✅ `logs.css` file path defined
- ✅ `logs.variables` file path defined
- ✅ Proper logging for troubleshooting

### 12. Suffix Collision Detection
Tests that suffixes don't collide with existing variables.

**Input CSS:**
- `:root --color: #ff0000;`
- `:root --color-1: #00ff00;` (manually defined)
- `.theme --color: #0000ff;`

**Expected:**
- `--color` (root)
- `--color-1` (root manual)
- `--color-2` (theme, not -1 to avoid collision)

**Validates:**
- ✅ Collision detection working
- ✅ Proper suffix incrementation

## Running the Tests

### Run All Tests
```bash
cd plugins/elementor-css
npx playwright test tests/playwright/sanity/modules/css-converter/variables/
```

### Run Specific Test
```bash
npx playwright test tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts -g "should extract and rename"
```

### Run in UI Mode
```bash
npx playwright test --ui tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts
```

### Run with Debugging
```bash
npx playwright test --debug tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts
```

## Configuration

Tests use the main Playwright config at:
```
plugins/elementor-css/tests/playwright/playwright.config.ts
```

**Settings:**
- Base URL: `http://localhost:8888` (CI) or `http://elementor.local` (local)
- Timeout: 60000ms per test
- Retries: 0 (local) or 9 (CI)
- Video: off (local) or on-failure (CI)

## API Endpoint Being Tested

**Endpoint**: `/wp-json/elementor/v2/css-converter/variables`
**Method**: `POST`
**Authentication**: Handled by `Variables_Route`

**Request Parameters:**
- `css` (string): CSS content to extract variables from
- `update_mode` (string): `create_new` or `update`

**Response Structure:**
```json
{
  "success": boolean,
  "variables": [
    {
      "name": "--variable-name",
      "value": "value",
      "type": "global-color-variable"
    }
  ],
  "rawVariables": [...],
  "stats": {
    "converted": number,
    "extracted": number,
    "skipped": number
  },
  "logs": {
    "css": "path/to/css-file",
    "variables": "path/to/variables-file"
  }
}
```

## Test Tags

All tests include the `@nested-variables` tag for filtering:

```bash
npx playwright test --grep "@nested-variables"
```

## CI/CD Integration

Tests are automatically run in CI pipeline:
- Configured in workflow files
- Report results to GitHub
- Retain videos on failure
- Retry up to 9 times on CI

## Prerequisites

- Node.js 18+
- Playwright browsers installed: `npx playwright install`
- API server running at configured BASE_URL
- WordPress with Elementor CSS plugin installed

## Troubleshooting

### Test Timeout
If tests timeout, check:
1. API server is running
2. Network connectivity
3. Server logs for errors

### API Errors
If API returns errors:
1. Check Variables_Route logs
2. Verify CSS is valid
3. Review response in test output

### Network Issues
If connecting to wrong server:
1. Set `BASE_URL` environment variable
2. Check `playwright.config.ts` configuration
3. Verify network access

## Related Documentation

- `../../../../../docs/implementation/NESTED-VARIABLES-IMPLEMENTATION.md` - Implementation guide
- `../../../../../services/variables/README.md` - Service documentation
- `../../../../../docs/page-testing/1-NESTED-VARIABLES.md` - Specification

