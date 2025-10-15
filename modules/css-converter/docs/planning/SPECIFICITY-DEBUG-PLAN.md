# Specificity Bug Debug Plan

## Symptom
Both `#container` and `#container.box` are outputting `background-color: blue` instead of blue and red respectively.

```css
/* In rendered page: */
.e-7b4c57d-c45bebc { background-color: blue; }   /* from #container */
.e-642b9ef-c71f8c9 { background-color: blue; }   /* from #container.box - SHOULD BE RED! */
```

## Hypothesis
The value "red" is being lost somewhere between CSS parsing and atomic prop generation.

## Possible Causes

### 1. CSS Parser Issue
- Sabberworm might be misparsing `#container.box` 
- Test: Run `/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/test-sabberworm.php`
- Expected: Two rulesets, one with "blue", one with "red"

### 2. Selector Collision
- `#container.box` selector might be normalized to `#container` somewhere
- Both rules end up with the same normalized key
- Later rule overwrites earlier, but both have "blue"?

### 3. Property Inheritance
- `#container.box` inherits properties from `#container`
- CSS cascade logic incorrectly merging parent properties

### 4. Widget Matching Issue  
- Both selectors match the same widget
- Lower specificity overwrites higher (order bug)

## Debug Strategy

Since terminal output isn't working, add a WRITE to file approach:

```php
// In process_matched_rule(), add:
if ( strpos( $selector, '#container' ) !== false ) {
    $debug_data = [
        'selector' => $selector,
        'properties' => $properties,
        'converted' => $converted_properties,
        'matched_count' => count( $matched_elements ),
    ];
    file_put_contents(
        WP_CONTENT_DIR . '/debug-specificity.json',
        json_encode( $debug_data, JSON_PRETTY_PRINT ) . "\n",
        FILE_APPEND
    );
}
```

Then read `/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug-specificity.json` to see what's being processed.

## Next Steps

1. ✅ Add file-based debug logging
2. ⏳ Trigger conversion via test or API
3. ⏳ Read debug file to see actual values
4. ⏳ Identify where "red" becomes "blue"
5. ⏳ Fix the root cause


