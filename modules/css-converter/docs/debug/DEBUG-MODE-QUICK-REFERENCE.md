# WordPress Debug Mode - Quick Reference Card

## ⚡ Current Status
✅ **Maximum debug is ALREADY ENABLED in this environment**

## 📋 Essential Commands

```bash
# View debug log in real-time
tail -f /wp-content/debug.log

# View last 100 lines
tail -100 /wp-content/debug.log

# Search for errors
grep "ERROR" /wp-content/debug.log

# Clear the log
echo "" > /wp-content/debug.log

# Show line count
wc -l /wp-content/debug.log

# Watch for new entries
watch -n 1 'tail -20 /wp-content/debug.log'
```

## 🔧 wp-config.php Settings

### Current (ALREADY SET):
```php
define( 'WP_DEBUG', true );              ✅ Master debug flag
define( 'WP_DEBUG_LOG', true );          ✅ Log to file
define( 'WP_DEBUG_DISPLAY', false );     ✅ Don't show on screen
define( 'SCRIPT_DEBUG', true );          ✅ Unminified scripts
define( 'ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS', true );  ✅ Elementor experiments
```

### To Add Maximum Debug:
```php
// In /wp-config.php after existing debug defines:
define( 'SAVEQUERIES', true );           // Track DB queries
define( 'CONCATENATE_SCRIPTS', false );  // Don't merge JS
define( 'COMPRESS_SCRIPTS', false );     // Don't compress JS
define( 'COMPRESS_CSS', false );         // Don't compress CSS
ini_set( 'error_reporting', E_ALL );     // Report everything
```

## 🪵 Logging Code in PHP

```php
// Simple log
error_log( 'Debug message' );

// Log array/object
error_log( print_r( $variable, true ) );

// Log with context
error_log( 'NESTED VARS: ' . print_r( $scoped_variables, true ) );

// Conditional logging
if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
    error_log( 'Debug info: ' . $info );
}

// Using Elementor logger
use Elementor\Core\Logger\Logger;
Logger::error( 'Error message' );
Logger::debug( 'Debug message' );
```

## 📁 Log Locations

| Log Type | Location |
|----------|----------|
| **WordPress Debug** | `/wp-content/debug.log` |
| **PHP Errors** | `/var/log/php-errors.log` (varies) |
| **Apache** | `/var/log/apache2/error.log` |
| **Nginx** | `/var/log/nginx/error.log` |
| **Elementor** | `/wp-content/uploads/elementor/` |

## 🎯 For Nested Variables Debugging

### Step-by-Step:

1. **Open log watcher** in terminal:
   ```bash
   tail -f /wp-content/debug.log
   ```

2. **Add logging to code** (variables-route.php around line 123):
   ```php
   error_log( '=== START DEBUG ===' );
   error_log( 'Input CSS: ' . substr( $css, 0, 100 ) );
   
   $scoped_variables = $parser->extract_variables_with_nesting( $parsed );
   error_log( 'Scoped Variables Count: ' . count( $scoped_variables ) );
   error_log( print_r( $scoped_variables, true ) );
   
   $raw = $this->extract_and_rename_nested_variables( $scoped_variables );
   error_log( 'After Rename Count: ' . count( $raw ) );
   error_log( print_r( $raw, true ) );
   
   error_log( '=== END DEBUG ===' );
   ```

3. **Run a test** (in another terminal):
   ```bash
   cd /plugins/elementor-css
   npm run test:playwright -- tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts
   ```

4. **Watch the log** fill in real-time in first terminal

## 🔍 What to Look For

- **Variable Count**: Are all scoped variables being extracted?
- **Value Normalization**: Are colors being normalized (hex to rgb)?
- **Suffix Assignment**: Are suffixes being added correctly?
- **Conversion Process**: What happens in Variable_Conversion_Service?
- **Storage**: Are variables actually being saved?

## 🚀 Performance Impact

Debug mode has minimal impact when:
- `WP_DEBUG_DISPLAY` = false (logging only)
- `SCRIPT_DEBUG` = true (but affects page speed slightly)
- File logging is on a fast disk

## ✋ Don't Forget

- Clear the log frequently: `echo "" > /wp-content/debug.log`
- Monitor file size: `ls -lh /wp-content/debug.log`
- Remove debug code before committing
- Disable debug in production

## 📞 Helpful Plugins

```bash
# Install Query Monitor for visual debugging
wp plugin install query-monitor --activate

# Install Debug Bar
wp plugin install debug-bar --activate
```

## 💡 Pro Tips

1. **Tail with grep**: `tail -f /wp-content/debug.log | grep "NESTED"`
2. **Count occurrences**: `grep -c "Variable" /wp-content/debug.log`
3. **Export for analysis**: `cp /wp-content/debug.log ~/debug-export.log`
4. **Watch in VS Code**: Open file and VS Code watches changes
5. **Use timestamps**: `grep "2025-10-16" /wp-content/debug.log`

---

**Status**: Ready to debug! Use `tail -f /wp-content/debug.log` to start monitoring.

