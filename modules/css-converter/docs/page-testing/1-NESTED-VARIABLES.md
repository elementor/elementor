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
