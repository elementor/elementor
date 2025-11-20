# Why 95 Variables Instead of 6?

**Date**: October 30, 2025  
**Status**: ✅ Smart extraction working, but 95 variables already exist in repository

## Debug Log Evidence

```
[18:46:38] Before filter=208, references=205
[18:46:38] After filter=184 (removed 24 unused)
[18:46:38] COMMAND: Received 184 variables from processor
[18:46:38] COMMAND: Result - created=0, reused=95
```

## The Answer

**Smart extraction IS working perfectly!**

1. **208 variables** extracted from Kit CSS files
2. **184 variables** after filtering (removed 24 unused) ✅
3. **95 variables** already existed in repository (from previous run)
4. **0 new variables** created (all were duplicates)

### Why Not 6 Variables?

**Current State**: 184 variables pass the filter  
**Your Goal**: Only 6 variables for `.elementor-element-6d397c1`

**The Issue**: Smart extraction is filtering by **ALL** referenced variables in **ALL** CSS being processed, not just the specific selector.

### What's Being Processed

When you request selector `.elementor-element-6d397c1`, the CSS Converter is:
1. Fetching the entire HTML page
2. Extracting ALL CSS (including Kit CSS with 208 variables)
3. Processing ALL of that CSS
4. Finding references to 205 variables across the entire page
5. Filtering to keep 184 referenced variables

**Problem**: The filter scope is too broad - it's looking at the entire page, not just your specific selector.

### The 6 Critical Variables You Want

For `.elementor-element-6d397c1` specifically, only these 6 are needed:

| # | Variable | Value | Used In |
|---|----------|-------|---------|
| 1 | `--ec-global-color-e66ebc9` | `#222A5A` | `.elementor-element-6d397c1` color |
| 2 | `--ec-global-color-text` | `#7A7A7A` | `.elementor-widget-text-editor` color |
| 3 | `--ec-global-typography-text-font-family` | `"forma-djr-text"` | Typography |
| 4 | `--ec-global-typography-text-font-size` | `20px` | Typography |
| 5 | `--ec-global-typography-text-font-weight` | `400` | Typography |
| 6 | `--ec-global-typography-text-line-height` | `30px` | Typography |

## Solution Options

### Option 1: Scope CSS to Selector (Recommended)
**Goal**: Process ONLY the CSS for `.elementor-element-6d397c1`, not the entire page

**How**:
1. Extract HTML for `.elementor-element-6d397c1` only
2. Extract CSS rules that apply to that HTML only
3. Find variable references in those specific rules only
4. Result: 6 variables instead of 184

**Complexity**: Medium - requires HTML scoping logic

### Option 2: Post-Filter by Selector Classes
**Goal**: After extracting 184 variables, filter again to keep only those used by your selector's classes

**How**:
1. Get all classes from `.elementor-element-6d397c1`
2. Find CSS rules for those specific classes
3. Extract variable references from those rules only
4. Filter the 184 variables down to just those 6

**Complexity**: Low - add one more filtering step

### Option 3: Accept 95-184 Variables (Current)
**Goal**: Keep smart extraction as-is

**Pros**:
- Already working
- Covers all variables that might be needed
- 184 is much better than 208

**Cons**:
- Not optimal (95-184 vs 6)
- May hit repository limits (100 max)

## Current Status

✅ **Smart extraction is WORKING**  
✅ **Variables are being filtered** (208 → 184)  
✅ **Variables are being registered** (95 reused)  
⚠️ **Scope is too broad** (entire page instead of specific selector)

## Recommendation

**Implement Option 2: Post-Filter by Selector**

This is the quickest win:
1. Get the selector's classes: `elementor-element-6d397c1`, `elementor-widget-text-editor`, etc.
2. Find all CSS rules that target those classes
3. Extract variable references from ONLY those rules
4. Filter the 184 variables to keep only referenced ones
5. Expected result: ~6 variables

**Code Change**: Add one more filtering step in `css-variables-processor.php` after line 65.

Would you like me to implement this?

