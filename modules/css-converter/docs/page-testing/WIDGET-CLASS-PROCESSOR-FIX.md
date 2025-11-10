# Widget Class Processor Variable Extraction Fix

## Problem Identified

CSS variables were not being created because **variable references in widget properties were not being extracted**.

### Root Cause

The `widget-class-processor.php` was:
1. ✅ Correctly matching CSS rules to widgets
2. ✅ Applying properties to widgets
3. ❌ **NOT extracting** `var(--variable-name)` references from property values
4. ❌ **NOT passing** these references to the CSS variables processor

This meant that variables used in widget styling (e.g., `.elementor-widget-text-editor { font-size: var(--ec-global-typography-text-font-size); }`) were never extracted for registration.

## Solution Implemented

### 1. Added Variable Extraction to Widget Class Processor

**File**: `plugins/elementor-css/modules/css-converter/services/css/processing/processors/widget-class-processor.php`

**Changes**:
- Added `extract_and_store_variable_references()` method
- Extracts all `var(--variable-name)` references from widget properties
- Stores them in context metadata as `widget_variable_references`
- Handles `--e-global-` to `--ec-global-` renaming

**Code Added** (lines 504-535):
```php
private function extract_and_store_variable_references( array $properties, Css_Processing_Context $context ): void {
    $widget_variable_references = $context->get_metadata( 'widget_variable_references', [] );
    
    foreach ( $properties as $property_data ) {
        $value = $property_data['value'] ?? '';
        
        if ( empty( $value ) ) {
            continue;
        }
        
        preg_match_all( '/var\(\s*--([a-zA-Z0-9_-]+)/', $value, $matches );
        
        if ( ! empty( $matches[1] ) ) {
            foreach ( $matches[1] as $var_name ) {
                $clean_name = $this->clean_variable_name( $var_name );
                $widget_variable_references[] = $clean_name;
            }
        }
    }
    
    $context->set_metadata( 'widget_variable_references', array_unique( $widget_variable_references ) );
}

private function clean_variable_name( string $var_name ): string {
    $clean_name = ltrim( $var_name, '-' );
    
    if ( strpos( $clean_name, 'e-global-' ) === 0 ) {
        $clean_name = 'ec-' . substr( $clean_name, 2 );
    }
    
    return sanitize_key( $clean_name );
}
```

### 2. Integrated Widget References into CSS Variables Processor

**File**: `plugins/elementor-css/modules/css-converter/services/css/processing/processors/css-variables-processor.php`

**Changes**:
- Retrieves `widget_variable_references` from context
- Merges with CSS string and rule-based references
- Ensures widget variables are included in smart filtering

**Code Modified** (lines 161-169):
```php
$widget_variable_references = $context->get_metadata( 'widget_variable_references', [] );

$all_referenced_variables = array_unique( array_merge( 
    $referenced_variables_from_rules, 
    $referenced_variables_from_css_string,
    $widget_variable_references
) );

file_put_contents( $log_file, date('[H:i:s] ') . "References: " . count($referenced_variables_from_rules) . " from scoped rules, " . count($referenced_variables_from_css_string) . " from CSS string, " . count($widget_variable_references) . " from widget properties, total=" . count($all_referenced_variables) . "\n", FILE_APPEND );
```

## Test Results

### API Call
```bash
curl -X POST http://elementor.local:10003/wp-json/elementor/v2/widget-converter \
  -H "Content-Type: application/json" \
  -d '{"type":"url","content":"https://oboxthemes.com/","selector":".elementor-element-6d397c1"}'
```

### Before Fix
- `variables_created: 0`
- Only 1 reference found from CSS string

### After Fix
- `variables_created: 17`
- **18 variable references extracted** from widget properties:
  1. `align-self`
  2. `flex-basis`
  3. `flex-grow`
  4. `flex-shrink`
  5. `order`
  6. `align-content`
  7. `align-items`
  8. `flex-direction`
  9. `flex-wrap`
  10. `row-gap`
  11. `column-gap`
  12. `justify-content`
  13. `kit-widget-spacing`
  14. **`ec-global-typography-text-font-size`** ✅
  15. **`ec-global-typography-text-font-weight`** ✅
  16. **`ec-global-typography-text-line-height`** ✅
  17. **`ec-global-color-text`** ✅
  18. **`ec-global-color-e66ebc9`** ✅ (reused)

## CSS Rules Applied to Widgets

From `/tmp/widget_rules_applied.log`:

```
APPLYING RULE: .elementor-widget-text-editor
  Target classes: elementor-widget-text-editor
  Properties: 4
    font-size: var(--ec-global-typography-text-font-size)
    font-weight: var(--ec-global-typography-text-font-weight)
    line-height: var(--ec-global-typography-text-line-height)
    color: var(--ec-global-color-text)

APPLYING RULE: .elementor-1140 .elementor-element.elementor-element-6d397c1
  Target classes: elementor-1140, elementor-element, elementor-element-6d397c1
  Properties: 4
    font-size: 26px
    font-weight: 400
    line-height: 36px
    color: var(--ec-global-color-e66ebc9)
```

## Status

✅ **COMPLETE** - Widget variable extraction working
✅ All 5 critical typography/color variables extracted
✅ Variables being registered in Elementor's repository
✅ Smart filtering correctly includes widget property references

## Next Steps

1. Remove debug logging
2. Test with Chrome DevTools MCP to verify variables render correctly
3. Run Playwright tests to ensure no regressions




