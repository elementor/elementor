# Compound Selector Implementation Roadmap

**Date**: October 16, 2025  
**Priority**: Medium  
**Effort**: 2-3 days

---

## 🚀 Quick Implementation Plan

### Phase 1: Detection & Extraction (Day 1)

**File**: `css-selector-utils.php`

```php
public static function is_compound_class_selector( string $selector ): bool {
    $trimmed = trim( $selector );
    $pattern = '/^\.([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)$/';
    return preg_match( $pattern, $trimmed ) === 1;
}

public static function extract_compound_classes( string $selector ): array {
    $trimmed = trim( $selector );
    
    if ( empty( $trimmed ) || $trimmed[0] !== '.' ) {
        return [];
    }
    
    $trimmed = substr( $trimmed, 1 );
    $classes = explode( '.', $trimmed );
    
    return array_filter( array_map( 'trim', $classes ) );
}

public static function build_compound_flattened_name( array $classes ): string {
    sort( $classes );
    return implode( '-and-', $classes );
}
```

### Phase 2: Selector Processing (Day 2)

**File**: `unified-css-processor.php`

Add method to handle compound selectors:

```php
private function process_compound_selectors( array $rules ): array {
    $compound_rules = [];
    
    foreach ( $rules as $rule ) {
        $selector = $rule['selector'] ?? '';
        
        if ( Css_Selector_Utils::is_compound_class_selector( $selector ) ) {
            $classes = Css_Selector_Utils::extract_compound_classes( $selector );
            $flattened_name = Css_Selector_Utils::build_compound_flattened_name( $classes );
            
            $compound_rule = [
                'selector' => '.' . $flattened_name,
                'properties' => $rule['properties'] ?? [],
                'original_selector' => $selector,
                'compound_classes' => $classes,
                'flattened_class' => $flattened_name,
                'specificity' => count( $classes ) * 10,
                'is_compound' => true,
            ];
            
            $compound_rules[] = $compound_rule;
        }
    }
    
    return $compound_rules;
}
```

### Phase 3: HTML Modification (Day 2)

**File**: `html-class-modifier-service.php`

Add compound class detection:

```php
private function apply_compound_classes( array $widgets ): array {
    foreach ( $widgets as &$widget ) {
        $classes = $widget['classes'] ?? [];
        
        // Check for compound requirements
        foreach ( $this->compound_mappings as $compound_id => $requirements ) {
            $has_all_required = true;
            
            foreach ( $requirements as $required_class ) {
                if ( ! in_array( $required_class, $classes, true ) ) {
                    $has_all_required = false;
                    break;
                }
            }
            
            if ( $has_all_required && ! in_array( $compound_id, $classes, true ) ) {
                $widget['classes'][] = $compound_id;
            }
        }
    }
    
    return $widgets;
}
```

### Phase 4: Global Classes Storage (Day 2)

Ensure compound classes are stored in kit meta:

```php
private function create_global_class_from_compound( 
    array $compound_rule 
): array {
    return [
        'id' => 'g-' . substr( md5( $compound_rule['flattened_class'] ), 0, 8 ),
        'label' => $compound_rule['flattened_class'],
        'type' => 'class',
        'original_selector' => $compound_rule['original_selector'],
        'compound_classes' => $compound_rule['compound_classes'],
        'specificity' => $compound_rule['specificity'],
        'variants' => [
            [
                'meta' => [
                    'breakpoint' => 'desktop',
                    'state' => null,
                ],
                'props' => $this->convert_properties_to_atomic( 
                    $compound_rule['properties'] 
                ),
            ],
        ],
    ];
}
```

### Phase 5: Integration (Day 3)

Update `unified-css-processor.php` to call new logic:

```php
public function process_css_and_widgets( string $css, array $widgets ): array {
    // Existing code...
    
    // NEW: Process compound selectors
    $compound_rules = $this->process_compound_selectors( $css_rules );
    
    // NEW: Store compound class metadata
    foreach ( $compound_rules as $rule ) {
        $global_class = $this->create_global_class_from_compound( $rule );
        $this->global_classes[ $global_class['label'] ] = $global_class;
    }
    
    // NEW: Apply compound classes to HTML
    $widgets = $this->apply_compound_classes( $widgets );
    
    // Rest of processing...
}
```

---

## 🧪 Test Cases (Phase 5)

```javascript
describe( 'Compound Class Selectors', () => {
    test( 'Single compound selector', () => {
        const css = '.first.second { color: red; }';
        const html = '<div class="first second">Text</div>';
        
        const result = convert( css, html );
        
        expect( result.html ).toContain( 'class="first second first-and-second"' );
        expect( result.globalClasses ).toHaveProperty( 'first-and-second' );
        expect( result.globalClasses[ 'first-and-second' ].properties.color ).toBe( 'red' );
    } );
    
    test( 'Multiple compound selectors', () => {
        const css = `
            .btn.primary { background: blue; }
            .btn.secondary { background: gray; }
        `;
        const html = `
            <button class="btn primary">Primary</button>
            <button class="btn secondary">Secondary</button>
        `;
        
        const result = convert( css, html );
        
        expect( result.globalClasses ).toHaveProperty( 'btn-and-primary' );
        expect( result.globalClasses ).toHaveProperty( 'btn-and-secondary' );
    } );
    
    test( 'Compound selector with element selector should not match', () => {
        const css = '.first.second { color: red; }';
        const html = '<div class="first">Text</div>';
        
        const result = convert( css, html );
        
        expect( result.html ).not.toContain( 'first-and-second' );
    } );
    
    test( 'Three-class compound selector', () => {
        const css = '.btn.primary.large { padding: 20px; }';
        const html = '<button class="btn primary large">Click</button>';
        
        const result = convert( css, html );
        
        expect( result.html ).toContain( 'btn-and-large-and-primary' );
        expect( result.globalClasses[ 'btn-and-large-and-primary' ].specificity ).toBe( 30 );
    } );
} );
```

---

## 📋 Checklist

- [ ] Add `is_compound_class_selector()` to `Css_Selector_Utils`
- [ ] Add `extract_compound_classes()` to `Css_Selector_Utils`
- [ ] Add `build_compound_flattened_name()` to `Css_Selector_Utils`
- [ ] Add `process_compound_selectors()` to `Unified_Css_Processor`
- [ ] Add `apply_compound_classes()` to `Html_Class_Modifier_Service`
- [ ] Add `create_global_class_from_compound()` to global classes converter
- [ ] Update regex patterns in `css-converter-config.php`
- [ ] Write comprehensive tests
- [ ] Run lint fixes
- [ ] Test with Playwright
- [ ] Document in README

---

## 🎯 Expected Outcome

After implementation:

```css
/* Input CSS */
.card.featured { border: 2px solid gold; }
```

```html
<!-- Input HTML -->
<div class="card featured">Featured Card</div>

<!-- Output HTML -->
<div class="card featured card-and-featured">Featured Card</div>

<!-- Generated Global Class -->
.elementor .card-and-featured {
    border: 2px solid gold;
}
```

---

## 🚨 Edge Cases to Handle

1. **Order independence**: `.first.second` and `.second.first` should map to same class
   - Solution: Sort classes alphabetically before flattening

2. **Three+ classes**: `.a.b.c` should work
   - Solution: Flattened name: `a-and-b-and-c` or `a--b--c`

3. **Class name conflicts**: `first-and-second` vs separate `first-and-second` class
   - Solution: Add unique hash suffix if needed

4. **Mixed with element selectors**: `button.primary.large`
   - Current: Not compound (has element tag)
   - Status: Handle as element + classes combination

5. **Specificity ordering**: `.first.second` vs `.second.first`
   - Solution: Normalize order (alphabetical sort)

---

## 🔗 Dependencies

- ✅ No new dependencies
- ✅ Uses existing global classes infrastructure
- ✅ Extends existing selector parsing
- ✅ Compatible with flattening system

---

## 📊 Effort Estimate

| Phase | Task | Effort | Status |
|-------|------|--------|--------|
| 1 | Detection & Extraction | 2 hours | 🟢 Straightforward |
| 2 | Selector Processing | 3 hours | 🟢 Clear logic |
| 3 | HTML Modification | 2 hours | 🟢 Proven pattern |
| 4 | Global Classes Storage | 1 hour | 🟢 Existing system |
| 5 | Integration & Testing | 4 hours | 🟡 Needs verification |
| **Total** | | **~12 hours** | |

---

## 📝 Notes

- Compound selectors are **not nested** (no spaces/combinators)
- They require **ALL specified classes** on the same element
- Specificity = `number_of_classes * 10`
- Can be combined with element selectors (e.g., `button.primary`)
- Should work with pseudo-classes (e.g., `.btn.primary:hover`)

