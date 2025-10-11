# Skipped Prop Types Tests

**Date**: October 11, 2025  
**Version**: 1.0  
**Status**: Documentation of intentionally skipped tests

---

## 🎯 **Overview**

This document tracks Playwright tests that are intentionally skipped due to feature gaps, implementation complexity, or testing challenges. These tests represent future enhancements documented in `FUTURE.md`.

---

## 📋 **Skipped Tests by Category**

### **🔮 Future Features (Documented in FUTURE.md)**

#### **1. Margin Auto Support**
- **File**: `margin-prop-type.test.ts`
- **Test**: `should convert margin auto for centering - SKIPPED: margin auto difficult to test in Playwright`
- **Reason**: `margin: auto` depends on container width and layout context which varies
- **Status**: ✅ **KEEP SKIPPED** - Complex layout dependency
- **Future.md Reference**: ✅ Documented in "Margin Auto Support" section

#### **2. Flex Shorthand Property**
- **File**: `flex-properties-prop-type.test.ts`
- **Test**: `should convert flex shorthand property (FUTURE)`
- **Reason**: Flex shorthand parsing not implemented (`flex: 0 0 auto`)
- **Status**: ✅ **KEEP SKIPPED** - Feature not implemented
- **Future.md Reference**: ✅ Documented in "Flex Shorthand Property" section

#### **3. Border-Width Keywords**
- **File**: `border-width-prop-type.test.ts`
- **Test**: `should handle border-width keyword values and edge cases - Keyword values (thin/medium/thick) not yet supported`
- **Reason**: CSS keyword values (`thin`, `medium`, `thick`) not implemented
- **Status**: ✅ **KEEP SKIPPED** - Keywords not supported
- **Future.md Reference**: ✅ Documented in "Border-Width Keywords Support" section

#### **4. Border-Width Mixed Units**
- **File**: `border-width-prop-type.test.ts`
- **Test**: `should handle mixed units in border-width shorthand`
- **Reason**: Mixed unit handling in shorthand not implemented
- **Status**: ✅ **KEEP SKIPPED** - Complex parsing required
- **Future.md Reference**: ❌ **NEEDS DOCUMENTATION**

#### **5. Size Property Unitless Zero**
- **File**: `size-prop-type.test.ts`
- **Test**: `should support unitless zero for all size properties`
- **Reason**: ~~Comprehensive unitless zero support across all size properties~~ **RESOLVED**
- **Status**: ✅ **TEST NOW PASSES** - Size_Value_Parser handles unitless zero correctly
- **Action Taken**: Unskipped test - it passes with current Size_Value_Parser implementation

---

### **🚨 Currently Failing Tests (Need Investigation)**

#### **6. Text Align Properties**
- **File**: `text-align-prop-type.test.ts`
- **Test**: `should convert text-align properties and verify styles`
- **Reason**: ~~**PLAYWRIGHT SELECTOR ISSUE** - Not a conversion problem!~~ **RESOLVED**
- **Status**: ✅ **TEST NOW PASSES** - Fixed Playwright selector logic
- **Investigation Result**: 
  - ✅ Property mapper exists and works correctly
  - ✅ API successfully creates 4 paragraph widgets with correct text-align CSS
  - ✅ All text-align values applied: start, center, end, justify
  - ✅ **FIXED**: Replaced generic `.filter({ hasText: /aligned text/i }).nth(index)` with specific `.filter({ hasText: testCase.textContent })`
- **Action Taken**: Updated selectors to use unique text content instead of generic regex + nth() pattern

#### **7. Text Transform Properties**
- **File**: `text-transform-prop-type.test.ts`
- **Test**: `should convert text-transform properties and verify styles`
- **Reason**: **PLAYWRIGHT SELECTOR ISSUE** - Same issue as text-align
- **Status**: 🔧 **NEEDS SELECTOR FIX** - Conversion works perfectly, test selectors need updating
- **Investigation Result**: 
  - ✅ Property mapper exists and works correctly
  - ✅ API successfully creates all 4 widgets with correct text-transform CSS
  - ✅ All text-transform values applied: uppercase, lowercase, capitalize, none
  - ❌ Playwright test selector `.filter({ hasText: /aligned text/i }).nth(index)` fails to find elements
- **Action Required**: Apply same selector fix as text-align test

#### **8. Opacity Properties**
- **File**: `opacity-prop-type.test.ts`
- **Test**: `should convert opacity properties`
- **Reason**: **ATOMIC WIDGET VALIDATION ISSUE** - Property mapper works, atomic widget rejects values
- **Status**: ❌ **ATOMIC VALIDATION FAILURE** - Requires deeper atomic widget investigation
- **Investigation Result**: 
  - ✅ Property mapper exists and processes CSS correctly
  - ✅ API processes all 5 opacity properties successfully
  - ❌ Atomic widget validation fails: `variants[0].opacity: invalid_value`
  - ❌ Issue with Size_Prop_Type validation or opacity mapper output format
- **Action Required**: Deep dive into atomic widget validation requirements

#### **9. Height Properties**
- **File**: `height-prop-type.test.ts`
- **Test**: `should convert height properties and verify styles`
- **Reason**: **PLAYWRIGHT SELECTOR ISSUE** - Same issue as text-align
- **Status**: 🔧 **NEEDS SELECTOR FIX** - Conversion works perfectly, test selectors need updating
- **Investigation Result**: 
  - ✅ Property mapper exists and works correctly
  - ✅ API successfully creates all 4 paragraph widgets with correct height CSS
  - ✅ All height properties processed: height: 3, min-height: 1
  - ❌ Playwright test selector fails to find 4th element (index 3)
- **Action Required**: Apply same selector fix as text-align test

#### **10. Font Weight Properties**
- **File**: `font-weight-prop-type.test.ts`
- **Test**: `should convert font-weight properties and verify styles`
- **Reason**: **PLAYWRIGHT SELECTOR ISSUE** - Same issue as text-align
- **Status**: 🔧 **NEEDS SELECTOR FIX** - Conversion works perfectly, test selectors need updating
- **Investigation Result**: 
  - ✅ Property mapper exists and works correctly
  - ✅ API successfully creates all 4 paragraph widgets with correct font-weight CSS
  - ✅ All font-weight properties processed: font-weight: 4
  - ❌ Playwright test selector fails to find 3rd element (index 2)
- **Action Required**: Apply same selector fix as text-align test

#### **11. Dimensions Properties**
- **File**: `dimensions-prop-type.test.ts`
- **Test**: `should convert all padding variations and verify atomic mapper success`
- **Reason**: **ATOMIC WIDGET VALIDATION ISSUE** - Similar to opacity issue
- **Status**: ❌ **ATOMIC VALIDATION FAILURE** - Requires deeper atomic widget investigation
- **Investigation Result**: 
  - ✅ Property mapper exists and processes CSS correctly
  - ✅ API processes all 11 padding properties successfully
  - ❌ Atomic widget validation fails: `variants[0].padding: invalid_value`
  - ❌ Issue with Dimensions_Prop_Type validation or padding mapper output format
- **Action Required**: Deep dive into atomic widget validation requirements

---

## 🔧 **Action Items**

### **✅ Completed**
1. **Size Unitless Zero** - Test now passes ✅
2. **Text Align Properties** - Selector issue fixed ✅
3. **Margin Auto** - Added to FUTURE.md ✅
4. **Flex Shorthand** - Already documented in FUTURE.md ✅
5. **Border-Width Keywords** - Already documented in FUTURE.md ✅

### **🔧 Easy Fixes (Playwright Selector Issues)**
1. **Text Transform Properties** - Apply same selector fix as text-align
2. **Height Properties** - Apply same selector fix as text-align  
3. **Font Weight Properties** - Apply same selector fix as text-align

### **❌ Complex Issues (Atomic Widget Validation)**
1. **Opacity Properties** - Deep dive into Size_Prop_Type validation requirements
2. **Dimensions Properties** - Deep dive into Dimensions_Prop_Type validation requirements

### **📋 Documentation Pending**
1. **Border-Width Mixed Units** - Add to FUTURE.md

### **🚫 Keep Skipped (Future Features)**
- `margin-prop-type.test.ts` - margin auto test
- `flex-properties-prop-type.test.ts` - flex shorthand test  
- `border-width-prop-type.test.ts` - keyword values test
- `border-width-prop-type.test.ts` - mixed units test

---

## 📊 **Summary**

- **Total Skipped Tests**: 11 identified
- **Tests Now Passing**: 2 tests (size unitless zero, text-align)
- **Easy Fixes Needed**: 3 tests (Playwright selector issues)
- **Complex Issues**: 2 tests (atomic widget validation failures)
- **Future Features (Keep Skipped)**: 4 tests
- **Documented in FUTURE.md**: 3/4 future features
- **Action Required**: 
  - Fix 3 Playwright selector issues (easy)
  - Investigate 2 atomic widget validation failures (complex)
  - Document 1 missing future feature

---

## 🎯 **PRIORITY: Tests That Need Fixing**

### **🔧 EASY FIXES (Playwright Selector Issues)**
These tests have working conversions but broken selectors. Apply the same fix as `text-align-prop-type.test.ts`:

1. **`text-transform-prop-type.test.ts`**
   - **Issue**: Generic selector `.filter({ hasText: /text/i }).nth(index)` fails
   - **Fix**: Use specific text content: `.filter({ hasText: testCase.textContent })`
   - **Effort**: ~15 minutes per test

2. **`height-prop-type.test.ts`**
   - **Issue**: Same selector pattern fails to find 4th element
   - **Fix**: Same as above - use unique text content selectors
   - **Effort**: ~15 minutes

3. **`font-weight-prop-type.test.ts`**
   - **Issue**: Same selector pattern fails to find 3rd element  
   - **Fix**: Same as above - use unique text content selectors
   - **Effort**: ~15 minutes

**Total Easy Fixes**: 3 tests, ~45 minutes total effort

### **❌ COMPLEX ISSUES (Atomic Widget Validation)**
These require deep investigation into atomic widget validation:

1. **`opacity-prop-type.test.ts`**
   - **Issue**: `variants[0].opacity: invalid_value` - Size_Prop_Type validation failure
   - **Investigation Needed**: Atomic widget validation requirements
   - **Effort**: Several hours of research

2. **`dimensions-prop-type.test.ts`**
   - **Issue**: `variants[0].padding: invalid_value` - Dimensions_Prop_Type validation failure  
   - **Investigation Needed**: Atomic widget validation requirements
   - **Effort**: Several hours of research

**Total Complex Issues**: 2 tests, significant research effort required

---

## 🔍 **Investigation Protocol**

For tests marked "INVESTIGATE":

1. **Unskip the test** (remove `test.skip`)
2. **Run the test** to see actual failure
3. **Analyze failure**:
   - Is it a real bug that can be fixed?
   - Is it a missing feature that should go to FUTURE.md?
   - Is it a test issue that needs updating?
4. **Take appropriate action**:
   - Fix the bug if simple
   - Document in FUTURE.md if complex feature
   - Update test if test issue
   - Re-skip if intentionally not supported

---

**Note**: This document should be updated as tests are investigated and resolved. The goal is to have a clear distinction between intentionally skipped future features and actual bugs that need fixing.
