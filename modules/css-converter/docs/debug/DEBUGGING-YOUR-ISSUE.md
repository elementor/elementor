# Debugging Your Nested Compound Selector Issue

## Step-by-Step Debugging Workflow

### Phase 1: Enable Maximum Debug (✅ DONE)

Your `wp-config.php` now has:
```
WP_DEBUG = true
WP_DEBUG_LOG = true
SCRIPT_DEBUG = true  
SAVEQUERIES = true
error_reporting = E_ALL
```

### Phase 2: Add Strategic Debug Logging

Edit `/plugins/elementor-css/modules/css-converter/services/css/processing/unified-css-processor.php`

In the `apply_widget_specific_styling_for_nested_compound()` method, **replace** current error_log calls with:

```php
error_log( '█████ START: Nested Compound Handler' );
error_log( 'SELECTOR: ' . $selector );

$target_selector = $this->extract_target_selector( $selector );
error_log( 'EXTRACTED TARGET: ' . $target_selector );

$matched_elements = $this->find_matching_widgets( $target_selector, $widgets );
error_log( 'MATCHED BY SELECTOR: ' . count( $matched_elements ) );

if ( empty( $matched_elements ) && strpos( $target_selector, '.' ) === 0 ) {
    $element_type = $this->extract_element_type_from_selector_class( $target_selector );
    error_log( 'EXTRACTED ELEMENT TYPE: ' . $element_type );
    
    $matched_elements = $this->find_widgets_by_element_type( $element_type, $widgets );
    error_log( 'MATCHED BY TYPE: ' . count( $matched_elements ) );
}

if ( empty( $matched_elements ) ) {
    error_log( '❌ NO WIDGETS MATCHED' );
    return;
}

$converted_properties = $this->convert_rule_properties_to_atomic( $properties );
error_log( 'CONVERTED PROPERTIES: ' . count( $converted_properties ) );
error_log( 'PROPERTIES: ' . json_encode( array_map( function($p) { 
    return [ 'property' => $p['property'], 'has_converted' => isset( $p['converted_property'] ) ];
}, $converted_properties ) ) );

error_log( 'CALLING collect_reset_styles with:' );
error_log( '  - selector: ' . $target_selector );
error_log( '  - properties: ' . count( $converted_properties ) );
error_log( '  - widgets: ' . json_encode( $matched_elements ) );

$this->unified_style_manager->collect_reset_styles(
    $target_selector,
    $converted_properties,
    $matched_elements,
    true
);

error_log( '█████ END: Nested Compound Handler (styles collected)' );
```

Also add logging to `resolve_styles_recursively()`:

```php
private function resolve_styles_recursively( array $widgets ): array {
    $resolved_widgets = [];
    foreach ( $widgets as $widget ) {
        $widget_id = $this->get_widget_identifier( $widget );
        
        // DEBUG START
        $element_id = $widget['element_id'] ?? 'unknown';
        $widget_type = $widget['widget_type'] ?? 'unknown';
        error_log( '📝 RESOLVING: ' . $element_id . ' (type: ' . $widget_type . ')' );
        
        $resolved_styles = $this->unified_style_manager->resolve_styles_for_widget( $widget );
        
        error_log( '📝 RESOLVED STYLES: ' . count( $resolved_styles ) . ' properties' );
        if ( ! empty( $resolved_styles ) ) {
            error_log( '  Keys: ' . json_encode( array_keys( $resolved_styles ) ) );
        }
        // DEBUG END
        
        $widget['resolved_styles'] = $resolved_styles;
        // ... rest of method
    }
    return $resolved_widgets;
}
```

### Phase 3: Test and Monitor Logs

**In Terminal 1** - Watch the logs:
```bash
rm /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log
tail -f /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log | grep -E "█|SELECTOR|MATCHED|CONVERTED|RESOLVE|RESOLVED"
```

**In Terminal 2** - Run the conversion:
```bash
curl -X POST "http://elementor.local:10003/wp-json/elementor/v2/widget-converter" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "url",
    "content": "https://oboxthemes.com/",
    "selector": ".elementor-element-14c0aa4"
  }'
```

### Phase 4: Analyze Results

Look for these key messages in the log:

```
█████ START: Nested Compound Handler
SELECTOR: .elementor-1140 .elementor-element.elementor-element-14c0aa4 .elementor-heading-title
EXTRACTED TARGET: .elementor-heading-title
MATCHED BY SELECTOR: 0                    ← If 0, we fall back to element type
EXTRACTED ELEMENT TYPE: h2                ← Good, we found it
MATCHED BY TYPE: 1                        ← Good, we found the widget
CONVERTED PROPERTIES: 5                   ← Good, we have properties to apply
PROPERTIES: [{"property":"font-size","has_converted":true}, ...]
CALLING collect_reset_styles...
█████ END: Nested Compound Handler
📝 RESOLVING: [widget-id] (type: e-heading)
📝 RESOLVED STYLES: 5 properties
  Keys: ["font-size", "font-weight", "line-height", ...]
```

## Expected Flow

### ✅ What Should Happen:
1. Handler detects nested+compound selector
2. Extracts target (`.elementor-heading-title` → `h2`)
3. Finds matching h2 widget(s)
4. Converts properties to atomic format
5. Collects via `collect_reset_styles()`
6. Widget resolved with styles
7. Styles appear in `_elementor_data`

### ❌ If It Breaks:
- Check which step has `0` count
- Verify property conversion happened (`has_converted: true`)
- Check that widget was resolved with expected style count

## Clean Up After Debugging

Once fixed, remove the debug statements.

