# Testing Strategy for Simplified Architecture

**Date**: October 12, 2025  
**Purpose**: Ensure architectural changes don't break existing CSS Converter functionality

---

## 🎯 **Core Principle**

> **"Continuously check existing tests to ensure architecture changes don't break existing converters."**

---

## 📋 **Critical Tests to Monitor**

### **1. Default Styles Removal Test**

**File**: `default-styles-removal.test.ts`

**What It Tests**:
- CSS Converter widgets have NO base classes (`.e-paragraph-base`, `.e-heading-base`)
- Browser default margins are preserved (not forced to 0px)
- Explicit inline styles are applied correctly
- Manual widgets vs. API widgets behave differently

**Why Critical**:
- Tests the `use_zero_defaults` flag functionality
- Validates base styles override mechanism
- Ensures CSS Converter widgets integrate with Elementor editor

**Must Pass After Changes**:
- ✅ API widgets have no base classes
- ✅ Manual widgets have base classes
- ✅ Explicit inline styles override defaults
- ✅ Frontend and editor behavior match

---

### **2. Reset Styles Handling Test**

**File**: `reset-styles-handling.test.ts`

**What It Tests**:
- Reset styles from CSS files (normalize.css, reset.css, custom resets)
- Simple element selectors (h1, h2, p, a, button) → Widget styling
- Specificity resolution (inline > reset)
- Multiple CSS file handling

**Why Critical**:
- Tests "Approach 6: Direct Widget Styling for Simple Element Selectors"
- Validates unified CSS processor's specificity resolution
- Ensures reset styles are applied to atomic widgets

**Must Pass After Changes**:
- ✅ Reset styles applied to atomic widgets
- ✅ Heading elements get reset styling (color, font-size, font-weight)
- ✅ Paragraph elements get reset styling (line-height, color)
- ✅ Inline styles override reset styles (specificity)

---

### **3. Class-Based Properties Test**

**File**: `class-based-properties.test.ts`

**What It Tests**:
- CSS class selectors (`.banner-title`, `.text-bold`) → Global classes
- Multiple classes on single element
- Class styles + inline styles combination
- Global class generation and application

**Why Critical**:
- Tests global classes functionality (CURRENT SCOPE per HVV feedback)
- Validates CSS class selector → Global class mapping
- Ensures atomic widgets receive global class names

**Must Pass After Changes**:
- ✅ CSS classes converted to global classes
- ✅ Multiple classes combined correctly
- ✅ Inline styles override class styles (specificity)
- ✅ Global classes applied to atomic widgets

---

### **4. All Prop Types Tests**

**Directory**: `prop-types/`

**Tests**:
- `dimensions-prop-type.test.ts` - Margin, padding conversion
- `size-prop-type.test.ts` - Font-size, width, height
- `color-prop-type.test.ts` - Color values
- `border-radius-prop-type.test.ts` - Border radius
- `box-shadow-prop-type.test.ts` - Box shadow
- etc.

**What They Test**:
- CSS properties → Atomic prop types conversion
- Property mappers functionality
- Atomic widget prop schema validation

**Why Critical**:
- Validates property conversion pipeline (CSS → Atomic format)
- Ensures atomic widgets receive correct prop types
- Tests the core conversion logic

**Must Pass After Changes**:
- ✅ All CSS properties convert to correct atomic prop types
- ✅ Numeric values are numeric (not strings)
- ✅ Shorthand properties expand correctly
- ✅ Edge cases handled (auto, inherit, calc, etc.)

---

## 🔄 **Testing Workflow for Implementation**

### **Phase 1: Before Making Changes**

**Step 1**: Run ALL critical tests
```bash
cd plugins/elementor-css
npx playwright test tests/playwright/sanity/modules/css-converter/default-styles/default-styles-removal.test.ts
npx playwright test tests/playwright/sanity/modules/css-converter/reset-styles/reset-styles-handling.test.ts
npx playwright test tests/playwright/sanity/modules/css-converter/prop-types/class-based-properties.test.ts
npx playwright test tests/playwright/sanity/modules/css-converter/prop-types/
```

**Step 2**: Document baseline
- Record which tests pass/fail
- Note any flaky tests
- Document expected failures (e.g., reset styles not working yet)

---

### **Phase 2: During Implementation (Small Iterations)**

**For EACH change**:

1. **Make small code change** (e.g., add one method to `Atomic_Widget_Data_Formatter`)
2. **Run affected tests immediately**
3. **Fix issues before moving to next iteration**

**Example Iteration**:
```bash
# Iteration 1: Create Atomic_Widget_Data_Formatter class skeleton
# → Run: default-styles-removal.test.ts (should still pass)

# Iteration 2: Implement format_widget_data() method
# → Run: reset-styles-handling.test.ts (may start passing!)

# Iteration 3: Integrate with Widget_Conversion_Service
# → Run: class-based-properties.test.ts (should still pass)

# Iteration 4: Remove deprecated CSS generation code
# → Run: ALL tests (ensure nothing breaks)
```

---

### **Phase 3: After Implementation**

**Step 1**: Run full test suite
```bash
npx playwright test tests/playwright/sanity/modules/css-converter/
```

**Step 2**: Compare with baseline
- All previously passing tests must still pass
- Previously failing tests (e.g., reset styles) should now pass
- No new test failures introduced

**Step 3**: Document improvements
- List tests that now pass (e.g., reset styles)
- Note any remaining failures
- Update documentation

---

## ⚠️ **Handling Test Failures**

### **If default-styles-removal.test.ts Fails**

**Likely Cause**: Changed how base classes are applied or removed

**Debug Steps**:
1. Check if `use_zero_defaults` flag is still working
2. Verify atomic widgets are instantiated correctly
3. Check if base styles override is still applied
4. Review widget data structure

**Fix Priority**: 🚨 **CRITICAL** - Must fix immediately

---

### **If reset-styles-handling.test.ts Fails**

**Likely Cause**: Reset styles not being applied to widgets

**Debug Steps**:
1. Check if simple element selectors (h1, p) are detected
2. Verify specificity resolution works
3. Check if styles are in atomic widget data format
4. Verify atomic widgets are generating CSS from styles

**Fix Priority**: 🔴 **HIGH** - This is what we're implementing

---

### **If class-based-properties.test.ts Fails**

**Likely Cause**: Global classes not being generated or applied

**Debug Steps**:
1. Check if CSS class selectors are detected
2. Verify global class generation logic
3. Check if global class names are applied to HTML
4. Verify atomic widgets reference global classes

**Fix Priority**: 🚨 **CRITICAL** - Current scope per HVV feedback

---

### **If prop-types tests Fail**

**Likely Cause**: Property mappers broken or atomic format changed

**Debug Steps**:
1. Check if property mappers are still being called
2. Verify atomic prop type format hasn't changed
3. Check if data formatter preserves converted properties
4. Review property conversion pipeline

**Fix Priority**: 🚨 **CRITICAL** - Core functionality

---

## 📊 **Test Success Criteria**

### **All Tests Must Pass**

| Test Category | Baseline | After Implementation | Status |
|--------------|----------|---------------------|--------|
| default-styles-removal | ✅ PASS | ✅ PASS | ✅ NO REGRESSION |
| reset-styles-handling | ❌ FAIL | ✅ PASS | ✅ IMPROVEMENT |
| class-based-properties | ✅ PASS | ✅ PASS | ✅ NO REGRESSION |
| prop-types (all) | ✅ PASS | ✅ PASS | ✅ NO REGRESSION |

---

## 🔍 **Continuous Monitoring**

### **After Each Commit**

Run a quick smoke test:
```bash
npx playwright test tests/playwright/sanity/modules/css-converter/default-styles/default-styles-removal.test.ts --project=chromium
```

### **Before Each PR**

Run full test suite:
```bash
npx playwright test tests/playwright/sanity/modules/css-converter/
```

### **Weekly**

Run extended test suite including all Elementor tests:
```bash
npx playwright test
```

---

## 📝 **Testing Checklist for Implementation**

- [ ] **Before starting**: Document baseline test results
- [ ] **Iteration 1**: Create `Atomic_Widget_Data_Formatter` skeleton
  - [ ] Run: default-styles-removal.test.ts
  - [ ] Status: PASS (no regression)
- [ ] **Iteration 2**: Implement `format_widget_data()` method
  - [ ] Run: reset-styles-handling.test.ts
  - [ ] Status: Should start passing
- [ ] **Iteration 3**: Integrate with `Widget_Conversion_Service`
  - [ ] Run: class-based-properties.test.ts
  - [ ] Status: PASS (no regression)
- [ ] **Iteration 4**: Remove deprecated CSS generation code
  - [ ] Run: ALL prop-types tests
  - [ ] Status: PASS (no regression)
- [ ] **Final**: Run full test suite
  - [ ] All baseline tests still pass
  - [ ] Reset styles tests now pass
  - [ ] No new failures introduced

---

**Testing Status**: ✅ READY TO BEGIN  
**Next Step**: Document baseline test results before starting implementation  
**Estimated Testing Time**: 2-3 hours per phase (3 phases = 6-9 hours total)


