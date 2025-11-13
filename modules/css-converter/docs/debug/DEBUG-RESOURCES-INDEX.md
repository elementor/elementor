# Debug Mode Resources Index

## 📚 Available Documentation

### 1. **MAX-DEBUG-MODE-RESEARCH.md** (Comprehensive)
   - **Length**: ~600 lines
   - **Content**: Complete guide to WordPress debug configuration
   - **Best for**: Understanding all aspects of debugging
   - **Key Sections**:
     - WordPress debug constants (WP_DEBUG, WP_DEBUG_LOG, etc.)
     - PHP error constants and levels
     - Log locations (4 different types)
     - How to access debug logs (3 methods)
     - Advanced tools (Xdebug, Query Monitor, etc.)
     - Step-by-step troubleshooting for nested variables

### 2. **DEBUG-MODE-QUICK-REFERENCE.md** (Practical)
   - **Length**: ~150 lines  
   - **Content**: Quick lookup reference
   - **Best for**: Immediate help while debugging
   - **Key Sections**:
     - Essential commands (bash)
     - wp-config.php settings
     - Logging code examples
     - Log locations table
     - Pro tips and tricks

---

## 🎯 Current Environment Status

**Your setup is ALREADY configured for maximum debugging!**

```
✅ WP_DEBUG = true
✅ WP_DEBUG_LOG = true  (logs to /wp-content/debug.log)
✅ SCRIPT_DEBUG = true
✅ ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS = true
⚠️  WP_DEBUG_DISPLAY = false (good for security)
```

---

## 🚀 Quick Start - Debug Nested Variables

### Terminal 1: Watch the log
```bash
cd /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content
tail -f debug.log | grep -i "NESTED\|ERROR\|VARS"
```

### Terminal 2: Add logging to code
Edit: `/plugins/elementor-css/modules/css-converter/routes/variables-route.php`

After line 123, add:
```php
error_log( '=== NESTED VARIABLES DEBUG ===' );
error_log( 'Scoped variables count: ' . count( $scoped_variables ) );
error_log( print_r( $scoped_variables, true ) );
error_log( 'After extraction count: ' . count( $raw ) );
error_log( print_r( $raw, true ) );
```

### Terminal 3: Run test
```bash
cd /plugins/elementor-css
npm run test:playwright -- ./tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts
```

Watch Terminal 1 for the debug output!

---

## 📋 Commands Cheat Sheet

```bash
# View real-time log
tail -f /wp-content/debug.log

# View last 50 lines
tail -50 /wp-content/debug.log

# Search for specific errors
grep "ERROR" /wp-content/debug.log

# Filter by keyword
grep -i "nested" /wp-content/debug.log

# Count matches
grep -c "Variable" /wp-content/debug.log

# Show with line numbers
grep -n "ERROR" /wp-content/debug.log

# Clear the log
echo "" > /wp-content/debug.log

# Monitor file size
ls -lh /wp-content/debug.log

# Export for analysis
cp /wp-content/debug.log ~/debug-export-$(date +%s).log
```

---

## 🔧 Recommended Debug Configuration

To enable ABSOLUTE MAXIMUM debugging, add this to `/wp-config.php`:

```php
// After existing debug defines (around line 79)
define( 'SAVEQUERIES', true );           // Track all DB queries
define( 'CONCATENATE_SCRIPTS', false );  // Don't combine JS
define( 'COMPRESS_SCRIPTS', false );     // Don't compress JS  
define( 'COMPRESS_CSS', false );         // Don't compress CSS
ini_set( 'error_reporting', E_ALL );     // Report ALL errors
```

---

## 📊 Data Flow to Track

For nested variables debugging, trace this flow:

```
CSS Input
    ↓
parse() [Sabberworm Parser]
    ↓
extract_variables_with_nesting() ← CHECK: How many variables?
    ↓
extract_and_rename_nested_variables() ← CHECK: Are suffixes added?
    ↓
Variable_Conversion_Service::convert_to_editor_variables()
    ↓
save_editor_variables() [Database Storage]
    ↓
API Response to Playwright Test
```

---

## 🎓 Learning Resources

From the code, these are examples of logging patterns used:

### Send App Logger
- **File**: `/plugins/send-app/core/logger.php`
- **Usage**: `Logger::error()`, `Logger::debug()`

### Elementor Logger
- **File**: `/plugins/elementor/core/logger/manager.php`
- **Usage**: Automatic error handling and logging

### Post SMTP Logger
- **File**: `/plugins/post-smtp/Postman/PostmanLogger.php`
- **Usage**: Multiple log levels (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)

---

## ⏱️ Expected Debug Output

When properly logged, you should see something like:

```
[16-Oct-2025 14:23:45 UTC] === NESTED VARIABLES DEBUG ===
[16-Oct-2025 14:23:45 UTC] Scoped variables count: 6
[16-Oct-2025 14:23:45 UTC] Array
(
    [--primary::hash1] => Array ( [name] => --primary [value] => #007bff ... )
    [--primary::hash2] => Array ( [name] => --primary [value] => #0d6efd ... )
    ...
)
[16-Oct-2025 14:23:45 UTC] After extraction count: 3
[16-Oct-2025 14:23:45 UTC] Array
(
    [0] => Array ( [name] => --primary [value] => #007bff ...)
    [1] => Array ( [name] => --primary-1 [value] => #0d6efd ...)
    [2] => Array ( [name] => --primary-2 [value] => #ffffff ...)
)
```

---

## 🚨 Troubleshooting

### Log not appearing?
- Check: `ls -l /wp-content/debug.log` (exists?)
- Check: `cat /wp-content/debug.log` (has content?)
- Restart: Clear cache with `wp cache flush`

### Too much output?
- Use grep: `grep -i "nested" debug.log`
- Use less: `less +G /wp-content/debug.log` (go to end)
- Search: `grep -c "ERROR" debug.log` (count errors)

### File too large?
- Clear it: `echo "" > /wp-content/debug.log`
- Rotate it: `mv debug.log debug.log.bak`

---

## 📞 Next Steps

1. ✅ Read **MAX-DEBUG-MODE-RESEARCH.md** for comprehensive understanding
2. ✅ Reference **DEBUG-MODE-QUICK-REFERENCE.md** while debugging
3. ✅ Open Terminal 1: Start watching log with `tail -f`
4. ✅ Add logging to variables-route.php
5. ✅ Run the failing Playwright test
6. ✅ Analyze output to find where nested variables are lost

---

**Status**: You're ready to debug! Maximum debug mode is enabled. Start with `tail -f /wp-content/debug.log`
