# Compound Class Data Purity Fix

## Problem

Compound classes were NOT flowing through the same data pipeline as regular `.class {}` rules.

## Root Cause

**Regular Class Flow:**
1. Parsing Processor → `css_rules` array with format: `['selector' => '.my-class', 'properties' => [...]]`
2. Rule Classification Processor → Adds to `global_class_rules` array
3. Global Classes Processor → Processes `global_class_rules` through integration service

**Compound Class Flow (WRONG):**
1. Compound Processor → Added to `global_classes` array directly
2. Never went through integration service
3. Never got `atomic_props` conversion

## Solution

Make compound classes flow through `global_class_rules` EXACTLY like regular classes.

### Code Changes

**File: `compound-class-selector-processor.php`**

```php
// OLD (WRONG):
// Add compound classes directly to the global_classes array
$global_classes = $context->get_metadata( 'global_classes', [] );
$global_classes = array_merge( $global_classes, $result['compound_global_classes'] );
$context->set_metadata( 'global_classes', $global_classes );

// NEW (CORRECT):
// Add compound rules to global_class_rules (SAME as regular .class rules)
$global_class_rules = $context->get_metadata( 'global_class_rules', [] );
foreach ( $result['compound_global_classes'] as $class_name => $class_data ) {
	$global_class_rules[] = [
		'selector' => '.' . $class_name,
		'properties' => $class_data['properties'] ?? [],
	];
}
$context->set_metadata( 'global_class_rules', $global_class_rules );
```

**File: `compound-class-selector-processor.php` (create_compound_global_class method)**

```php
// OLD (WRONG): Created atomic_props directly
$class_data = [
	'id' => $compound_class_name,
	'label' => $compound_class_name,
	'original_selector' => $selector,
	'compound_classes' => $classes,
	'properties' => $properties,
	'atomic_props' => $atomic_props, // ← WRONG: Bypassed integration service
	'type' => 'compound',
];

// NEW (CORRECT): Only properties, no atomic_props
$class_data = [
	'id' => $compound_class_name,
	'label' => $compound_class_name,
	'original_selector' => $selector,
	'compound_classes' => $classes,
	'properties' => $properties, // ← Will be converted by integration service
	'css_converter_original_selector' => $selector,
	'css_converter_requires' => $classes,
	'type' => 'compound',
];
```

**File: `global-classes-processor.php`**

```php
// REVERTED: No special handling for compound classes
// They flow through global_class_rules like any other class
public function process( Css_Processing_Context $context ): Css_Processing_Context {
	$css_rules = $context->get_metadata( 'css_rules', [] );
	$css = $context->get_metadata( 'css', '' );
	$global_class_rules = $context->get_metadata( 'global_class_rules', [] );
	// ↑ Compound rules are already in here!
	
	// Process ALL global class rules (regular + compound) through integration service
	$global_classes_result = $this->process_global_classes_with_duplicate_detection(
		$css_class_rules, // ← Contains both regular and compound rules
		$flattening_results,
		$compound_results
	);
	
	// ...
}
```

## Data Flow (CORRECTED)

```
CSS Input: .first.second { color: red; }
    ↓
[Parsing Processor]
    ↓ Creates css_rules
[Compound Processor]
    ↓ Detects compound selector
    ↓ Creates: ['selector' => '.first-and-second', 'properties' => [color: red]]
    ↓ Adds to global_class_rules (SAME FORMAT as regular .class rules)
[Rule Classification Processor]
    ↓ (skipped for compound - already in global_class_rules)
[Global Classes Processor]
    ↓ Processes global_class_rules through integration service
    ↓ Integration service converts properties → atomic_props
    ↓ Creates final global_classes array
[HTML Modifier]
    ↓ Applies compound_mappings: .first.second → .first-and-second
Output: Widget has class="first-and-second" with atomic CSS properties
```

## Key Principle

**ALL classes must flow through `global_class_rules` → integration service → `global_classes`**

No processor should bypass this flow. The integration service is responsible for:
- Converting CSS properties to atomic properties
- Duplicate detection
- Registration with Elementor

## Benefits

1. **Data Purity**: Compound classes use EXACT same structure as regular classes
2. **Single Responsibility**: Each processor does ONE thing
3. **No Special Cases**: Global_Classes_Processor doesn't need to know about compound/flattened/etc
4. **Consistent Conversion**: All property conversion happens in ONE place (integration service)

## Testing

Run the compound selector tests:
```bash
npm run test:playwright -- compound-class-selectors.test.ts
```

Expected: All 6 tests pass with CSS properties correctly applied.

