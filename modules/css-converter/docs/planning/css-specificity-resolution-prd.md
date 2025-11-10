# CSS Specificity Resolution in Unified Style Manager

## Problem Statement

The `Unified_Style_Manager` currently collects styles from multiple processors without respecting CSS specificity rules. When multiple processors provide conflicting values for the same property, the **last processor wins** regardless of CSS specificity, leading to incorrect style application.

### Current Behavior (Incorrect)

```php
// Widget_Child_Element_Selector_Processor (priority 10) runs first
collect_element_styles('e-image', [width: 100px], 'element-img-8');
// Specificity: (0,3,1) - Higher specificity

// Widget_Class_Processor (priority 11) runs second  
collect_element_styles('e-image', [width: 48px], 'element-img-8');
// Specificity: (0,1,3) - Lower specificity

// Result: 48px wins (WRONG - lower specificity overrides higher)
```

### Expected Behavior (Correct)

```php
// Widget_Child_Element_Selector_Processor (priority 10)
collect_element_styles('e-image', [width: 100px], 'element-img-8');
// Specificity: (0,3,1) - Higher specificity

// Widget_Class_Processor (priority 11)
collect_element_styles('e-image', [width: 48px], 'element-img-8');
// Specificity: (0,1,3) - Lower specificity

// Result: 100px wins (CORRECT - higher specificity wins)
```

## Real-World Example

### CSS Rules
```css
/* Rule 1: Higher specificity (0,3,1) */
.elementor-1140 .elementor-element.elementor-element-a431a3a img {
    width: 100px;
}

/* Rule 2: Lower specificity (0,1,3) */
.elementor-widget-image a img[src$=".svg"] {
    width: 48px;
}
```

### Current Result
- **Actual**: `width: 48px` (WRONG)
- **Expected**: `width: 100px` (Rule 1 has higher specificity)

## Root Cause

The `Unified_Style_Manager` stores styles in a flat array without comparing specificity:

```php
// unified-style-manager.php
public function collect_element_styles($element_type, $properties, $element_id) {
    foreach ($properties as $property_data) {
        // Just appends to array - no specificity check
        $this->collected_styles[] = [
            'source' => 'element',
            'element_type' => $element_type,
            'element_id' => $element_id,
            'property' => $property_data['property'],
            'value' => $property_data['value'],
            'specificity' => $this->calculate_element_specificity($important),
            // ...
        ];
    }
}
```

During style resolution, the system uses the **last collected value** for each property, ignoring specificity.

## Solution Design

### Phase 1: Add Selector Tracking

**Problem**: The `Unified_Style_Manager` doesn't know which CSS selector each style came from, making specificity comparison impossible.

**Solution**: Pass the original CSS selector through the processing pipeline.

#### Changes Required

1. **Update `collect_element_styles()` signature**:
```php
public function collect_element_styles(
    string $element_type, 
    array $properties, 
    string $element_id,
    string $selector = '',  // NEW: Original CSS selector
    int $specificity = 0    // NEW: Pre-calculated specificity
): void
```

2. **Update all callers** to pass selector and specificity:
```php
// Widget_Child_Element_Selector_Processor
$specificity = $this->calculate_specificity('.elementor-1140 .elementor-element.elementor-element-a431a3a img');
$unified_style_manager->collect_element_styles(
    'e-image',
    $properties,
    'element-img-8',
    '.elementor-1140 .elementor-element.elementor-element-a431a3a img',
    $specificity
);

// Widget_Class_Processor  
$specificity = $this->calculate_specificity('.elementor-widget-image a img[src$=".svg"]');
$unified_style_manager->collect_element_styles(
    'e-image',
    $properties,
    'element-img-8',
    '.elementor-widget-image a img[src$=".svg"]',
    $specificity
);
```

3. **Store selector in collected styles**:
```php
$this->collected_styles[] = [
    'source' => 'element',
    'element_type' => $element_type,
    'element_id' => $element_id,
    'property' => $property_data['property'],
    'value' => $property_data['value'],
    'selector' => $selector,        // NEW
    'specificity' => $specificity,  // UPDATED: Use passed value
    // ...
];
```

### Phase 2: Implement Specificity-Based Resolution

**Problem**: Multiple styles for the same property are not compared by specificity.

**Solution**: When resolving styles for a widget, keep only the highest-specificity value for each property.

#### Implementation

```php
// unified-style-manager.php
private function resolve_property_conflicts(array $applicable_styles): array {
    $by_property = [];
    
    // Group styles by property
    foreach ($applicable_styles as $style) {
        $property = $style['property'];
        
        if (!isset($by_property[$property])) {
            $by_property[$property] = [];
        }
        
        $by_property[$property][] = $style;
    }
    
    // For each property, keep only the highest specificity
    $resolved = [];
    foreach ($by_property as $property => $styles) {
        $winning_style = $this->find_winning_style($styles);
        $resolved[] = $winning_style;
    }
    
    return $resolved;
}

private function find_winning_style(array $styles): array {
    $winner = $styles[0];
    
    foreach ($styles as $style) {
        // Higher specificity wins
        if ($style['specificity'] > $winner['specificity']) {
            $winner = $style;
        }
        // Same specificity: later in source order wins (CSS cascade rule)
        elseif ($style['specificity'] === $winner['specificity']) {
            if ($style['order'] > $winner['order']) {
                $winner = $style;
            }
        }
        // !important always wins
        if ($style['important'] && !$winner['important']) {
            $winner = $style;
        }
    }
    
    return $winner;
}
```

### Phase 3: Update Specificity Calculation

**Problem**: Current specificity calculation is too simple and doesn't handle attribute selectors correctly.

**Solution**: Use the existing `Css_Specificity_Calculator` service consistently across all processors.

#### Standardize Calculation

```php
// All processors should use:
$specificity_calculator = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator();
$specificity = $specificity_calculator->calculate($selector);
```

## Implementation Plan

### Step 1: Update Unified_Style_Manager (Core)
- [ ] Add `$selector` and `$specificity` parameters to `collect_element_styles()`
- [ ] Store selector and specificity in `$this->collected_styles[]`
- [ ] Implement `resolve_property_conflicts()` method
- [ ] Implement `find_winning_style()` method
- [ ] Update `resolve_styles_for_widget()` to call conflict resolution

### Step 2: Update Widget_Child_Element_Selector_Processor
- [ ] Calculate specificity for each selector using `Css_Specificity_Calculator`
- [ ] Pass selector and specificity to `collect_element_styles()`

### Step 3: Update Widget_Class_Processor
- [ ] Calculate specificity for each selector using `Css_Specificity_Calculator`
- [ ] Pass selector and specificity to `collect_element_styles()`

### Step 4: Update Other Processors (if needed)
- [ ] ID_Selector_Processor
- [ ] Reset_Styles_Processor
- [ ] Nested_Element_Selector_Processor
- [ ] Any other processors calling `collect_element_styles()`

### Step 5: Testing
- [ ] Test width: 100px vs 48px case (expected: 100px wins)
- [ ] Test with `!important` flag (expected: !important always wins)
- [ ] Test with equal specificity (expected: source order wins)
- [ ] Test with multiple conflicting properties
- [ ] Run existing Playwright tests to ensure no regressions

## Success Criteria

1. **Specificity Respected**: Higher specificity rules always win regardless of processor order
2. **CSS Cascade Rules**: When specificity is equal, source order determines winner
3. **Important Flag**: `!important` declarations always win
4. **No Regressions**: All existing tests continue to pass
5. **Real-World Fix**: The width: 100px vs 48px case resolves correctly

## Edge Cases to Handle

### 1. Equal Specificity
```css
.class1 .class2 img { width: 100px; }  /* (0,2,1) */
.class3 .class4 img { width: 50px; }   /* (0,2,1) */
```
**Expected**: Source order wins (last one in CSS file)

### 2. Important Flag
```css
.low-specificity { width: 100px !important; }  /* (0,1,0) + !important */
.high-specificity .more .classes { width: 50px; }  /* (0,3,0) */
```
**Expected**: 100px wins (!important beats higher specificity)

### 3. Inline Styles
```html
<img style="width: 75px;">
```
**Expected**: Inline styles have specificity (1,0,0,0) and should win over all CSS rules

### 4. Multiple Properties from Same Selector
```css
.selector img {
    width: 100px;
    height: 200px;
    border: 1px solid red;
}
```
**Expected**: All properties should have the same specificity

## Files to Modify

1. **`unified-style-manager.php`** (Core changes)
   - Update `collect_element_styles()` signature
   - Add `resolve_property_conflicts()` method
   - Add `find_winning_style()` method
   - Update `resolve_styles_for_widget()` to use conflict resolution

2. **`widget-child-element-selector-processor.php`**
   - Add specificity calculation
   - Pass selector and specificity to `collect_element_styles()`

3. **`widget-class-processor.php`**
   - Add specificity calculation  
   - Pass selector and specificity to `collect_element_styles()`

4. **Other processors** (as needed)
   - Update any other processors calling `collect_element_styles()`

## Backward Compatibility

**Breaking Changes**: The signature of `collect_element_styles()` will change.

**Migration Strategy**:
1. Make new parameters optional with defaults: `$selector = ''`, `$specificity = 0`
2. Update processors one by one
3. Once all processors are updated, make parameters required

## Performance Considerations

**Impact**: Minimal - specificity comparison happens once per property during style resolution.

**Optimization**: 
- Specificity is calculated once per selector during processing
- Conflict resolution only happens for properties with multiple values
- Most properties will have only one value (no conflict)

## Documentation Updates

- [ ] Update `unified-style-manager.php` docblocks
- [ ] Add specificity resolution explanation to architecture docs
- [ ] Update processor implementation guide
- [ ] Document the CSS cascade rules being followed

## Related Issues

- Width 48px vs 100px bug (this PRD's primary driver)
- Any other cases where processor order affects final styling
- Future: Support for CSS layers and cascade layers


