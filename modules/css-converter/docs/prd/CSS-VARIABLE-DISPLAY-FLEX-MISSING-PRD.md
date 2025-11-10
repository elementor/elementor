# PRD: CSS Variable Display Flex Property Missing

**Date**: November 7, 2025  
**Status**: Investigation Complete  
**Priority**: High  
**Type**: Bug Fix

---

## Problem Statement

CSS variable `var(--display)` is resolved to `flex` during processing, but the `display: flex` property does not appear in the final widget output. Other flex properties (`flex-basis`, `flex-grow`, `flex-shrink`) are present in the same widget.

### Source CSS

From [oboxthemes.com](https://oboxthemes.com/wp-content/uploads/elementor/css/post-1140.css?ver=1759276070):

```css
.elementor-1140 .elementor-element.elementor-element-089b111 {
    --display: flex;
    --flex-direction: row;
    --justify-content: space-between;
    --align-items: center;
}

.e-con, .e-con>.e-con-inner {
    display: var(--display);
}
```

### Expected Output

Widget should have:
```json
{
  "props": {
    "display": {"$$type": "string", "value": "flex"},
    "flex-basis": {"$$type": "size", "value": {"size": "auto", "unit": "custom"}},
    "flex-grow": {"$$type": "number", "value": 1}
  }
}
```

### Actual Output

Widget has:
```json
{
  "props": {
    "flex-basis": {"$$type": "size", "value": {"size": "auto", "unit": "custom"}},
    "flex-grow": {"$$type": "number", "value": 1}
  }
}
```

**Missing**: `display: flex` property

---

## Investigation Evidence

### 1. CSS Variable Resolution ✅ WORKING

**File**: `css-variable-resolver.php`  
**Function**: `resolve_variable_reference()`  
**Evidence**:
```
[19:39:21] CSS_VARIABLE_RESOLVER: Resolved display: var(--display) -> flex (type: local)
```

**Status**: Variable resolution is working correctly.

---

### 2. Property Conversion ✅ WORKING

**File**: `widget-class-processor.php`  
**Function**: `convert_properties_to_atomic()`  
**Line**: 696  
**Evidence**:
```
[19:39:21] DEBUG PROPERTY CONVERSION: display: flex -> SUCCESS
[19:39:21] DEBUG PROPERTY CONVERSION: display converted to: {"$$type":"string","value":"flex"}
```

**Status**: Property conversion to atomic format is working correctly.

---

### 3. Style Application ✅ WORKING

**File**: `widget-class-processor.php`  
**Function**: `apply_widget_specific_styles()`  
**Line**: 675  
**Evidence**:
```
[19:39:21] DEBUG STYLE APPLICATION: Applying display: flex to widgets: element-div-2
[19:39:21] DEBUG STYLE APPLICATION: Applying display: flex to widgets: element-div-3
```

**Status**: Style application is working correctly.

---

### 4. Style Collection ✅ WORKING

**File**: `unified-style-manager.php`  
**Function**: `collect_css_selector_styles()`  
**Line**: 93  
**Evidence**:
```
[19:39:21] UNIFIED_STYLE_MANAGER: Collecting display: flex for element element-div-2 from selector '.e-con'
[19:39:21] UNIFIED_STYLE_MANAGER: Collecting display: flex for element element-div-3 from selector '.e-con>.e-con-inner'
```

**Status**: Style collection is working correctly.

---

### 5. Style Resolution ✅ WORKING

**File**: `unified-style-manager.php`  
**Function**: `resolve_styles_for_widget_legacy()`  
**Line**: 365  
**Evidence**:
```
[19:33:35] STYLE_RESOLUTION: element-div-2 has 1 display styles
[19:33:35] STYLE_RESOLUTION: element-div-2 winning display style: flex
[19:33:35] STYLE_RESOLUTION: element-div-3 has 1 display styles
[19:33:35] STYLE_RESOLUTION: element-div-3 winning display style: flex
```

**Status**: Style resolution is working correctly.

---

### 6. Widget Replacement ❌ DATA LOSS

**File**: `unified-widget-conversion-service.php`  
**Function**: `create_widgets_with_resolved_styles()`  
**Line**: 260  
**Evidence**:
```
[21:07:32] ORIGINAL_WIDGET_IDS: element-div-1
[21:07:32] ELEMENTOR_DATA_IDS: 5d403e4a-7c63-4537-bebc-096c97e588a0
```

**Issue**: Original widgets with applied styles are replaced with new Elementor widgets that have different IDs.

**Code**:
```php
'widgets' => ! empty( $elementor_data ) ? $elementor_data : $widgets
```

**Status**: Widget replacement causes loss of applied styles.

---

### 7. Final API Response ❌ MISSING PROPERTY

**Evidence**:
```
Widget 0: elType=e-div-block, element_id=unknown
  - Style e-58a1e55-2673150 has props: []
```

**Issue**: Final widget has:
- Different element ID (`unknown` vs `element-div-2` or `element-div-3`)
- Empty props array
- No `display: flex` property

---

## Root Cause Analysis

### Processing Flow

```
HTML Input
    ↓
Widget Mapping (creates element-div-1, element-div-2, element-div-3, element-h2-4)
    ↓
CSS Processing (applies display: flex to element-div-2, element-div-3)
    ↓
Style Collection (collects display: flex for element-div-2, element-div-3)
    ↓
Style Resolution (resolves display: flex for element-div-2, element-div-3)
    ↓
Widget Creation (creates NEW widgets with NEW IDs)
    ↓
API Response (returns NEW widgets WITHOUT original applied styles)
```

### Critical Issue

**File**: `unified-widget-conversion-service.php`  
**Function**: `create_widgets_with_resolved_styles()`  
**Line**: 260  
**Problem**: The widget creation process generates completely new widgets with new UUIDs, breaking the connection to the original widgets where CSS styles were applied.

**Evidence**:
- **Styled widgets**: `element-div-1, element-div-2, element-div-3` with `display: flex` applied
- **Final widgets**: `5d403e4a-7c63-4537-bebc-096c97e588a0` (new UUID, no styles)

### Why Other Properties Work

The widget in the API response has `flex-basis`, `flex-grow`, `flex-shrink` properties. These properties come from a different source than the `display: flex` property that was applied via CSS variable resolution.

**Investigation Needed**: Determine where `flex-basis`, `flex-grow`, `flex-shrink` are coming from and why `display: flex` is not included with them.

---

## Technical Questions

### Q1: Widget ID Mismatch
- **Styled widgets**: `element-div-2`, `element-div-3`
- **Final widget**: `5d403e4a-7c63-4537-bebc-096c97e588a0`
- **Question**: How does the widget creation process map styled widgets to final Elementor widgets?

### Q2: Style Transfer Mechanism
- **Observation**: Some styles (flex-basis, flex-grow) are present in final widget
- **Question**: How are these styles transferred from styled widgets to final Elementor widgets?
- **Question**: Why is `display: flex` not transferred using the same mechanism?

### Q3: Element ID Tracking
- **Processing**: Uses `element_id` field (`element-div-2`, `element-div-3`)
- **Final output**: Uses `id` field (UUID)
- **Question**: Is there a mapping between `element_id` and final `id`?

---

## Proposed Solution

### Option 1: Fix Widget Creation Mapping

Ensure the widget creation process preserves the mapping between original `element_id` (where styles are applied) and final widget `id` (UUID), then transfer all collected styles to the final widgets.

**Implementation**:
1. Track mapping: `element-div-2` → `5d403e4a-7c63-4537-bebc-096c97e588a0`
2. Transfer styles from `element-div-2` to widget with UUID `5d403e4a-7c63-4537-bebc-096c97e588a0`
3. Ensure `display: flex` is included in the transfer

### Option 2: Use Styled Widgets Directly

Return the styled widgets from CSS processing instead of creating new Elementor widgets.

**Implementation**:
```php
'widgets' => $widgets // Use styled widgets, not elementor_data
```

**Risk**: May break Elementor editor compatibility if widget structure doesn't match expected format.

### Option 3: Investigate Style Transfer Mechanism

Determine how `flex-basis`, `flex-grow`, `flex-shrink` are successfully transferred to the final widget, then apply the same mechanism to `display: flex`.

**Implementation**:
1. Find where `flex-basis` is added to final widget
2. Verify `display: flex` goes through the same code path
3. Identify why `display` is filtered out or lost

---

## Recommended Approach

**Priority 1**: Investigate Option 3 first - understand why some properties transfer successfully while `display` does not.

**Next Steps**:
1. Add debug logging to track `flex-basis` property through the entire pipeline
2. Compare the code path for `flex-basis` vs `display`
3. Identify the specific filtering or transformation that removes `display` but keeps `flex-basis`
4. Apply the same fix to ensure `display` property is preserved

---

## Success Criteria

1. Widget in API response contains `display: flex` property
2. Property is in the correct atomic format: `{"$$type": "string", "value": "flex"}`
3. Property is applied to the correct widget (e-con-inner equivalent)
4. All existing tests continue to pass
5. The fix is general-purpose, not specific to `display` property

