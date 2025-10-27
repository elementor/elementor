
# PRD: ID Styles Implementation Fix

## Problem Statement

The CSS Converter's ID styles functionality has 4 critical test failures that prevent proper handling of ID selectors in HTML-to-Elementor widget conversion. These failures indicate fundamental issues with ID selector processing, specificity handling, and widget style application.

## Current Status
- **0 passed, 4 failed, 5 did not run**
- Critical functionality: ID selector recognition and style application
- Impact: Users cannot convert HTML with ID-based styling

## Failed Test Analysis

### 1. Multiple elements with different IDs (id-styles-basic.test.ts:82)
**Test Case**: HTML with multiple divs having different IDs (`#header`, `#content`, `#footer`)
**Expected**: Each widget gets correct background color from respective ID selector
**Current Issue**: ID selectors not properly mapped to individual widgets

### 2. ID selector styles without ID attribute (id-styles-basic.test.ts:133)
**Test Case**: `<div id="unique-section">` with `#unique-section { border: 2px solid red; }`
**Expected**: Widget gets border styles but NO id attribute in final HTML
**Current Issue**: ID styles not applied to widgets or ID attributes incorrectly preserved

### 3. ID styles on nested elements (id-styles-basic.test.ts:176)
**Test Case**: Nested divs with `#outer` and `#inner` selectors
**Expected**: Outer widget gets `#outer` styles, inner widget gets `#inner` styles
**Current Issue**: Nested ID selector styles not properly distributed to correct widgets

### 4. ID > class > element specificity (id-styles-specificity.test.ts:40)
**Test Case**: `<h1 id="title" class="heading">` with competing selectors
**Expected**: ID selector (`#title { color: red; }`) wins over class and element selectors
**Current Issue**: CSS specificity not correctly calculated or applied for ID selectors

## Root Cause Analysis

Based on test examination, the issues stem from:

1. **ID Selector Processing**: CSS parser may not properly extract ID selectors from CSS
2. **Widget-Selector Mapping**: ID selectors not correctly associated with target widgets
3. **Specificity Calculation**: ID selectors (specificity 100) not properly weighted
4. **Attribute Handling**: ID attributes either preserved (incorrect) or styles lost

## Technical Requirements

### Phase 1: ID Selector Recognition
- CSS parser must identify all ID selectors (`#id-name`)
- Extract ID selector rules with proper specificity (100 base)
- Handle compound ID selectors (`#outer #inner`, `#id.class`)

### Phase 2: Widget-ID Mapping
- Map HTML elements with `id` attributes to corresponding widgets
- Associate ID selector styles with correct widgets
- Remove `id` attributes from final widget HTML (Elementor widgets don't use IDs)

### Phase 3: Specificity Implementation
- Calculate correct specificity for ID selectors (100 + class/element counts)
- Ensure ID selectors override class selectors (10) and element selectors (1)
- Handle `!important` flag interaction with ID selectors

### Phase 4: Style Application
- Apply ID selector styles to widget inline CSS or widget settings
- Ensure styles render correctly in Elementor preview
- Maintain style inheritance for nested ID selectors

## Implementation Strategy

### Backend Changes Required

1. **CSS Parser Enhancement**
   - File: `unified-css-processor.php` or equivalent
   - Add ID selector regex pattern matching
   - Extract ID-based rules with proper specificity

2. **Widget Mapping Logic**
   - File: `widget-mapper.php` or equivalent  
   - Create ID-to-widget association during HTML parsing
   - Store ID selector styles for widget application

3. **Specificity Calculator**
   - Implement CSS specificity calculation (a,b,c,d format)
   - ID selectors contribute 100 to specificity
   - Handle compound selectors correctly

4. **Style Applicator**
   - Apply ID selector styles to widget properties
   - Convert CSS properties to Elementor widget settings
   - Remove original ID attributes from HTML

### Testing Strategy

1. **Unit Tests**: Test ID selector parsing and specificity calculation
2. **Integration Tests**: Test widget mapping and style application
3. **E2E Tests**: Verify all 4 failed Playwright tests pass
4. **Regression Tests**: Ensure existing functionality unaffected

## Success Criteria

- ✅ All 4 failed ID styles tests pass
- ✅ ID selectors properly parsed from CSS
- ✅ Correct specificity calculation (ID=100, class=10, element=1)
- ✅ Styles applied to widgets without preserving ID attributes
- ✅ Nested ID selectors work correctly
- ✅ Multiple ID selectors on same page work independently

## Implementation Priority

**HIGH PRIORITY** - ID selectors are fundamental CSS functionality. Without this, users cannot convert common HTML patterns that rely on ID-based styling.

## Acceptance Tests

Run these specific tests to verify fix:
```bash
npx playwright test id-styles-basic.test.ts:82
npx playwright test id-styles-basic.test.ts:133  
npx playwright test id-styles-basic.test.ts:176
npx playwright test id-styles-specificity.test.ts:40
```

All tests must pass with proper CSS rendering in Elementor preview.
