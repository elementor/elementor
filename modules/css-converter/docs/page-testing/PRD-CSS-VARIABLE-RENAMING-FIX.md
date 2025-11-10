# PRD: CSS Variable Renaming Fix (`--e-global-` → `--ec-global-`)

**Date**: 2025-11-04  
**Status**: Draft  
**Priority**: HIGH  
**Complexity**: Low  

---

## Problem Statement

CSS variables with the Elementor global prefix (`--e-global-*`) are not being renamed to the Elementor Commerce prefix (`--ec-global-*`), causing variables to remain unresolved in the output CSS.

### Observed Behavior

**Input CSS**:
```css
.elementor-heading-title {
    color: var(--e-global-color-e66ebc9);
    font-weight: var(--e-global-typography-primary-font-weight);
}
```

**Current Output** (❌ Wrong):
```css
.elementor .e-b6778a2-5c75af9 {
    color: var(--e-global-color-e66ebc9);                    /* NOT renamed */
    font-weight: var(--e-global-typography-primary-font-weight); /* NOT renamed */
}
```

**Expected Output** (✅ Correct):
```css
.elementor .e-b6778a2-5c75af9 {
    color: var(--ec-global-color-e66ebc9);                   /* Renamed to --ec-global- */
    font-weight: var(--ec-global-typography-primary-font-weight); /* Renamed to --ec-global- */
}
```

---

## Root Cause Analysis

### Evidence: Function Exists But Is Commented Out

**File**: `unified-css-processor.php`  
**Line**: 1392 (in `parse_css_sources_safely()`)

```php
try {
    $sanitized_content = $this->sanitize_css_for_parsing( $content );
    // $sanitized_content = $this->rename_elementor_css_variables( $sanitized_content );  // ← COMMENTED OUT!
    
    if ( null !== $this->css_parser ) {
        try {
            $parsed = $this->css_parser->parse( $sanitized_content );
```

**The Function Exists** (Line 2000-2002):
```php
private function rename_elementor_css_variables( string $css ): string {
    return preg_replace( '/--e-global-/', '--ec-global-', $css );
}
```

**Status**: ✅ Function implemented correctly  
**Issue**: ❌ Function not being called (commented out)

### Why Was It Commented Out?

Looking at the git history or comments, this was likely disabled due to:
1. **Testing/Debugging**: Temporarily disabled to isolate variable issues
2. **Incomplete Implementation**: Variables weren't being resolved, so renaming was disabled
3. **Breaking Changes**: Renaming might have broken something else

### Impact of Not Renaming

1. **Variable Definitions Don't Match References**:
   ```php
   // Definitions extracted as:
   $definitions['ec-global-color-e66ebc9'] = '#ff0000';  // Cleaned and renamed
   
   // References remain as:
   var(--e-global-color-e66ebc9)  // NOT renamed
   
   // Result: No match → variable not resolved
   ```

2. **CSS Variable Resolver Fails**:
   - Resolver looks for `--e-global-color-e66ebc9` in definitions
   - Definitions only have `ec-global-color-e66ebc9` (cleaned)
   - No match found → variable remains unresolved

3. **Browser Must Resolve**:
   - Variables stay in output CSS
   - Browser/Elementor must have the variable defined
   - If not defined → fallback to initial value or broken styling

---

## Solution Design

### Option 1: Enable Renaming at CSS Input (Recommended)

**File**: `unified-css-processor.php`  
**Line**: 1392

**Change**:
```php
// BEFORE (commented out):
// $sanitized_content = $this->rename_elementor_css_variables( $sanitized_content );

// AFTER (enabled):
$sanitized_content = $this->rename_elementor_css_variables( $sanitized_content );
```

**Pros**:
- ✅ Simple one-line fix
- ✅ Function already exists and is correct
- ✅ Applies to ALL CSS sources consistently
- ✅ Happens early in pipeline (before parsing)

**Cons**:
- ⚠️ Need to verify it doesn't break variable resolution
- ⚠️ Need to check if definitions are also being renamed

### Option 2: Rename During Variable Definition Storage

**File**: `unified-css-processor.php`  
**Method**: `store_css_variable_definition()`

**Current**:
```php
private function store_css_variable_definition( string $variable_name, string $value, string $selector ): void {
    // Stores as-is
    $this->css_variable_definitions[ $variable_name ] = [ ... ];
}
```

**Enhanced**:
```php
private function store_css_variable_definition( string $variable_name, string $value, string $selector ): void {
    // Rename before storing
    $renamed_variable = str_replace( '--e-global-', '--ec-global-', $variable_name );
    
    $this->css_variable_definitions[ $renamed_variable ] = [
        'name' => $renamed_variable,  // Use renamed name
        'value' => $value,
        'selector' => $selector,
        'source' => 'extracted_from_css',
    ];
}
```

**Pros**:
- ✅ Ensures definitions use `--ec-global-` naming
- ✅ Works even if input CSS isn't renamed

**Cons**:
- ❌ Only renames definitions, not references
- ❌ Still needs input renaming for consistency

### Option 3: Rename During Variable Resolution

**File**: `css-variable-resolver.php`  
**Method**: `get_variable_value()`

**Current**:
```php
private function get_variable_value( string $var_name, array $variable_definitions ): ?string {
    $clean_name = ltrim( $var_name, '-' );
    
    if ( isset( $variable_definitions[ $clean_name ] ) ) {
        return $variable_definitions[ $clean_name ]['value'] ?? '';
    }
    
    return null;
}
```

**Enhanced**:
```php
private function get_variable_value( string $var_name, array $variable_definitions ): ?string {
    $clean_name = ltrim( $var_name, '-' );
    
    // Try exact match first
    if ( isset( $variable_definitions[ $clean_name ] ) ) {
        return $variable_definitions[ $clean_name ]['value'] ?? '';
    }
    
    // Try with --e-global- renamed to --ec-global-
    $renamed_clean = str_replace( 'e-global-', 'ec-global-', $clean_name );
    if ( isset( $variable_definitions[ $renamed_clean ] ) ) {
        return $variable_definitions[ $renamed_clean ]['value'] ?? '';
    }
    
    return null;
}
```

**Pros**:
- ✅ Fallback mechanism if renaming is inconsistent
- ✅ Doesn't break if input CSS isn't renamed

**Cons**:
- ❌ Adds lookup overhead
- ❌ Band-aid solution, not addressing root cause

---

## Recommended Solution

**Use Option 1** (Enable renaming at CSS input) **+ Option 2** (Rename during definition storage)

### Implementation Plan

#### Step 1: Enable Input Renaming

**File**: `unified-css-processor.php`, Line 1392

```php
try {
    $sanitized_content = $this->sanitize_css_for_parsing( $content );
    $sanitized_content = $this->rename_elementor_css_variables( $sanitized_content );  // ← ENABLE THIS
    
    if ( null !== $this->css_parser ) {
```

**Also Enable in**: `variables-route.php`, Line 92

```php
$css = $this->remove_utf8_bom( $css );
$css = $this->rename_elementor_css_variables( $css );  // ← ENABLE THIS

$logs_dir = $this->ensure_logs_directory();
```

#### Step 2: Verify Variable Definition Cleaning

**File**: `css-variables-processor.php`  
**Method**: `clean_variable_name()`

Ensure it handles both `--e-global-` and `--ec-global-` consistently:

```php
private function clean_variable_name( string $var_name ): string {
    // Remove leading dashes
    $clean = ltrim( $var_name, '-' );
    
    // Ensure --e-global- is renamed to --ec-global-
    if ( strpos( $clean, 'e-global-' ) === 0 ) {
        $clean = str_replace( 'e-global-', 'ec-global-', $clean );
    }
    
    return $clean;
}
```

#### Step 3: Add Logging

**File**: `unified-css-processor.php`

```php
private function rename_elementor_css_variables( string $css ): string {
    $renamed = preg_replace( '/--e-global-/', '--ec-global-', $css );
    
    // Log how many were renamed
    $count = substr_count( $css, '--e-global-' );
    if ( $count > 0 ) {
        error_log( "CSS Variables: Renamed {$count} --e-global- variables to --ec-global-" );
    }
    
    return $renamed;
}
```

---

## Testing Plan

### Test Case 1: Basic Variable Renaming

**Input CSS**:
```css
.test {
    color: var(--e-global-color-primary);
}
```

**Expected Output**:
```css
.test {
    color: var(--ec-global-color-primary);
}
```

**Verification**:
1. Check sanitized CSS has `--ec-global-`
2. Check variable definitions use `ec-global-color-primary` as key
3. Check variable resolver finds the definition

### Test Case 2: Variable Definition and Reference

**Input CSS**:
```css
:root {
    --e-global-color-primary: #ff0000;
}

.heading {
    color: var(--e-global-color-primary);
}
```

**Expected**:
1. Definition stored as: `ec-global-color-primary: #ff0000`
2. Reference renamed to: `var(--ec-global-color-primary)`
3. Resolver matches and resolves to: `color: #ff0000`

### Test Case 3: Mixed Variables

**Input CSS**:
```css
.test {
    color: var(--e-global-color-primary);       /* Should rename */
    background: var(--custom-local-color);       /* Should NOT rename */
    border-color: var(--ec-global-color-accent); /* Already correct */
}
```

**Expected**:
- `--e-global-color-primary` → `--ec-global-color-primary`
- `--custom-local-color` → unchanged
- `--ec-global-color-accent` → unchanged

### Test Case 4: Typography Variables

**Input CSS**:
```css
.heading {
    font-family: var(--e-global-typography-primary-font-family);
    font-weight: var(--e-global-typography-primary-font-weight);
    font-size: var(--e-global-typography-primary-font-size);
}
```

**Expected**:
All three variables renamed to `--ec-global-typography-*`

---

## Success Criteria

1. ✅ **All `--e-global-` variables renamed**: To `--ec-global-` in CSS input
2. ✅ **Variable definitions match references**: Both use `--ec-global-` naming
3. ✅ **Variables resolve correctly**: Resolver finds definitions and replaces values
4. ✅ **Non-Elementor variables unchanged**: Custom variables not affected
5. ✅ **Logging confirms renaming**: Debug logs show count of renamed variables

---

## Rollout Plan

### Phase 1: Enable in Development (Immediate)

1. Uncomment line 1392 in `unified-css-processor.php`
2. Uncomment line 92 in `variables-route.php`
3. Add logging to `rename_elementor_css_variables()`
4. Test with oboxthemes.com conversion

### Phase 2: Verify Resolution (Next)

1. Check `/wp-content/css-property-tracking.log` for variable resolution
2. Verify variables are being resolved to actual values
3. Check output CSS has resolved values, not variables

### Phase 3: Handle Unresolved Variables (If Needed)

If some variables still aren't resolved:
1. Check if Kit CSS is being included
2. Verify variable definitions are extracted correctly
3. Add fallback to preserve unresolved variables

---

## Related Issues

### This Fix Addresses:

1. **Issue #2 from 0-0---variables.md**: CSS Variables Not Resolved
   - Root cause: Variables not renamed, so definitions don't match references
   - Fix: Enable renaming to ensure consistency

2. **Variable Resolution Pipeline**:
   ```
   Input CSS
   ↓ rename_elementor_css_variables()  ← FIX HERE
   ↓ CSS Parsing
   ↓ Variable Registry (stores as --ec-global-)
   ↓ Variable Resolver (looks for --ec-global-)
   ↓ Output CSS (should have resolved values)
   ```

### Still To Address:

1. **Font-weight Duplication** (PRD-CSS-VARIABLE-PROPERTY-DUPLICATION.md)
   - Separate issue at style resolution stage
   - Will fix after variables are resolving correctly

---

## Risk Assessment

### Low Risk Changes

- ✅ Enabling existing, tested function
- ✅ Simple string replacement
- ✅ Already used in codebase (just commented out)

### Potential Issues

1. **Variable definitions not found**:
   - If Kit CSS not included, variables still won't resolve
   - Solution: Add logging to track missing definitions

2. **Breaking existing functionality**:
   - Function was commented out for a reason
   - Mitigation: Test thoroughly before deploying

3. **Performance impact**:
   - Regex replacement on entire CSS string
   - Impact: Minimal (runs once per CSS source)

---

## Documentation Updates

After implementation, update:

1. **0-0---variables.md**: Mark Issue #2 as FIXED
2. **CSS-VARIABLE-PROCESSING-ANALYSIS.md**: Add renaming step to flow
3. **FINAL-STATUS.md**: Update with renaming implementation

---

## Future Enhancements

1. **Configurable Prefix**: Support custom variable prefixes
2. **Bidirectional Mapping**: Map both `--e-global-` and `--ec-global-` to same definition
3. **Variable Fallbacks**: Support fallback values in `var()` calls
4. **Cache Renamed CSS**: Avoid re-processing same CSS multiple times



