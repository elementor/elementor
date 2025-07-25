# CSS Parser Phase 1 - Test Plan

## Overview

This test plan covers the verification and validation of Phase 1 CSS Parser implementation for the Elementor CSS Converter module. The goal is to ensure the CSS parser correctly handles various CSS inputs and provides reliable extraction of classes, variables, and unsupported CSS.

## Test Environment Setup

### Prerequisites
- PHP 7.4+ environment
- WordPress installation with Elementor
- Composer installed
- WP-CLI available (optional but recommended)

### Installation Steps
1. Navigate to `plugins/elementor/modules/css-converter`
2. Run `composer install`
3. Execute `php verify-installation.php`
4. Confirm all checks pass

## Test Categories

### 1. Installation & Setup Testing

#### Test 1.1: Dependency Installation
**Objective:** Verify composer dependencies install correctly

**Steps:**
1. Run `composer install` in css-converter directory
2. Check `vendor/sabberworm/` directory exists
3. Verify `vendor/autoload.php` file present

**Expected Result:** All dependencies installed without errors

**Test Command:**
```bash
ls -la vendor/sabberworm/php-css-parser/
```

#### Test 1.2: Autoloader Functionality
**Objective:** Verify CSS converter autoloader works

**Steps:**
1. Run `php verify-installation.php`
2. Check autoloader section passes
3. Verify sabberworm classes load

**Expected Result:** Autoloader loads dependencies successfully

#### Test 1.3: Class Availability
**Objective:** Confirm all required classes are available

**Steps:**
1. Check `CssParser` class loads
2. Check `ParsedCss` class loads  
3. Check `CssParseException` class loads

**Expected Result:** All classes available without errors

### 2. Basic Functionality Testing

#### Test 2.1: Simple CSS Parsing
**Objective:** Test basic CSS class extraction

**Test Data:**
```css
.button {
    background-color: red;
    color: white;
    padding: 10px;
}
.header {
    font-size: 24px;
    margin-bottom: 20px;
}
```

**Steps:**
1. Parse CSS using `CssParser::parse()`
2. Extract classes using `extract_classes()`
3. Verify 2 classes extracted
4. Check properties are correct

**Expected Result:**
- 2 classes: `button`, `header`
- `button` has 3 properties
- `header` has 2 properties
- All property values match input

**Test Command:**
```bash
wp eval-file tests/css-parser-test.php
```

#### Test 2.2: CSS Variables Extraction
**Objective:** Test CSS custom properties extraction

**Test Data:**
```css
:root {
    --primary-color: #007cba;
    --spacing: 20px;
    --font-family: 'Arial', sans-serif;
}
.button {
    background-color: var(--primary-color);
    margin: var(--spacing);
}
```

**Steps:**
1. Parse CSS with variables
2. Extract variables using `extract_variables()`
3. Extract classes using `extract_classes()`
4. Verify variable preservation in class rules

**Expected Result:**
- 3 variables extracted from `:root`
- 1 class extracted
- Class preserves `var()` syntax

#### Test 2.3: Complex Selector Handling
**Objective:** Test unsupported selector detection

**Test Data:**
```css
.simple { color: red; }
.parent .child { color: blue; }
.button:hover { background: green; }
#header { width: 100%; }
```

**Steps:**
1. Parse CSS with mixed selectors
2. Extract classes and unsupported CSS
3. Verify only simple class extracted
4. Check complex selectors in unsupported

**Expected Result:**
- 1 class extracted: `simple`
- 3 rules in unsupported CSS
- Unsupported includes descendant, pseudo-class, ID selectors

### 3. Advanced Functionality Testing

#### Test 3.1: Shorthand Properties
**Objective:** Test CSS shorthand property handling

**Test Data:**
```css
.box {
    margin: 10px 20px 15px 5px;
    border: 1px solid black;
    background: red url(image.jpg) no-repeat center;
    font: bold 16px/1.5 'Arial', sans-serif;
}
```

**Steps:**
1. Parse CSS with shorthand properties
2. Extract class properties
3. Verify shorthand preservation

**Expected Result:**
- All shorthand properties preserved as-is
- No expansion to individual properties
- Complex values maintained

#### Test 3.2: Important Declarations
**Objective:** Test `!important` declaration handling

**Test Data:**
```css
.priority {
    color: red !important;
    background-color: blue;
    margin: 10px !important;
}
```

**Steps:**
1. Parse CSS with `!important` rules
2. Check `important` flag in extracted rules
3. Verify correct identification

**Expected Result:**
- `color` and `margin` marked as important
- `background-color` not marked as important
- Important flag accurately reflects CSS

#### Test 3.3: CSS Functions
**Objective:** Test CSS function preservation

**Test Data:**
```css
.advanced {
    background: linear-gradient(45deg, red, blue);
    width: calc(100% - 40px);
    color: rgba(255, 0, 0, 0.5);
    transform: translateX(50px);
}
```

**Steps:**
1. Parse CSS with various functions
2. Extract class properties
3. Verify function syntax preserved

**Expected Result:**
- All CSS functions preserved intact
- Complex function parameters maintained
- No parsing errors with functions

### 4. At-Rules and Media Queries Testing

#### Test 4.1: Media Queries
**Objective:** Test media query handling as unsupported

**Test Data:**
```css
.simple { color: red; }
@media (max-width: 768px) {
    .responsive { display: none; }
}
@media print {
    .print-only { color: black; }
}
```

**Steps:**
1. Parse CSS with media queries
2. Extract classes and unsupported CSS
3. Verify media queries in unsupported

**Expected Result:**
- 1 simple class extracted
- 2 media queries in unsupported CSS
- Media query content preserved

#### Test 4.2: Keyframes
**Objective:** Test animation keyframes as unsupported

**Test Data:**
```css
.animated { animation: slide 2s ease; }
@keyframes slide {
    from { transform: translateX(0); }
    to { transform: translateX(100px); }
}
```

**Steps:**
1. Parse CSS with keyframes
2. Check keyframes in unsupported CSS
3. Verify animated class extracted

**Expected Result:**
- 1 class extracted: `animated`
- Keyframes rule in unsupported CSS
- Animation property preserved in class

#### Test 4.3: Import and Font-Face
**Objective:** Test other at-rules handling

**Test Data:**
```css
@import url('fonts.css');
@font-face {
    font-family: 'CustomFont';
    src: url('font.woff2');
}
.text { font-family: 'CustomFont'; }
```

**Steps:**
1. Parse CSS with import and font-face
2. Verify at-rules in unsupported
3. Check simple class extraction

**Expected Result:**
- Import and font-face in unsupported
- Text class extracted successfully
- Font-family property preserved

### 5. Error Handling Testing

#### Test 5.1: Empty CSS
**Objective:** Test empty CSS input handling

**Test Data:** `""` (empty string)

**Steps:**
1. Attempt to parse empty CSS
2. Verify exception thrown
3. Check exception message

**Expected Result:**
- `CssParseException` thrown
- Message indicates empty CSS
- No parsing attempted

#### Test 5.2: Invalid CSS Syntax
**Objective:** Test malformed CSS handling

**Test Data:**
```css
.invalid {
    color: red
    background-color: blue;
}
.broken { color: ; }
```

**Steps:**
1. Parse malformed CSS
2. Check lenient parsing behavior
3. Verify error recovery

**Expected Result:**
- Parser handles errors gracefully
- Valid parts extracted if possible
- No fatal errors

#### Test 5.3: Large CSS Files
**Objective:** Test performance with large CSS

**Test Data:** CSS with 1000+ rules

**Steps:**
1. Generate large CSS file
2. Parse and measure time/memory
3. Verify extraction accuracy

**Expected Result:**
- Parsing completes within reasonable time (< 5s)
- Memory usage stays under 50MB
- All classes extracted correctly

### 6. Integration Testing

#### Test 6.1: WordPress Environment
**Objective:** Test parser in WordPress context

**Steps:**
1. Load parser in WordPress environment
2. Test with `wp_remote_get()` for URL parsing
3. Verify WordPress function compatibility

**Expected Result:**
- Parser works in WordPress context
- URL parsing uses WordPress HTTP API
- No conflicts with WordPress functions

#### Test 6.2: Elementor Module Integration
**Objective:** Test integration with existing module

**Steps:**
1. Load parser through `CssConverterHandler`
2. Test autoloader registration
3. Verify no conflicts with existing code

**Expected Result:**
- Parser loads without conflicts
- Existing functionality preserved
- Handler can access parser classes

### 7. Performance Testing

#### Test 7.1: Memory Usage
**Objective:** Monitor memory consumption

**Test Cases:**
- Small CSS (< 1KB): Target < 2MB memory
- Medium CSS (10KB): Target < 10MB memory  
- Large CSS (100KB): Target < 50MB memory

**Steps:**
1. Measure memory before parsing
2. Parse CSS of various sizes
3. Measure peak memory usage

#### Test 7.2: Processing Time
**Objective:** Monitor parsing performance

**Test Cases:**
- 10 classes: Target < 50ms
- 100 classes: Target < 200ms
- 1000 classes: Target < 2s

**Steps:**
1. Time CSS parsing operations
2. Measure class extraction time
3. Record performance metrics

### 8. Regression Testing

#### Test 8.1: Bootstrap CSS
**Objective:** Test with real-world CSS framework

**Test Data:** Bootstrap 5 CSS (subset)

**Steps:**
1. Parse Bootstrap button classes
2. Verify utility class extraction
3. Check hover states in unsupported

**Expected Result:**
- Utility classes extracted
- Complex selectors properly categorized
- No parsing errors

#### Test 8.2: Tailwind CSS
**Objective:** Test with utility-first framework

**Test Data:** Tailwind utility classes

**Steps:**
1. Parse Tailwind utilities
2. Test escaped selectors
3. Verify responsive variants handling

**Expected Result:**
- Simple utilities extracted
- Escaped characters preserved
- Responsive variants in unsupported

## Test Execution

### Automated Testing
```bash
# Run comprehensive unit tests
wp elementor css-parser-test

# Run manual test scenarios  
php tests/manual-test.php

# Verify installation
php verify-installation.php
```

### Manual Testing Checklist

- [ ] Installation verification passes
- [ ] Unit tests pass (10/10)
- [ ] Manual tests execute without errors
- [ ] Bootstrap CSS sample works
- [ ] Tailwind CSS sample works
- [ ] CSS variables extracted correctly
- [ ] Complex selectors properly categorized
- [ ] Error handling works as expected
- [ ] Performance within acceptable limits
- [ ] WordPress integration functional

## Success Criteria

### Phase 1 Complete When:
- [ ] All automated tests pass
- [ ] Manual test scenarios successful
- [ ] Performance benchmarks met
- [ ] Error handling robust
- [ ] Documentation complete
- [ ] Installation process smooth

### Quality Gates:
- **Test Coverage:** 90%+ of functionality tested
- **Performance:** < 2s for 1000 CSS rules
- **Memory:** < 50MB for large CSS files
- **Error Handling:** Graceful degradation for invalid input
- **Compatibility:** Works with PHP 7.4+ and WordPress 5.0+

## Risk Mitigation

### High Risk Areas:
1. **Large CSS files** - Monitor memory usage
2. **Complex CSS syntax** - Test edge cases
3. **WordPress compatibility** - Test in various WP versions
4. **Composer dependencies** - Verify installation process

### Contingency Plans:
- Performance issues → Implement streaming parser
- Memory issues → Add chunked processing
- Compatibility issues → Add fallback mechanisms
- Installation issues → Improve error messages

## Test Report Template

```
Phase 1 Test Execution Report
============================

Test Environment:
- PHP Version: 
- WordPress Version:
- Elementor Version:
- Test Date:

Test Results:
✓ Installation Tests: X/X passed
✓ Functionality Tests: X/X passed  
✓ Performance Tests: X/X passed
✓ Error Handling Tests: X/X passed
✓ Integration Tests: X/X passed

Issues Found:
- None / List issues

Performance Metrics:
- Average parsing time: Xms
- Peak memory usage: XMB
- Classes extracted: X/X

Recommendation:
□ Approved for Phase 2
□ Requires fixes before proceeding
```

---

**Next Phase:** Upon successful completion of all tests, proceed to Phase 2 - Global Classes Integration.
