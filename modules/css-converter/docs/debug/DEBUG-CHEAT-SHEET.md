# WordPress Debug Mode - Quick Reference

## ✅ You Now Have Maximum Debug Enabled

Your `wp-config.php` now includes:
- ✅ `WP_DEBUG` = true (all errors visible in logs)
- ✅ `WP_DEBUG_LOG` = true (logged to `/wp-content/debug.log`)
- ✅ `WP_DEBUG_DISPLAY` = false (not shown on frontend)
- ✅ `SCRIPT_DEBUG` = true (unminified JS files)
- ✅ `SAVEQUERIES` = true (database query logging)
- ✅ `error_reporting` = E_ALL (catch everything)
- ✅ `log_errors` = 1 (enable error logging)

## Real-Time Log Monitoring

### Watch logs while testing:
```bash
tail -f /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log
```

### Better: Watch with filtering:
```bash
# Only show your debug logs
tail -f /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log | grep -E "NESTED|START|END"
```

### Clear before test, then watch:
```bash
rm /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log
tail -f /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log
```

## Debug Logging Patterns

### For Nested Compound Selectors
```php
error_log( '█ NESTED COMPOUND SELECTOR ====' );
error_log( 'Original: ' . $selector );
error_log( 'Target: ' . $target_selector );
error_log( 'Matched: ' . count( $matched_elements ) );
error_log( '████ NESTED COMPLETE ====' );
```

### For Widget Resolution
```php
error_log( '█ RESOLVE WIDGET: ' . $widget['element_id'] );
error_log( '  Type: ' . $widget['widget_type'] );
error_log( '  Styles: ' . count( $resolved_styles ) );
```

### For Property Conversion
```php
error_log( '█ CONVERT PROPERTY: ' . $property );
error_log( '  Value: ' . $value );
error_log( '  Converted: ' . json_encode( $converted ) );
```

## Common Debug Commands

```bash
# Get last 100 lines
tail -100 /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log

# Search for specific keyword
grep "NESTED" /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log

# Get context around a keyword
grep -B 2 -A 2 "NESTED" /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log

# Count occurrences
grep -c "NESTED" /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log

# Remove duplicates, show unique lines
grep "NESTED" /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log | sort | uniq

# Watch for new errors in real-time
tail -f /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log | grep -i "error\|fatal\|warning"
```

## Workflow

1. **Clear the log**:
   ```bash
   > /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log
   ```

2. **Start watching**:
   ```bash
   tail -f /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log
   ```

3. **Run your test** (in another terminal):
   ```bash
   curl -X POST "http://elementor.local:10003/wp-json/elementor/v2/widget-converter" \
     -H "Content-Type: application/json" \
     -d '{"type": "url", "content": "https://oboxthemes.com/", "selector": ".elementor-element-14c0aa4"}'
   ```

4. **Check the log** - your debug messages will appear in real-time

## What to Look For

- **"START NESTED COMPOUND"** - Handler triggered for nested+compound selector
- **"Target Extracted"** - Successfully extracted target element
- **"Matched Elements"** - Number and IDs of matched widgets
- **"Converted Properties"** - Number of CSS properties converted to atomic format
- **"END NESTED COMPOUND"** - Handler completed

## Advanced: View Full Widget Resolution

Add to `unified-css-processor.php` in `resolve_styles_recursively()`:

```php
error_log( '█ RESOLVING WIDGET: ' . $widget_id );
error_log( print_r( [
    'widget_type' => $widget['widget_type'],
    'resolved_styles_count' => count( $resolved_styles ),
    'resolved_styles_keys' => array_keys( $resolved_styles ),
], true ) );
```

This will show exactly which resolved styles are being applied to each widget!

