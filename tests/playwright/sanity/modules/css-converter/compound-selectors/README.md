# Compound Class Selector Tests

**Date**: October 16, 2025  
**Status**: ✅ Comprehensive test suite created  
**Total Tests**: 8 scenarios covering all PRD requirements

---

## 📋 Test Overview

This directory contains comprehensive Playwright tests for the **Compound Class Selector** feature implementation. The tests validate that CSS selectors with multiple classes (e.g., `.first.second`) are correctly detected, processed, and applied.

---

## 🧪 Test Scenarios

### Scenario 1: Simple Compound Selector
**File**: `compound-class-selectors.test.ts`  
**Selector**: `.first.second`

**What It Tests**:
- Compound selector detection
- Flattened class generation (`first-and-second`)
- HTML class application
- Style application

**Expected Results**:
- `compound_classes_created` ≥ 1
- HTML has classes: `first`, `second`, `first-and-second`
- Styles correctly applied: `color: red`, `font-size: 16px`

---

### Scenario 2: Multiple Compound Selectors
**File**: `compound-class-selectors.test.ts`  
**Selectors**: `.btn.primary`, `.btn.secondary`

**What It Tests**:
- Multiple independent compound selectors
- Different compound class generation
- Independent class application

**Expected Results**:
- `compound_classes_created` ≥ 2
- Primary button has `btn-and-primary`
- Secondary button has `btn-and-secondary`
- Each has appropriate styles

---

### Scenario 3: Three-Class Compound
**File**: `compound-class-selectors.test.ts`  
**Selector**: `.btn.primary.large`

**What It Tests**:
- Compound with 3+ classes
- Specificity calculation (30 for 3 classes)
- Alphabetical normalization

**Expected Results**:
- HTML has: `btn`, `primary`, `large`, `btn-and-large-and-primary`
- Specificity = 30
- All properties applied correctly

---

### Scenario 4: Class Missing - Compound Not Applied
**File**: `compound-class-selectors.test.ts`  
**Selector**: `.first.second`  
**HTML**: Multiple divs with different class combinations

**What It Tests**:
- Requirement checking logic
- Only applies when ALL classes present
- Partial matches don't get compound class

**Expected Results**:
- Element with only `first`: NO compound class
- Element with only `second`: NO compound class
- Element with both: HAS compound class `first-and-second`

---

### Scenario 5: Order Independence
**File**: `compound-class-selectors.test.ts`  
**Selectors**: `.first.second`, `.second.first`

**What It Tests**:
- Alphabetical normalization
- Single compound class for multiple orderings
- Last rule wins for conflicting properties

**Expected Results**:
- Only 1 compound class created
- Class name is `first-and-second` (alphabetical)
- Both rule properties applied (merge)

---

### Scenario 6: Complex Properties
**File**: `compound-class-selectors.test.ts`  
**Selector**: `.card.featured`

**What It Tests**:
- Compound with complex CSS properties
- Gradient backgrounds
- Box shadows
- Multiple property types

**Expected Results**:
- All complex properties converted correctly
- Compound class applied: `card-and-featured`
- Visual styling preserved

---

### Scenario 7: Specificity Calculation
**File**: `compound-class-selectors.test.ts`  
**Selectors**: `.a.b`, `.x.y.z`

**What It Tests**:
- Specificity calculation formula
- Data structure verification
- Requires array accuracy

**Expected Results**:
- 2-class compound: specificity = 20
- 3-class compound: specificity = 30
- `requires` arrays match extracted classes

---

### Scenario 8: Hyphenated Class Names
**File**: `compound-class-selectors.test.ts`  
**Selector**: `.btn-primary.btn-large`

**What It Tests**:
- Hyphenated class names in compounds
- Class name extraction with hyphens
- Flattened name generation with hyphens

**Expected Results**:
- Compound class: `btn-large-and-btn-primary`
- All hyphenated classes preserved
- Styles correctly applied

---

## 🏗️ Test Structure

### Test File Organization

```
compound-selectors/
├── compound-class-selectors.test.ts    Main test suite (8 scenarios)
└── README.md                            This file
```

### Common Test Pattern

Each test follows this structure:

```typescript
test( 'Scenario X: Description', async ( { page, request } ) => {
  // 1. Setup: HTML + CSS
  const htmlContent = `<style>...</style><div>...</div>`;
  
  // 2. API Call: Convert HTML
  const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
    createGlobalClasses: true,
  } );
  
  // 3. Validation: Check API response
  expect( apiResult.success ).toBe( true );
  expect( apiResult.compound_classes_created ).toBeGreaterThanOrEqual( X );
  
  // 4. Editor Verification: Navigate and check
  await page.goto( editUrl );
  editor = new EditorPage( page, wpAdmin.testInfo );
  
  // 5. DOM Verification: Check classes applied
  const classAttribute = await element.getAttribute( 'class' );
  expect( classAttribute ).toContain( 'flattened-class-name' );
  
  // 6. Style Verification: Check CSS properties
  await expect( element ).toHaveCSS( 'property', 'value' );
} );
```

---

## 📊 Coverage Matrix

| Feature | Test Coverage | Status |
|---------|--------------|--------|
| Detection | Scenario 1 | ✅ |
| Extraction | Scenarios 1-3, 8 | ✅ |
| Flattening | Scenarios 1-6, 8 | ✅ |
| Application | Scenarios 1-4, 6, 8 | ✅ |
| Requirements | Scenario 4 | ✅ |
| Normalization | Scenario 5 | ✅ |
| Specificity | Scenarios 3, 7 | ✅ |
| Complex Props | Scenario 6 | ✅ |
| Edge Cases | Scenarios 4, 5, 8 | ✅ |

**Overall Coverage**: 100% of PRD requirements

---

## 🚀 Running the Tests

### Run All Compound Selector Tests

```bash
npx playwright test compound-selectors
```

### Run Specific Scenario

```bash
npx playwright test compound-selectors -g "Scenario 1"
```

### Run in Debug Mode

```bash
npx playwright test compound-selectors --debug
```

### Run in UI Mode

```bash
npx playwright test compound-selectors --ui
```

---

## 📋 Prerequisites

### Experiments Required
- `e_opt_in_v4_page: 'active'`
- `e_atomic_elements: 'active'`
- `e_nested_elements: 'active'`

### API Endpoint
- Widget Converter API: `/wp-json/elementor/v2/css-converter/widgets`
- Must support compound selector processing

---

## 🔍 What Each Test Verifies

### API Response Level
- `success: true`
- `compound_classes_created` count
- `compound_classes` data structure
- Specificity values
- Requires arrays

### Editor Level
- Compound classes applied to HTML
- Class attributes contain flattened names
- Original classes preserved
- Element structure maintained

### Style Level
- CSS properties correctly applied
- Visual rendering matches expectations
- Complex properties (gradients, shadows) work
- Specificity respected

---

## 📈 Expected Results Summary

| Test | Compound Classes Created | Key Assertion |
|------|-------------------------|---------------|
| Scenario 1 | 1 | Has `first-and-second` |
| Scenario 2 | 2 | Has `btn-and-primary`, `btn-and-secondary` |
| Scenario 3 | 1 | Has `btn-and-large-and-primary` |
| Scenario 4 | 1 | Only applied to element with ALL classes |
| Scenario 5 | 1 | Single class despite order variations |
| Scenario 6 | 1 | Complex properties preserved |
| Scenario 7 | 2 | Specificity: 20 and 30 |
| Scenario 8 | 1 | Hyphenated names work |

---

## 🐛 Troubleshooting

### Test Fails with "compound_classes_created is undefined"

**Cause**: Backend not returning compound class data  
**Solution**: Verify compound selector implementation is deployed

### Test Fails with "Class not applied"

**Cause**: HTML modification not working  
**Solution**: Check `Html_Class_Modifier_Service::apply_compound_classes()`

### Test Fails with Wrong Specificity

**Cause**: Calculation error  
**Solution**: Verify `calculate_compound_specificity()` formula (count × 10)

### Test Fails with Wrong Class Name

**Cause**: Normalization issue  
**Solution**: Check alphabetical sorting in `build_compound_flattened_name()`

---

## 📚 Related Documentation

- **PRD**: `plugins/elementor-css/modules/css-converter/docs/page-testing/1-MULTIPLE-CLASSES.md`
- **Implementation Summary**: `plugins/elementor-css/modules/css-converter/docs/page-testing/1-MULTIPLE-CLASSES-IMPLEMENTATION-SUMMARY.md`
- **Helper Class**: `plugins/elementor-css/tests/playwright/sanity/modules/css-converter/helper.ts`

---

## ✅ Success Criteria

All tests should:
1. ✅ Pass with green status
2. ✅ Complete in < 30 seconds each
3. ✅ Verify API responses correctly
4. ✅ Verify HTML classes applied
5. ✅ Verify styles rendered
6. ✅ Handle edge cases properly
7. ✅ Not produce false positives

---

## 🎯 Future Enhancements

### Not Yet Tested (Future Implementation)

| Feature | Status | Notes |
|---------|--------|-------|
| Element + Compound | ⏳ TODO | `button.primary.large` |
| Pseudo-classes | ⏳ TODO | `.btn.primary:hover` |
| Specificity Conflicts | ⏳ TODO | Multiple rules with same specificity |
| Nested + Compound | ⏳ TODO | `.parent .child.active` |

These will be added when the backend implementation supports them.

---

## 📝 Maintenance

### When to Update Tests

- **New compound features added**: Add new test scenarios
- **API response format changes**: Update assertions
- **HTML structure changes**: Update selectors
- **Style properties change**: Update CSS expectations

### Test Maintenance Checklist

- [ ] Update API assertions if response format changes
- [ ] Update selectors if widget HTML structure changes
- [ ] Update style expectations if default styles change
- [ ] Add new scenarios for new compound features
- [ ] Keep README synchronized with test changes

---

## 🎓 Notes

- Tests use rate limiting (7 seconds between API calls)
- Tests create temporary pages that are cleaned up
- Tests verify both editor and frontend rendering
- All tests are independent and can run in parallel
- Tests follow existing CSS converter test patterns

---

**Status**: Ready for CI/CD integration  
**Last Updated**: October 16, 2025

