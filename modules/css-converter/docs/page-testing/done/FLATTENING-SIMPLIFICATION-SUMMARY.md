# Flattening Pipeline Simplification - Summary

## The Problem

You identified a critical design flaw: **"Once flattened classes are updated, they should be unrecognizable. Now they are normal classes. I don't want to see a single reference to flattening."**

### Current State (Broken)

The pipeline has "flattening awareness" everywhere:

```
Nested Selector Flattening Processor
  ↓ creates flattened_rules, flattened_classes
  ↓
Rule Classification Processor
  ↓ reads flattened_rules
  ↓ creates atomic_rules, global_class_rules
  ↓
Style Collection Processor
  ↓ merges atomic_rules + global_class_rules (WHY?!)
  ↓
Global Classes Processor
  ↓ special handling for flattening_results
```

**Problems:**
1. Multiple metadata keys for the same data
2. Processors downstream know about "flattening"
3. Rule Classification Processor is redundant (merges rules back together!)
4. Violates single responsibility principle

## The Solution

**One simple registry: `css_rules`**

### Core Principle

> Flattening should transform selectors IN-PLACE in css_rules.
> Downstream processors should never know flattening happened.

### Desired State (Clean)

```
CSS Parser Processor
  ↓ css_rules: ['.parent .child' => {...}]
  ↓
Nested Selector Flattening Processor
  ↓ css_rules: ['.parent-and-child' => {...}]  ← TRANSFORMED IN-PLACE
  ↓ css_class_modifiers: [{type: 'flattening', mappings: {...}}]
  ↓
Style Collection Processor
  ↓ uses css_rules (doesn't care about flattening)
  ↓
Global Classes Processor
  ↓ uses css_rules (doesn't care about flattening)
```

## Key Insights from Investigation

### 1. Rule Classification Processor is Redundant

**What it does:**
- Splits css_rules into `atomic_rules` and `global_class_rules`

**Why it's redundant:**
- Style Collection Processor **merges them back**: `array_merge($atomic_rules, $global_class_rules)`
- Creates parallel data structures that violate single source of truth
- Classification logic belongs in Global Classes Processor

**Action: DELETE THIS PROCESSOR**

### 2. Flattening Should Update css_rules In-Place

**Current (wrong):**
```php
// Creates parallel structure
$result = $this->flatten_nested_selectors($css_rules);
$context->set_metadata('flattened_rules', $result['flattened_rules']);
$context->set_metadata('flattened_classes', $result['flattened_classes']);
```

**Proposed (correct):**
```php
// Updates css_rules in-place
$css_rules = $context->get_metadata('css_rules', []);
foreach ($css_rules as &$rule) {
    if ($this->is_nested_selector($rule['selector'])) {
        $rule['selector'] = $this->flatten_selector($rule['selector']);
    }
}
$context->set_metadata('css_rules', $css_rules);
```

### 3. Example Transformation

**Input css_rules:**
```php
[
    ['selector' => '.parent .child', 'properties' => [...]],
    ['selector' => '.first.second', 'properties' => [...]],
]
```

**After Nested Flattening:**
```php
[
    ['selector' => '.parent-and-child', 'properties' => [...]],
    ['selector' => '.first.second', 'properties' => [...]],
]
```

**After Compound Flattening:**
```php
[
    ['selector' => '.parent-and-child', 'properties' => [...]],
    ['selector' => '.first-and-second', 'properties' => [...]],
]
```

**css_class_modifiers (for HTML updates):**
```php
[
    [
        'type' => 'flattening',
        'mappings' => [
            '.child' => 'parent-and-child',  // For HTML: class="child" → class="parent-and-child"
        ]
    ],
    [
        'type' => 'compound',
        'mappings' => [
            '.first.second' => 'first-and-second',  // For HTML: class="first second" → class="first-and-second"
        ]
    ]
]
```

## Implementation Plan

### Phase 1: Nested Selector Flattening Processor
- Update css_rules in-place
- Remove flattened_rules, flattened_classes metadata
- Keep css_class_modifiers for HTML updates

### Phase 2: Style Collection Processor
- Remove atomic_rules, global_class_rules references
- Use css_rules directly

### Phase 3: Delete Rule Classification Processor
- Remove file
- Remove from processor registry

### Phase 4: Global Classes Processor
- Remove flattening_results awareness
- Use css_rules and global_classes only

### Phase 5: Unified CSS Processor
- Remove flattening helper methods
- Simplify response building

### Phase 6: Apply Same Pattern to Compound Processor
- Update css_rules in-place
- Remove compound_results metadata

## Metadata Keys

### To Remove ❌
- `flattened_rules`
- `flattened_classes`
- `flattening_results`
- `compound_results`
- `atomic_rules`
- `global_class_rules`
- `global_classes_rules`

### To Keep ✅
- `css_rules` - Single source of truth
- `global_classes` - Registered global classes
- `css_class_modifiers` - HTML modification instructions
- `class_name_mappings` - Duplicate detection

## Benefits

1. **Simplicity**: One data structure, one source of truth
2. **Clean Separation**: Each processor transforms data, passes it forward
3. **No Leakage**: Downstream processors don't know about flattening
4. **Easier Testing**: Test css_rules transformation directly
5. **Better Maintainability**: Clear responsibilities, no special cases

## Your Vision Realized

> "I want one simple registry. Once the flattened classes are updated, they should be unrecognizable. Now they are normal classes. I don't want to see a single reference to flattening."

✅ **Achieved**: css_rules is the single registry, flattening transforms it in-place, downstream processors see only normal CSS rules.

## Next Action

Ready to implement? Start with Phase 1: Update Nested Selector Flattening Processor to transform css_rules in-place.

