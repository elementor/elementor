# Stash Change Groups

## Group 1: CSS Variable Extraction - Generic Patterns
**Purpose**: Extract all CSS variables (--*) from Kit CSS, not just --ec-global-

### Files:
- `css-variable-registry-processor.php` (lines 191-201, 216-218)
- `css-variables-processor.php` (lines 440-442, 482, 485-487, 562)

### Changes:
- Changed pattern from `--ec-global-` to `--[a-zA-Z0-9-]+`
- Changed pattern from `--e-global-` to `--[a-zA-Z0-9-]+`
- Removed `hasEGlobal` checks, only checking for `--` prefix

---

## Group 2: CSS Variable Resolver - Remove WordPress Fetch
**Purpose**: Remove --e-global to --ec-global renaming and WordPress DB lookup

### Files:
- `css-variable-resolver.php` (lines 145-167, 170-220, 223-233, 247-249, 261-283)

### Changes:
- Removed `fetch_global_variable_from_wp()` method
- Removed `fetch_global_color()` method  
- Removed `fetch_global_typography()` method
- Removed WordPress fetch logic in `get_variable_value()`
- Updated `get_variable_type()` to only check `--ec-global-` (not `--e-global-`)
- Updated `is_global_variable()` to only check `--ec-global-` prefixes

---

## Group 3: Pre-Extracted CSS Rules (Fix Parsing Failures)
**Purpose**: Extract rules from individual CSS sources to avoid re-parsing combined CSS

### Files:
- `unified-css-processor.php` (lines 22, 1454, 1467-1499, 2103-2107)
- `css-parsing-processor.php` (lines 40-41, 50-67)
- `unified-widget-conversion-service.php` (lines 77-79)

### Changes:
- Added `extracted_rules_from_sources` property to `Unified_Css_Processor`
- Modified `parse_css_sources_safely()` to extract rules from each source
- Added `get_extracted_rules_from_sources()` method
- Modified `Css_Parsing_Processor` to use pre-extracted rules if available
- Modified conversion service to pass pre-extracted rules to processor

---

## Group 4: Widget Class Processor - Exclude Kit CSS (REVERTED BY USER)
**Purpose**: Prevent Kit CSS classes from being treated as widget classes

### Files:
- `widget-class-processor.php` (lines 155-165)

### Changes:
- Added exclusion for `elementor-kit-\d+` pattern
- Added exclusion for `elementor-\d+` (digits only) pattern

**Status**: User reverted this change

---

## Group 5: Nested Element Selector Processor - Skip Kit CSS
**Purpose**: Prevent Kit CSS element selectors from being applied

### Files:
- `nested-element-selector-processor.php` (lines 93-105)

### Changes:
- Skip standalone `.elementor-kit-\d+$` selectors
- Skip standalone `.elementor-\d+$` selectors  
- Skip `.elementor-kit-\d+\s+[a-z]+` (Kit CSS + element tag)

---

## Group 6: Test Updates
**Purpose**: Use environment-based URLs

### Files:
- `selector-matcher-general-solution.test.ts` (lines 7, 22-24, 43, 151)

### Changes:
- Use `baseUrl` and `apiUrl` from environment
- Remove hardcoded port




