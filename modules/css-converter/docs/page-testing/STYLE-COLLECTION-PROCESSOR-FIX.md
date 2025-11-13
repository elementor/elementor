# Style Collection Processor - Fixed

## Issue Found

The Style Collection Processor was still trying to access `atomic_rules` and `global_class_rules` metadata keys that were removed during the flattening pipeline simplification.

## Root Cause

After refactoring the pipeline to use `css_rules` as the single source of truth:
1. Nested Selector Flattening Processor no longer creates `flattened_rules`
2. Compound Class Selector Processor no longer creates `compound_results`
3. Rule Classification Processor was deleted (it was redundant)
4. **But** Style Collection Processor was still trying to:
   - Get `atomic_rules` from context
   - Get `global_class_rules` from context
   - Merge them: `array_merge($atomic_rules, $global_class_rules)`

This caused the processor to receive empty arrays and not process any CSS rules!

## The Fix

### Before (Broken):
```php
public function process( Css_Processing_Context $context ): Css_Processing_Context {
    $css_rules = $context->get_metadata( 'css_rules', [] );
    $atomic_rules = $context->get_metadata( 'atomic_rules', [] );
    $global_class_rules = $context->get_metadata( 'global_class_rules', [] );
    
    // Merge atomic and global class rules
    $all_rules = array_merge( $atomic_rules, $global_class_rules );
    $css_styles_collected = $this->collect_css_styles_from_rules( $all_rules, $widgets );
    
    return $context;
}
```

### After (Fixed):
```php
public function process( Css_Processing_Context $context ): Css_Processing_Context {
    $css_rules = $context->get_metadata( 'css_rules', [] );
    $widgets = $context->get_widgets();
    $css = $context->get_metadata( 'css', '' );
    
    // Collect styles from css_rules (single source of truth)
    $css_styles_collected = $this->collect_css_styles_from_rules( $css_rules, $widgets );
    $inline_styles_collected = $this->collect_inline_styles_from_widgets( $widgets );
    $reset_styles_collected = $this->collect_reset_styles( $css, $widgets );
    
    return $context;
}
```

## Changes Made

### 1. Removed `global_class_rules` from `supports_context()`
```php
// Before
$global_class_rules = $context->get_metadata( 'global_class_rules', [] );
error_log( "STYLE_COLLECTION SUPPORTS DEBUG: global_class_rules count: " . count($global_class_rules) );

// After
// Removed - not needed
```

### 2. Removed `atomic_rules` and `global_class_rules` from `process()`
```php
// Before
$atomic_rules = $context->get_metadata( 'atomic_rules', [] );
$global_class_rules = $context->get_metadata( 'global_class_rules', [] );
$all_rules = array_merge( $atomic_rules, $global_class_rules );

// After
// Just use css_rules directly
$css_styles_collected = $this->collect_css_styles_from_rules( $css_rules, $widgets );
```

### 3. Removed debug logging
```php
// Before
error_log( "STYLE_COLLECTION DEBUG: Processing with " . count($global_class_rules) . " global_class_rules" );
foreach ( $global_class_rules as $i => $rule ) {
    error_log( "STYLE_COLLECTION DEBUG: global_class_rules[$i] - selector: " . ($rule['selector'] ?? 'none') );
}

// After
// Removed - not needed
```

## Impact on Class-Based Properties Test

The test was failing because:
1. CSS classes like `.text-bold` and `.banner-title` were in `css_rules`
2. But Style Collection Processor was looking for them in `atomic_rules` and `global_class_rules`
3. Since those arrays were empty, no CSS styles were collected
4. Result: The heading had no `letter-spacing`, `text-transform`, etc.

Now:
1. CSS classes are in `css_rules` (transformed by flattening/compound processors if needed)
2. Style Collection Processor reads from `css_rules` directly
3. All CSS styles are collected and applied correctly
4. Test should pass ✅

## Data Flow (After Fix)

```
CSS Parser → css_rules: ['.text-bold' => {...}, '.banner-title' => {...}]
    ↓
Nested Flattening → css_rules (no nested selectors, so unchanged)
    ↓
Compound Processing → css_rules (no compound selectors, so unchanged)
    ↓
Style Collection → Reads css_rules directly ✅
    ↓
Collects styles and applies to widgets
```

## Files Modified

- `style-collection-processor.php` - Removed references to `atomic_rules` and `global_class_rules`

## Verification

To verify the fix works:
1. Run the class-based-properties test
2. Check that CSS properties are applied to the heading
3. Verify `letter-spacing: 1px` and `text-transform: uppercase` are present

## Related Issues

This was the last remaining processor that referenced the old metadata keys. The pipeline is now fully cleaned up:

✅ Nested Selector Flattening Processor - Uses `css_rules` only
✅ Compound Class Selector Processor - Uses `css_rules` only  
✅ Global Classes Processor - Uses `css_rules` only
✅ Style Collection Processor - Uses `css_rules` only
✅ Rule Classification Processor - Deleted (redundant)

## Success Criteria

✅ No processor references `atomic_rules`
✅ No processor references `global_class_rules`
✅ Style Collection Processor uses `css_rules` as single source
✅ Class-based properties test should pass

