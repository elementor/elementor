# PRD: E-Con Selector Processor

## Problem

`.e-con` and `.e-con-inner` selectors contain flexbox properties that need to be applied as atomic props, but current logic fails because:
1. Selectors are processed by Widget_Class_Processor, which looks for matching classes
2. Converted widgets don't have `e-con` or `e-con-inner` classes
3. Flexbox properties are lost or sent to custom CSS

## Solution: Dedicated E_Con_Selector_Processor

Following the same pattern as `Id_Selector_Processor` and `Reset_Styles_Processor`.

### Architecture

**Processor Name**: `E_Con_Selector_Processor`
**Priority**: 11 (Same as Widget_Class_Processor, run early to catch these selectors)
**Purpose**: Handle `.e-con` and `.e-con-inner` selectors specifically

### Implementation Pattern

```php
class E_Con_Selector_Processor implements Css_Processor_Interface {
    
    public function get_priority(): int {
        return 11; // Early, before style collection
    }
    
    public function supports_context( Css_Processing_Context $context ): bool {
        $css_rules = $context->get_metadata( 'css_rules', [] );
        return $this->has_e_con_selectors( $css_rules );
    }
    
    public function process( Css_Processing_Context $context ): Css_Processing_Context {
        // 1. Extract e-con rules
        $e_con_rules = $this->extract_e_con_selectors( $css_rules );
        
        // 2. Find matching widgets using metadata
        foreach ( $e_con_rules as $rule ) {
            $selector = $rule['selector'];
            
            if ( $this->is_e_con_inner_selector( $selector ) ) {
                $widgets = $this->find_widgets_with_metadata( $widgets, 'is_e_con_inner', true );
            } else {
                $widgets = $this->find_widgets_with_metadata( $widgets, 'is_e_con', true );
            }
            
            // 3. Convert properties
            $converted = $this->convert_properties( $rule['properties'] );
            
            // 4. Collect in unified style manager
            $unified_style_manager->collect_css_selector_styles(
                $selector,
                $converted,
                $matched_element_ids
            );
        }
        
        // 5. Remove processed rules
        $remaining_rules = $this->remove_e_con_selectors( $css_rules );
        $context->set_metadata( 'css_rules', $remaining_rules );
        
        return $context;
    }
}
```

### Key Methods

1. **`has_e_con_selectors()`** - Check if any CSS rules are e-con selectors
2. **`extract_e_con_selectors()`** - Extract rules with `.e-con` or `.e-con-inner` selectors
3. **`find_widgets_with_metadata()`** - Find widgets using `is_e_con` or `is_e_con_inner` metadata
4. **`remove_e_con_selectors()`** - Remove processed rules from css_rules

### Integration

**Register in css-processor-factory.php**:
```php
new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\E_Con_Selector_Processor(),
```

**Priority order**:
- Css_Variable_Resolver (10) - Resolves var() references first
- E_Con_Selector_Processor (11) - Processes e-con selectors
- Widget_Class_Processor (11) - Processes other widget classes
- Style_Collection_Processor (85) - Collects remaining styles

### Benefits

1. ✅ **Follows existing pattern** - Same as Id_Selector_Processor
2. ✅ **Clean separation** - E-con logic isolated in dedicated processor
3. ✅ **Uses metadata** - Relies on `is_e_con` / `is_e_con_inner` from HTML parser
4. ✅ **Prevents duplication** - Removes processed rules from pipeline
5. ✅ **Integrates with existing system** - Uses unified_style_manager

### Alternative: Enhance Widget_Class_Processor

Instead of creating a new processor, add metadata-based matching to Widget_Class_Processor:

```php
// In find_widgets_matching_selector_classes()
if ( in_array( 'e-con-inner', $selector_classes ) ) {
    return $this->find_widgets_with_metadata( $widgets, 'is_e_con_inner', true );
}
if ( in_array( 'e-con', $selector_classes ) ) {
    return $this->find_widgets_with_metadata( $widgets, 'is_e_con', true );
}
```

This is simpler and doesn't require a new processor.

## Recommendation

**Use Alternative Approach** - Enhance Widget_Class_Processor with metadata-based matching for e-con selectors. This is:
- Simpler (no new processor)
- Consistent (all widget class logic in one place)
- Minimal changes (just update matching logic)

## Implementation Steps

1. ✅ Add `is_e_con` / `is_e_con_inner` metadata in html-parser.php
2. Add `find_widgets_with_metadata()` helper method
3. Update `find_widgets_matching_selector_classes()` to check for e-con classes and use metadata matching
4. Test with Obox conversion
5. Verify with Chrome DevTools MCP









