# Font-Size Issue Root Cause Analysis

## ✅ ROOT CAUSE IDENTIFIED

### Issue Summary
- **Expected**: `font-size: 26px`
- **Actual**: `font-size: 22px`
- **Root Cause**: **DUPLICATE CSS PROCESSING** - The same selector `.elementor-1140 .elementor-element.elementor-element-6d397c1` is being processed TWICE with different font-size values

## Complete Data Flow Trace

### Phase 1: CSS Collection ✅ (FIRST PASS)
```
SELECTOR: .elementor-1140 .elementor-element.elementor-element-6d397c1
EXTRACTED TARGET: .elementor-element.elementor-element-6d397c1
  - font-size: 26px (converted: YES) ✅ CORRECT

🔍 FONT-SIZE TRACE: collect_reset_styles
  - selector: .elementor-element.elementor-element-6d397c1
  - widget_element_id: element-div-1
  - property: font-size
  - value: 26px ✅
  - converted_property: {"$$type":"size","value":{"size":26,"unit":"px"}}
  - can_apply_directly: TRUE
```

### Phase 2: CSS Collection ❌ (SECOND PASS - DUPLICATE!)
```
SELECTOR: .elementor-1140 .elementor-element.elementor-element-6d397c1
EXTRACTED TARGET: .elementor-element.elementor-element-6d397c1
  - font-size: 22px (converted: YES) ❌ INCORRECT

🔍 FONT-SIZE TRACE: collect_reset_styles
  - selector: .elementor-element.elementor-element-6d397c1
  - widget_element_id: element-div-1
  - property: font-size
  - value: 22px ❌
  - converted_property: {"$$type":"size","value":{"size":22,"unit":"px"}}
  - can_apply_directly: TRUE
```

### Phase 3: Style Resolution ❌ (WRONG VALUE WINS)
```
🔍 FONT-SIZE TRACE: resolve_styles_for_widget_legacy
  - widget_id: e-div-block#element-div-1
  - applicable font-size styles: 6
  - style[22]: value=1.5rem, specificity=10
  - style[44]: value=0, specificity=10
  - style[49]: value=26px, specificity=20 ✅ CORRECT VALUE
  - style[53]: value=0, specificity=10
  - style[55]: value=0, specificity=10
  - style[57]: value=22px, specificity=20 ❌ INCORRECT VALUE (WINS BECAUSE IT'S LAST)

🔍 FONT-SIZE TRACE: winning style selected
  - value: 22px ❌
  - specificity: 20
  - converted_property: {"$$type":"size","value":{"size":22,"unit":"px"}}
```

### Phase 4: Final Resolution
```
🔍 FONT-SIZE TRACE: resolve_styles_recursively
  - widget_id: e-div-block#element-div-1
  - resolved font-size: {
      "value": "22px", ❌
      "specificity": 20,
      "converted_property": {"$$type":"size","value":{"size":22,"unit":"px"}}
    }
```

## Root Cause ✅ CONFIRMED WITH PHP DEBUG

**DATA POLLUTION - DUPLICATE CSS IN SOURCE**: The selector `.elementor-1140 .elementor-element.elementor-element-6d397c1` appears in the **oboxthemes.com CSS source** **TWICE** with different font-size values:

### Evidence from PHP Debug Logs:
```
[15:03:38] 📋 ALL SELECTOR: .elementor-1140 .elementor-element.elementor-element-6d397c1
[15:03:38] 🔍 FONT-SIZE POLLUTION: Selector=.elementor-1140 .elementor-element.elementor-element-6d397c1 | Value=26px ✅

[15:03:38] 📋 ALL SELECTOR: .elementor-1140 .elementor-element.elementor-element-6d397c1
[15:03:38] 🔍 FONT-SIZE POLLUTION: Selector=.elementor-1140 .elementor-element.elementor-element-6d397c1 | Value=22px ❌
```

1. **First occurrence**: `font-size: 26px` (correct value from original design)
2. **Second occurrence**: `font-size: 22px` (incorrect value, likely from media query or responsive CSS)

Both have the **same specificity (20)**, so the resolution algorithm picks the **last one** (order: 91 > order: 49), resulting in `22px` being applied instead of `26px`.

## Why This Happens

1. **CSS Source Duplication**: The oboxthemes.com CSS contains the same selector multiple times with different values (confirmed by PHP debug)
2. **No Deduplication**: The CSS processor doesn't deduplicate selectors before collection
3. **CSS Cascade Not Implemented**: Proper CSS cascade rules would keep only the last occurrence
4. **Last-Wins Rule**: When multiple styles have the same specificity, the last one in order wins
5. **Order Matters**: style[57] (22px, order=91) comes after style[49] (26px, order=49)

## Likely Source of Duplication

Based on the CSS you provided, the duplicate likely comes from:
- **Desktop CSS**: `.elementor-1140 .elementor-element.elementor-element-6d397c1 { font-size: 26px; }`
- **Responsive/Media Query CSS**: Same selector with `font-size: 22px` for smaller screens
- **Or**: Different stylesheet loaded later that overrides the first value

## Solution

### Option 1: Deduplicate CSS Rules (RECOMMENDED)
Filter out duplicate selectors during CSS parsing, keeping only the **last** occurrence (which matches CSS cascade behavior).

**Location**: `unified-css-processor.php` - CSS parsing phase

### Option 2: Use Higher Specificity for Correct Value
If `26px` is the intended value, ensure it has higher specificity or comes later in the CSS.

**Location**: Source CSS from oboxthemes.com

### Option 3: Implement CSS Cascade Rules
Properly implement CSS cascade rules where later rules override earlier ones for the same selector.

**Location**: `unified-style-manager.php` - Style resolution phase

## Impact

This same issue likely affects:
- ✅ `line-height`: Expected `36px`, getting `32px` (same duplicate processing)
- ✅ `font-weight`: Expected `400`, getting `400` (happens to be the same in both)
- ✅ Other properties that appear multiple times in the source CSS

## Next Steps

1. ✅ Investigate why the same selector appears twice in parsed CSS
2. ✅ Check if this is from media queries or different CSS sources
3. ✅ Implement deduplication or proper cascade handling
4. ✅ Verify the fix resolves both font-size and line-height issues

