# PRD: Fix E-Con Selector Conversion to Widget Styling

## Problem Statement

**Original Elementor structure**:
```html
<div class="e-con e-flex elementor-element-089b111">
  <div class="e-con-inner">
    <img class="elementor-element-a431a3a" />
  </div>
</div>
```

**CSS**:
```css
/* Variable definitions on parent */
.elementor-element-089b111 {
  --display: flex;
  --align-items: center;
  --justify-content: space-between;
}

/* Variable usage on child */
.e-con.e-flex > .e-con-inner {
  display: var(--display);
  align-items: var(--align-items);
  justify-content: var(--justify-content);
}
```

**Current conversion result**:
- ❌ `display: flex` missing from atomic props
- ❌ `align-items: center` missing from atomic props
- ❌ `justify-content: space-between` missing from atomic props
- ❌ Extra nested div blocks created

**Expected conversion result**:
```
e-div-block (wrapper wrapper) ← display: flex, align-items: center, justify-content: space-between
└── e-div-block (wrapper)
    └── e-image
```

## Current System Architecture

### CSS Processing Flow

1. **Css_Variable_Registry_Processor** (priority 9)
   - Extracts variable definitions: `--display: flex`, `--align-items: center`
   
2. **Css_Variable_Resolver** (priority 10)
   - Resolves `var(--display)` → `flex`
   - Resolves `var(--align-items)` → `center`

3. **Widget_Class_Processor** (priority 11)
   - Processes widget-specific selectors
   - Currently has hardcoded e-con logic

4. **Style_Collection_Processor** (priority 85)
   - Collects all styles into unified_style_manager

5. **Style_Resolution_Processor** (priority 100)
   - Resolves winning styles for each widget
   - Stores in `widget['resolved_styles']`

6. **Atomic_Widget_Data_Formatter**
   - Converts `resolved_styles` → atomic props
   - Creates `widget['styles']` array

### Data Flow
```
CSS Rules → Unified Style Manager → resolved_styles → Atomic Props → Widget Data
```

## Root Cause Analysis

### Issue 1: E-Con Classes Not Preserved
The original `e-con` and `e-con-inner` classes are stripped during HTML parsing, so selector matching fails.

### Issue 2: Hardcoded Logic Looks for Classes
Current implementation searches for widgets WITH `e-con` classes, but converted widgets don't have these classes.

### Issue 3: Structure Mismatch
The `.e-con > .e-con-inner` parent/child structure exists in original HTML but not in converted widget tree.

## Solution Design

### Approach: Match by Original HTML Structure

Instead of looking for `e-con` classes on converted widgets, match based on the ORIGINAL HTML structure that WAS parsed.

**Key insight**: During HTML parsing, we know which elements had `e-con` and `e-con-inner` classes. Store this metadata and use it for selector matching.

### Implementation

#### Step 1: Store E-Con Metadata During HTML Parsing

In `html-parser.php`:
```php
private function extract_element_data( DOMElement $element ) {
    $classes = $element->getAttribute('class') ?? '';
    
    $data = [
        'tag' => $tag_name,
        'attributes' => $this->extract_attributes( $element ),
        // ... existing code ...
    ];
    
    // Store e-con metadata
    if (strpos($classes, 'e-con') !== false && strpos($classes, 'e-con-inner') === false) {
        $data['is_e_con'] = true;
    }
    if (strpos($classes, 'e-con-inner') !== false) {
        $data['is_e_con_inner'] = true;
    }
    
    return $data;
}
```

#### Step 2: Update Hardcoded E-Con Logic

In `widget-class-processor.php`:
```php
private function find_e_con_widgets_recursively( array $widgets, array &$e_con_widgets ): void {
    foreach ( $widgets as $widget ) {
        // Check metadata instead of classes
        if ( $widget['is_e_con'] ?? false ) {
            $e_con_widgets[] = $widget;
        }
        
        if ( ! empty( $widget['children'] ) ) {
            $this->find_e_con_widgets_recursively( $widget['children'], $e_con_widgets );
        }
    }
}

private function find_e_con_inner_widgets_recursively( array $widgets, array &$e_con_inner_widgets ): void {
    foreach ( $widgets as $widget ) {
        // Check metadata instead of classes
        if ( $widget['is_e_con_inner'] ?? false ) {
            $e_con_inner_widgets[] = $widget;
        }
        
        if ( ! empty( $widget['children'] ) ) {
            $this->find_e_con_inner_widgets_recursively( $widget['children'], $e_con_inner_widgets );
        }
    }
}
```

#### Step 3: Remove E-Con Classes During Conversion

In `elementor-class-filter.php` or during HTML class modification:
```php
// Remove Elementor v3 container classes
$classes_to_remove = ['e-con', 'e-con-inner', 'e-flex', 'e-grid', 'e-con-boxed', 'e-con-full'];
foreach ($classes_to_remove as $class) {
    // Remove from widget classes
}
```

## Benefits

1. ✅ **Flexbox properties become atomic props** instead of being lost
2. ✅ **No class preservation needed** - e-con classes removed, styles applied directly
3. ✅ **Correct widget structure** - matches expected parent/child relationships
4. ✅ **CSS variables resolved** - `var(--display)` → `flex` before conversion

## Success Criteria

### Test Case: Obox Element-089b111 Conversion

**Input**:
```
.elementor-element-089b111 {--display: flex; --align-items: center;}
.e-con.e-flex > .e-con-inner {display: var(--display); align-items: var(--align-items);}
```

**Expected Output**:
```json
{
  "elType": "e-div-block",
  "styles": {
    "e-xxx": {
      "variants": [{
        "props": {
          "display": {"$$type": "string", "value": "flex"},
          "align-items": {"$$type": "string", "value": "center"}
        }
      }]
    }
  }
}
```

**Verification**: Chrome DevTools MCP shows Layout controls with Display="Flex" selected.

## Implementation Plan

1. **Phase 1**: Add e-con metadata storage in HTML parser ✅
2. **Phase 2**: Update hardcoded logic to use metadata instead of classes ✅  
3. **Phase 3**: Remove e-con classes from converted widgets ⏸️
4. **Phase 4**: Test with Obox conversion and verify with Chrome DevTools MCP ⏸️

## Non-Goals

- Handling all Elementor v3 selectors (focus only on e-con/e-con-inner)
- Preserving e-con classes (they should be removed)
- Supporting nested e-con structures (handle single level first)



