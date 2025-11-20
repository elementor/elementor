# PRD: Fix Compound Selector Implementation

## Problem Statement

6 out of 7 compound selector tests are failing. The compound selectors are being detected and global classes are being created, but the compound class names are not being applied to the HTML widgets that have the required classes.

### Evidence from Investigation

**Test File Location**: `tests/playwright/sanity/modules/css-converter/compound-selectors/compound-class-selectors.test.ts`

**What Tests Expect**:
- HTML with compound selector `.first.second { color: red; }` 
- Element with `class="first second"`
- Should result in widget with class `.first-and-second` in the rendered output
- The compound class should have the CSS properties applied

**What Actually Happens**:
- Compound classes ARE being created (confirmed by statistics)
- Compound mappings ARE being stored in context
- BUT compound classes are NOT being applied to widgets
- Widgets render with original classes, not the flattened compound class names

## Root Cause Analysis

### Evidence Chain

**File**: `compound-class-selector-processor.php` (lines 44-82)
- ✅ Processor runs at priority 20 (step 6 in pipeline)
- ✅ Creates compound global classes
- ✅ Stores `compound_mappings` in context at line 67
- ✅ Builds HTML class mappings at line 221 with correct format: `['requires' => ['class1', 'class2']]`
- ❌ **NEVER sets `css_class_modifiers` in context**

**File**: `html-class-modifier-processor.php` (lines 42-50)
- ✅ Processor runs at priority 80 (step 9 in pipeline)
- ❌ **Tries to get `css_class_modifiers` from context at line 43**
- ❌ **Gets empty array because no processor ever sets it**
- ❌ HTML modifier never receives compound mappings
- ❌ Compound classes never get applied to widgets

**File**: `html-class-modifier-service.php` (lines 256-284)
- ✅ Has correct logic in `apply_compound_classes()` method
- ✅ Checks if widget has all required classes
- ✅ Adds compound class name if requirements met
- ❌ **Never executes because `$this->compound_mappings` is empty**

### The Missing Link

```php
// What compound processor does (line 67):
$context->set_metadata( 'compound_mappings', $result['compound_mappings'] );

// What HTML modifier expects (line 43):
$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );

// What should happen in compound processor:
$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
$css_class_modifiers[] = [
    'type' => 'compound',
    'mappings' => $html_class_mappings,
    'metadata' => ['compound_global_classes' => $compound_global_classes],
];
$context->set_metadata( 'css_class_modifiers', $css_class_modifiers );
```

## Solution Design

### Option 1: Processors Build Unified Modifiers (RECOMMENDED)

Each processor that needs HTML class modifications should add to the `css_class_modifiers` array in the context.

**Changes Required**:

1. **Compound Class Selector Processor** (`compound-class-selector-processor.php`)
   - After line 67, add logic to build and set `css_class_modifiers`
   - Format: `['type' => 'compound', 'mappings' => $html_class_mappings, 'metadata' => [...]]`

2. **Nested Selector Flattening Processor** (`nested-selector-flattening-processor.php`)
   - After line 61, add logic to build and set `css_class_modifiers`
   - Format: `['type' => 'flattening', 'mappings' => $class_mappings, 'metadata' => [...]]`

**Advantages**:
- Each processor is responsible for its own modifications
- Follows single responsibility principle
- No new processors needed
- Works with existing HTML modifier logic

**Disadvantages**:
- Multiple processors writing to same context key (needs append logic)

### Option 2: Create Unified Modifier Builder Processor

Create a new processor that runs after compound/flattening but before HTML modifier.

**New Processor**: `Css_Class_Modifiers_Builder_Processor` (priority 75)
- Reads `compound_mappings` and `class_mappings` from context
- Builds unified `css_class_modifiers` array
- Sets it in context for HTML modifier

**Advantages**:
- Single source of truth for modifier building
- Clear separation of concerns
- Easy to test and debug

**Disadvantages**:
- Adds another processor to pipeline
- More complexity

### Option 3: HTML Modifier Reads Raw Mappings

Modify HTML Class Modifier Processor to read raw mappings directly from context.

**Changes Required**:
- HTML modifier reads both `compound_mappings` and `class_mappings`
- Builds the unified structure internally
- Applies modifications

**Advantages**:
- Minimal changes to existing processors
- Backwards compatible

**Disadvantages**:
- HTML modifier becomes more complex
- Violates single responsibility (doing building AND applying)

## Recommended Solution: Option 1

### Implementation Plan

#### Phase 1: Fix Compound Processor

**File**: `compound-class-selector-processor.php`

Add after line 69 (after setting metadata):

```php
// Build unified css_class_modifiers entry
$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
$css_class_modifiers[] = [
    'type' => 'compound',
    'mappings' => $result['compound_mappings'],
    'metadata' => [
        'compound_global_classes' => $result['compound_global_classes'],
    ],
];
$context->set_metadata( 'css_class_modifiers', $css_class_modifiers );
```

#### Phase 2: Fix Flattening Processor

**File**: `nested-selector-flattening-processor.php`

Add after line 61 (after setting metadata):

```php
// Build unified css_class_modifiers entry
$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
$css_class_modifiers[] = [
    'type' => 'flattening',
    'mappings' => $result['class_mappings'],
    'metadata' => [
        'classes_with_direct_styles' => $result['classes_with_direct_styles'],
        'classes_only_in_nested' => $result['classes_only_in_nested'],
        'flattened_classes' => $result['flattened_classes'],
    ],
];
$context->set_metadata( 'css_class_modifiers', $css_class_modifiers );
```

#### Phase 3: Verify HTML Modifier

**File**: `html-class-modifier-processor.php`

No changes needed - already reads from `css_class_modifiers` at line 43.

#### Phase 4: Clean Up Unified CSS Processor

**File**: `unified-css-processor.php` (lines 1453-1513)

The `process_css_with_unified_registry()` method currently builds `css_class_modifiers` AFTER the pipeline runs. This is now redundant since processors will build it during the pipeline.

**Action**: This method can be simplified or the modifier building logic removed.

## Test Verification Plan

### Unit Tests

Create unit tests for compound processor:

```php
test('compound processor sets css_class_modifiers in context', function() {
    $context = new Css_Processing_Context();
    $context->set_metadata('css_rules', [
        ['selector' => '.first.second', 'properties' => [/* ... */]]
    ]);
    $context->set_widgets([
        ['attributes' => ['class' => 'first second']]
    ]);
    
    $processor = new Compound_Class_Selector_Processor();
    $result_context = $processor->process($context);
    
    $modifiers = $result_context->get_metadata('css_class_modifiers');
    expect($modifiers)->not->toBeEmpty();
    expect($modifiers[0]['type'])->toBe('compound');
    expect($modifiers[0]['mappings'])->toHaveKey('first-and-second');
});
```

### Integration Tests

Run existing Playwright tests:

```bash
npm run test:playwright -- compound-class-selectors.test.ts
```

**Expected Results**:
- Scenario 1 (Simple compound): ✅ PASS
- Scenario 2 (Multiple compounds): ✅ PASS  
- Scenario 3 (Class missing): ✅ PASS
- Scenario 4 (Order independence): ✅ PASS
- Scenario 5 (Complex compound): ✅ PASS
- Scenario 6 (Hyphenated names): ✅ PASS

### Manual Verification

1. Create test page with compound selector
2. Verify in browser DevTools:
   - Widget has `.first-and-second` class
   - Widget does NOT have separate `.first` and `.second` classes
   - CSS properties are applied correctly
   - Global class shows in Elementor's class manager

## Success Criteria

1. ✅ All 6 failing compound selector tests pass
2. ✅ No regressions in other tests
3. ✅ Compound classes visible in rendered HTML
4. ✅ CSS properties correctly applied to compound classes
5. ✅ Global classes registered in Elementor
6. ✅ Code follows project style guidelines (no comments, named constants, Yoda conditions)

## Risks & Mitigation

### Risk 1: Breaking Flattening Feature
**Mitigation**: Run full test suite, especially flattening tests

### Risk 2: Performance Impact
**Mitigation**: Profile before/after, compound processor is O(n) already

### Risk 3: Duplicate Modifiers in Context
**Mitigation**: Use append pattern (`$array[]`) not replacement

### Risk 4: Legacy Code Compatibility
**Mitigation**: Keep backward compatibility in unified-css-processor.php result format

## Timeline Estimate

- Phase 1 (Compound Processor): 30 minutes
- Phase 2 (Flattening Processor): 30 minutes
- Phase 3 (Verification): 15 minutes
- Phase 4 (Cleanup): 30 minutes
- Testing: 1 hour
- **Total**: ~3 hours

## Follow-Up Tasks

1. Document the `css_class_modifiers` format in architecture docs
2. Create developer guide for adding new modifier types
3. Add debug logging to track modifier application
4. Consider extracting modifier building to trait/helper class

## References

- **Test File**: `tests/playwright/sanity/modules/css-converter/compound-selectors/compound-class-selectors.test.ts`
- **Compound Processor**: `services/css/processing/processors/compound-class-selector-processor.php`
- **HTML Modifier**: `services/css/processing/processors/html-class-modifier-processor.php`
- **HTML Modifier Service**: `services/css/html-class-modifier-service.php`
- **Flattening Processor**: `services/css/processing/processors/nested-selector-flattening-processor.php`

---

**Created**: 2025-10-26  
**Status**: Draft  
**Priority**: High (Blocks 6 tests)


