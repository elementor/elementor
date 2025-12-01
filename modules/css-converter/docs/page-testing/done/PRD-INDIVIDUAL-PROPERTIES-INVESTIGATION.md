# PRD: Individual CSS Properties Investigation & Fix

**Date**: October 26, 2025  
**Status**: 🔍 INVESTIGATION REQUIRED  
**Priority**: HIGH - 6 Failing Tests

---

## 🎯 **Problem Statement**

Multiple Playwright tests are failing for individual CSS properties (padding-block-start, margin-inline-start, inset-inline, etc.) where the converted widgets don't show the expected CSS in the rendered output.

### **Failing Tests**
1. `dimensions-prop-type.test.ts` - padding-block-start expecting 30px but getting 0px
2. `margin-prop-type.test.ts` (Strategy 1) - marginInlineStart expecting 40px but getting 0px  
3. `margin-prop-type.test.ts` (inline shorthand) - Elementor loading timeout
4. `position-prop-type.test.ts` - inset-inline/inset-block elements not visible
5. `size-prop-type.test.ts` - unitless zero elements not visible
6. `flex-direction-prop-type.test.ts` - tracing/storage state file issues

---

## 🔍 **Investigation Questions**

### **Question 1: Atomic Widget Architecture Clarification**

**CLAIM (INCORRECT)**: "Atomic widgets don't support padding properties - only classes, paragraph, link, attributes"

**REALITY**: Atomic widgets support ALL CSS properties through the `styles` system:
- ✅ Atomic widgets accept `styles` array in constructor
- ✅ Styles contain atomic props (padding, margin, etc.) 
- ✅ Atomic widgets render styles to CSS automatically
- ✅ CSS is injected via `elementor/atomic-widgets/styles/register` hook

**Evidence**:
```php
// atomic-widget-base.php
public function __construct( $data = [], $args = null ) {
    $this->styles = $data['styles'] ?? []; // ← Accepts ALL styles
}
```

**Conclusion**: The issue is NOT that atomic widgets don't support padding. They support it through the styles system.

---

### **Question 2: Individual vs Shorthand Properties**

**HYPOTHESIS**: Is this issue specific to properties that have both shorthand and individual versions?

**Properties to Investigate**:
- ✅ **Shorthand + Individual**: `padding`, `padding-block-start`, `padding-inline-start`
- ✅ **Shorthand + Individual**: `margin`, `margin-inline-start`, `margin-block-end`
- ✅ **Shorthand + Individual**: `inset`, `inset-inline`, `inset-block`
- ✅ **Individual Only**: `width`, `height`, `max-width` (for comparison)

**Test Pattern**:
```html
<!-- Shorthand -->
<p style="padding: 20px;">Works?</p>

<!-- Individual -->  
<p style="padding-block-start: 30px;">Fails?</p>
```

**Investigation Tasks**:
1. Check if shorthand properties work but individual properties fail
2. Check if ALL individual properties fail or only logical properties (block-start, inline-end)
3. Check if physical properties (padding-top, padding-left) work vs logical properties

---

### **Question 3: Git History Analysis**

**GOAL**: Find the last working version before refactoring broke individual properties

**Timeline**:
- **2 days ago**: Before design pattern refactoring (should work)
- **Yesterday**: Design pattern refactoring started
- **Today**: Tests failing

**Commits to Check**:
```
00d7414a22 Refactor unified css processor
070fa7926c clean up nested widget processor  
6c3061b02e Clean up html processing
2e580f3f10 Clean up css preprocessing
```

**Investigation Tasks**:
1. Checkout commit from 2 days ago: `git checkout HEAD~10`
2. Run failing tests to see if they pass
3. Binary search through commits to find breaking change
4. Compare working vs broken implementation

**Commands**:
```bash
# Find the breaking commit
git bisect start
git bisect bad HEAD
git bisect good HEAD~10

# For each commit:
npm run test:playwright -- dimensions-prop-type.test.ts
git bisect good/bad
```

---

## 🔬 **Root Cause Analysis**

### **Current Understanding**

**What Works** ✅:
1. CSS property conversion: `padding-block-start: 30px` → atomic format
2. Property mapper: `Atomic_Padding_Property_Mapper` handles conversion
3. Atomic format generation: `Dimensions_Prop_Type::make()->generate()`

**What Might Be Broken** ❌:
1. **Styles Integration**: Atomic props not being added to widget `styles` array?
2. **CSS Generation**: Styles not being rendered to CSS by atomic widgets?
3. **CSS Injection**: Generated CSS not being injected to page?
4. **Specificity Issues**: Individual properties being overridden by browser defaults?

---

## 📋 **Investigation Plan**

### **Phase 1: Verify Conversion Pipeline** (30 minutes)

**Task 1.1**: Test API Response
```bash
# Create test script to call API and inspect response
php test-padding-block-start-api.php
```

**Expected Output**:
```json
{
  "success": true,
  "post_id": 12345,
  "elementor_data": [
    {
      "widgetType": "e-paragraph",
      "settings": {
        "classes": ["e-abc1234-def5678"]
      },
      "styles": {
        "e-abc1234-def5678": {
          "variants": [{
            "props": {
              "padding": {
                "$$type": "dimensions",
                "value": {
                  "block-start": {"$$type": "size", "value": {"size": 30, "unit": "px"}}
                }
              }
            }
          }]
        }
      }
    }
  ]
}
```

**Verification Points**:
- ✅ Widget has `styles` array
- ✅ Styles contain padding with block-start
- ✅ Class ID is in widget settings.classes

---

### **Phase 2: Verify CSS Generation** (30 minutes)

**Task 2.1**: Inspect Generated CSS in Browser
1. Open page in Elementor editor
2. Inspect paragraph element
3. Check computed styles for `padding-block-start`
4. Check if CSS class is applied to element
5. Check if CSS rule exists in `<style>` tags

**Expected**:
```html
<p class="e-abc1234-def5678">Padding block start</p>

<style>
.e-abc1234-def5678 {
  padding-block-start: 30px;
}
</style>
```

**Verification Points**:
- ✅ Element has correct class
- ✅ CSS rule exists in page
- ✅ CSS property is correct
- ✅ No conflicting rules overriding it

---

### **Phase 3: Compare Working vs Broken Commits** (1 hour)

**Task 3.1**: Checkout 2-day-old commit
```bash
cd plugins/elementor-css
git log --oneline --since="3 days ago" --until="1 day ago"
git checkout <commit-from-2-days-ago>
```

**Task 3.2**: Run test
```bash
npm run test:playwright -- dimensions-prop-type.test.ts --grep "padding-block-start"
```

**Task 3.3**: If test passes, compare implementations
```bash
# Compare key files
git diff HEAD <old-commit> -- services/css/processing/
git diff HEAD <old-commit> -- services/atomic-widgets/
git diff HEAD <old-commit> -- convertors/css-properties/
```

---

### **Phase 4: Identify Breaking Change** (1 hour)

**Task 4.1**: Binary search through commits
```bash
git bisect start
git bisect bad HEAD
git bisect good <working-commit>

# For each commit:
npm run test:playwright -- dimensions-prop-type.test.ts
git bisect good  # if test passes
git bisect bad   # if test fails
```

**Task 4.2**: Analyze breaking commit
- Read commit message
- Review changed files
- Identify removed/modified logic
- Document what was lost

---

## 🎯 **Expected Findings**

### **Hypothesis 1: Shorthand Expansion Issue**

**Theory**: Individual properties aren't being properly converted because shorthand expansion logic was removed/broken

**Evidence to Look For**:
- Shorthand `padding: 20px` works
- Individual `padding-block-start: 30px` fails
- Property mapper exists but output isn't used

**Fix**: Restore shorthand expansion or individual property handling

---

### **Hypothesis 2: Styles Integration Issue**

**Theory**: Converted atomic props aren't being added to widget `styles` array

**Evidence to Look For**:
- API response shows empty `styles` array
- Or `styles` array missing padding property
- Widget has classes but no style definitions

**Fix**: Ensure `Atomic_Widget_Data_Formatter` adds all atomic props to styles

---

### **Hypothesis 3: CSS Rendering Issue**

**Theory**: Styles are in widget data but not being rendered to CSS

**Evidence to Look For**:
- Widget has `styles` array with padding
- But no CSS rule in page `<style>` tags
- Atomic widgets not rendering styles

**Fix**: Verify atomic widgets CSS generation is working

---

### **Hypothesis 4: Logical Properties Not Supported**

**Theory**: Only physical properties (padding-top) work, logical properties (padding-block-start) don't

**Evidence to Look For**:
- `padding-top: 20px` works
- `padding-block-start: 30px` fails
- Browser doesn't support logical properties

**Fix**: Convert logical properties to physical properties for browser compatibility

---

## 📝 **Deliverables**

### **1. Investigation Report**
- Document which hypothesis is correct
- Provide evidence (API responses, CSS output, git diffs)
- Identify exact breaking change

### **2. Root Cause Analysis**
- Explain what was working before
- Explain what changed
- Explain why it broke

### **3. Fix Implementation**
- Restore missing logic OR
- Fix broken logic OR
- Add new logic to handle individual properties

### **4. Test Verification**
- Run all 6 failing tests
- Verify they pass
- Document any remaining issues

---

## ⚠️ **Important Notes**

### **Correction: Atomic Widget Architecture**

**WRONG**: "Atomic widgets only support classes, paragraph, link, attributes"
- This refers to the `define_props_schema()` which defines CONTROL properties
- NOT the same as CSS styling properties

**RIGHT**: "Atomic widgets support ALL CSS properties through the styles system"
- Styles are separate from widget props
- Styles contain atomic props (padding, margin, color, etc.)
- Styles are rendered to CSS automatically

### **Key Distinction**

```php
// Widget Props Schema (CONTROLS)
protected static function define_props_schema(): array {
    return [
        'classes' => Classes_Prop_Type::make(),
        'paragraph' => String_Prop_Type::make(),
        'link' => Link_Prop_Type::make(),
    ];
}

// Widget Styles (CSS PROPERTIES) - Separate!
public function __construct( $data = [], $args = null ) {
    $this->styles = $data['styles'] ?? []; // ← ALL CSS properties go here
}
```

---

## 🚀 **Next Steps**

1. **Run Phase 1**: Verify API response contains styles with padding
2. **Run Phase 2**: Verify CSS is generated and injected
3. **Run Phase 3**: Find working commit from 2 days ago
4. **Run Phase 4**: Identify breaking change
5. **Implement Fix**: Based on findings
6. **Verify Tests**: Run all 6 failing tests

---

## 📊 **Success Criteria**

- ✅ All 6 failing tests pass
- ✅ Individual properties render correctly
- ✅ Shorthand properties still work
- ✅ No regressions in other tests
- ✅ Root cause documented
- ✅ Fix is maintainable and follows atomic widgets architecture

