# Duplicate Detection Flow Diagrams

**Related**: `PRD-AVOID-CLASS-DUPLICATION.md`  
**Purpose**: Visual representation of duplicate detection logic  
**Date**: 2025-10-16

---

## 🔄 Current Flow (Before Implementation)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Parse CSS and Extract Classes                                │
│    Input: ".button { background: blue; padding: 10px; }"        │
│    Output: [{ selector: '.button', properties: {...} }]         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Generate Label                                                │
│    '.button' → label: 'button'                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Check If Label Exists                                         │
│    Query existing labels from DB                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ├─── YES ──┐
                     │          │
                     │          ▼
                     │    ┌──────────────────────────────────────┐
                     │    │ ❌ SKIP with warning                  │
                     │    │ "Skipped duplicate class: .button"  │
                     │    │ Result: Class NOT imported           │
                     │    └──────────────────────────────────────┘
                     │
                     └─── NO ───┐
                                │
                                ▼
                          ┌──────────────────────────────────────┐
                          │ ✅ Create New Class                   │
                          │ - Convert properties to atomic       │
                          │ - Generate unique ID (g-abc123)      │
                          │ - Store in Kit meta                  │
                          └──────────────────────────────────────┘
```

**Problem**: Labels like `.button` are skipped even if styling differs!

---

## 🎯 Proposed Flow (After Implementation)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Parse CSS and Extract Classes                                │
│    Input: ".button { background: blue; padding: 10px; }"        │
│    Output: [{ selector: '.button', properties: {...} }]         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Convert Properties to Atomic Format                          │
│    { background: 'blue' } →                                      │
│    { background_color: { $$type: 'color', value: '#0000ff' } }  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Extract Base Label                                            │
│    '.button' → base_label: 'button'                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Fetch All Label Variants from DB                             │
│    base_label: 'button'                                          │
│    → Found: ['button', 'button-1', 'button-2']                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Compare Against Each Variant                                 │
│    For each existing variant:                                   │
│      - Normalize both property sets (sort keys)                 │
│      - Deep compare atomic properties                           │
│      - Check $$type and value match                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
     MATCH FOUND            NO MATCH
          │                     │
          ▼                     ▼
┌─────────────────────┐   ┌─────────────────────────────────────┐
│ ✅ REUSE Existing    │   │ 🆕 CREATE New with Suffix            │
│                     │   │                                     │
│ Return:             │   │ Steps:                              │
│ {                   │   │ 1. Find next available suffix       │
│   action: 'reused', │   │    (button-3 if -2 exists)         │
│   class_id: 'g-123',│   │ 2. Create label: 'button-3'        │
│   label: 'button-1' │   │ 3. Generate ID: 'g-xyz789'         │
│ }                   │   │ 4. Store in Kit meta               │
│                     │   │                                     │
│ Stats:              │   │ Return:                             │
│ - reused++          │   │ {                                   │
│ - no DB write       │   │   action: 'created',                │
└─────────────────────┘   │   class_id: 'g-xyz789',             │
                          │   label: 'button-3'                 │
                          │ }                                   │
                          │                                     │
                          │ Stats:                              │
                          │ - created++                         │
                          │ - DB write performed                │
                          └─────────────────────────────────────┘
```

---

## 🔍 Detailed Comparison Logic

```
┌─────────────────────────────────────────────────────────────────┐
│ COMPARE_CLASSES(new_class, existing_class)                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Extract Props from Both                                 │
│                                                                  │
│ new_props = new_class['variants'][0]['props']                   │
│ existing_props = existing_class['variants'][0]['props']         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Normalize (Sort Keys)                                   │
│                                                                  │
│ ksort(new_props)                                                 │
│ ksort(existing_props)                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Check Property Count                                    │
│                                                                  │
│ count(new_props) === count(existing_props) ?                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
         NO                    YES
          │                     │
          ▼                     ▼
    ┌──────────┐    ┌─────────────────────────────────────────────┐
    │ DIFFERENT │    │ Step 4: Compare Each Property               │
    └──────────┘    │                                             │
                    │ foreach (new_props as key => value):       │
                    │   if (!isset(existing_props[key])):        │
                    │     return DIFFERENT                        │
                    │                                             │
                    │   if (!compare_atomic_value(                │
                    │        new_value, existing_value)):        │
                    │     return DIFFERENT                        │
                    └────────────────┬────────────────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │ ✅ IDENTICAL     │
                            └─────────────────┘
```

---

## 🔬 Atomic Property Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│ COMPARE_ATOMIC_VALUE(value_a, value_b)                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Check Structure                                         │
│                                                                  │
│ value_a = { $$type: 'color', value: '#ff0000' }                 │
│ value_b = { $$type: 'color', value: '#ff0000' }                 │
│                                                                  │
│ Both have $$type key?                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
         NO                    YES
          │                     │
          ▼                     ▼
    ┌──────────────┐   ┌─────────────────────────────────────────┐
    │ DIFFERENT    │   │ Step 2: Compare $$type                  │
    │ (malformed)  │   │                                         │
    └──────────────┘   │ value_a['$$type'] === value_b['$$type'] │
                       └────────────────┬────────────────────────┘
                                        │
                             ┌──────────┴──────────┐
                             │                     │
                            NO                    YES
                             │                     │
                             ▼                     ▼
                      ┌──────────────┐   ┌──────────────────────┐
                      │ DIFFERENT    │   │ Step 3: Compare Value│
                      │ (type mismatch)  │                      │
                      └──────────────┘   │ Deep compare:        │
                                         │ - If string: exact   │
                                         │ - If array: recursive│
                                         │ - If object: recursive│
                                         └────────────┬─────────┘
                                                      │
                                           ┌──────────┴──────────┐
                                           │                     │
                                        MATCH               DIFFERENT
                                           │                     │
                                           ▼                     ▼
                                    ┌──────────────┐   ┌──────────────┐
                                    │ ✅ IDENTICAL │   │ ❌ DIFFERENT │
                                    └──────────────┘   └──────────────┘
```

---

## 🔢 Suffix Generation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ FIND_NEXT_SUFFIX(base_label, existing_variants)                 │
│                                                                  │
│ Input: base_label = 'button'                                    │
│        existing_variants = ['button', 'button-1', 'button-2']   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Extract Numeric Suffixes                                │
│                                                                  │
│ 'button'   → suffix = 0 (or null, treated as base)             │
│ 'button-1' → suffix = 1                                         │
│ 'button-2' → suffix = 2                                         │
│                                                                  │
│ suffixes = [0, 1, 2]                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Find Max Suffix                                         │
│                                                                  │
│ max_suffix = max(suffixes) = 2                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Increment                                               │
│                                                                  │
│ next_suffix = max_suffix + 1 = 3                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Build New Label                                         │
│                                                                  │
│ new_label = base_label + '-' + next_suffix                      │
│           = 'button' + '-' + 3                                  │
│           = 'button-3'                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
                  ┌─────────┐
                  │ Return  │
                  │ 'button-3' │
                  └─────────┘
```

---

## 🔄 Complete Import Flow (Batch)

```
┌─────────────────────────────────────────────────────────────────┐
│ IMPORT_CLASSES([class1, class2, class3, ...])                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Fetch Existing Classes (ONE TIME)                       │
│                                                                  │
│ $existing_classes = $repository->all();                          │
│ Cache in memory for batch processing                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Process Each New Class                                  │
│                                                                  │
│ foreach ($new_classes as $new_class):                           │
│   $result = find_or_create_class($new_class, $existing_classes) │
│                                                                  │
│   if ($result['action'] === 'reused'):                          │
│     $reused_classes[] = $result                                 │
│   else:                                                          │
│     $created_classes[] = $result                                │
│     // Add to in-memory cache for subsequent iterations        │
│     $existing_classes[] = $result['class']                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Build Response                                          │
│                                                                  │
│ return [                                                         │
│   'converted_classes' => $created_classes,                      │
│   'reused_classes' => $reused_classes,                          │
│   'stats' => [                                                  │
│     'total_processed' => count($new_classes),                   │
│     'created' => count($created_classes),                       │
│     'reused' => count($reused_classes),                         │
│     'skipped' => count($skipped_classes)                        │
│   ]                                                             │
│ ]                                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Key Optimization**: Cache existing classes in memory during batch, append created classes to cache to avoid re-querying DB.

---

## 📊 Example Scenarios

### Scenario A: Identical Class (Reuse)

```
┌──────────────────────────────────────────────────────────────┐
│ EXISTING IN DB                                                │
├──────────────────────────────────────────────────────────────┤
│ Class ID: g-abc123                                            │
│ Label: button                                                 │
│ Props: { background_color: { $$type: 'color', value: 'blue' }}│
└──────────────────────────────────────────────────────────────┘

                        ↓ IMPORT ↓

┌──────────────────────────────────────────────────────────────┐
│ NEW CLASS FROM CSS                                            │
├──────────────────────────────────────────────────────────────┤
│ Selector: .button                                             │
│ Props: { background_color: { $$type: 'color', value: 'blue' }}│
└──────────────────────────────────────────────────────────────┘

                        ↓ COMPARE ↓

┌──────────────────────────────────────────────────────────────┐
│ COMPARISON RESULT                                             │
├──────────────────────────────────────────────────────────────┤
│ ✅ Properties identical                                       │
│ ✅ Reuse existing class                                       │
│                                                               │
│ Action: reused                                                │
│ Class ID: g-abc123                                            │
│ Label: button                                                 │
│                                                               │
│ 📊 Stats: reused_classes++                                    │
└──────────────────────────────────────────────────────────────┘
```

### Scenario B: Different Styles (Create Suffix)

```
┌──────────────────────────────────────────────────────────────┐
│ EXISTING IN DB                                                │
├──────────────────────────────────────────────────────────────┤
│ Class ID: g-abc123                                            │
│ Label: button                                                 │
│ Props: { background_color: { $$type: 'color', value: 'blue' }}│
└──────────────────────────────────────────────────────────────┘

                        ↓ IMPORT ↓

┌──────────────────────────────────────────────────────────────┐
│ NEW CLASS FROM CSS                                            │
├──────────────────────────────────────────────────────────────┤
│ Selector: .button                                             │
│ Props: { background_color: { $$type: 'color', value: 'red' }} │
└──────────────────────────────────────────────────────────────┘

                        ↓ COMPARE ↓

┌──────────────────────────────────────────────────────────────┐
│ COMPARISON RESULT                                             │
├──────────────────────────────────────────────────────────────┤
│ ❌ Values differ (blue vs red)                                │
│ 🆕 Create new class with suffix                              │
│                                                               │
│ Action: created                                               │
│ Class ID: g-xyz789 (newly generated)                          │
│ Label: button-1 (suffix added)                               │
│                                                               │
│ 📊 Stats: created_classes++                                   │
└──────────────────────────────────────────────────────────────┘
```

### Scenario C: Match Existing Suffix (Reuse)

```
┌──────────────────────────────────────────────────────────────┐
│ EXISTING IN DB                                                │
├──────────────────────────────────────────────────────────────┤
│ Class ID: g-abc123                                            │
│ Label: button                                                 │
│ Props: { background_color: { value: 'blue' } }               │
├──────────────────────────────────────────────────────────────┤
│ Class ID: g-def456                                            │
│ Label: button-1                                               │
│ Props: { background_color: { value: 'red' } }                │
└──────────────────────────────────────────────────────────────┘

                        ↓ IMPORT ↓

┌──────────────────────────────────────────────────────────────┐
│ NEW CLASS FROM CSS                                            │
├──────────────────────────────────────────────────────────────┤
│ Selector: .button                                             │
│ Props: { background_color: { value: 'red' } }                │
└──────────────────────────────────────────────────────────────┘

                        ↓ COMPARE ↓

┌──────────────────────────────────────────────────────────────┐
│ COMPARISON STEPS                                              │
├──────────────────────────────────────────────────────────────┤
│ 1. Compare vs 'button' (g-abc123)                             │
│    → blue ≠ red → NOT a match                                │
│                                                               │
│ 2. Compare vs 'button-1' (g-def456)                           │
│    → red === red → ✅ MATCH!                                  │
│                                                               │
│ Action: reused                                                │
│ Class ID: g-def456                                            │
│ Label: button-1                                               │
│                                                               │
│ 📊 Stats: reused_classes++                                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Variables Flow (Similar Logic)

```
┌─────────────────────────────────────────────────────────────────┐
│ PROCESS_VARIABLE(--primary-color, #ff0000)                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Extract Base Name                                       │
│ '--primary-color' → base: 'primary-color'                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Fetch Variants                                          │
│ ['primary-color', 'primary-color-1']                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Compare Values                                          │
│                                                                  │
│ For each variant:                                               │
│   if (variant.value === new_value):                             │
│     return REUSE variant                                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
     MATCH FOUND            NO MATCH
          │                     │
          ▼                     ▼
    ┌──────────────┐   ┌──────────────────────┐
    │ Reuse Existing│   │ Create New with Suffix│
    │ Variable     │   │ 'primary-color-2'     │
    └──────────────┘   └──────────────────────┘
```

---

## 📈 Performance Visualization

```
Performance: O(n × m) where n = new classes, m = existing classes

┌─────────────────────────────────────────────────────────────────┐
│ Comparisons Required                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Existing Classes → │  100   │  1,000  │  10,000 │               │
│ New Classes ↓      │        │         │         │               │
│ ───────────────────┼────────┼─────────┼─────────┤               │
│ 10                 │   1k   │   10k   │  100k   │               │
│ 100                │   10k  │  100k   │   1M    │ ← Target      │
│ 1,000              │  100k  │   1M    │  10M    │               │
│                                                                  │
│ Legend:                                                          │
│ 🟢 < 10k comparisons: Fast (< 0.1s)                             │
│ 🟡 10k-100k comparisons: Medium (0.1-1s)                        │
│ 🔴 > 100k comparisons: Slow (> 1s)                              │
└─────────────────────────────────────────────────────────────────┘

With Optimization (Hash Lookup):

┌─────────────────────────────────────────────────────────────────┐
│ Hash Lookups Required: O(n)                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Existing Classes → │  100   │  1,000  │  10,000 │               │
│ New Classes ↓      │        │         │         │               │
│ ───────────────────┼────────┼─────────┼─────────┤               │
│ 10                 │   10   │    10   │    10   │               │
│ 100                │  100   │   100   │   100   │ ← Target      │
│ 1,000              │  1k    │   1k    │   1k    │               │
│                                                                  │
│ ALL scenarios 🟢 Fast!                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Decision Points Flowchart

```
                         START
                           │
                           ▼
               ┌─────────────────────────┐
               │ Should we implement     │
               │ duplicate detection?    │
               └────────┬────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
           YES                      NO
            │                       │
            │                       └─→ Keep current behavior
            ▼                           (skip on label match)
   ┌──────────────────┐
   │ Which comparison │
   │ method?          │
   └────┬─────────────┘
        │
        ├─→ Raw CSS comparison
        │   • Simpler
        │   • Less accurate
        │
        └─→ Atomic property comparison
            • More complex
            • More accurate
            │
            ▼
   ┌──────────────────┐
   │ Should variables │
   │ use same logic?  │
   └────┬─────────────┘
        │
        ├─→ YES: Incremental naming
        │   • Consistency
        │   • Breaking change
        │
        └─→ NO: Keep update-in-place
            • No breaking change
            • Inconsistent
            │
            ▼
   ┌──────────────────┐
   │ Performance      │
   │ optimization?    │
   └────┬─────────────┘
        │
        ├─→ Now: Hash-based
        │   • Faster
        │   • Schema changes
        │
        └─→ Later: Full scan + optimize if needed
            • Simpler
            • May need optimization
            │
            ▼
        IMPLEMENT!
```

---

## 🎬 Summary

These flows show:
1. **Current Problem**: Label-only matching causes false skips
2. **Proposed Solution**: Deep property comparison with suffix generation
3. **Comparison Logic**: Normalized atomic property comparison
4. **Suffix Strategy**: Incremental numbering with variant checking
5. **Performance**: O(n×m) but acceptable for typical use cases
6. **Variables**: Same logic for consistency

**Next**: Review these flows and confirm architectural approach!




