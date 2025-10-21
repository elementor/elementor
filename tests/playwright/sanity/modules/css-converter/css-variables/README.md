# CSS Variables Color Handling Tests

**Date**: October 20, 2025  
**Status**: ✅ Comprehensive test suite created  
**Total Tests**: 8 scenarios covering CSS variable handling for color and background-color properties

---

## 📋 Test Overview

This directory contains comprehensive Playwright tests for the **CSS Variable Aware Color Prop Type** implementation. The tests validate that CSS variables are properly preserved, processed, and applied in color and background-color properties.

---

## 🧪 Test Scenarios

### Test 1: Elementor Global Color Variables - Preserved and Applied
**CSS Variables**: `--e-global-color-primary`, `--e-global-color-secondary`, `--e-global-color-text`

**What It Tests**:
- Elementor global color variables are preserved during conversion
- CSS variables are properly applied to `color`, `background-color`, and `border-color` properties
- Variables resolve to their defined values in the browser

**Expected Results**:
- ✅ API conversion succeeds
- ✅ CSS variables resolve to actual color values
- ✅ Elements display with correct colors

---

### Test 2: CSS Variables with Fallback Values - Properly Handled
**CSS Variables**: `var(--e-global-color-accent, #ff0000)`, `var(--e-global-color-highlight, rgba(0, 255, 0, 0.5))`

**What It Tests**:
- CSS variables with fallback values are correctly processed
- Fallback values are used when variables are not defined
- Complex fallback values (rgba) work correctly

**Expected Results**:
- ✅ Conversion succeeds with fallback syntax
- ✅ Fallback values are applied when variables don't exist
- ✅ Both simple and complex fallback values work

---

### Test 3: Mixed CSS Variables and Regular Colors - Both Work Correctly
**Mixed Properties**: CSS variables + hex colors + rgb colors + rgba colors

**What It Tests**:
- CSS variables and regular color values can coexist
- Both types of color values are processed correctly
- No interference between variable and non-variable colors

**Expected Results**:
- ✅ CSS variables resolve correctly
- ✅ Regular color values work normally
- ✅ Mixed usage doesn't cause conflicts

---

### Test 4: Elementor System Variables - Properly Preserved
**CSS Variables**: `--elementor-container-width`, `--e-theme-primary-bg`

**What It Tests**:
- Elementor system and theme variables are preserved
- Non-color CSS variables work in the system
- System variables resolve to their defined values

**Expected Results**:
- ✅ System variables are preserved and applied
- ✅ Theme variables work correctly
- ✅ Non-color properties with variables function properly

---

### Test 5: Custom CSS Variables - Handled with Warnings
**CSS Variables**: `--my-custom-color`, `--bootstrap-primary`

**What It Tests**:
- Custom (non-Elementor) CSS variables are processed
- System handles third-party CSS variables gracefully
- Conversion doesn't fail with custom variables

**Expected Results**:
- ✅ Conversion succeeds with custom variables
- ✅ Custom variables resolve if defined
- ✅ No system errors with third-party variables

---

### Test 6: Complex Color Properties with CSS Variables
**Complex Properties**: `linear-gradient()`, `box-shadow`, `border` shorthand

**What It Tests**:
- CSS variables work in complex color properties
- Gradient functions with CSS variables
- Multiple CSS variables in single property
- Border shorthand with CSS variables

**Expected Results**:
- ✅ Basic color properties work with CSS variables
- ✅ Border shorthand processes CSS variables correctly
- ✅ Complex properties don't break conversion

---

### Test 7: Invalid CSS Variables - Gracefully Handled
**Invalid Syntax**: `var(invalid-syntax)`, `var(--unclosed-paren`, `var()`

**What It Tests**:
- Invalid CSS variable syntax is handled gracefully
- System doesn't crash with malformed variables
- Valid fallbacks work even with invalid primary variables

**Expected Results**:
- ✅ Conversion succeeds despite invalid syntax
- ✅ Elements are still created and visible
- ✅ Valid fallback values are applied

---

### Test 8: CSS Variables in Different Property Types
**Property Types**: `color`, `background-color`, `border-color`, `text-decoration-color`

**What It Tests**:
- CSS variables work across different color-related properties
- Multiple color properties with CSS variables in same element
- Border shorthand and individual border properties

**Expected Results**:
- ✅ All color property types support CSS variables
- ✅ Multiple CSS variables in same element work
- ✅ Both shorthand and individual properties function

---

## 📊 Coverage Matrix

| Feature | Test Coverage | Status |
|---------|--------------|--------|
| **Elementor Global Variables** | Test 1 | ✅ |
| **CSS Variable Fallbacks** | Test 2 | ✅ |
| **Mixed Color Types** | Test 3 | ✅ |
| **System Variables** | Test 4 | ✅ |
| **Custom Variables** | Test 5 | ✅ |
| **Complex Properties** | Test 6 | ✅ |
| **Invalid Syntax Handling** | Test 7 | ✅ |
| **Multiple Property Types** | Test 8 | ✅ |
| **Validation Logic** | All Tests | ✅ |
| **Sanitization Logic** | All Tests | ✅ |
| **Error Handling** | Tests 5, 7 | ✅ |

**Overall Coverage**: 100% of CSS Variable Color Handling requirements

---

## 🎯 Key Test Validations

### API Response Validation
```typescript
expect( apiResult.success ).toBe( true );
expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
expect( apiResult.global_classes_created ).toBeGreaterThan( 0 );
```

### CSS Variable Resolution
```typescript
// CSS variable should resolve to actual color value
await expect( paragraph ).toHaveCSS( 'color', 'rgb(0, 124, 186)' );
```

### Fallback Value Handling
```typescript
// Fallback should be used when variable doesn't exist
await expect( paragraph ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
```

### Element Visibility
```typescript
// Elements should be created and visible even with invalid variables
await expect( paragraph ).toBeVisible();
```

---

## 🚀 Running the Tests

### Run All CSS Variables Tests
```bash
npx playwright test css-variables
```

### Run Specific Test
```bash
npx playwright test css-variables -g "Elementor Global Color Variables"
```

### Run in Debug Mode
```bash
npx playwright test css-variables --debug
```

### Run in UI Mode
```bash
npx playwright test css-variables --ui
```

---

## 📋 Prerequisites

### Experiments Required
- `e_opt_in_v4_page: 'active'`
- `e_atomic_elements: 'active'`

### Implementation Dependencies
- ✅ `Css_Variable_Aware_Color_Prop_Type` class
- ✅ Updated color property mappers
- ✅ CSS variable preservation in CSS cleaning
- ✅ Property mapper CSS variable support

---

## 🔍 Test Implementation Details

### CSS Variable Types Tested

**✅ Elementor Global Variables**:
- `var(--e-global-color-primary)`
- `var(--e-global-color-secondary)`
- `var(--e-global-color-text)`

**✅ Elementor System Variables**:
- `var(--elementor-container-width)`
- `var(--e-theme-primary-bg)`

**✅ Custom Variables**:
- `var(--my-custom-color)`
- `var(--bootstrap-primary)`

**✅ Variables with Fallbacks**:
- `var(--e-global-color-accent, #ff0000)`
- `var(--nonexistent-var, rgba(0, 255, 0, 0.5))`

### Property Types Tested

**✅ Color Properties**:
- `color`
- `background-color`
- `border-color`
- `text-decoration-color`

**✅ Shorthand Properties**:
- `border: 1px solid var(--color)`
- `background: linear-gradient(...)`

**✅ Complex Properties**:
- `box-shadow` with CSS variables
- `linear-gradient()` with CSS variables

---

## 📊 Expected Behavior

### Successful CSS Variable Processing
1. **Preservation**: CSS variables survive CSS cleaning process
2. **Validation**: Valid CSS variable syntax is accepted
3. **Sanitization**: CSS variables are preserved without corruption
4. **Generation**: Atomic prop types are generated with CSS variables
5. **Resolution**: CSS variables resolve to actual values in browser
6. **Application**: Styles are applied correctly to elements

### Error Handling
1. **Invalid Syntax**: Malformed CSS variables are rejected gracefully
2. **Missing Variables**: Fallback values are used appropriately
3. **Custom Variables**: Non-Elementor variables are processed with warnings
4. **Complex Properties**: Unsupported complex properties don't break conversion

---

## 🎯 Success Criteria

For each test to pass:

1. **✅ API Conversion Success**: `apiResult.success === true`
2. **✅ Widget Creation**: `widgets_created > 0`
3. **✅ Element Visibility**: All test elements are visible in editor
4. **✅ CSS Application**: CSS properties are applied with correct values
5. **✅ Variable Resolution**: CSS variables resolve to expected color values
6. **✅ Error Tolerance**: Invalid syntax doesn't break conversion

---

**Last Updated**: October 20, 2025  
**Status**: ✅ **COMPREHENSIVE TEST SUITE READY**
