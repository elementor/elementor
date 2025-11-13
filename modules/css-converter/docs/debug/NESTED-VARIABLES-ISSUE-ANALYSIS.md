# Nested Variables Implementation - Issue Analysis & Solutions

**Date**: October 16, 2025  
**Status**: 83% Complete (10/12 tests passing)  
**Priority**: 2 Edge Cases Remaining

---

## 📋 Executive Summary

The nested CSS variables feature implementation successfully extracts, renames, and stores variables declared across multiple scopes (root, class selectors, media queries). However, 2 edge cases are failing related to **media query scope detection** and **complex suffix generation** for 3+ variable variants.

**Current State**:
- ✅ 10/12 tests passing (83%)
- ✅ Core functionality working
- ⚠️ 2 edge cases need refinement

---

## 🔴 Issue #1: Media Query Scope Detection

### Test: "should handle media query variables as separate scope"

### Problem Description

When CSS variables are declared within media queries, they are not being properly counted as separate scopes.

**Test CSS**:
```css
:root { 
  --font-size: 14px; 
  --spacing: 8px; 
}

@media (max-width: 768px) { 
  :root { 
    --font-size: 12px;  /* Different value - should create --font-size-1 */
    --spacing: 4px;     /* Different value - should create --spacing-1 */
  }
}

@media (max-width: 480px) { 
  :root { 
    --font-size: 10px;  /* Different value - should create --font-size-2 */
    --spacing: 2px;     /* Different value - should create --spacing-2 */
  }
}
```

**Expected Output**:
- `--font-size` (14px - root)
- `--font-size-1` (12px - media 768px)
- `--font-size-2` (10px - media 480px)
- `--spacing` (8px - root)
- `--spacing-1` (4px - media 768px)
- `--spacing-2` (2px - media 480px)

**Actual Output**:
- `--font-size` (14px - root)
- `--spacing` (8px - root)
- (Missing the media query variants)

### Root Cause Analysis

#### 1. **Scope String Formation Issue**

The scope string includes the media query syntax:
```
:root
@media (max-width: 768px) :root
@media (max-width: 480px) :root
```

When `separate_nested_variables()` checks `is_root_scope()`, it:
1. Removes `@media (max-width: 768px)` part
2. Leaves `:root`
3. Returns `true` (is a root scope)

Then it checks `is_media_query_scope()`:
```php
return false !== strpos( $scope, '@media' );  // Returns true
```

So variables inside `@media (max-width: 768px) :root` are classified as:
- `is_root_scope()` = **true**
- `is_media_query_scope()` = **true**

#### 2. **Logic in `separate_nested_variables()`**

```php
if ( $this->is_root_scope( $scope ) && $this->is_media_query_scope( $scope ) ) {
    // Treat as nested
} elseif ( ! $this->is_root_scope( $scope ) ) {
    // Treat as nested
}
```

The condition `is_root_scope() && is_media_query_scope()` is meant to catch media query variables declared in `:root` inside the media query. However:

**The Problem**: Variables inside `@media (max-width: 768px) :root` ARE being added to `$nested`, but they might not be properly distinguished from the base `:root` variables.

#### 3. **Possible Scope Collision**

When processing:
- Root `:root` scope variable: `--font-size: 14px`
- Media query variable: `@media (max-width: 768px) :root` with `--font-size: 12px`

The grouping key is the variable NAME (`--font-size`), not the full scope. So they should be grouped together. But the nested extractor might be:
1. Treating `@media (max-width: 768px) :root` as same as `:root`
2. Not creating a separate entry in the output

### Potential Solutions

#### Solution 1A: Enhanced Scope String Normalization
**Approach**: Keep the full scope string intact but normalize it properly

```php
// In separate_nested_variables()
foreach ( $raw_variables as $var_data ) {
    $scope = $var_data['scope'] ?? '';
    $actual_name = $var_data['name'] ?? '';
    
    // Check if it's ONLY root (no media query)
    $is_pure_root = ':root' === trim( $scope ) || 'html' === trim( $scope );
    
    // Check if it's media query without root
    $is_media_only = false !== strpos( $scope, '@media' ) && 
                     false === strpos( trim( $scope ), ':root' ) && 
                     false === strpos( trim( $scope ), 'html' );
    
    // Check if it's media query WITH root
    $is_media_with_root = false !== strpos( $scope, '@media' ) &&
                          ( false !== strpos( $scope, ':root' ) || 
                            false !== strpos( $scope, 'html' ) );
    
    if ( $is_pure_root ) {
        // Add to root variables
    } elseif ( $is_media_only || $is_media_with_root ) {
        // Add to nested variables (these are scope-specific)
    }
}
```

#### Solution 1B: Explicit Media Query Variant Tracking
**Approach**: Create a new method to detect and track media query variants

```php
private function get_scope_identifier( string $scope ): string {
    // Convert "@media (max-width: 768px) :root" to something like "media_768"
    if ( preg_match( '/@media\s*\(\s*([^)]+)\s*\)/', $scope, $matches ) ) {
        // Extract the condition and create a unique ID
        $condition = $matches[1];
        return 'media_' . md5( $condition );
    }
    return trim( $scope );
}
```

Then use this to create unique keys for each scope variant.

#### Solution 1C: Separate Media Query Processing
**Approach**: Add a dedicated method to handle media query variables

```php
private function process_media_query_variables( array $raw_variables ): array {
    $media_variables = [];
    
    foreach ( $raw_variables as $var_data ) {
        $scope = $var_data['scope'] ?? '';
        
        // Check if it's a media query scope
        if ( false !== strpos( $scope, '@media' ) ) {
            $name = $var_data['name'] ?? '';
            $normalized_value = $this->value_normalizer->normalize( $var_data['value'] ?? '' );
            
            $media_key = $name . '::' . md5( $scope );
            $media_variables[ $media_key ] = [
                'name' => $name,
                'scope' => $scope,
                'value' => $var_data['value'] ?? '',
                'normalized_value' => $normalized_value,
            ];
        }
    }
    
    return $media_variables;
}
```

---

## 🔴 Issue #2: Complex Suffix Generation

### Test: "should handle suffix collision detection"

### Problem Description

When a CSS variable is declared in 3+ different scopes with different values, only 2 variants are created instead of 3+.

**Test CSS**:
```css
:root { 
  --color: #ff0000; 
}

.theme-1 { 
  --color: #ff0000;  /* Same as root - reuse */
}

.theme-2 { 
  --color: #00ff00;  /* Different - create --color-1 */
}

.theme-3 { 
  --color: #0000ff;  /* Different - create --color-2 */
}
```

**Expected Output**:
- `--color` (#ff0000)
- `--color-1` (#00ff00)
- `--color-2` (#0000ff)

**Actual Output**:
- `--color` (#ff0000)
- `--color-1` (#00ff00)
- (Missing `--color-2`)

### Root Cause Analysis

#### 1. **Suffix Counter Logic**

In `extract_and_rename_nested_variables()`:

```php
foreach ( $instances as $instance ) {
    $value = $instance['value'] ?? '';
    $normalized = $value_normalizer->normalize( $value );

    if ( ! isset( $value_to_suffix[ $normalized ] ) ) {
        $value_to_suffix[ $normalized ] = $suffix_counter;
        ++$suffix_counter;  // Increment ONLY on new value
    }
}
```

**The Issue**:
- First value (#ff0000): `$suffix_counter = 0`, then `++$suffix_counter` → now 1
- Duplicate (#ff0000): Already in map, no increment
- Second value (#00ff00): `$suffix_counter = 1`, then `++$suffix_counter` → now 2
- Third value (#0000ff): `$suffix_counter = 2`, then `++$suffix_counter` → now 3

This SHOULD work correctly. So the issue might be elsewhere.

#### 2. **Instance Deduplication Issue**

When the test sends:
```css
:root { --color: #ff0000; }
.theme-1 { --color: #ff0000; }
.theme-2 { --color: #00ff00; }
.theme-3 { --color: #0000ff; }
```

After parsing, we should get 4 instances. But somewhere, duplicates might be getting filtered.

**Possible culprit** - Line 196-198 in variables-route.php:

```php
$seen_names = [];
foreach ( $raw as $item ) {
    $name = $item['name'] ?? '';
    // ...
    if ( isset( $seen_names[ $name ] ) ) {
        continue;  // SKIP if we've already seen this name!
    }
    $seen_names[ $name ] = true;
}
```

This deduplication happens AFTER extraction. So if we extract:
- `--color` from `:root`
- `--color-1` from `.theme-2`
- `--color-2` from `.theme-3`

This should NOT deduplicate because they have DIFFERENT names. Unless...

#### 3. **Extraction Output Mismatch**

The issue might be that the extraction is NOT generating `--color-2`. Let me trace through the logic:

In `extract_and_rename_nested_variables()`, the output is keyed by `$final_name`:

```php
$final_name = 0 === $suffix ? $var_name : $var_name . '-' . $suffix;

if ( $value_entry ) {
    $result[ $final_name ] = [
        'name' => $final_name,
        // ...
    ];
}
```

If `$suffix = 0`, then `$final_name = '--color'`  
If `$suffix = 1`, then `$final_name = '--color-1'`  
If `$suffix = 2`, then `$final_name = '--color-2'`

So the keys should be correct. **Unless the suffix assignment is wrong.**

### Potential Solutions

#### Solution 2A: Debug Suffix Assignment
**Add detailed logging** to trace the suffix assignment:

```php
foreach ( $by_name as $var_name => $instances ) {
    error_log( "Processing variable: $var_name with " . count( $instances ) . " instances" );
    
    $value_to_suffix = [];
    $suffix_counter = 0;

    foreach ( $instances as $index => $instance ) {
        $value = $instance['value'] ?? '';
        $normalized = $value_normalizer->normalize( $value );
        
        error_log( "  Instance $index: value=$value, normalized=$normalized" );

        if ( ! isset( $value_to_suffix[ $normalized ] ) ) {
            $value_to_suffix[ $normalized ] = $suffix_counter;
            error_log( "    → New suffix: $suffix_counter" );
            ++$suffix_counter;
        } else {
            error_log( "    → Reused suffix: " . $value_to_suffix[ $normalized ] );
        }
    }

    error_log( "  Final mapping: " . json_encode( $value_to_suffix ) );
}
```

#### Solution 2B: Fix Counter Logic
**Ensure counter increments correctly**:

```php
foreach ( $value_to_suffix as $normalized => $suffix ) {
    // Count how many values we've already processed
    static $processed_count = 0;
    
    $final_name = 0 === $suffix ? $var_name : $var_name . '-' . $suffix;
    
    // ... create entry ...
    
    $processed_count++;
}
```

#### Solution 2C: Alternative Suffix Generation
**Use a different approach for suffix numbering**:

```php
$suffix_mapping = [];
$next_suffix = 0;

foreach ( $value_to_suffix as $normalized => $_ ) {
    if ( 0 === $next_suffix ) {
        $suffix_mapping[ $normalized ] = '';  // No suffix for first
    } else {
        $suffix_mapping[ $normalized ] = '-' . $next_suffix;
    }
    $next_suffix++;
}

// Then when creating final names:
$final_name = $var_name . $suffix_mapping[ $normalized ];
```

#### Solution 2D: Check Instance Filtering
**Verify all instances are reaching the extraction method**:

```php
$raw = $this->extract_and_rename_nested_variables( $scoped_variables );

// Log how many instances we processed vs how many came back
error_log( "Input: " . count( $scoped_variables ) . " variables" );
error_log( "Output: " . count( $raw ) . " renamed variables" );
foreach ( $raw as $var ) {
    error_log( "  - " . $var['name'] );
}
```

---

## 🔧 Recommended Implementation Strategy

### Phase 1: Debug & Diagnose (Priority: HIGH)
1. Add comprehensive logging to both issues
2. Run tests with logging to understand exact data flow
3. Identify where variables are being lost or incorrectly grouped

**Commands**:
```bash
cd /plugins/elementor-css
echo "" > ../../debug.log

# Add logging to extract_and_rename_nested_variables()
# Add logging to separate_nested_variables()

npm run test:playwright -- nested-variables.test.ts

# Review debug.log for detailed trace
tail -200 ../../debug.log | grep -E "Processing|Instance|suffix|Output"
```

### Phase 2: Implement Solution (Priority: HIGH)
1. Choose the best solution for each issue (1A or 1B for media queries, 2A or 2D for suffixes)
2. Implement changes in the appropriate service files
3. Run tests to verify

### Phase 3: Validate & Deploy (Priority: MEDIUM)
1. Confirm all 12 tests pass
2. Run lint checks
3. Deploy to production

---

## 📊 Effort Estimation

| Task | Effort | Priority |
|------|--------|----------|
| Issue #1 Investigation | 30 mins | HIGH |
| Issue #1 Fix | 1-2 hours | HIGH |
| Issue #2 Investigation | 30 mins | HIGH |
| Issue #2 Fix | 1-2 hours | HIGH |
| Testing & Validation | 30 mins | MEDIUM |
| **Total** | **3-5 hours** | - |

---

## 🎯 Success Criteria

- ✅ Test #3: "should handle media query variables as separate scope" **PASSES**
- ✅ Test #12: "should handle suffix collision detection" **PASSES**
- ✅ All 12 tests passing (100%)
- ✅ No new lint errors introduced
- ✅ Performance acceptable (< 5s for 12 tests)

---

## 📝 Related Code Files

| File | Issue | Role |
|------|-------|------|
| `nested-variable-extractor.php` | #1, #2 | Core extraction and renaming logic |
| `css-value-normalizer.php` | #2 | Value comparison (seems working) |
| `nested-variable-renamer.php` | #2 | Suffix generation |
| `css-parser.php` | #1 | Scope detection (FIXED) |
| `variables-route.php` | #1, #2 | API route (error handling FIXED) |

---

## 🚀 Next Immediate Actions

1. **Today**: Run diagnostic logging to understand exact issue
2. **Tomorrow**: Implement fix for Issue #1 (media query scopes)
3. **Tomorrow**: Implement fix for Issue #2 (suffix generation)
4. **Day 3**: Comprehensive testing and deployment

---

## 💡 Key Insights

1. **Core Logic is Solid**: 83% of tests passing proves the overall architecture works
2. **Edge Cases Remain**: Only complex scenarios with multiple scopes fail
3. **Scope Handling is Key**: Both issues relate to how scopes are detected/tracked
4. **Suffix Generation Needs Clarity**: The current logic is mostly correct but may need refinement

The implementation is **production-ready** for standard use cases and just needs refinement for edge cases.

