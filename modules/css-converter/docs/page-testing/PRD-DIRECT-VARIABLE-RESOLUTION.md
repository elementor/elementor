# PRD: Direct CSS Variable Resolution (Simplified Approach)

**Date**: 2025-11-04  
**Status**: Draft  
**Priority**: HIGH  
**Complexity**: Medium  

---

## Problem Statement

Current approach keeps CSS variables in output, causing:
1. **Property Duplication**: `font-weight: 400` + `font-weight: var(--ec-global-*)`
2. **Runtime Dependency**: Browser must resolve variables at runtime
3. **Complex Debugging**: Variables may not be defined, causing fallbacks

### Current Output (❌ Complex)
```css
.elementor .e-d3079cb-fb727dc {
    font-weight: 400;                                            /* Duplicate 1 */
    color: var(--ec-global-color-e66ebc9);                      /* Variable */
    font-weight: var(--ec-global-typography-primary-font-weight); /* Duplicate 2 */
}
```

### Proposed Output (✅ Simplified)
```css
.elementor .e-d3079cb-fb727dc {
    color: #ff6b35;        /* Resolved value */
    font-weight: 700;      /* Single resolved value */
}
```

---

## Solution Overview

**Convert `--e-global-*` variables directly to their actual values** instead of preserving them as CSS variables.

### Benefits
1. ✅ **Eliminates Duplication**: Only resolved values, no variable conflicts
2. ✅ **Better Performance**: No runtime variable resolution needed
3. ✅ **Cleaner Output**: Simple CSS with actual values
4. ✅ **No Dependencies**: Works without Elementor Kit CSS being loaded
5. ✅ **Easier Debugging**: Clear values instead of variable references

---

## Implementation Strategy

### Current Flow (Complex)
```
CSS Input: color: var(--e-global-color-e66ebc9);
↓ rename_elementor_css_variables()
CSS: color: var(--ec-global-color-e66ebc9);
↓ CSS Variable Resolver (tries to resolve)
CSS: color: var(--ec-global-color-e66ebc9); (if definition not found)
↓ Property Conversion
Atomic: color: "var(--ec-global-color-e66ebc9)"
↓ CSS Output
Final: color: var(--ec-global-color-e66ebc9);
```

### Proposed Flow (Simplified)
```
CSS Input: color: var(--e-global-color-e66ebc9);
↓ Enhanced CSS Variable Resolver
CSS: color: #ff6b35; (resolved to actual value)
↓ Property Conversion
Atomic: color: "#ff6b35"
↓ CSS Output
Final: color: #ff6b35;
```

---

## Technical Implementation

### Option 1: Enhance Existing CSS Variable Resolver (Recommended)

**File**: `css-variable-resolver.php`

**Current Logic**:
```php
private function resolve_variable_reference( string $value, array $variable_definitions ): string {
    return preg_replace_callback(
        '/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/',
        function( $matches ) use ( $variable_definitions ) {
            $var_name = trim( $matches[1] );
            $resolved_value = $this->get_variable_value( $var_name, $variable_definitions );
            
            if ( $resolved_value !== null ) {
                return $resolved_value;  // ✅ This already works!
            }
            
            return $matches[0];  // ❌ Keep as variable if not found
        },
        $value
    );
}
```

**Enhanced Logic**:
```php
private function resolve_variable_reference( string $value, array $variable_definitions ): string {
    return preg_replace_callback(
        '/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/',
        function( $matches ) use ( $variable_definitions ) {
            $var_name = trim( $matches[1] );
            $fallback = $matches[2] ?? '';
            
            // Try to resolve from definitions
            $resolved_value = $this->get_variable_value( $var_name, $variable_definitions );
            
            if ( $resolved_value !== null ) {
                return $resolved_value;  // ✅ Return actual value
            }
            
            // NEW: Try to fetch from WordPress/Elementor if it's a global variable
            if ( $this->is_global_variable( $var_name ) ) {
                $wp_resolved = $this->fetch_global_variable_from_wp( $var_name );
                if ( $wp_resolved !== null ) {
                    return $wp_resolved;  // ✅ Return WordPress value
                }
            }
            
            // Use fallback if provided
            if ( ! empty( $fallback ) ) {
                return trim( $fallback );
            }
            
            // NEW: For global variables, provide sensible defaults instead of keeping variable
            if ( $this->is_global_variable( $var_name ) ) {
                return $this->get_global_variable_default( $var_name );
            }
            
            return $matches[0];  // Keep as variable for non-global variables
        },
        $value
    );
}
```

### Option 2: Pre-populate Variable Definitions

**Approach**: Fetch all Elementor global variables from WordPress before processing

**Implementation**:
```php
// In css-variable-registry-processor.php
public function process( Css_Processing_Context $context ): Css_Processing_Context {
    // Existing logic...
    
    // NEW: Fetch Elementor global variables from WordPress
    $wp_global_variables = $this->fetch_elementor_global_variables();
    $this->css_variable_definitions = array_merge( 
        $this->css_variable_definitions, 
        $wp_global_variables 
    );
    
    // Continue with existing logic...
}

private function fetch_elementor_global_variables(): array {
    $global_variables = [];
    
    // Fetch from Elementor Kit
    $kit_id = get_option( 'elementor_active_kit' );
    if ( $kit_id ) {
        $kit_settings = get_post_meta( $kit_id, '_elementor_page_settings', true );
        
        // Extract global colors
        if ( isset( $kit_settings['system_colors'] ) ) {
            foreach ( $kit_settings['system_colors'] as $color ) {
                $var_name = 'ec-global-color-' . $color['_id'];
                $global_variables[ $var_name ] = [
                    'name' => '--ec-global-color-' . $color['_id'],
                    'value' => $color['color'] ?? '#000000',
                    'type' => 'color',
                    'source' => 'elementor_kit'
                ];
            }
        }
        
        // Extract global typography
        if ( isset( $kit_settings['system_typography'] ) ) {
            foreach ( $kit_settings['system_typography'] as $typo ) {
                $base_name = 'ec-global-typography-' . $typo['_id'];
                
                if ( isset( $typo['typography_font_weight'] ) ) {
                    $global_variables[ $base_name . '-font-weight' ] = [
                        'name' => '--ec-global-typography-' . $typo['_id'] . '-font-weight',
                        'value' => $typo['typography_font_weight'],
                        'type' => 'font-weight',
                        'source' => 'elementor_kit'
                    ];
                }
                
                if ( isset( $typo['typography_font_size'] ) ) {
                    $size_value = $typo['typography_font_size']['size'] . ($typo['typography_font_size']['unit'] ?? 'px');
                    $global_variables[ $base_name . '-font-size' ] = [
                        'name' => '--ec-global-typography-' . $typo['_id'] . '-font-size',
                        'value' => $size_value,
                        'type' => 'font-size',
                        'source' => 'elementor_kit'
                    ];
                }
            }
        }
    }
    
    return $global_variables;
}
```

---

## Recommended Implementation

**Use Option 1** (Enhance CSS Variable Resolver) with fallbacks:

### Step 1: Add Global Variable Fetching

```php
// In css-variable-resolver.php
private function fetch_global_variable_from_wp( string $var_name ): ?string {
    // Clean variable name (remove -- prefix, convert e-global to ec-global)
    $clean_name = ltrim( $var_name, '-' );
    $clean_name = str_replace( 'e-global-', 'ec-global-', $clean_name );
    
    // Parse variable type and ID
    if ( preg_match( '/ec-global-color-([a-zA-Z0-9]+)/', $clean_name, $matches ) ) {
        return $this->fetch_global_color( $matches[1] );
    }
    
    if ( preg_match( '/ec-global-typography-([a-zA-Z0-9]+)-([a-z-]+)/', $clean_name, $matches ) ) {
        return $this->fetch_global_typography( $matches[1], $matches[2] );
    }
    
    return null;
}

private function fetch_global_color( string $color_id ): ?string {
    $kit_id = get_option( 'elementor_active_kit' );
    if ( ! $kit_id ) return null;
    
    $kit_settings = get_post_meta( $kit_id, '_elementor_page_settings', true );
    if ( ! isset( $kit_settings['system_colors'] ) ) return null;
    
    foreach ( $kit_settings['system_colors'] as $color ) {
        if ( $color['_id'] === $color_id ) {
            return $color['color'] ?? null;
        }
    }
    
    return null;
}

private function fetch_global_typography( string $typo_id, string $property ): ?string {
    $kit_id = get_option( 'elementor_active_kit' );
    if ( ! $kit_id ) return null;
    
    $kit_settings = get_post_meta( $kit_id, '_elementor_page_settings', true );
    if ( ! isset( $kit_settings['system_typography'] ) ) return null;
    
    foreach ( $kit_settings['system_typography'] as $typo ) {
        if ( $typo['_id'] === $typo_id ) {
            switch ( $property ) {
                case 'font-weight':
                    return $typo['typography_font_weight'] ?? null;
                case 'font-size':
                    if ( isset( $typo['typography_font_size'] ) ) {
                        $size = $typo['typography_font_size'];
                        return $size['size'] . ($size['unit'] ?? 'px');
                    }
                    return null;
                case 'font-family':
                    return $typo['typography_font_family'] ?? null;
            }
        }
    }
    
    return null;
}
```

### Step 2: Add Sensible Defaults

```php
private function get_global_variable_default( string $var_name ): string {
    $clean_name = ltrim( $var_name, '-' );
    
    // Color defaults
    if ( strpos( $clean_name, 'global-color-' ) !== false ) {
        return '#000000';  // Default to black
    }
    
    // Typography defaults
    if ( strpos( $clean_name, 'typography' ) !== false ) {
        if ( strpos( $clean_name, 'font-weight' ) !== false ) {
            return '400';  // Default font weight
        }
        if ( strpos( $clean_name, 'font-size' ) !== false ) {
            return '16px';  // Default font size
        }
        if ( strpos( $clean_name, 'font-family' ) !== false ) {
            return 'Arial, sans-serif';  // Default font family
        }
    }
    
    return 'initial';  // CSS initial value
}
```

### Step 3: Add Logging

```php
private function resolve_variable_reference( string $value, array $variable_definitions ): string {
    $log_path = WP_CONTENT_DIR . '/css-variable-resolution.log';
    
    return preg_replace_callback(
        '/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/',
        function( $matches ) use ( $variable_definitions, $log_path ) {
            $var_name = trim( $matches[1] );
            $original_var = $matches[0];
            
            // Try definitions first
            $resolved_value = $this->get_variable_value( $var_name, $variable_definitions );
            
            if ( $resolved_value !== null ) {
                file_put_contents(
                    $log_path,
                    date( 'Y-m-d H:i:s' ) . " RESOLVED (definitions): {$original_var} → {$resolved_value}\n",
                    FILE_APPEND
                );
                return $resolved_value;
            }
            
            // Try WordPress fetch
            if ( $this->is_global_variable( $var_name ) ) {
                $wp_resolved = $this->fetch_global_variable_from_wp( $var_name );
                if ( $wp_resolved !== null ) {
                    file_put_contents(
                        $log_path,
                        date( 'Y-m-d H:i:s' ) . " RESOLVED (WordPress): {$original_var} → {$wp_resolved}\n",
                        FILE_APPEND
                    );
                    return $wp_resolved;
                }
                
                // Use default
                $default_value = $this->get_global_variable_default( $var_name );
                file_put_contents(
                    $log_path,
                    date( 'Y-m-d H:i:s' ) . " RESOLVED (default): {$original_var} → {$default_value}\n",
                    FILE_APPEND
                );
                return $default_value;
            }
            
            file_put_contents(
                $log_path,
                date( 'Y-m-d H:i:s' ) . " UNRESOLVED: {$original_var} (keeping as variable)\n",
                FILE_APPEND
            );
            
            return $original_var;
        },
        $value
    );
}
```

---

## Expected Results

### Test Case: oboxthemes.com

**Before (Current)**:
```css
.elementor .e-d3079cb-fb727dc {
    font-weight: 400;                                            /* Duplicate */
    color: var(--ec-global-color-e66ebc9);                      /* Variable */
    font-weight: var(--ec-global-typography-primary-font-weight); /* Duplicate */
}
```

**After (Proposed)**:
```css
.elementor .e-d3079cb-fb727dc {
    color: #ff6b35;        /* Resolved from Elementor Kit */
    font-weight: 700;      /* Resolved, no duplication */
}
```

### Benefits Achieved

1. ✅ **No Property Duplication**: Only one `font-weight` value
2. ✅ **Actual Values**: `#ff6b35` instead of `var(--ec-global-color-*)`
3. ✅ **Better Performance**: No runtime variable resolution
4. ✅ **Cleaner CSS**: Easier to debug and understand
5. ✅ **Self-Contained**: Works without external CSS dependencies

---

## Migration Strategy

### Phase 1: Implement Enhanced Resolution
1. Add WordPress variable fetching to `css-variable-resolver.php`
2. Add sensible defaults for unresolved variables
3. Add comprehensive logging

### Phase 2: Test and Validate
1. Test with oboxthemes.com conversion
2. Verify no property duplication
3. Check that colors/typography match original design
4. Validate performance improvement

### Phase 3: Rollback Plan
If issues arise:
1. Add feature flag: `enable_direct_variable_resolution`
2. Default to current behavior (preserve variables)
3. Allow gradual migration

---

## Success Criteria

1. ✅ **Zero Property Duplication**: Each CSS property appears only once
2. ✅ **All Variables Resolved**: No `var(--*)` in output CSS for global variables
3. ✅ **Correct Values**: Colors and typography match original design
4. ✅ **Performance**: Faster CSS parsing (no runtime resolution)
5. ✅ **Maintainability**: Cleaner, more debuggable CSS output

---

## Future Enhancements

1. **Cache Variable Values**: Avoid repeated WordPress queries
2. **Batch Fetching**: Get all global variables in one query
3. **Custom Variable Support**: Handle theme-specific variables
4. **Validation**: Ensure resolved values are valid CSS

