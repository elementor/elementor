# Smart Extraction - Current Status

**Date**: October 30, 2025  
**Status**: ✅ VARIABLES API WORKING | ❌ WIDGET CONVERSION BLOCKED

## What's Working

### ✅ CSS Variables API Endpoint (`/wp-json/elementor-css/v1/variables`)
- **Test**: `variable-duplicate-detection.test.ts`
- **Result**: ✅ **2/2 tests passing**
- **Evidence**:
  ```
  ✓ should create suffixed variables and reuse originals correctly (7.3s)
  ✓ should create suffixed variable when value differs (7.2s)
  ```
- **Conclusion**: The variables registration service is working perfectly

### ✅ Smart Extraction Implementation
- **Files Modified**:
  1. `css-variables-processor.php` - Smart filtering added
  2. `unified-css-processor.php` - Cleaned up (no longer needed)
- **Methods Added**:
  - `extract_variable_references_from_rules()` - ✅ Implemented
  - `filter_by_references()` - ✅ Implemented
  - `clean_variable_name()` - ✅ Implemented

## What's NOT Working

### ❌ Widget Conversion Pipeline (`/wp-json/elementor/v2/widget-converter`)
- **Test**: Manual API call for `https://oboxthemes.com/`
- **Result**: ❌ `variables_created: 0`
- **Expected**: `variables_created: 6`
- **Problem**: Smart extraction is filtering out ALL variables during widget conversion

##Root Cause Analysis

### Why Variables API Works But Widget Conversion Doesn't

**Variables API Flow**:
```
CSS → css-variables-processor → extract ALL vars → create vars → ✅ Success
```

**Widget Conversion Flow**:
```
HTML + CSS → css-variables-processor → extract ALL vars → 
→ extract references from WIDGET-SPECIFIC rules →
→ filter to keep ONLY referenced vars →
→ ❌ Result: 0 variables (no matches)
```

### The Problem

**Smart extraction is TOO smart**:
1. Variables are defined in Kit CSS (e.g., `.elementor-kit-1140 { --e-global-color-e66ebc9: #222A5A; }`)
2. Variables are REFERENCED in widget-specific CSS (e.g., `.elementor-element-6d397c1 { color: var(--e-global-color-e66ebc9); }`)
3. `extract_variable_references_from_rules()` scans `$css_rules` which might ONLY contain widget-specific rules, NOT Kit CSS rules
4. Result: 0 references found → 226 variables filtered to 0

### Evidence Needed

**Debug Questions**:
1. What rules are in `$css_rules` during widget conversion?
2. Are Kit CSS rules included in `$css_rules`?
3. Are variable references being found in those rules?

**Debug Logging Added**:
```php
// In css-variables-processor.php (lines 43-57)
error_log( "CSS Variables: Before filtering - $before_filter_count definitions, $ref_count referenced" );
error_log( "CSS Variables: After filtering - $after_filter_count definitions remain" );
```

**Status**: Logs are not appearing, which indicates:
- Either the processor isn't running during widget conversion
- Or the logs are going elsewhere
- Or there's a caching issue

## Possible Solutions

### Option 1: Fix Smart Extraction Scope
**Problem**: Smart extraction should scan ALL parsed CSS, not just widget-specific rules  
**Solution**: Include Kit CSS rules in the reference extraction

### Option 2: Disable Smart Extraction for Widget Conversion
**Problem**: Widget conversion needs ALL variables, not just referenced ones  
**Solution**: Add a flag to bypass smart extraction in widget conversion context

### Option 3: Extract References from ALL CSS Sources
**Problem**: References are in widget CSS, definitions are in Kit CSS  
**Solution**: Scan both `$css_rules` AND `beautified_css` for references

## Next Steps

1. **Add debug logging** to see what's in `$css_rules` during widget conversion
2. **Verify references** are being extracted from the correct CSS source
3. **Test Option 3** - Scan `beautified_css` string for `var(--*)` patterns in addition to `$css_rules`
4. **Re-run widget conversion** and verify 6 variables are created

## Testing Checklist

- [x] Variables API endpoint working
- [x] Smart extraction implemented
- [ ] Widget conversion creates variables
- [ ] Debug logs appearing
- [ ] 6 variables created (not 0, not 226)
- [ ] Variables applied in preview

---

**Blocked By**: Need to debug why smart extraction filters out all variables during widget conversion.
**Root Cause**: Likely scanning wrong CSS source for references (widget rules only, not Kit CSS).

