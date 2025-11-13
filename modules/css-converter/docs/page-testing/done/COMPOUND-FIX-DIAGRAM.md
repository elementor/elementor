# Compound Selectors - Visual Flow Diagram

## Current (Broken) Flow

```
INPUT CSS:
.first.second { color: red; }

INPUT HTML:
<div class="first second">Text</div>

┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING PIPELINE                          │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ STEP 6: Compound Class Selector Processor                     │
│                                                                │
│ ✅ Detects: .first.second                                     │
│ ✅ Extracts: ['first', 'second']                              │
│ ✅ Generates: 'first-and-second'                              │
│ ✅ Creates global class in Elementor                          │
│ ✅ Stores in context:                                         │
│    - compound_mappings                                        │
│    - compound_global_classes                                  │
│                                                                │
│ ❌ MISSING: Does NOT set css_class_modifiers                  │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 9: HTML Class Modifier Processor                         │
│                                                                │
│ ❌ Reads: css_class_modifiers from context → EMPTY []         │
│ ❌ No compound mappings available                             │
│ ❌ Cannot apply compound classes to widgets                   │
│ ❌ Widgets keep original classes: "first second"              │
└────────────────────────────────────────────────────────────────┘
                            ↓
OUTPUT WIDGET:
{
  "widgetType": "e-div-block",
  "attributes": {
    "class": "first second"  ❌ Should be "first-and-second"
  }
}

TEST EXPECTS: <div class="first-and-second">
TEST GETS:    <div class="first second">
RESULT: ❌ TEST FAILS
```

## Fixed Flow

```
INPUT CSS:
.first.second { color: red; }

INPUT HTML:
<div class="first second">Text</div>

┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING PIPELINE                          │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ STEP 6: Compound Class Selector Processor                     │
│                                                                │
│ ✅ Detects: .first.second                                     │
│ ✅ Extracts: ['first', 'second']                              │
│ ✅ Generates: 'first-and-second'                              │
│ ✅ Creates global class in Elementor                          │
│ ✅ Stores in context:                                         │
│    - compound_mappings                                        │
│    - compound_global_classes                                  │
│                                                                │
│ ✅ NEW FIX: Sets css_class_modifiers in context:              │
│    [{                                                          │
│      type: 'compound',                                        │
│      mappings: {                                              │
│        'first-and-second': {                                  │
│          requires: ['first', 'second']                        │
│        }                                                      │
│      }                                                        │
│    }]                                                          │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 9: HTML Class Modifier Processor                         │
│                                                                │
│ ✅ Reads: css_class_modifiers from context → FOUND!           │
│ ✅ Gets compound mappings with requirements                   │
│ ✅ Checks widget has classes: ['first', 'second'] ✅          │
│ ✅ Adds compound class: 'first-and-second'                    │
│ ✅ Removes original classes: 'first', 'second'                │
└────────────────────────────────────────────────────────────────┘
                            ↓
OUTPUT WIDGET:
{
  "widgetType": "e-div-block",
  "attributes": {
    "class": "first-and-second"  ✅ CORRECT!
  }
}

TEST EXPECTS: <div class="first-and-second">
TEST GETS:    <div class="first-and-second">
RESULT: ✅ TEST PASSES
```

## The Missing Code

### Location: `compound-class-selector-processor.php` (after line 69)

```php
// BEFORE (current code):
$context->set_metadata( 'compound_mappings', $result['compound_mappings'] );
$context->set_metadata( 'compound_selectors_filtered', $result['filtered_count'] );
// HTML modifier cannot see compound mappings!

// AFTER (with fix):
$context->set_metadata( 'compound_mappings', $result['compound_mappings'] );
$context->set_metadata( 'compound_selectors_filtered', $result['filtered_count'] );

// NEW: Build unified css_class_modifiers entry
$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
$css_class_modifiers[] = [
    'type' => 'compound',
    'mappings' => $result['compound_mappings'],
    'metadata' => [
        'compound_global_classes' => $result['compound_global_classes'],
    ],
];
$context->set_metadata( 'css_class_modifiers', $css_class_modifiers );
// HTML modifier can now see and apply compound mappings!
```

## Context Data Structure

```php
// Context BEFORE fix:
[
  'compound_mappings' => [
    'first-and-second' => ['requires' => ['first', 'second']]
  ],
  'css_class_modifiers' => []  // ❌ EMPTY
]

// Context AFTER fix:
[
  'compound_mappings' => [
    'first-and-second' => ['requires' => ['first', 'second']]
  ],
  'css_class_modifiers' => [  // ✅ POPULATED
    [
      'type' => 'compound',
      'mappings' => [
        'first-and-second' => ['requires' => ['first', 'second']]
      ]
    ]
  ]
]
```

## Test Scenarios Coverage

### Scenario 1: Simple Compound `.first.second`
- Widget has: `['first', 'second']`
- Gets compound: `first-and-second` ✅

### Scenario 2: Multiple Compounds `.btn.primary` + `.btn.secondary`
- Widget 1 has: `['btn', 'primary']` → Gets: `btn-and-primary` ✅
- Widget 2 has: `['btn', 'secondary']` → Gets: `btn-and-secondary` ✅

### Scenario 3: Missing Class
- Widget 1 has: `['first']` → No compound (missing 'second') ✅
- Widget 2 has: `['second']` → No compound (missing 'first') ✅
- Widget 3 has: `['first', 'second']` → Gets: `first-and-second` ✅

### Scenario 4: Order Independence `.first.second` + `.second.first`
- Both map to: `first-and-second` (alphabetically sorted) ✅
- Widget with `['first', 'second']` gets both styles ✅

### Scenario 5: Complex with Multiple Properties
- Compound class has multiple CSS properties
- All properties applied via global class ✅

### Scenario 6: Hyphenated Class Names `.btn-primary.btn-large`
- Widget has: `['btn-primary', 'btn-large']`
- Gets compound: `btn-large-and-btn-primary` (alphabetically sorted) ✅

## Summary

**Lines Changed**: ~20 lines across 2 files
**Files Modified**: 2
**Tests Fixed**: 6
**Complexity**: Low (copy-paste pattern from flattening)
**Risk**: Low (additive change, no breaking modifications)


