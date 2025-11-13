# Order Property Targeting Issue - Complete Reproduction Analysis

## 🎯 Issue Summary

**Problem**: The `order` CSS property is being applied to widget props instead of the global `.elementor-element` class, preventing proper flex ordering behavior.

**URL Tested**: https://oboxthemes.com/  
**Selector**: `.elementor-element-6d397c1`

## 📊 Original Styling Analysis

### Flex Context on Obox Themes
- **Element**: `.elementor-element-6d397c1` (text editor widget)
- **Parent**: `.elementor-widget-wrap.elementor-element-populated` 
- **Parent Display**: `flex` with `flex-direction: row` and `flex-wrap: wrap`
- **Current Order**: `0` (default)
- **Siblings**: 3 elements, all with `order: 0`

### Expected Behavior
When `order: 2` is applied to `.elementor-element-6d397c1`:
1. Element should move to the end of the flex container
2. Visual position should change from index 2 to index 2 (last)
3. Other elements with `order: 0` should appear before it

## 🔄 Conversion Process Mapping

### Current (Incorrect) Implementation

```php
// In flex-properties-mapper.php
private function map_order( string $value ): ?array {
    if ( ! is_numeric( $value ) ) {
        return null;
    }
    
    // ❌ PROBLEM: Returns widget prop data
    return Number_Prop_Type::make()->generate( (int) $value );
}
```

**Result**: 
- CSS: `.elementor-element-6d397c1 { order: 2; }`
- Converts to: Widget prop `{ "order": { "type": "number", "value": 2 } }`
- Applied to: Individual widget (wrong target)

### Expected (Correct) Implementation

```php
// Should target global .elementor-element class
private function map_order( string $value ): ?array {
    if ( ! is_numeric( $value ) ) {
        return null;
    }
    
    // ✅ SOLUTION: Return global class targeting data
    return [
        'target' => 'global_class',
        'selector' => '.elementor-element',
        'property' => 'order',
        'value' => (int) $value
    ];
}
```

**Expected Result**:
- CSS: `.elementor-element-6d397c1 { order: 2; }`
- Converts to: Global class rule `.elementor-element { order: 2; }`
- Applied to: Element container (correct target)

## 🧪 Test Results

### Direct CSS Application Test
```javascript
element.style.order = '2';
// Result: ✅ Works correctly, order becomes '2'
```

### CSS Variable Application Test  
```javascript
element.style.setProperty('--order', '2');
element.style.order = 'var(--order)';
// Result: ✅ Works correctly, order becomes '2'
```

### Current Elementor Implementation
```css
.elementor-element { 
    order: var(--order); 
    --order: initial; 
}
```
- CSS variable `--order` is set to `initial` by default
- Widget props don't set the CSS variable value
- **Result**: Order property has no effect

## 🎯 Container Property Targeting System Requirements

### Properties That Should Target Global Class
1. **Flex Item Properties** (affect element within flex parent):
   - `order` - Controls visual order in flex container
   - `align-self` - Individual alignment override
   - `flex-grow` - Growth factor
   - `flex-shrink` - Shrink factor  
   - `flex-basis` - Initial size

2. **Grid Item Properties** (affect element within grid parent):
   - `grid-column` - Column placement
   - `grid-row` - Row placement
   - `grid-area` - Area placement

### Implementation Strategy
1. **Identify Container Properties**: Create list of properties that affect element positioning
2. **Global Class Targeting**: Route these properties to `.elementor-element` class
3. **CSS Variable Integration**: Use existing `--order` variable system
4. **Widget Prop Exclusion**: Don't create widget props for container properties

## 🔧 Solution Implementation Plan

### Phase 1: Fix Flex Properties Mapper
```php
// Add container property detection
private function is_container_property( string $property ): bool {
    return in_array( $property, [
        'order',
        'align-self',
        'flex-grow', 
        'flex-shrink',
        'flex-basis'
    ], true );
}

// Modify map_order method
private function map_order( string $value ): ?array {
    if ( ! is_numeric( $value ) ) {
        return null;
    }
    
    // Target global class instead of widget props
    return $this->create_global_class_rule( 'order', (int) $value );
}
```

### Phase 2: Global Class Rule Creation
```php
private function create_global_class_rule( string $property, $value ): array {
    return [
        'type' => 'global_class_rule',
        'selector' => '.elementor-element',
        'property' => $property,
        'value' => $value,
        'css_variable' => '--' . $property
    ];
}
```

### Phase 3: Integration with CSS Output
- Ensure global class rules are processed correctly
- Set CSS variables: `.elementor-element { --order: 2; }`
- Existing CSS rule applies: `.elementor-element { order: var(--order); }`

## ✅ Verification Checklist

- [x] **Issue Reproduced**: Order property targeting confirmed
- [x] **Original Styling Analyzed**: Flex context understood  
- [x] **Conversion Mapped**: Current vs expected behavior documented
- [ ] **Solution Implemented**: Container property targeting system
- [ ] **Testing Complete**: Fix verified with original URL/selector
- [ ] **Integration Done**: CSS output optimizer integrated

## 🎯 Success Criteria

1. **CSS Input**: `.elementor-element-6d397c1 { order: 2; }`
2. **Expected Output**: `.elementor-element { --order: 2; }`
3. **Visual Result**: Element reorders correctly in flex container
4. **No Widget Props**: Order property not in widget prop data

## 📁 Related Files

- **Issue File**: `plugins/elementor-css/modules/css-converter/convertors/css-properties/properties/flex-properties-mapper.php`
- **Analysis Doc**: `plugins/elementor-css/modules/css-converter/docs/debugging/CSS-FIXES-FAILURE-ANALYSIS.md`
- **Test URL**: https://oboxthemes.com/ (`.elementor-element-6d397c1`)
- **Elementor Editor**: http://elementor.local:10003/wp-admin/post.php?post=40059&action=elementor

---

**Status**: 🟡 Issue Reproduced & Analyzed - Ready for Implementation
