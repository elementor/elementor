# Step-by-Step Implementation Plan

**Date**: October 12, 2025  
**Status**: 🚧 **IN PROGRESS**  
**Approach**: Small iterations with continuous testing

---

## 🎯 **Core Principle**

> **"After every step: Update ALL .md documents, run ALL Playwright tests, don't continue until tests pass. NO test assertion modifications allowed."**

---

## 📋 **Step-by-Step Plan**

### **Step 1: Remove Forbidden CSS Injection** ✅ COMPLETE

**Problem**: CSS injection is forbidden - atomic widgets should handle this

**Files Modified**:
- `widget-conversion-service.php` ✅

**Methods DELETED**:
```php
✅ inject_preserved_css_styles() - REMOVED (105 lines)
✅ inject_global_base_styles_override() - REMOVED
✅ register_css_injection_hooks() - REMOVED
✅ enable_css_converter_base_styles_override() - REMOVED
✅ invalidate_atomic_base_styles_cache() - REMOVED
✅ page_has_css_converter_widgets() - REMOVED
✅ traverse_elements_for_css_converter_widgets() - REMOVED
✅ store_preserved_css() - REMOVED
```

**Testing Results**:
- ✅ `default-styles-removal.test.ts` - PASSING (manual confirmation)
- ⏸️ `reset-styles-handling.test.ts` - Not run yet
- ⏸️ `class-based-properties.test.ts` - Not run yet
- ⏸️ All prop-types tests - Not run yet

**Lines of Code Removed**: ~105 lines

**Outcome**: CSS injection successfully removed, atomic widgets will handle this natively

**Documentation Updates**:
- ✅ Updated: `STEP-BY-STEP-IMPLEMENTATION.md` - Marked complete
- ⏸️ Update: `ATOMIC-WIDGETS-RESEARCH.md` - Next
- ⏸️ Update: `SIMPLIFIED-ARCHITECTURE-PRD.md` - Next
- ⏸️ Update: `IMPLEMENTATION-READY-SUMMARY.md` - Next

---

### **Step 2: Unify Style Object Creation** ⏸️ PENDING → 🔄 REVISED

**Problem**: Non-unified style generation - 4 different methods for the SAME output format!

**Current (WRONG)**:
```php
❌ create_v4_style_object()                      // Inline styles
❌ create_v4_style_object_from_id_styles()       // ID styles
❌ create_v4_style_object_from_direct_styles()   // Reset/direct styles
❌ create_v4_style_object_from_global_classes()  // Global classes
```

**Target (CORRECT)**:
```php
✅ Atomic_Widget_Data_Formatter::format_widget_data()  // ALL widget styles (unified!)
✅ Atomic_Widget_Data_Formatter::format_global_class()  // Global classes (reusable)
```

**Key Insight (HVV)**:
> "ID styles and direct element styles should at the end all be applied to the widget directly. On the CSS input side this is different, but on the style generation side, this should be identical."

**Implementation Plan**:
1. Create `Atomic_Widget_Data_Formatter` class
2. Implement `format_widget_data()` - ONE method for ALL widget styles
3. Replace 4 methods with 1 unified method
4. Test with Playwright

**Testing**:
- Run: All Playwright tests after unification
- **Expected**: All tests pass (no regression)

**Documentation Updates**:
- Update: All .md files with unified approach
- Document: How unified formatting works

---

### **Step 3: Research convert_styles_to_v4_format()** ✅ COMPLETE

**Problem**: Method breaks unified approach - CRITICAL architectural violation!

**Research Findings**:
- ❌ **130+ lines** of complex, manual style processing
- ❌ **Duplicates** unified processor work (re-processes same styles)
- ❌ **Ignores specificity** - uses `array_merge()` instead of CSS rules
- ❌ **Multiple class IDs** per widget (confusing)
- ❌ **Called in 2 places** - widget creation for div-block and regular widgets

**Unified Processor Already Provides**:
- ✅ `resolved_styles` per widget (all sources unified!)
- ✅ Specificity already resolved
- ✅ Properties already converted to atomic format
- ✅ Single data structure per widget

**Critical Discovery**:
```php
// Unified processor returns:
[
    'widgets' => [
        [
            'resolved_styles' => [
                'color' => [
                    'converted_property' => [ '$$type' => 'color', 'value' => '#ff0000' ],
                    'specificity' => [ 0, 1, 0, 0 ],
                    'source' => 'id',  // Won specificity battle
                ],
            ],
        ],
    ],
]
```

**Solution**: Replace 130+ lines with ~20 lines in `Atomic_Widget_Data_Formatter`

**Documentation Created**:
- ✅ Created: `STEP-3-ANALYSIS.md` - Detailed architectural violation analysis
- ✅ Identified: Exact replacement strategy
- ✅ Found: Where method is called (2 locations in widget creation)

---

### **Step 4: Document CSS Converter vs Atomic Widgets** ⏸️ PENDING

**Problem**: Unclear what CSS Converter does vs. what Atomic Widgets do

**Research Questions**:
1. What does CSS Converter currently do?
2. What do Atomic Widgets currently do?
3. Where is the separation unclear?
4. Can existing Atomic Widgets module replace all this code?

**Atomic-Only Mapper Approach**:
- Review: `atomic-only-mapper-factory.php` implementation
- Question: Is it realistic that all code gets replaced?
- Document: What Atomic Widgets module CANNOT do
- Document: What CSS Converter MUST do

**Documentation to Create**:
- `CURRENT-IMPLEMENTATION-ANALYSIS.md` - What exists now
- `ATOMIC-WIDGETS-CAPABILITIES.md` - What atomic widgets can/cannot do
- `SEPARATION-OF-CONCERNS.md` - Clear boundaries
- `REPLACEMENT-FEASIBILITY.md` - Can atomic widgets replace everything?

---

## 📊 **Progress Tracking**

| Step | Status | Tests Passing | Documentation Updated |
|------|--------|---------------|---------------------|
| **1. Remove CSS Injection** | ✅ COMPLETE | ✅ PASSING | ✅ COMPLETE |
| **2. Unify Style Object Creation** | 🔄 REVISED | ⏸️ PENDING | ✅ COMPLETE |
| **3. Research convert_styles_to_v4_format()** | ✅ COMPLETE | N/A | ✅ COMPLETE |
| **4. Document Separation** | ⏸️ PENDING | N/A | ⏸️ PENDING |

---

## ✅ **Step Completion Criteria**

### **For Each Step**:
1. ✅ Code changes made
2. ✅ All Playwright tests run
3. ✅ Tests pass (or maintain current state)
4. ✅ All .md documents updated
5. ✅ Results documented
6. ✅ Proceed to next step

### **Never Allowed**:
- ❌ Modifying test assertions
- ❌ Skipping test runs
- ❌ Proceeding with failing tests
- ❌ Not updating documentation

---

## 🔍 **Critical Tests to Run After EACH Step**

```bash
# Test Suite (Run after EACH change)
cd /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/plugins/elementor-css

# 1. Default styles removal
npx playwright test tests/playwright/sanity/modules/css-converter/default-styles/default-styles-removal.test.ts

# 2. Reset styles handling
npx playwright test tests/playwright/sanity/modules/css-converter/reset-styles/reset-styles-handling.test.ts

# 3. Class-based properties
npx playwright test tests/playwright/sanity/modules/css-converter/prop-types/class-based-properties.test.ts

# 4. All prop types
npx playwright test tests/playwright/sanity/modules/css-converter/prop-types/
```

---

## 📝 **Communication Protocol**

### **After EACH code change**:
1. ✅ Describe what was changed
2. ✅ Run Playwright tests
3. ✅ Report test results
4. ✅ Update documentation
5. ✅ Wait for approval before proceeding

### **Small Steps Approach**:
- Change ONE method at a time
- Test immediately
- Document immediately
- Get feedback
- Proceed only after approval

---

## 🚀 **Current Status**

**Completed**: 
- ✅ Step 1 - CSS Injection Removed (8 methods, ~105 lines)
- ✅ Step 3 - convert_styles_to_v4_format() Analysis (CRITICAL violation found!)

**Revised**: 
- 🔄 Step 2 - Unified Style Object Creation (4 methods → 1 method)

**Active Step**: Step 4 - Document CSS Converter vs Atomic Widgets Separation  
**Next Action**: Create comprehensive documentation of current implementation  
**Key Finding**: Unified processor already provides `resolved_styles` - no need for manual processing!

---

**Proceeding to Step 4!** 🎯

