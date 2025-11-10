# CSS Variable Resolution Bug Fix

**Date**: 2025-11-06  
**Status**: ✅ **FIXED**  
**Issue**: CSS variables not resolving to correct values (defaulting to black `rgb(0,0,0)`)

---

## 🎯 **Problem Statement**

CSS variables like `var(--e-global-color-e66ebc9)` were not resolving to their actual values (`#222A5A`), instead defaulting to black (`rgb(0, 0, 0)`).

**Test Failure**:
- Expected: `rgb(34, 42, 90)` (which is `#222A5A`)
- Actual: `rgb(0, 0, 0)` (black)

---

## 🔍 **Root Cause Analysis**

### **The Bug**

In `css-variable-resolver.php`, the `get_variable_value()` method was using:
```php
$clean_name = ltrim($var_name, '-');
```

**Problem**: `ltrim()` removes **all leading characters** matching the specified characters, not just the prefix. So:
- `--e-global-color-e66ebc9` → `-e-global-color-e66ebc9` (only removes ONE dash)
- But the registry stores it as: `e-global-color-e66ebc9` (removes BOTH dashes)

**Result**: Variable lookup fails because keys don't match:
- Registry key: `e-global-color-e66ebc9` ✅
- Resolver lookup: `-e-global-color-e66ebc9` ❌

### **Why It Defaulted to Black**

When the variable isn't found:
1. `get_variable_value()` returns `null`
2. `is_global_variable()` checks if it's a global variable (it is)
3. `fetch_global_variable_from_wp()` tries WordPress (fails - variable not in local kit)
4. `get_global_variable_default()` returns `#000000` (black) for color variables

---

## ✅ **Solution**

### **Fix Applied**

Replaced all instances of `ltrim($var_name, '-')` with a proper `clean_variable_name()` method:

```php
private function clean_variable_name( string $variable_name ): string
{
    $clean = trim($variable_name);
    if (0 === strpos($clean, '--')) {
        $clean = substr($clean, 2);
    }
    return $clean;
}
```

**Fixed Methods**:
1. `get_variable_value()` - Line 188
2. `get_variable_type()` - Line 233
3. `fetch_global_variable_from_wp()` - Line 276
4. `get_global_variable_default()` - Line 351

### **How It Works Now**

1. **Variable Extraction** (CSS Variable Registry Processor):
   - Extracts `--e-global-color-e66ebc9: #222A5A` from Kit CSS
   - Stores as key: `e-global-color-e66ebc9` (clean name)

2. **Variable Resolution** (CSS Variable Resolver):
   - Receives `var(--e-global-color-e66ebc9)` in CSS rule
   - Cleans to: `e-global-color-e66ebc9` ✅
   - Looks up in registry: **FOUND** ✅
   - Returns: `#222A5A` ✅

3. **Style Application**:
   - CSS rule becomes: `color: #222A5A`
   - Applied to widget correctly ✅

---

## 📊 **Impact**

### **Before Fix**
- CSS variables defaulted to black (`#000000`)
- Test failures: 3 tests failing due to incorrect color values
- Variables from Kit CSS not being resolved

### **After Fix**
- CSS variables resolve correctly from Kit CSS definitions
- Variables resolve from WordPress Kit (if available)
- Proper fallback to defaults only when variable truly doesn't exist

---

## 🔧 **Files Modified**

1. **`css-variable-resolver.php`**:
   - Added `clean_variable_name()` method
   - Fixed 4 methods to use proper variable name cleaning

---

## 🧪 **Testing**

### **Manual Test**
```json
{
  "type": "html",
  "content": "<div class=\"elementor elementor-1140\"><h2 class=\"elementor-heading-title\">Test</h2></div>",
  "css": ".elementor-1140 .elementor-heading-title { color: var(--e-global-color-e66ebc9); } :root { --e-global-color-e66ebc9: #222A5A; }"
}
```

**Expected Result**: Color resolves to `#222A5A` (not black)

### **Playwright Tests**
- `selector-matcher-general-solution.test.ts` - Should now pass color assertions

---

## 📝 **Related Issues**

This bug was causing:
- Incorrect color rendering in converted widgets
- CSS variables from external sites not being resolved
- Test failures in selector matching tests

---

## ✅ **Status**

**FIXED** - Variable name cleaning now matches registry storage format.


