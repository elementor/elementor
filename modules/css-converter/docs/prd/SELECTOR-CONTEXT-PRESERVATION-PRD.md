# PRD: Selector Context Preservation for CSS Matching

## Problem Statement

When using the widget converter API with a `selector` parameter (e.g., `selector: ".elementor-element-1a10fb4"`), CSS selectors that reference ancestor elements fail to match because only the selected element and its children are extracted from the HTML.

### Current Behavior
```json
{
  "type": "url",
  "content": "https://oboxthemes.com/",
  "selector": ".elementor-element-1a10fb4"
}
```

**HTML Structure:**
```html
<div class="elementor elementor-1140">          <!-- ANCESTOR - NOT EXTRACTED -->
  <section class="elementor-element-1a10fb4">   <!-- SELECTED ELEMENT - EXTRACTED -->
    <div class="elementor-element-14c0aa4">     <!-- CHILD - EXTRACTED -->
      <h2 class="elementor-heading-title">20 Years of Trust</h2>
    </div>
  </section>
</div>
```

**Current Extraction:** Only `<section class="elementor-element-1a10fb4">` and its children
**Missing:** `<div class="elementor elementor-1140">` ancestor

### Failing CSS Selectors
```css
.elementor-1140 .elementor-element.elementor-element-14c0aa4 .elementor-heading-title {
    font-size: 36px;
    color: #222A5A;
}
```

**Why it fails:** No widget has `elementor-1140` class because the ancestor div wasn't extracted.

## Goals

1. **Preserve CSS Selector Context**: Ensure all CSS selectors can match correctly
2. **Maintain Performance**: Don't convert unnecessary ancestor elements to widgets
3. **Clean Architecture**: Separate HTML extraction from widget conversion
4. **Backward Compatibility**: Don't break existing functionality

## Proposed Solution

### Two-Phase Approach

#### Phase 1: HTML Context Extraction
Extract **full HTML tree** including ancestors, but mark what should be converted:

```php
private function extract_html_with_context( string $html, string $selector ): array {
    $dom = new \DOMDocument();
    $dom->loadHTML( $html );
    $xpath = new \DOMXPath( $dom );
    
    // Find the selected element
    $selected_nodes = $xpath->query( $this->css_selector_to_xpath( $selector ) );
    $selected_element = $selected_nodes->item( 0 );
    
    // Extract full tree but mark conversion boundaries
    return [
        'full_html' => $dom->saveHTML(),
        'selected_element_html' => $dom->saveHTML( $selected_element ),
        'context_classes' => $this->extract_ancestor_classes( $selected_element ),
    ];
}
```

#### Phase 2: Selective Widget Conversion
Convert only the selected element to widgets, but preserve ancestor context:

```php
private function convert_with_context( array $extraction_result ): array {
    // Parse full HTML for CSS context
    $full_elements = $this->html_parser->parse( $extraction_result['full_html'] );
    
    // Parse selected HTML for widget conversion
    $selected_elements = $this->html_parser->parse( $extraction_result['selected_element_html'] );
    
    // Convert only selected elements to widgets
    $widgets = $this->widget_mapper->map_elements( $selected_elements );
    
    // Add virtual ancestor context for CSS matching
    $widgets_with_context = $this->add_ancestor_context( 
        $widgets, 
        $extraction_result['context_classes'] 
    );
    
    return $widgets_with_context;
}
```

### Alternative: Virtual Ancestor Injection

Instead of parsing full HTML, inject virtual ancestor widgets:

```php
private function add_virtual_ancestors( array $widgets, array $ancestor_classes ): array {
    if ( empty( $ancestor_classes ) ) {
        return $widgets;
    }
    
    // Create virtual root widget with ancestor classes
    $virtual_root = [
        'widget_type' => 'virtual-ancestor',
        'element_id' => 'virtual-root',
        'attributes' => [
            'class' => implode( ' ', $ancestor_classes )
        ],
        'children' => $widgets,
        'virtual' => true, // Mark as virtual for CSS matching only
    ];
    
    return [ $virtual_root ];
}
```

## Implementation Plan

### Option A: Full HTML Context (Recommended)
1. Modify `extract_html_by_selector()` to return context information
2. Update `resolve_html_content()` to handle context extraction
3. Modify widget conversion to use context for CSS matching
4. Ensure virtual ancestors don't appear in final widget output

### Option B: Ancestor Class Injection
1. Extract ancestor classes from full HTML before selector extraction
2. Inject ancestor classes into widget tree as virtual context
3. Modify selector matcher to handle virtual ancestors
4. Filter out virtual ancestors from final output

## Success Criteria

### Functional Requirements
- [ ] CSS selectors with ancestor requirements match correctly
- [ ] `.elementor-1140 .elementor-element-14c0aa4 .elementor-heading-title` applies styles
- [ ] No performance degradation for non-selector requests
- [ ] Virtual ancestors don't appear in final widget JSON

### Technical Requirements
- [ ] Backward compatibility maintained
- [ ] Clean separation between HTML extraction and widget conversion
- [ ] Minimal changes to existing CSS processing pipeline
- [ ] Clear distinction between real and virtual widgets

## Risk Assessment

### Low Risk
- Virtual ancestor approach is isolated and doesn't affect core logic
- Can be feature-flagged for gradual rollout

### Medium Risk  
- Full HTML parsing might impact performance for large pages
- Need to ensure virtual elements don't leak into final output

### Mitigation
- Implement virtual ancestor approach first (simpler, lower risk)
- Add performance monitoring for HTML parsing
- Comprehensive testing with various selector patterns

## Acceptance Criteria

1. **Test Case**: `selector: ".elementor-element-1a10fb4"` with CSS rule `.elementor-1140 .elementor-element-14c0aa4 .elementor-heading-title`
   - **Expected**: Styles applied correctly (font-size: 36px, color: rgb(34, 42, 90))
   - **Current**: Styles not applied (font-size: 32px, color: rgb(255, 255, 255))

2. **Performance**: No regression for requests without selector parameter

3. **Architecture**: Virtual ancestors clearly marked and filtered from final output

## Implementation Priority

**HIGH** - This is blocking CSS selector matching for targeted element extraction, which is a core use case for the widget converter API.

