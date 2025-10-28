# Normal vs Compound Class Processing - Complete Mapping

## Processing Pipeline Order

```
1. Css_Parsing_Processor          (Priority 20)
2. Css_Variables_Processor        (Priority 30)  
3. Rule_Classification_Processor  (Priority 40)
4. Id_Selector_Processor          (Priority 50)
5. Nested_Selector_Flattening_Processor (Priority 60)
6. Compound_Class_Selector_Processor    (Priority 70)
7. Style_Collection_Processor     (Priority 80)
8. Global_Classes_Processor       (Priority 90)
9. Html_Class_Modifier_Processor  (Priority 100)
10. Style_Resolution_Processor    (Priority 110)
```

## Normal Class Flow (.my-class)

### Step 1: CSS Parsing Processor
**Input**: `.my-class { color: red; font-size: 16px; }`
**Output**: 
```php
$css_rules = [
    [
        'selector' => '.my-class',
        'properties' => [
            ['property' => 'color', 'value' => 'red'],
            ['property' => 'font-size', 'value' => '16px']
        ]
    ]
];
```

### Step 2: Rule Classification Processor
**Input**: `css_rules` array
**Logic**: `is_simple_class_selector('.my-class')` → `true`
**Output**: 
```php
$global_class_rules = [
    [
        'selector' => '.my-class',
        'properties' => [
            ['property' => 'color', 'value' => 'red'],
            ['property' => 'font-size', 'value' => '16px']
        ]
    ]
];
```

### Step 3-7: Other Processors
**Action**: Skip (no compound/flattening/etc needed)

### Step 8: Global Classes Processor
**Input**: `global_class_rules` array
**Action**: 
1. Gets `global_class_rules` from context
2. Calls `process_global_classes_with_duplicate_detection($global_class_rules, ...)`
3. Integration service processes rules:
   - Detection: Finds `.my-class` selector
   - Conversion: Converts `color: red` → `{'$$type': 'color', 'value': 'red'}`
   - Registration: Creates global class with atomic props
**Output**:
```php
$global_classes = [
    'my-class' => [
        'id' => 'g-abc123',
        'label' => 'my-class', 
        'variants' => [
            [
                'props' => [
                    'color' => ['$$type' => 'color', 'value' => 'red'],
                    'font-size' => ['$$type' => 'font-size', 'value' => '16px']
                ]
            ]
        ]
    ]
];
```

### Step 9: HTML Class Modifier
**Action**: No changes needed (class name stays `.my-class`)

### Step 10: Style Resolution
**Action**: Final widget has `class="my-class"` with atomic CSS applied

---

## Compound Class Flow (.first.second)

### Step 1: CSS Parsing Processor
**Input**: `.first.second { color: red; font-size: 16px; }`
**Output**: 
```php
$css_rules = [
    [
        'selector' => '.first.second',
        'properties' => [
            ['property' => 'color', 'value' => 'red'],
            ['property' => 'font-size', 'value' => '16px']
        ]
    ]
];
```

### Step 2: Rule Classification Processor
**Input**: `css_rules` array
**Logic**: `is_simple_class_selector('.first.second')` → `false` (contains multiple dots)
**Output**: 
```php
$atomic_rules = [
    [
        'selector' => '.first.second',
        'properties' => [
            ['property' => 'color', 'value' => 'red'],
            ['property' => 'font-size', 'value' => '16px']
        ]
    ]
];
// NOT added to global_class_rules!
```

### Step 3-5: Other Processors
**Action**: Skip

### Step 6: Compound Class Selector Processor
**Input**: `css_rules` array (still contains `.first.second`)
**Logic**: 
1. `is_compound_class_selector('.first.second')` → `true`
2. Creates compound class: `first-and-second`
3. Creates mapping: `.first.second` → `.first-and-second`
**Output**:
```php
// CURRENT (FIXED) - Adds to global_class_rules
$global_class_rules = [
    [
        'selector' => '.first-and-second',
        'properties' => [
            ['property' => 'color', 'value' => 'red'],
            ['property' => 'font-size', 'value' => '16px']
        ]
    ]
];

$compound_mappings = [
    '.first.second' => '.first-and-second'
];

$css_class_modifiers = [
    [
        'type' => 'compound',
        'mappings' => ['.first.second' => '.first-and-second']
    ]
];
```

### Step 7: Style Collection Processor
**Action**: Skip

### Step 8: Global Classes Processor
**Input**: `global_class_rules` array (now contains compound rule)
**Action**: 
1. Gets `global_class_rules` from context
2. Calls `process_global_classes_with_duplicate_detection($global_class_rules, ...)`
3. Integration service processes rules:
   - Detection: Finds `.first-and-second` selector
   - Conversion: Converts `color: red` → `{'$$type': 'color', 'value': 'red'}`
   - Registration: Creates global class with atomic props
**Output**:
```php
$global_classes = [
    'first-and-second' => [
        'id' => 'g-def456',
        'label' => 'first-and-second', 
        'variants' => [
            [
                'props' => [
                    'color' => ['$$type' => 'color', 'value' => 'red'],
                    'font-size' => ['$$type' => 'font-size', 'value' => '16px']
                ]
            ]
        ]
    ]
];
```

### Step 9: HTML Class Modifier
**Input**: Widget with `class="first second"`
**Action**: 
1. Gets `css_class_modifiers` from context
2. Finds compound mapping: `.first.second` → `.first-and-second`
3. Checks if widget has both `first` AND `second` classes → `true`
4. Replaces classes: `first second` → `first-and-second`
**Output**: Widget with `class="first-and-second"`

### Step 10: Style Resolution
**Action**: Final widget has `class="first-and-second"` with atomic CSS applied

---

## Key Differences Summary

| Aspect | Normal Class | Compound Class |
|--------|-------------|----------------|
| **Rule Classification** | Added to `global_class_rules` | Added to `atomic_rules` (then moved by Compound Processor) |
| **Selector Processing** | None needed | Creates new class name (`first-and-second`) |
| **Class Mapping** | None | `.first.second` → `.first-and-second` |
| **HTML Modification** | None | `class="first second"` → `class="first-and-second"` |
| **Global Classes Input** | Original selector `.my-class` | Generated selector `.first-and-second` |
| **Integration Service** | Processes `.my-class` directly | Processes `.first-and-second` |
| **Final Class Name** | `my-class` | `first-and-second` |

## Critical Insight

The key difference is that **compound classes go through an extra transformation step**:
1. Original selector: `.first.second`
2. Generated class: `.first-and-second` 
3. HTML mapping: `class="first second"` → `class="first-and-second"`

But the **integration service processing should be identical** for both:
- Both end up in `global_class_rules`
- Both get processed by integration service
- Both should get atomic properties
- Both should be registered as global classes

## Potential Issue

If compound classes are still failing, the issue might be:
1. **HTML Class Modifier not applying mappings correctly**
2. **Global class not being registered properly**
3. **Atomic widget factory not extracting compound global classes**
4. **CSS output not including compound global classes**

The data flow is now correct - we need to investigate the CSS output stage.
