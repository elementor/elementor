# Nested CSS Variables: Rename Strategy

## Overview

When extracting CSS variables from stylesheets, the same variable name can appear in different scopes with different values. This document defines how to detect and handle these "nested" (scope-specific) variables by renaming them with numeric suffixes.

**Strategy**: Keep all variable declarations, rename conflicts to `-1`, `-2`, etc. matching the class deduplication pattern.

---

## 1. Variable Scope Detection

### Primary Source: :root{}

Extract variables declared at the global scope first:

```css
:root {
  --primary-color: #007bff;
  --spacing-unit: 8px;
  --font-size-base: 16px;
}
```

Result:
```json
{
  "--primary-color": "#007bff",
  "--spacing-unit": "8px",
  "--font-size-base": "16px"
}
```

---

## 2. Nested Variables: Same Name, Different Scope

### Pattern Recognition

When a variable appears in multiple scopes with different values:

```css
:root {
  --primary-color: #007bff;
}

.light-theme {
  --primary-color: #ffffff;
}

.dark-theme {
  --primary-color: #1a1a1a;
}
```

### Detection Algorithm

1. Extract all variables from `:root{}`
2. Scan all other selectors for same variable names
3. For each duplicate found:
   - If value differs from :root version → require rename
   - If value identical to :root version → reuse existing

### Rename Process

Create new variable names with numeric suffixes:

```json
{
  "--primary-color": "#007bff",
  "--primary-color-1": "#ffffff",
  "--primary-color-2": "#1a1a1a"
}
```

**Naming Convention**:
- `:root` version = base name (no suffix)
- First nested occurrence = `-1`
- Second nested occurrence = `-2`
- Continue incrementing as needed

---

## 3. Usage Tracking Within Scopes

After renaming, track which variable is used in which scope:

```css
:root {
  --primary-color: #007bff;
}

.light-theme {
  --primary-color-1: #ffffff;
  background: var(--primary-color-1);  /* Updated reference */
}

.dark-theme {
  --primary-color-2: #1a1a1a;
  background: var(--primary-color-2);  /* Updated reference */
}
```

**Important**: When renaming a variable, also update all `var()` references within that scope.

---

## 4. Comparison Logic: Identical vs. Different

### Comparison Rules (from @1-AVOID-CLASS-DUPLICATION.md)

For each variable occurrence:

**Step 1**: Check if already exists in system
- If NO → Use base name or next available suffix
- If YES → Compare values

**Step 2**: Compare Values
- Parse value (remove whitespace, normalize)
- Compare normalized values
- Handle shorthand properties (if applicable)

**Step 3**: Decision

| Scenario | Action |
|----------|--------|
| New variable, no conflicts | Use base name |
| Duplicate name, identical value | Reuse existing variable |
| Duplicate name, different value | Create with suffix (test all variants) |
| Suffix collision exists | Increment to next available number |

### Example: Value Comparison

```css
:root {
  --color: #ff0000;
}

.theme-1 {
  --color: #ff0000;  /* Same value → reuse --color */
}

.theme-2 {
  --color: #00ff00;  /* Different value → create --color-1 */
}

.theme-3 {
  --color: #00ff00;  /* Same as theme-2 → reuse --color-1 */
}
```

Result:
```json
{
  "--color": "#ff0000",
  "--color-1": "#00ff00"
}
```

---

## 5. Suffix Collision Resolution

### Problem: What if `-1` already exists?

```css
:root {
  --size: 10px;
  --size-1: 20px;  /* Manually defined! */
}

.variant {
  --size: 15px;  /* Needs to become --size-? */
}
```

### Solution: Check All Existing Variants

**Algorithm**:
1. Get base variable name: `--size`
2. Collect existing variants: `--size`, `--size-1`, (next check: `--size-2`, etc.)
3. Find first available suffix slot

```json
{
  "--size": "10px",
  "--size-1": "20px",
  "--size-2": "15px"  /* New variant uses next available slot */
}
```

### Implementation

```
find_next_suffix(base_name, existing_variables):
  suffix = 0
  while (base_name + '-' + suffix) exists in existing_variables:
    suffix++
  return suffix
```

---

## 6. Variable Extraction Workflow

### Full Example with Multiple Scopes

Input CSS:
```css
:root {
  --primary: #007bff;
  --padding: 16px;
}

.theme-light {
  --primary: #ffffff;
  padding: var(--primary);
}

.theme-dark {
  --primary: #1a1a1a;
  padding: var(--primary);
}

.custom-variant {
  --primary: #ff6b6b;
  padding: var(--primary);
}
```

### Step-by-Step Processing

**Step 1: Extract :root**
```json
{
  "--primary": "#007bff",
  "--padding": "16px"
}
```

**Step 2: Scan other selectors**
```
.theme-light: --primary: #ffffff (different from #007bff → needs rename)
.theme-dark: --primary: #1a1a1a (different from #007bff → needs rename)
.custom-variant: --primary: #ff6b6b (different from #007bff → needs rename)
```

**Step 3: Compare and deduplicate**
```
--primary: #ffffff (1st unique value → --primary-1)
--primary: #1a1a1a (2nd unique value → --primary-2)
--primary: #ff6b6b (3rd unique value → --primary-3)
```

**Step 4: Final output**
```json
{
  "--primary": "#007bff",
  "--primary-1": "#ffffff",
  "--primary-2": "#1a1a1a",
  "--primary-3": "#ff6b6b",
  "--padding": "16px"
}
```

**Step 5: Update references within scopes**
```css
:root {
  --primary: #007bff;
  --padding: 16px;
}

.theme-light {
  --primary-1: #ffffff;
  padding: var(--primary-1);  /* ← Updated */
}

.theme-dark {
  --primary-2: #1a1a1a;
  padding: var(--primary-2);  /* ← Updated */
}

.custom-variant {
  --primary-3: #ff6b6b;
  padding: var(--primary-3);  /* ← Updated */
}
```

---

## 7. Edge Cases

### Case 1: Media Queries
Variables in media queries are scope-specific:

```css
@media (max-width: 768px) {
  :root {
    --font-size: 14px;
  }
}

:root {
  --font-size: 16px;
}
```

**Handling**: Each media query scope gets separate suffix (`--font-size` for base, `--font-size-1` for media query variant)

### Case 2: Keyframe Animation Variables
```css
@keyframes slide {
  from {
    --offset: 0px;
  }
  to {
    --offset: 100px;
  }
}

:root {
  --offset: 50px;
}
```

**Handling**: Treat keyframe scope like any other, create `--offset-1` for keyframe version

### Case 3: Deeply Nested Selectors
```css
.container {
  --spacing: 20px;
  
  .child {
    --spacing: 10px;
  }
}

:root {
  --spacing: 16px;
}
```

**Handling**: Collect all unique values, create suffixes:
- `--spacing: 16px` (:root)
- `--spacing-1: 20px` (.container)
- `--spacing-2: 10px` (.container .child)

### Case 4: Variable Inheritance (var() within var())
```css
:root {
  --base: 8px;
  --spacing: var(--base);
}

.component {
  --base: 4px;
  --spacing: var(--base);  /* Different computed value */
}
```

**Handling**: Compare **resolved values** after variable expansion
- `:root --spacing` resolves to 8px
- `.component --spacing` resolves to 4px
- Create suffixes based on resolved values

---

## 8. Performance Considerations

### Algorithm Complexity: O(n×m)

Where:
- `n` = number of unique variable names
- `m` = number of different scopes

**Optimization**: Use hash map for O(1) duplicate checks

```
variable_map = {}

for each variable in CSS:
  key = variable.name + ":" + variable.value
  if key not in variable_map:
    variable_map[key] = find_next_available_name(variable.name)
  
  variable.renamed_name = variable_map[key]
```

---

## 9. Return Value Structure

After extraction, return:

```json
{
  "variables": {
    "--primary": "#007bff",
    "--primary-1": "#ffffff",
    "--primary-2": "#1a1a1a",
    "--padding": "16px"
  },
  "variable_mapping": {
    ":root --primary": "--primary",
    ".theme-light --primary": "--primary-1",
    ".theme-dark --primary": "--primary-2",
    ":root --padding": "--padding"
  },
  "scope_references": {
    "--primary-1": [".theme-light"],
    "--primary-2": [".theme-dark"],
    "--primary": [":root"]
  }
}
```

---

## 10. Testing Scenarios

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Simple :root only | `:root { --color: red; }` | `{ "--color": "red" }` |
| One override | `:root { --color: red; }` + `.theme { --color: blue; }` | `{ "--color": "red", "--color-1": "blue" }` |
| Multiple scopes | 3 different values | `{ "--color": val1, "--color-1": val2, "--color-2": val3 }` |
| Duplicate values | Same value in 2 scopes | Both scopes reuse single variable |
| Collision | Base + `-1` both exist | New variant gets `-2` |
| Media query | Variables in `@media` | Separate suffix tracking |
| Keyframes | Variables in animation | Separate suffix tracking |
| Nested inheritance | `var()` inside `var()` | Compare resolved values |
| Shorthand props | `border: 1px solid red;` | Expand and compare individual properties |
| Already suffixed | `--color-1` exists manually | Avoid collision, use next slot |

---

## 11. Integration with Class Duplication

This implementation mirrors the **@1-AVOID-CLASS-DUPLICATION.md** pattern:

✓ Same suffix naming scheme (`-1`, `-2`, etc.)
✓ Same comparison methodology (identical → reuse, different → suffix)
✓ Same collision resolution (check all variants)
✓ Same deduplication logic (maximize reuse)

The only difference: Variables compare by **value**, classes compare by **styling properties**.

---

## 12. Implementation Pseudocode

### Core Algorithm

```
function extract_and_rename_variables(css_rules):
  root_variables = {}
  all_variables = {}
  variable_mapping = {}
  
  for each rule in css_rules:
    if rule.selector == ":root":
      for each declaration in rule.declarations:
        if is_css_variable(declaration):
          root_variables[declaration.name] = declaration.value
          all_variables[declaration.name] = declaration.value
  
  for each rule in css_rules:
    if rule.selector != ":root":
      for each declaration in rule.declarations:
        if is_css_variable(declaration):
          var_name = declaration.name
          var_value = normalize(declaration.value)
          
          if var_name not in root_variables:
            all_variables[var_name] = var_value
            variable_mapping[rule.selector + " " + var_name] = var_name
          else:
            root_value = normalize(root_variables[var_name])
            
            if root_value == var_value:
              variable_mapping[rule.selector + " " + var_name] = var_name
            else:
              new_name = find_next_available_suffix(var_name, all_variables)
              all_variables[new_name] = var_value
              variable_mapping[rule.selector + " " + var_name] = new_name
  
  update_var_references_in_rules(css_rules, variable_mapping)
  
  return {
    "variables": all_variables,
    "mapping": variable_mapping
  }
```

### Helper: Find Next Available Suffix

```
function find_next_available_suffix(base_name, existing_variables):
  suffix = 1
  
  while true:
    candidate = base_name + "-" + suffix
    if candidate not in existing_variables:
      return candidate
    suffix++
```

### Helper: Update Variable References

```
function update_var_references_in_rules(css_rules, variable_mapping):
  for each rule in css_rules:
    scope_identifier = rule.selector
    
    for each declaration in rule.declarations:
      for each var_reference in declaration.value:
        if var_reference matches pattern var(--variable-name):
          var_name = extract_variable_name(var_reference)
          scope_key = scope_identifier + " " + var_name
          
          if scope_key in variable_mapping:
            new_var_name = variable_mapping[scope_key]
            declaration.value = declaration.value.replace(
              var_reference,
              "var(" + new_var_name + ")"
            )
```

---

## 13. Real-World Example: Complex Theme System

### Scenario
A design system with multiple theme variants, each with conditional variables:

**Input CSS:**
```css
:root {
  --primary: #007bff;
  --secondary: #6c757d;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --primary: #0d6efd;
    --secondary: #adb5bd;
  }
}

.theme-brand {
  --primary: #ff6b35;
  --secondary: #ffd700;
  --spacing-xs: 2px;
}

.theme-corporate {
  --primary: #1a472a;
  --secondary: #ffffff;
  --spacing-xs: 6px;
}

.card {
  --spacing-md: 20px;
}

@supports (display: grid) {
  .layout {
    --spacing-md: 12px;
  }
}
```

### Processing Steps

**Step 1: Extract base :root (not in media query)**
```json
{
  "--primary": "#007bff",
  "--secondary": "#6c757d",
  "--spacing-xs": "4px",
  "--spacing-sm": "8px",
  "--spacing-md": "16px"
}
```

**Step 2: Process media query :root**
```
@media dark mode --primary: #0d6efd (different) → --primary-1
@media dark mode --secondary: #adb5bd (different) → --secondary-1
```

**Step 3: Process .theme-brand**
```
--primary: #ff6b35 (different from #007bff) → --primary-2
--secondary: #ffd700 (different from #6c757d) → --secondary-2
--spacing-xs: 2px (different from 4px) → --spacing-xs-1
```

**Step 4: Process .theme-corporate**
```
--primary: #1a472a (different from all previous) → --primary-3
--secondary: #ffffff (different from all previous) → --secondary-3
--spacing-xs: 6px (different from all previous) → --spacing-xs-2
```

**Step 5: Process .card**
```
--spacing-md: 20px (different from 16px) → --spacing-md-1
```

**Step 6: Process @supports .layout**
```
--spacing-md: 12px (different from 16px and 20px) → --spacing-md-2
```

### Final Output

```json
{
  "variables": {
    "--primary": "#007bff",
    "--primary-1": "#0d6efd",
    "--primary-2": "#ff6b35",
    "--primary-3": "#1a472a",
    "--secondary": "#6c757d",
    "--secondary-1": "#adb5bd",
    "--secondary-2": "#ffd700",
    "--secondary-3": "#ffffff",
    "--spacing-xs": "4px",
    "--spacing-xs-1": "2px",
    "--spacing-xs-2": "6px",
    "--spacing-sm": "8px",
    "--spacing-md": "16px",
    "--spacing-md-1": "20px",
    "--spacing-md-2": "12px"
  },
  "variable_mapping": {
    ":root --primary": "--primary",
    "@media dark --primary": "--primary-1",
    ".theme-brand --primary": "--primary-2",
    ".theme-corporate --primary": "--primary-3",
    ":root --secondary": "--secondary",
    "@media dark --secondary": "--secondary-1",
    ".theme-brand --secondary": "--secondary-2",
    ".theme-corporate --secondary": "--secondary-3",
    ":root --spacing-xs": "--spacing-xs",
    ".theme-brand --spacing-xs": "--spacing-xs-1",
    ".theme-corporate --spacing-xs": "--spacing-xs-2",
    ":root --spacing-sm": "--spacing-sm",
    ":root --spacing-md": "--spacing-md",
    ".card --spacing-md": "--spacing-md-1",
    "@supports --spacing-md": "--spacing-md-2"
  }
}
```

---

## 14. Common Pitfalls & Solutions

### Pitfall 1: Not Normalizing Values

**Problem:**
```css
:root {
  --color: #0077ff;  /* 7-digit hex */
}

.theme {
  --color: #007fff;  /* 6-digit equivalent */
}
```

**Wrong**: Treat as different values → create `--color-1`
**Correct**: Normalize both to RGB/HSL, compare, reuse `--color`

**Solution**: Always normalize values to canonical form:
- `#0077ff` → `rgb(0, 119, 255)`
- `#007fff` → `rgb(0, 127, 255)` (actually different, create suffix)

### Pitfall 2: Whitespace Sensitivity

**Problem:**
```css
--spacing: 16px;
--spacing: 16 px;  /* Extra space */
```

**Wrong**: Treat as different
**Correct**: Normalize whitespace before comparison

**Solution**: Strip and normalize all whitespace:
```
value.trim().replace(/\s+/g, ' ')
```

### Pitfall 3: calc() Expressions Not Resolved

**Problem:**
```css
:root {
  --unit: 1px;
  --spacing: calc(16 * var(--unit));
}

.component {
  --spacing: 16px;
}
```

**Wrong**: Compare `calc(...)` literally against `16px` (different)
**Correct**: Only compare when fully resolvable

**Solution**: Attempt resolution; if failed, treat as fundamentally different:
```
if both_values_resolvable:
  compare_computed_values()
else:
  treat_as_different()
```

### Pitfall 4: Not Updating var() References

**Problem:**
```css
.theme {
  --color: #ff0000;
  background: var(--color);  /* Still references old name! */
}
```

After renaming to `--color-1`, this becomes broken.

**Solution**: Always update var() references when renaming:
```css
.theme {
  --color-1: #ff0000;
  background: var(--color-1);  /* Updated */
}
```

### Pitfall 5: Ignoring Custom Properties in Shorthand

**Problem:**
```css
--border: 1px solid var(--border-color);
```

Custom properties inside shorthand functions are missed.

**Solution**: Parse all declaration values recursively for var() calls.

### Pitfall 6: Scope Precedence Not Considered

**Problem:**
```css
:root {
  --size: 16px;
}

@media (max-width: 768px) {
  :root {
    --size: 14px;
  }
}

.widget {
  --size: 12px;
}
```

Unclear which takes precedence without considering CSS specificity.

**Solution**: Process by scope precedence order:
1. Base :root (no media queries, no @supports)
2. Media queries (treat as separate scope)
3. Feature queries @supports
4. Class/element selectors
5. Nested selectors (deepest first)

---

## 15. Troubleshooting Guide

### Issue: Suffix Numbers Not Sequential

**Symptom**: Variables named `--color`, `--color-2`, `--color-5` (missing -1, -3, -4)

**Cause**: Collision detection not properly checking for duplicates across scopes

**Fix**: Ensure `find_next_available_suffix()` checks ALL existing variables:
```
for suffix = 1 to infinity:
  if (base + "-" + suffix) not in all_variables:
    return base + "-" + suffix
```

### Issue: Variable References Not Updated

**Symptom**: CSS output has `var(--color)` but variable was renamed to `--color-1`

**Cause**: Scope tracking not matching when updating references

**Fix**: Ensure exact scope matching in variable_mapping:
- Store scope as `"selector_selector_selector"` or unique identifier
- Match exact scope when updating references
- Handle compound selectors: `.a, .b` → process separately

### Issue: Duplicate Variable Names in Output

**Symptom**: Same variable name appears multiple times in extracted output

**Cause**: Not deduplating identical name+value pairs

**Fix**: Use Set/Map keyed by `name:value` before generating output:
```
variable_map = new Map()
for each scope:
  for each variable:
    key = variable.name + ":" + normalize(variable.value)
    if not in map:
      map[key] = find_available_name(variable.name)
```

### Issue: Media Query Variables Not Handled

**Symptom**: Variables inside `@media` blocks ignored or causing conflicts

**Cause**: Media query scope not recognized as separate from global :root

**Fix**: Treat media query-scoped :root as distinct:
```
@media (max-width: 768px) {
  :root {
    --size: 14px;
  }
}
```
Scope identifier: `"@media (max-width: 768px) :root"` (not just `":root"`)

### Issue: Performance Degradation on Large Stylesheets

**Symptom**: Extraction taking >1 second on 50KB+ CSS

**Cause**: Inefficient loop nesting or repeated string operations

**Fix**: Use hash maps for O(1) lookups:
```
// DON'T: Loop through all variables for each new variable
for each new_var:
  for each existing_var:
    if new_var.name == existing_var.name:
      ...

// DO: Use Map for O(1) lookup
variable_map[variable.name] = existing_var
```

---

## 16. Implementation Checklist

Use this checklist when implementing nested variable extraction:

### Phase 1: Basic Infrastructure
- [ ] Parse CSS rules and extract declarations
- [ ] Identify CSS variables (starts with `--`)
- [ ] Create data structure for storing variables (Map/Object)
- [ ] Implement scope identifier generation (selector string)

### Phase 2: Root Variables
- [ ] Locate `:root` selector
- [ ] Extract all variables from `:root` (no media queries)
- [ ] Store base variables in map
- [ ] Normalize values (whitespace, color formats)

### Phase 3: Scope Detection
- [ ] Scan all non-:root selectors
- [ ] Identify variables in each scope
- [ ] Handle media queries as separate scopes
- [ ] Handle @supports as separate scopes
- [ ] Handle compound selectors (`.a, .b`)

### Phase 4: Comparison & Deduplication
- [ ] Implement value comparison (normalize first)
- [ ] Check if variable name already exists
- [ ] Compare values if name matches
- [ ] Decide: reuse or create suffix

### Phase 5: Suffix Management
- [ ] Implement `find_next_available_suffix()`
- [ ] Handle collision detection
- [ ] Generate unique suffix numbers
- [ ] Track all used suffixes for each base name

### Phase 6: Reference Updates
- [ ] Find all `var(--name)` references
- [ ] Update to new variable name after rename
- [ ] Handle nested var() calls
- [ ] Handle var() in shorthand properties

### Phase 7: Output Generation
- [ ] Compile final variables map
- [ ] Generate variable_mapping (scope → final name)
- [ ] Generate scope_references (variable → scopes)
- [ ] Format as JSON

### Phase 8: Validation
- [ ] Check for duplicate variable names
- [ ] Verify all references updated
- [ ] Test with complex stylesheets
- [ ] Verify performance on large CSS
- [ ] Test edge cases (media queries, keyframes, etc.)

### Phase 9: Testing
- [ ] Unit tests for each helper function
- [ ] Integration tests with real stylesheets
- [ ] Edge case tests (nesting, collisions, etc.)
- [ ] Performance benchmarks
- [ ] Regression tests

---

## 17. Next Steps & Related Documentation

- **@1-AVOID-CLASS-DUPLICATION.md**: Class deduplication pattern (mirror implementation)
- **@2-CLASS-SELECTOR-MAPPING.md**: How classes map to widget selectors
- **@3-CSS-PROPERTY-MAPPING.md**: How CSS properties map to Elementor controls
- **Integration Guide**: How to integrate variable extraction with class creation workflow
- **API Documentation**: HTTP endpoint structure for variable extraction API
