# PRD: Complete E-Con Variable Resolution Solution

## Problem Statement

E-con flexbox properties are not being applied to widgets as atomic props.

**Test Case**:
```html
<div class="e-con e-flex">
  <div class="e-con-inner">
    <p>Content</p>
  </div>
</div>
```

```css
.e-con {--display: flex; --align-items: center;}
.e-con.e-flex > .e-con-inner {display: var(--display); align-items: var(--align-items);}
```

**Expected**: Widget has `display: flex`, `align-items: center` as atomic props
**Actual**: Widget has no display/align-items props

## Complete Flow Analysis

### Step 1: HTML Parsing ✅
**File**: `html-parser.php`
**What happens**: 
- Parses HTML, extracts elements
- Stores `is_e_con` and `is_e_con_inner` metadata ✅ (after my changes)
- Classes remain in `attributes['class']`: `e-con e-flex` ✅

### Step 2: Widget Mapping
**File**: `widget-mapper.php`
**What happens**:
- Converts HTML elements to widget structure
- **ISSUE**: Metadata (`is_e_con_inner`) is LOST during mapping
- Only standard fields are preserved (tag, attributes, children, etc.)

### Step 3: CSS Variable Registry (Priority 9) ✅
**File**: `css-variable-registry-processor.php`
**What happens**:
- Extracts variable definitions from CSS rules
- Stores: `--display: flex`, `--align-items: center` ✅

### Step 4: CSS Variable Resolver (Priority 10) ✅
**File**: `css-variable-resolver.php`
**What happens**:
- Resolves `var(--display)` → `flex` ✅
- Resolves `var(--align-items)` → `center` ✅
- Updates css_rules with resolved values ✅

### Step 5: Widget_Class_Processor (Priority 11) ❌
**File**: `widget-class-processor.php`
**What happens**:
- Recognizes `.e-con-inner` as widget class ✅ (after my changes)
- Extracts rule: `display: flex, align-items: center` ✅ (resolved!)
- Calls `find_e_con_inner_widgets()` ❌
- Looks for `widget['is_e_con_inner'] == true` ❌
- Finds ZERO widgets (metadata lost!) ❌
- **Result**: Styles applied to 0 widgets ❌

## Root Cause

**Metadata is not preserved through widget mapping.**

The `is_e_con` and `is_e_con_inner` flags are added in HTML parsing but are stripped out when elements are converted to widgets.

## Solution Options

### Option A: Preserve Metadata Through Mapping
Update `widget-mapper.php` to preserve `is_e_con` and `is_e_con_inner` fields.

**Pros**: Clean, uses metadata
**Cons**: Requires modifying widget mapper, metadata must flow through entire pipeline

### Option B: Match by Original HTML Classes
Use `widget['attributes']['class']` which IS preserved, instead of metadata.

```php
private function find_e_con_inner_widgets_recursively( array $widgets, array &$e_con_inner_widgets ): void {
    foreach ( $widgets as $widget ) {
        $classes = $widget['attributes']['class'] ?? '';
        
        // Check if widget has e-con-inner in its HTML classes
        if ( strpos( $classes, 'e-con-inner' ) !== false ) {
            $e_con_inner_widgets[] = $widget;
        }
        
        if ( ! empty( $widget['children'] ) ) {
            $this->find_e_con_inner_widgets_recursively( $widget['children'], $e_con_inner_widgets );
        }
    }
}
```

**Pros**: Simple, uses existing data
**Cons**: HTML classes might get modified/filtered

### Option C: Remove E-Con from Widget_Class_Processor
Let e-con selectors go through Global_Classes_Processor as framework classes.

**Pros**: Follows framework class pattern
**Cons**: Doesn't solve the issue - global classes still won't apply properly

## Recommended Solution: Option B

**Use HTML classes for matching, not metadata.**

### Rationale

1. `widget['attributes']['class']` IS preserved through the entire pipeline
2. No need to modify widget mapper
3. Simple implementation
4. Works with existing architecture

### Implementation

**Update `find_e_con_widgets_recursively()`**:
```php
private function find_e_con_widgets_recursively( array $widgets, array &$e_con_widgets ): void {
    foreach ( $widgets as $widget ) {
        $classes = $widget['attributes']['class'] ?? '';
        
        if ( strpos( $classes, 'e-con' ) !== false && 
             strpos( $classes, 'e-con-inner' ) === false ) {
            $e_con_widgets[] = $widget;
        }
        
        if ( ! empty( $widget['children'] ) ) {
            $this->find_e_con_widgets_recursively( $widget['children'], $e_con_widgets );
        }
    }
}
```

**Update `find_e_con_inner_widgets_recursively()`**:
```php
private function find_e_con_inner_widgets_recursively( array $widgets, array &$e_con_inner_widgets ): void {
    foreach ( $widgets as $widget ) {
        $classes = $widget['attributes']['class'] ?? '';
        
        if ( strpos( $classes, 'e-con-inner' ) !== false ) {
            $e_con_inner_widgets[] = $widget;
        }
        
        if ( ! empty( $widget['children'] ) ) {
            $this->find_e_con_inner_widgets_recursively( $widget['children'], $e_con_inner_widgets );
        }
    }
}
```

### Remove Metadata Additions
Revert changes to `html-parser.php` - metadata not needed.

## Testing Plan

1. Test simple e-con structure
2. Test Obox conversion
3. Verify with Chrome DevTools MCP
4. Check that e-con classes are filtered from final widget HTML

## Success Criteria

✅ E-con-inner widget has `display: flex` atomic prop
✅ E-con-inner widget has `align-items: center` atomic prop
✅ Variables are resolved before property conversion
✅ No e-con classes in final widget HTML (filtered out)
✅ Styles visible in Elementor editor Layout controls



