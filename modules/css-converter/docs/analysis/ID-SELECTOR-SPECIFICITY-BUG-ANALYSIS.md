# ID Selector Specificity Bug Analysis

## Test Case

```html
<div id="container" class="box">Content</div>
```

```css
#container { background-color: blue; }
#container.box { background-color: red; }
```

**Expected**: Red (specificity 110 > 100)
**Actual**: Blue (bug)

## Root Cause Analysis

### CSS Specificity Values

According to standard CSS specificity rules:
- `#container` = 1 ID + 0 classes = **(1,0,0)** = **100**
- `#container.box` = 1 ID + 1 class = **(1,1,0)** = **110** ✅

### Current Implementation Flow

#### Step 1: Selector Categorization (`unified-css-processor.php:390-392`)

```php
private function is_id_selector( string $selector ): bool {
    return strpos( $selector, '#' ) === 0 
        && ! strpos( $selector, ' ' ) 
        && ! strpos( $selector, '.' );  // ❌ REJECTS #container.box
}
```

**Result:**
- `#container` → TRUE → routes to `collect_id_styles()` → creates `Id_Style`
- `#container.box` → FALSE → routes to `collect_css_selector_styles()` → creates `Css_Selector_Style`

#### Step 2: Specificity Calculation

**For `#container` (Id_Style):**
- Uses `Id_Style_Factory` (line 43-48)
- **Hardcoded**: `ID_WEIGHT = 100` (no selector parsing)
- Result: specificity = **100**

**For `#container.box` (Css_Selector_Style):**
- Uses `Css_Selector_Style_Factory` (line 43-46)
- **Calculated**: Uses `Css_Specificity_Calculator`
- Result: specificity = **110** ✅ CORRECT

#### Step 3: Widget Matching

**Id_Style matching logic** (`id-style.php:20-23`):
```php
public function matches( array $widget ): bool {
    $html_id = $widget['attributes']['id'] ?? null;
    return $html_id && $this->id === $html_id;  // ❌ REQUIRES HTML ID attribute
}
```

**Css_Selector_Style matching logic** (`css-selector-style.php:20-23`):
```php
public function matches( array $widget ): bool {
    $widget_element_id = $widget['element_id'] ?? null;
    return $this->element_id === $widget_element_id;  // ✅ Uses internal element_id
}
```

**Problem**: We removed HTML `id` attributes from widgets (as per requirements).

**Result:**
- `#container` → `Id_Style` → **matches() = FALSE** → style not applied
- `#container.box` → `Css_Selector_Style` → **matches() = TRUE** → style applied

### Why Blue Wins (Hypothesis)

If blue is winning, there must be a fallback mechanism or the styles are being applied through a different path. Possibilities:

1. **Legacy Style Resolution**: The legacy code path might still be processing ID styles differently
2. **Order Issue**: Both styles might be failing to match, causing a default or fallback
3. **Class Matching**: The `.box` class might be causing `#container.box` to fail matching if the widget doesn't have class="box"

## The Bugs

### Bug #1: Incorrect Selector Categorization

**File**: `unified-css-processor.php:390-392`

The `is_id_selector()` function is too restrictive:
```php
// ❌ CURRENT: Only accepts pure ID selectors
return strpos( $selector, '#' ) === 0 && ! strpos( $selector, ' ' ) && ! strpos( $selector, '.' );

// ✅ SHOULD: Accept any selector starting with # (no spaces = not descendant)
return strpos( $selector, '#' ) === 0 && ! strpos( $selector, ' ' );
```

**Impact**: `#id.class`, `#id[attr]`, `#id:hover` are incorrectly routed to CSS selector styles instead of ID styles.

### Bug #2: Hardcoded ID Specificity

**File**: `id-style-factory.php:43-48`

The factory hardcodes specificity to `ID_WEIGHT` without parsing the selector:
```php
// ❌ CURRENT: Hardcoded
private function calculate_specificity( bool $important ): int {
    $specificity = $this->get_specificity_weight();  // Always 100
    if ( $important ) {
        $specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
    }
    return $specificity;
}
```

**Should be**:
```php
// ✅ FIXED: Calculate from selector
private function calculate_specificity( string $selector, bool $important ): int {
    $calculator = new Css_Specificity_Calculator();
    return $calculator->calculate_specificity( $selector, $important );
}
```

**Impact**: All ID selectors get specificity=100, even `#id.class.class` which should be 120.

### Bug #3: ID Style Matching Requires HTML Attribute

**File**: `id-style.php:20-23`

ID styles only match if the widget has an HTML `id` attribute:
```php
// ❌ CURRENT: Requires HTML id attribute (which we removed)
public function matches( array $widget ): bool {
    $html_id = $widget['attributes']['id'] ?? null;
    return $html_id && $this->id === $html_id;
}
```

**Problem**: We removed HTML `id` attributes from widgets (per requirements), so ID styles never match.

**Solution Options**:

#### Option A: Store ID mapping during widget creation
- When creating widgets, store a mapping of `element_id` → `html_id`
- `Id_Style` checks this mapping instead of `attributes['id']`

#### Option B: Treat all ID selectors as CSS selectors
- Remove the distinction between `Id_Style` and `Css_Selector_Style`
- All selectors use the same matching logic (by `element_id`)
- Specificity is always calculated by the CSS calculator

## Recommended Fix

**Option B** is cleaner and more aligned with the "pure unified architecture":

1. **Remove** the `is_id_selector()` check
2. **Always** route to `collect_css_selector_styles()`
3. **Remove** `Id_Style` and `Id_Style_Factory` (or deprecate)
4. **Use** `Css_Selector_Style` for all CSS rules (including ID selectors)
5. The `Css_Specificity_Calculator` already handles ID selectors correctly

This eliminates source-specific logic and makes the system truly unified.

### Alternative: Minimal Fix

If we want to keep the `Id_Style` distinction for some reason:

1. **Fix `is_id_selector()`**: Remove the `&& ! strpos( $selector, '.' )` check
2. **Pass selector to factory**: Update `Id_Style_Factory` to accept and parse the full selector
3. **Fix matching**: Store `html_id` → `element_id` mapping during DOM parsing

## Files to Update

### Option B (Recommended):
1. `unified-css-processor.php`: Remove `is_id_selector()` check, always use CSS selector collection
2. `unified-style-manager.php`: Remove `collect_id_styles()` method (or mark deprecated)
3. Update tests to verify correct specificity calculation

### Option A (Minimal):
1. `unified-css-processor.php:390-392`: Fix `is_id_selector()`
2. `id-style-factory.php:14-36`: Accept selector, calculate real specificity
3. `unified-css-processor.php:373-379`: Pass full selector to factory
4. `id-style.php:20-23`: Store ID-to-element mapping, match by it
5. `dom-parser.php` or similar: Create and populate ID mapping

## Test Case to Verify Fix

```typescript
test('should respect #id.class > #id specificity', async () => {
    const html = '<div id="container" class="box">Content</div>';
    const css = `
        #container { background-color: blue; }      /* specificity: 100 */
        #container.box { background-color: red; }   /* specificity: 110 */
    `;
    
    // After conversion, widget should have red background
    const widget = findWidget('[data-element_type="e-div-block"]');
    await expect(widget).toHaveCSS('background-color', 'rgb(255, 0, 0)'); // red
});
```

## Impact on Existing Tests

The `id-styles-specificity.test.ts:110` test is currently **failing** due to this bug.

After the fix, this test should **pass** with red winning over blue.


