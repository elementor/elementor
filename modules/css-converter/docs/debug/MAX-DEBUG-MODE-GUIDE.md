# WordPress Maximum Debug Mode - Complete Guide

## Current Configuration Status ✅
```php
if ( ! defined( 'WP_DEBUG' ) ) {
    define( 'WP_DEBUG', true );              // Enable debug mode
    define( 'WP_DEBUG_LOG', true );          // Log to debug.log
    define( 'WP_DEBUG_DISPLAY', false );     // Don't display on frontend
    define( 'ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS', true );
    define( 'SCRIPT_DEBUG', true );          // Load unminified JS
}
```

## Maximum Debug Mode Setup

### 1. Essential Constants (Already Set)
- `WP_DEBUG` = true → Enables all PHP warnings, notices, and errors
- `WP_DEBUG_LOG` = true → Writes errors to `/wp-content/debug.log`
- `WP_DEBUG_DISPLAY` = false → Hides errors on frontend (shows in log only)
- `SCRIPT_DEBUG` = true → Loads unminified JavaScript files

### 2. Additional Debug Constants to Add

```php
// For exhaustive error logging
ini_set( 'error_reporting', E_ALL );
ini_set( 'display_errors', 0 );
ini_set( 'log_errors', 1 );
ini_set( 'error_log', dirname( __FILE__ ) . '/debug.log' );

// WordPress specific
define( 'SAVEQUERIES', true );              // Log database queries
define( 'WP_DEBUG_LOG', true );             // Already set
define( 'WP_DEBUG_DISPLAY', false );        // Already set

// Elementor specific
define( 'ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS', true );  // Already set

// Performance & Debug
define( 'JETPACK_DEV_DEBUG', true );        // If using Jetpack
define( 'WP_ENVIRONMENT_TYPE', 'local' );   // Tells WP this is local/dev
```

### 3. How to Read debug.log
```bash
# Watch log in real-time
tail -f /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log

# Get last 50 lines
tail -50 /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log

# Search for specific errors
grep "ERROR\|Fatal\|Warning" /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log

# Clear log before testing
> /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log
```

## Advanced Debugging

### 4. Custom Error Logging in PHP

```php
// Add to your code to debug specific values
error_log( 'VARIABLE: ' . print_r( $variable, true ) );
error_log( 'SELECTOR: ' . $selector );
error_log( 'MATCHED: ' . count( $matched_elements ) . ' elements' );

// Or use wp_die() to see full stack trace
wp_die( 'Debug point reached. Var: ' . print_r( $data, true ) );
```

### 5. Query Logging (SAVEQUERIES)

```php
// Add to wp-config.php
define( 'SAVEQUERIES', true );

// Then in your code:
global $wpdb;
error_log( 'QUERIES: ' . print_r( $wpdb->queries, true ) );
```

## Checking Current Debug Status

```bash
# See current debug configuration
grep -E "WP_DEBUG|SCRIPT_DEBUG|error_reporting" \
  /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-config.php

# Check if debug.log exists and size
ls -lh /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log

# Check file permissions (should be writable)
stat /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log
```

## For Your Nested Compound Selector Issue

### Add These Debug Statements

In `apply_widget_specific_styling_for_nested_compound()`:

```php
error_log( '===== START NESTED COMPOUND =====' );
error_log( 'Original Selector: ' . $selector );
error_log( 'Target Extracted: ' . $target_selector );
error_log( 'Matched Elements: ' . json_encode( $matched_elements ) );
error_log( 'Converted Properties Count: ' . count( $converted_properties ) );
foreach ( $converted_properties as $prop ) {
    error_log( '  - ' . $prop['property'] . ': ' . $prop['value'] );
}
error_log( '===== END NESTED COMPOUND =====' );
```

In `resolve_styles_for_widget()`:

```php
$element_id = $widget['element_id'] ?? null;
if ( $element_id ) {
    error_log( 'Resolving styles for widget: ' . $element_id );
    error_log( 'Widget type: ' . ( $widget['widget_type'] ?? 'unknown' ) );
    error_log( 'Resolved styles count: ' . count( $resolved_styles ) );
}
```

## Quick Reference Commands

```bash
# Real-time log watch (best for debugging)
tail -f /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log | grep -i "nested\|selector\|widget"

# Count error types
grep -oE "(\[.*-.*\]|PHP Warning|PHP Notice|PHP Fatal)" \
  /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log | sort | uniq -c

# Get last N lines with context around "NESTED"
grep -C 3 "NESTED" /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/debug.log
```

## Enable Maximum Debug Right Now

Create a debug helper file and include it:

```php
// debug-helper.php - Include in wp-config.php
if ( WP_DEBUG ) {
    ini_set( 'error_reporting', E_ALL );
    ini_set( 'display_errors', 0 );
    ini_set( 'log_errors', 1 );
    
    // Custom error handler
    set_error_handler( function( $errno, $errstr, $errfile, $errline ) {
        error_log( sprintf(
            '[ERROR %d] %s in %s:%d',
            $errno,
            $errstr,
            basename( $errfile ),
            $errline
        ));
    });
}
```

