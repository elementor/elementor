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
- **Reason**: **PLAYWRIGHT SELECTOR ISSUE** - Not a conversion problem!
- **Status**: ✅ **CONVERSION WORKS** - API creates all widgets correctly with proper text-align styles
- **Investigation Result**: 
  - ✅ Property mapper exists and works correctly
  - ✅ API successfully creates 4 paragraph widgets with correct text-align CSS
  - ✅ All text-align values applied: start, center, end, justify
  - ❌ Playwright test selector `.filter({ hasText: /aligned text/i }).nth(3)` fails to find 4th element
- **Action Required**: Fix Playwright test selector logic, not the conversion pipeline

#### **7. Text Transform Properties**
- **File**: `text-transform-prop-type.test.ts`
- **Test**: `should convert text-transform properties and verify styles`
- **Reason**: Unknown - needs investigation
- **Status**: ⚠️ **INVESTIGATE** - May be fixable
- **Action Required**: Unskip and test to determine if it's a real failure

#### **8. Opacity Properties**
- **File**: `opacity-prop-type.test.ts`
- **Test**: `should convert opacity properties`
- **Reason**: Unknown - needs investigation
- **Status**: ⚠️ **INVESTIGATE** - May be fixable
- **Action Required**: Unskip and test to determine if it's a real failure

#### **9. Height Properties**
- **File**: `height-prop-type.test.ts`
- **Test**: `should convert height properties and verify styles`
- **Reason**: Unknown - needs investigation
- **Status**: ⚠️ **INVESTIGATE** - May be fixable
- **Action Required**: Unskip and test to determine if it's a real failure

#### **10. Font Weight Properties**
- **File**: `font-weight-prop-type.test.ts`
- **Test**: `should convert font-weight properties and verify styles`
- **Reason**: Unknown - needs investigation
- **Status**: ⚠️ **INVESTIGATE** - May be fixable
- **Action Required**: Unskip and test to determine if it's a real failure

#### **11. Dimensions Properties**
- **File**: `dimensions-prop-type.test.ts`
- **Test**: `should convert all padding variations and verify atomic mapper success`
- **Reason**: Unknown - needs investigation
- **Status**: ⚠️ **INVESTIGATE** - May be fixable
- **Action Required**: Unskip and test to determine if it's a real failure

---

## 🔧 **Action Items**

### **✅ Completed**
1. **Margin Auto** - Added to FUTURE.md ✅
2. **Flex Shorthand** - Already documented in FUTURE.md ✅
3. **Border-Width Keywords** - Already documented in FUTURE.md ✅

### **📋 Pending**
1. **Border-Width Mixed Units** - Add to FUTURE.md
2. **Size Unitless Zero** - Add to FUTURE.md
3. **Investigate Failing Tests** - Unskip and test the "INVESTIGATE" category tests

### **🚫 Keep Skipped (Future Features)**
- `margin-prop-type.test.ts` - margin auto test
- `flex-properties-prop-type.test.ts` - flex shorthand test  
- `border-width-prop-type.test.ts` - keyword values test
- `border-width-prop-type.test.ts` - mixed units test
- `size-prop-type.test.ts` - unitless zero test

---

## 📊 **Summary**

- **Total Skipped Tests**: 11 identified
- **Future Features (Keep Skipped)**: 5 tests
- **Need Investigation**: 6 tests
- **Documented in FUTURE.md**: 3/5 future features
- **Action Required**: Document 2 missing future features, investigate 6 failing tests

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
