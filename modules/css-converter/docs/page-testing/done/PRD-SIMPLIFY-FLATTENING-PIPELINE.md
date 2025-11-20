# PRD: Simplify Flattening Pipeline - Remove Flattening Awareness

## Problem Statement

The current CSS processing pipeline has too much "flattening awareness" scattered across multiple processors. Processors downstream of the flattening processor need to know about flattened rules, flattened classes, and handle them specially. This violates the single responsibility principle and makes the pipeline complex and hard to maintain.

### Current Issues

1. **Flattening Leakage**: Multiple processors reference "flattened_rules", "flattened_classes", "flattening_results"
2. **Duplicate Storage**: Same data stored in multiple metadata keys (css_rules, flattened_rules, global_classes_rules)
3. **Complex Classification**: Rule Classification Processor tries to get flattened_rules separately from css_rules
4. **Unclear Responsibilities**: Global Classes Processor has special handling for flattening_results
5. **Broken Design Pattern**: Processors should transform data in-place, not create parallel data structures

## Design Principle

**Once nested selectors are flattened, they become normal CSS rules. No downstream processor should know or care that flattening occurred.**

## Proposed Solution

### Core Concept

The Nested Selector Flattening Processor should:
1. Read `css_rules` from context
2. Transform nested selectors in-place (e.g., `.first .second` → `.first-and-second`)
3. Update `css_rules` with the transformed rules
4. Store HTML class modification instructions in `css_class_modifiers` (for HTML updates)
5. **That's it. No special metadata.**

### Architecture Changes

#### 1. Nested Selector Flattening Processor (Priority 15)

**Input**: `css_rules` array
**Output**: Updated `css_rules` array with flattened selectors

```php
// BEFORE (current):
$css_rules = [
    ['selector' => '.parent .child', 'properties' => [...]]
]

// AFTER (transformed):
$css_rules = [
    ['selector' => '.parent-and-child', 'properties' => [...]]
]
```

**Responsibilities**:
- Parse nested selectors from css_rules
- Generate flattened class names
- Replace nested selectors with flattened selectors IN css_rules
- Store class mappings in css_class_modifiers for HTML updates
- Add flattened classes to global_classes array (for registration)

**What to REMOVE**:
- ❌ `flattened_rules` metadata
- ❌ `flattened_classes` metadata  
- ❌ `global_classes_rules` metadata
- ❌ Any separate storage of flattening results

**What to KEEP**:
- ✅ `css_class_modifiers` (needed for HTML modification)
- ✅ Direct updates to `css_rules`
- ✅ Direct updates to `global_classes`

#### 2. Rule Classification Processor (Priority 25)

**Current Problem**: 
```php
$flattened_rules = isset( $global_classes_rules['flattening']['rules'] ) 
    ? $global_classes_rules['flattening']['rules'] 
    : $context->get_metadata( 'flattened_rules', $css_rules );
```

This is trying to get "flattened rules" separately from css_rules. This is wrong.

**Proposed Change**: 
```php
// Simply use css_rules - they're already flattened by this point
$css_rules = $context->get_metadata( 'css_rules', [] );
```

**Question to Investigate**: What is this processor actually doing?
- Splitting rules into `atomic_rules` and `global_class_rules`
- Merging with `existing_global_class_rules`

**Potential Issues**:
- Is `global_class_rules` different from `css_rules`?
- Why do we need both `atomic_rules` and `global_class_rules`?
- Is this classification happening too late in the pipeline?

**Recommendation**: 
- If this processor is just splitting rules based on selector type, it should work directly with `css_rules`
- If `global_class_rules` is redundant with `css_rules`, remove it
- Consider if this processor is even needed, or if its logic should be in Global Classes Processor

#### 3. Global Classes Processor (Priority 70)

**Current Problem**:
```php
$flattening_results = $context->get_metadata( 'flattening_results', [] );
$compound_results = $context->get_metadata( 'compound_results', [] );

// Special handling for flattened classes
if ( ! empty( $flattening_results['flattened_classes'] ) ) {
    $css_class_rules = array_merge( 
        $css_class_rules, 
        $this->convert_flattened_classes_to_css_rules( $flattening_results['flattened_classes'] ) 
    );
}
```

**Proposed Change**:
```php
// Simply use css_rules and global_classes - no special flattening handling
$css_rules = $context->get_metadata( 'css_rules', [] );
$global_classes = $context->get_metadata( 'global_classes', [] );
```

**What to REMOVE**:
- ❌ `flattening_results` parameter
- ❌ `compound_results` parameter
- ❌ `convert_flattened_classes_to_css_rules()` method
- ❌ Any special handling for flattened classes

**What to KEEP**:
- ✅ Processing css_rules to create global classes
- ✅ Duplicate detection logic
- ✅ Class name mapping

## Implementation Plan

### Phase 1: Update Nested Selector Flattening Processor

**File**: `nested-selector-flattening-processor.php`

**Changes**:
1. Remove all metadata storage except `css_class_modifiers`
2. Update `css_rules` in-place instead of creating `flattened_rules`
3. Simplify the process() method to:
   ```php
   public function process( Css_Processing_Context $context ): Css_Processing_Context {
       $css_rules = $context->get_metadata( 'css_rules', [] );
       
       // Transform nested selectors in css_rules
       $result = $this->flatten_nested_selectors_in_place( $css_rules );
       
       // Update css_rules with transformed rules
       $context->set_metadata( 'css_rules', $result['css_rules'] );
       
       // Add flattened classes to global_classes
       $global_classes = $context->get_metadata( 'global_classes', [] );
       $global_classes = array_merge( $global_classes, $result['flattened_classes'] );
       $context->set_metadata( 'global_classes', $global_classes );
       
       // Store HTML modification instructions
       $css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
       $css_class_modifiers[] = [
           'type' => 'flattening',
           'mappings' => $result['class_mappings'],
       ];
       $context->set_metadata( 'css_class_modifiers', $css_class_modifiers );
       
       return $context;
   }
   ```

4. Rename method: `flatten_nested_selectors()` → `flatten_nested_selectors_in_place()`
5. Update method to modify css_rules array directly instead of creating parallel structure

### Phase 2: Investigate Rule Classification Processor

**File**: `rule-classification-processor.php`

**Investigation Questions**:
1. What is the purpose of splitting rules into atomic_rules and global_class_rules?
2. Where are atomic_rules and global_class_rules used downstream?
3. Is this classification necessary, or can it be done in Global Classes Processor?
4. What is `existing_global_class_rules` and why is it being merged?

**Potential Actions**:
- Option A: Simplify to use css_rules directly
- Option B: Remove processor entirely if redundant
- Option C: Move logic into Global Classes Processor

### Phase 3: Clean Up Global Classes Processor

**File**: `global-classes-processor.php`

**Changes**:
1. Remove `flattening_results` parameter from all methods
2. Remove `compound_results` parameter from all methods
3. Remove `convert_flattened_classes_to_css_rules()` method
4. Simplify `process()` to work only with css_rules and global_classes
5. Remove special handling for flattened classes

### Phase 4: Remove Unified CSS Processor References

**File**: `unified-css-processor.php`

**Changes**:
1. Remove `get_flattened_classes_from_unified_structure()` method
2. Remove `get_flattened_rules_from_unified_structure()` method
3. Remove all references to flattened_rules, flattened_classes, flattening_results
4. Simplify response building to use only css_rules and global_classes

### Phase 5: Update Tests

**Files**: All test files

**Changes**:
1. Remove assertions about flattened_rules
2. Remove assertions about flattened_classes
3. Update to test css_rules directly
4. Verify HTML class modifications still work via css_class_modifiers

## Data Flow (After Refactoring)

```
1. CSS Parser Processor (Priority 10)
   Input: Raw CSS string
   Output: css_rules array
   
2. Nested Selector Flattening Processor (Priority 15)
   Input: css_rules (with nested selectors like ".parent .child")
   Output: css_rules (with flattened selectors like ".parent-and-child")
           global_classes (flattened class definitions)
           css_class_modifiers (HTML update instructions)
   
3. Compound Class Selector Processor (Priority 20)
   Input: css_rules (with compound selectors like ".first.second")
   Output: css_rules (with flattened selectors like ".first-and-second")
           global_classes (compound class definitions)
           css_class_modifiers (HTML update instructions)
   
4. [Other Processors] (Priority 25-60)
   Input: css_rules (already flattened)
   Output: css_rules (with additional transformations)
   
5. Global Classes Processor (Priority 70)
   Input: css_rules, global_classes
   Output: global_classes (registered), class_name_mappings
   
6. HTML Class Modifier Processor (Priority 80)
   Input: html, css_class_modifiers
   Output: html (with updated classes)
```

## Benefits

1. **Simplicity**: Each processor does one thing and passes clean data forward
2. **No Leakage**: Downstream processors don't need to know about flattening
3. **Single Source of Truth**: css_rules is the only source of CSS rules
4. **Easier Testing**: Test css_rules transformation, not parallel data structures
5. **Better Maintainability**: Clear responsibilities, no special cases
6. **Follows Design Pattern**: Transform in-place, not create parallel structures

## Success Criteria

1. ✅ No processor references "flattened_rules" or "flattened_classes" metadata
2. ✅ css_rules is the single source of truth for CSS rules
3. ✅ Nested selectors are transformed to flattened selectors in css_rules
4. ✅ HTML modifications still work via css_class_modifiers
5. ✅ All tests pass
6. ✅ No duplicate data storage

## Risks & Mitigation

### Risk 1: Breaking HTML Modifications
**Mitigation**: css_class_modifiers already stores the mappings needed for HTML updates

### Risk 2: Breaking Global Classes Registration
**Mitigation**: Flattened classes are still added to global_classes array

### Risk 3: Unknown Dependencies on flattened_rules
**Mitigation**: Grep entire codebase for references before removing

### Risk 4: Rule Classification Processor Purpose Unclear
**Mitigation**: Investigate thoroughly before making changes

## Investigation Results

### Rule Classification Processor Analysis

**Purpose**: Splits CSS rules into two categories:
- `atomic_rules`: Rules that will be converted to atomic properties (inline styles)
- `global_class_rules`: Rules that will become global CSS classes

**Usage**: 
- Style Collection Processor merges both: `array_merge( $atomic_rules, $global_class_rules )`
- Global Classes Processor uses `global_class_rules` directly

**Problem**: This classification is REDUNDANT and breaks the design pattern:
1. All rules are already in `css_rules`
2. The classification logic (`should_create_global_class_for_rule`) should be in Global Classes Processor
3. Creating parallel arrays (`atomic_rules`, `global_class_rules`) violates single source of truth
4. Style Collection Processor merges them back together anyway!

**Recommendation**: **REMOVE THIS PROCESSOR ENTIRELY**
- Move classification logic to Global Classes Processor
- Style Collection Processor should just use `css_rules`
- Global Classes Processor decides which rules to register as global classes

### Data Flow Discovery

**Current (Broken)**:
```
css_rules → Rule Classification → atomic_rules + global_class_rules
                                         ↓              ↓
                                   Style Collection ←──┘
                                   (merges them back!)
```

**Proposed (Clean)**:
```
css_rules → Style Collection (uses all css_rules)
         → Global Classes (decides which to register)
```

## Questions to Answer Before Implementation

1. ✅ **Rule Classification Processor**: REMOVE IT - it's redundant
2. ✅ **global_class_rules vs css_rules**: Different arrays, but shouldn't be - remove global_class_rules
3. ✅ **atomic_rules**: Used by Style Collection, but it merges with global_class_rules anyway - just use css_rules
4. ⏳ **Compound Processor**: Does it follow the same pattern? Should it also update css_rules in-place?
5. ⏳ **Response Building**: What data does the API response need? Can it work with just css_rules?

## Implementation Summary

### Files to Modify

1. **nested-selector-flattening-processor.php** - Transform css_rules in-place
2. **rule-classification-processor.php** - DELETE THIS FILE
3. **style-collection-processor.php** - Use css_rules instead of atomic_rules + global_class_rules
4. **global-classes-processor.php** - Remove flattening_results awareness
5. **unified-css-processor.php** - Remove flattening helper methods
6. **css-processor-factory.php** - Remove Rule_Classification_Processor registration
7. **compound-class-selector-processor.php** - Apply same pattern (update css_rules in-place)

### Key Changes

#### 1. Nested Selector Flattening Processor
```php
// BEFORE: Creates parallel structure
$context->set_metadata( 'flattened_rules', $result['flattened_rules'] );
$context->set_metadata( 'flattened_classes', $result['flattened_classes'] );

// AFTER: Updates css_rules in-place
$css_rules = $context->get_metadata( 'css_rules', [] );
$css_rules = $this->flatten_nested_selectors_in_place( $css_rules );
$context->set_metadata( 'css_rules', $css_rules );
```

#### 2. Style Collection Processor
```php
// BEFORE: Merges atomic_rules and global_class_rules
$atomic_rules = $context->get_metadata( 'atomic_rules', [] );
$global_class_rules = $context->get_metadata( 'global_class_rules', [] );
$all_rules = array_merge( $atomic_rules, $global_class_rules );

// AFTER: Just uses css_rules
$css_rules = $context->get_metadata( 'css_rules', [] );
$css_styles_collected = $this->collect_css_styles_from_rules( $css_rules, $widgets );
```

#### 3. Global Classes Processor
```php
// BEFORE: Special handling for flattening_results
$flattening_results = $context->get_metadata( 'flattening_results', [] );
if ( ! empty( $flattening_results['flattened_classes'] ) ) {
    // Special conversion logic
}

// AFTER: Just uses css_rules and global_classes
$css_rules = $context->get_metadata( 'css_rules', [] );
$global_classes = $context->get_metadata( 'global_classes', [] );
// Decide which css_rules should become global classes
```

### Metadata Keys to Remove

- ❌ `flattened_rules`
- ❌ `flattened_classes`
- ❌ `flattening_results`
- ❌ `compound_results`
- ❌ `atomic_rules`
- ❌ `global_class_rules`
- ❌ `global_classes_rules` (the one we just added!)

### Metadata Keys to Keep

- ✅ `css_rules` - Single source of truth for CSS rules
- ✅ `global_classes` - Registered global classes
- ✅ `css_class_modifiers` - HTML modification instructions
- ✅ `class_name_mappings` - For duplicate detection

## Next Steps

1. ✅ Create this PRD
2. ✅ Investigate Rule Classification Processor purpose and dependencies
3. ⏳ Implement Phase 1: Update Nested Selector Flattening Processor
4. ⏳ Implement Phase 2: Update Style Collection Processor
5. ⏳ Implement Phase 3: Delete Rule Classification Processor
6. ⏳ Implement Phase 4: Update Global Classes Processor
7. ⏳ Implement Phase 5: Update Unified CSS Processor
8. ⏳ Run tests and verify no regressions
9. ⏳ Apply same pattern to Compound Class Selector Processor
10. ⏳ Clean up and document

## Related Files

- `nested-selector-flattening-processor.php` - Primary change
- `rule-classification-processor.php` - Investigate and simplify
- `global-classes-processor.php` - Remove flattening awareness
- `unified-css-processor.php` - Remove helper methods
- `compound-class-selector-processor.php` - Apply same pattern?
- `html-class-modifier-processor.php` - Verify still works

