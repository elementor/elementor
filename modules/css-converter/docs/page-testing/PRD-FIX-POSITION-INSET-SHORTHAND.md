# PRD: Fix Position Inset-Inline/Inset-Block Shorthand Processing

## Problem Statement

Two position property tests are failing:
1. `position-prop-type.test.ts:219` - Inset-inline/inset-block shorthand properties  
2. `size-prop-type.test.ts:144` - Unitless zero support for all size properties

**Root Cause**: The positioning mapper is trying to handle shorthand properties directly instead of relying on the CSS_Shorthand_Expander infrastructure that already exists.

## Current Architecture Analysis

### Working Pattern: Padding/Margin
```php
// ✅ WORKING: Padding mapper DOES NOT handle shorthand
class Atomic_Padding_Property_Mapper {
    private const SUPPORTED_PROPERTIES = [
        'padding',           // ⚠️ Listed but...
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'padding-block-start',
        'padding-block-end',
        'padding-inline-start',
        'padding-inline-end',
        'padding-block',     // ⚠️ Listed but...
        'padding-inline',    // ⚠️ Listed but...
    ];

    public function map_to_v4_atomic($property, $value): ?array {
        // Handles all properties uniformly
        $dimensions_data = $this->parse_padding_property($property, $value);
        return Dimensions_Prop_Type::make()->generate($dimensions_data);
    }

    private function parse_padding_property($property, $value): ?array {
        switch ($property) {
            case 'padding':
                return $this->parse_shorthand_to_logical_properties($value);
            case 'padding-block':
                return $this->parse_logical_shorthand($value, 'block');
            case 'padding-inline':
                return $this->parse_logical_shorthand($value, 'inline');
            // ... individual properties
        }
    }
}
```

**Key Insight**: Padding mapper DOES handle shorthand internally because it uses `Dimensions_Prop_Type` which requires all 4 directions to be provided at once.

### Broken Pattern: Positioning
```php
// ❌ BROKEN: Positioning mapper tries to handle shorthand
class Positioning_Property_Mapper {
    private const SUPPORTED_PROPERTIES = [
        'top', 'right', 'bottom', 'left',
        'inset-block-start', 'inset-inline-end', 'inset-block-end', 'inset-inline-start',
        'inset',              // ❌ Should be expanded BEFORE mapper
        'inset-block',        // ❌ Should be expanded BEFORE mapper
        'inset-inline',       // ❌ Should be expanded BEFORE mapper
        'z-index',
    ];

    public function map_to_v4_atomic($property, $value): ?array {
        if ('z-index' === $property) {
            return $this->map_z_index_property($value);
        }

        // ❌ PROBLEM: Tries to handle shorthand
        if (in_array($property, ['inset', 'inset-block', 'inset-inline'], true)) {
            return $this->map_shorthand_property($property, $value);
        }

        return $this->map_individual_property($property, $value);
    }

    // ❌ BROKEN: Only returns first value, ignores other directions
    private function map_shorthand_property($property, $value): ?array {
        $parts = $this->parse_shorthand_values($value);
        if (empty($parts)) {
            return null;
        }

        $first_value = $parts[0];  // ❌ ONLY USES FIRST VALUE!
        $parsed_size = $this->parse_size_value($first_value);
        if (null === $parsed_size) {
            return null;
        }

        return Size_Prop_Type::make()->generate($parsed_size);
    }
}
```

### Infrastructure Already Exists

```php
// ✅ ALREADY EXISTS: CSS_Shorthand_Expander
class CSS_Shorthand_Expander {
    private static function expand_shorthand($property, $value): array {
        switch ($property) {
            case 'inset':
                return self::expand_inset_shorthand($value);
            case 'inset-inline':
                return self::expand_inset_inline_shorthand($value);
            case 'inset-block':
                return self::expand_inset_block_shorthand($value);
            // ...
        }
    }

    // ✅ COMPLETE IMPLEMENTATION
    private static function expand_inset_shorthand($value): array {
        // Handles 1-4 values correctly
        switch ($count) {
            case 1:
                return [
                    'inset-block-start' => $value,
                    'inset-inline-end' => $value,
                    'inset-block-end' => $value,
                    'inset-inline-start' => $value,
                ];
            case 2:
                return [
                    'inset-block-start' => $parts[0],
                    'inset-inline-end' => $parts[1],
                    'inset-block-end' => $parts[0],
                    'inset-inline-start' => $parts[1],
                ];
            // ... case 3, 4
        }
    }

    // ✅ COMPLETE IMPLEMENTATION
    private static function expand_inset_inline_shorthand($value): array {
        return [
            'inset-inline-start' => $start_value,
            'inset-inline-end' => $end_value,
        ];
    }

    // ✅ COMPLETE IMPLEMENTATION
    private static function expand_inset_block_shorthand($value): array {
        return [
            'inset-block-start' => $start_value,
            'inset-block-end' => $end_value,
        ];
    }
}
```

### Expansion Flow (Already Working)

```php
// ✅ ALREADY CALLED: CSS_Property_Conversion_Service
public function convert_properties_to_v4_atomic(array $properties): array {
    // ✅ STEP 1: Expand shorthand BEFORE conversion
    $expanded_properties = CSS_Shorthand_Expander::expand_shorthand_properties($properties);

    $converted = [];

    // ✅ STEP 2: Convert expanded individual properties
    foreach ($expanded_properties as $property => $value) {
        $mapper = $this->resolve_property_mapper_safely($property, $value);
        if (!$mapper) {
            continue;
        }

        $result = $this->convert_property_to_v4_atomic($property, $value);
        // ...
    }

    return $converted;
}
```

## Root Cause Analysis

### The Bug

1. **Shorthand properties ARE being expanded** by CSS_Shorthand_Expander (lines 62-67)
2. **BUT** the positioning mapper is ALSO listed as supporting shorthand (line 45-47 of positioning-property-mapper.php)
3. **When the mapper receives shorthand**, it only processes the first value (lines 112-125)
4. **This causes the test to fail** because:
   - `inset: 20px` should expand to 4 individual properties
   - Each should be converted to Size_Prop_Type independently
   - But the mapper short-circuits and only returns one Size_Prop_Type

### Why Padding Works Differently

Padding uses `Dimensions_Prop_Type` which requires all 4 directions at once:
```php
// Padding returns this structure:
{
    'block-start': Size_Prop_Type,
    'inline-end': Size_Prop_Type,
    'block-end': Size_Prop_Type,
    'inline-start': Size_Prop_Type,
}
```

Positioning uses individual `Size_Prop_Type` for each direction:
```php
// Positioning should return 4 separate properties:
'inset-block-start' => Size_Prop_Type
'inset-inline-end' => Size_Prop_Type
'inset-block-end' => Size_Prop_Type
'inset-inline-start' => Size_Prop_Type
```

## Solution Design

### Option 1: Remove Shorthand Support from Mapper (RECOMMENDED)

**Philosophy**: Let the infrastructure handle expansion, mapper only converts individual properties.

```php
class Positioning_Property_Mapper extends Atomic_Property_Mapper_Base {

    private const SUPPORTED_PROPERTIES = [
        'top',
        'right',
        'bottom',
        'left',
        'inset-block-start',
        'inset-inline-end',
        'inset-block-end',
        'inset-inline-start',
        // ✅ REMOVED: 'inset', 'inset-block', 'inset-inline'
        'z-index',
    ];

    public function map_to_v4_atomic($property, $value): ?array {
        if ('z-index' === $property) {
            return $this->map_z_index_property($value);
        }

        // ✅ REMOVED: Shorthand handling
        // All properties go through individual mapping
        return $this->map_individual_property($property, $value);
    }

    // ✅ DELETE: map_shorthand_property() method
    // ✅ DELETE: parse_shorthand_values() method
}
```

**Pros**:
- ✅ Follows single responsibility principle
- ✅ Leverages existing infrastructure
- ✅ Simpler code
- ✅ Consistent with border, border-radius mappers

**Cons**:
- None

### Option 2: Make Shorthand Return Multiple Properties (NOT RECOMMENDED)

**Philosophy**: Have mapper handle shorthand like padding does.

**Problem**: Positioning properties are stored individually in atomic widgets, not as a single "inset" Dimensions_Prop_Type. This would require:
1. Creating new Inset_Dimensions_Prop_Type
2. Updating atomic widget schema
3. Updating all consumers
4. Major architectural change

**Verdict**: ❌ Overkill for this issue

## Implementation Plan

### Phase 1: Investigation & Verification

#### Task 1.1: Verify Shorthand Expansion is Working
**File**: `plugins/elementor-css/modules/css-converter/services/css/processing/css-shorthand-expander.php`

**Debug Points**:
```php
private static function expand_inset_inline_shorthand($value): array {
    error_log('TMZ_DEBUG: expand_inset_inline_shorthand called');
    error_log('TMZ_DEBUG: Input value: ' . $value);
    
    // ... existing code ...
    
    $result = [
        'inset-inline-start' => $start_value,
        'inset-inline-end' => $end_value,
    ];
    
    error_log('TMZ_DEBUG: Expanded to: ' . print_r($result, true));
    return $result;
}
```

**Test**:
```php
// Create test file: test-inset-expansion.php
$html = '<p style="inset-inline: 10px 30px;">Test</p>';
// Call API
// Check error_log output
```

#### Task 1.2: Verify Mapper Receives Expanded Properties
**File**: `plugins/elementor-css/modules/css-converter/convertors/css-properties/properties/positioning-property-mapper.php`

**Debug Points**:
```php
public function map_to_v4_atomic($property, $value): ?array {
    error_log('TMZ_DEBUG: Positioning mapper called');
    error_log('TMZ_DEBUG: Property: ' . $property);
    error_log('TMZ_DEBUG: Value: ' . $value);
    
    // ... existing code ...
}
```

**Expected Output**:
```
TMZ_DEBUG: expand_inset_inline_shorthand called
TMZ_DEBUG: Input value: 10px 30px
TMZ_DEBUG: Expanded to: Array([inset-inline-start] => 10px, [inset-inline-end] => 30px)
TMZ_DEBUG: Positioning mapper called
TMZ_DEBUG: Property: inset-inline-start
TMZ_DEBUG: Value: 10px
TMZ_DEBUG: Positioning mapper called
TMZ_DEBUG: Property: inset-inline-end
TMZ_DEBUG: Value: 30px
```

**If mapper receives shorthand directly**:
```
TMZ_DEBUG: Positioning mapper called
TMZ_DEBUG: Property: inset-inline  ⚠️ PROBLEM!
TMZ_DEBUG: Value: 10px 30px
```

This means expansion is not happening or mapper is being called before expansion.

### Phase 2: Fix Implementation

#### Task 2.1: Update Positioning Mapper

**File**: `plugins/elementor-css/modules/css-converter/convertors/css-properties/properties/positioning-property-mapper.php`

**Changes**:

1. Remove shorthand from SUPPORTED_PROPERTIES:
```php
private const SUPPORTED_PROPERTIES = [
    'top',
    'right',
    'bottom',
    'left',
    'inset-block-start',
    'inset-inline-end',
    'inset-block-end',
    'inset-inline-start',
    'z-index',
];
```

2. Simplify map_to_v4_atomic:
```php
public function map_to_v4_atomic($property, $value): ?array {
    if (!$this->is_supported_property($property)) {
        return null;
    }

    if ('z-index' === $property) {
        return $this->map_z_index_property($value);
    }

    return $this->map_individual_property($property, $value);
}
```

3. Delete unused methods:
```php
// ❌ DELETE: map_shorthand_property()
// ❌ DELETE: parse_shorthand_values()
```

#### Task 2.2: Verify Shorthand Expander Registration

**File**: `plugins/elementor-css/modules/css-converter/services/css/processing/css-shorthand-expander.php`

**Verify** lines 37-44:
```php
private static function is_shorthand_property(string $property): bool {
    $shorthand_properties = [
        'border',
        'border-top',
        'border-right',
        'border-bottom',
        'border-left',
        'margin-inline',
        'margin-block',
        'inset',            // ✅ Present
        'inset-inline',     // ✅ Present
        'inset-block',      // ✅ Present
        'top',              // ✅ Present (converts to logical)
        'right',            // ✅ Present (converts to logical)
        'bottom',           // ✅ Present (converts to logical)
        'left',             // ✅ Present (converts to logical)
    ];

    return in_array($property, $shorthand_properties, true);
}
```

**Verify** lines 62-75:
```php
private static function expand_shorthand(string $property, $value): array {
    switch ($property) {
        // ... border cases ...
        case 'inset':
            return self::expand_inset_shorthand($value);        // ✅ Implemented
        case 'inset-inline':
            return self::expand_inset_inline_shorthand($value); // ✅ Implemented
        case 'inset-block':
            return self::expand_inset_block_shorthand($value);  // ✅ Implemented
        case 'top':
            return ['inset-block-start' => $value];             // ✅ Converts to logical
        case 'right':
            return ['inset-inline-end' => $value];              // ✅ Converts to logical
        case 'bottom':
            return ['inset-block-end' => $value];               // ✅ Converts to logical
        case 'left':
            return ['inset-inline-start' => $value];            // ✅ Converts to logical
        default:
            return [$property => $value];
    }
}
```

**Action**: No changes needed, infrastructure is complete.

### Phase 3: Testing

#### Task 3.1: Add PHP Debug Test

**Create**: `test-position-shorthand-expansion.php`

```php
<?php
// Test inset-inline shorthand expansion

require_once __DIR__ . '/wp-load.php';

use Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander;

echo "Testing Inset Shorthand Expansion\n";
echo "=================================\n\n";

$test_cases = [
    'inset: 20px' => [
        'inset-block-start' => '20px',
        'inset-inline-end' => '20px',
        'inset-block-end' => '20px',
        'inset-inline-start' => '20px',
    ],
    'inset: 10px 30px' => [
        'inset-block-start' => '10px',
        'inset-inline-end' => '30px',
        'inset-block-end' => '10px',
        'inset-inline-start' => '30px',
    ],
    'inset-inline: 10px 30px' => [
        'inset-inline-start' => '10px',
        'inset-inline-end' => '30px',
    ],
    'inset-block: 15px 35px' => [
        'inset-block-start' => '15px',
        'inset-block-end' => '35px',
    ],
];

foreach ($test_cases as $input => $expected) {
    list($property, $value) = explode(': ', $input, 2);
    
    $properties = [$property => $value];
    $expanded = CSS_Shorthand_Expander::expand_shorthand_properties($properties);
    
    echo "Input: $input\n";
    echo "Expected: " . print_r($expected, true) . "\n";
    echo "Actual: " . print_r($expanded, true) . "\n";
    
    $matches = $expanded === $expected;
    echo "Result: " . ($matches ? '✅ PASS' : '❌ FAIL') . "\n\n";
}
```

**Run**:
```bash
php test-position-shorthand-expansion.php
```

#### Task 3.2: Run Failing Playwright Test

```bash
cd plugins/elementor-css
npm test -- position-prop-type.test.ts:219
```

**Expected**:
- ✅ Test passes
- All `inset`, `inset-inline`, `inset-block` properties correctly applied

#### Task 3.3: Run Size Test (Unitless Zero)

```bash
npm test -- size-prop-type.test.ts:144
```

**Note**: This may be a separate issue related to unitless zero handling. Investigation needed if still fails.

### Phase 4: Validation

#### Task 4.1: Run Full Test Suite

```bash
cd plugins/elementor-css
npm test -- prop-types/
```

**Expected**: All prop-type tests pass.

#### Task 4.2: Verify No Regressions

Test files to check:
- `position-prop-type.test.ts` (all tests)
- `margin-prop-type.test.ts` (similar shorthand handling)
- `padding-prop-type.test.ts` (similar shorthand handling)
- `border-prop-type.test.ts` (similar shorthand handling)

## Comparison: Padding vs Position Infrastructure

### Architectural Difference

| Aspect | Padding | Positioning |
|--------|---------|-------------|
| **Prop Type** | `Dimensions_Prop_Type` | Individual `Size_Prop_Type` |
| **Storage** | Single object with 4 keys | 4 separate widget properties |
| **Shorthand Handling** | Mapper expands internally | Should use CSS_Shorthand_Expander |
| **Collision Handling** | Merge in conversion service | N/A (different property names) |
| **Why Different?** | Atomic widget schema uses Dimensions | Atomic widget schema uses individual properties |

### Code Comparison

#### Padding (Dimensions Pattern)
```php
// Input: padding: 10px 20px
// Mapper output: ONE object
{
    "$$type": "dimensions",
    "value": {
        "block-start": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
        "inline-end": {"$$type": "size", "value": {"size": 20, "unit": "px"}},
        "block-end": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
        "inline-start": {"$$type": "size", "value": {"size": 20, "unit": "px"}}
    }
}

// Widget storage:
'padding' => [Dimensions object]
```

#### Positioning (Individual Size Pattern)
```php
// Input: inset: 10px 20px
// After expansion: 4 properties
'inset-block-start' => '10px'
'inset-inline-end' => '20px'
'inset-block-end' => '10px'
'inset-inline-start' => '20px'

// Mapper output: 4 separate Size_Prop_Types
'inset-block-start' => {"$$type": "size", "value": {"size": 10, "unit": "px"}}
'inset-inline-end' => {"$$type": "size", "value": {"size": 20, "unit": "px"}}
'inset-block-end' => {"$$type": "size", "value": {"size": 10, "unit": "px"}}
'inset-inline-start' => {"$$type": "size", "value": {"size": 20, "unit": "px"}}

// Widget storage:
'inset-block-start' => [Size object]
'inset-inline-end' => [Size object]
'inset-block-end' => [Size object]
'inset-inline-start' => [Size object]
```

## Success Criteria

### Must Have
- ✅ `position-prop-type.test.ts:219` passes (inset-inline/inset-block shorthand)
- ✅ `size-prop-type.test.ts:144` passes (unitless zero) - May need separate investigation
- ✅ All existing position tests still pass
- ✅ No regressions in other prop-type tests

### Nice to Have
- ✅ Debug logging removed after verification
- ✅ Test file cleaned up
- ✅ Documentation updated

## Risk Assessment

### Low Risk
- ✅ Only modifying positioning mapper
- ✅ CSS_Shorthand_Expander already handles expansion
- ✅ Similar pattern used by other mappers (border, border-radius)
- ✅ Clear rollback path (revert changes)

### Testing Coverage
- ✅ Playwright tests cover all scenarios
- ✅ Manual verification possible via test PHP script
- ✅ Error logging helps debug issues

## Timeline

- **Phase 1**: 30 minutes (Investigation)
- **Phase 2**: 30 minutes (Implementation)
- **Phase 3**: 30 minutes (Testing)
- **Phase 4**: 30 minutes (Validation)

**Total**: ~2 hours

## Next Steps

1. ✅ **START HERE**: Run Phase 1 investigation with debug logging
2. Based on findings, proceed to Phase 2 implementation
3. Run tests immediately after implementation
4. Verify no regressions with full test suite

