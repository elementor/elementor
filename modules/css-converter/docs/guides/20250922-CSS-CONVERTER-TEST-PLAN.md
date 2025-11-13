# CSS Converter Test Plan

## Overview
This test plan provides systematic testing for all 54 supported CSS properties in the Elementor CSS Class Converter. Use the provided test CSS file to verify correct conversion and editor integration.

## Test Files
- **CSS File**: `docs/test/test-plan.css` - Contains comprehensive test classes
- **Test Runner**: `docs/test/run-tests.sh` - Automated test execution
- **Endpoint**: `POST /wp-json/elementor/v2/css-converter/classes`

## Testing Categories

### 1. Typography Properties (7 properties)
**Test Classes**: `.typography-basic`, `.typography-advanced`, `.typography-units`

**Properties to Verify**:
- `color` - hex, rgb, rgba, hsl, named colors
- `font-size` - px, rem, em, vw, %
- `font-weight` - numeric (100-900), keywords (normal, bold)
- `text-align` - left, center, right, justify
- `line-height` - unitless, px, em, rem, %
- `text-decoration` - none, underline, line-through
- `text-transform` - none, uppercase, lowercase, capitalize

**Expected Results**:
```json
{
  "color": {"$$type": "color", "value": "#ff6600"},
  "font-size": {"$$type": "size", "value": {"size": 18, "unit": "px"}},
  "font-weight": {"$$type": "string", "value": "bold"}
}
```

### 2. Layout & Display Properties (8 properties)
**Test Classes**: `.layout-basic`, `.layout-dimensions`, `.layout-units`

**Properties to Verify**:
- `display` - block, inline, flex, grid, none, inline-block
- `width`, `height` - px, %, em, rem, vh, vw, auto
- `min-width`, `min-height`, `max-width`, `max-height`
- `opacity` - 0-1, percentage

### 3. Spacing Properties (10 properties)
**Test Classes**: `.spacing-shorthand`, `.spacing-individual`, `.spacing-units`

**Properties to Verify**:
- `margin` - shorthand expansion
- `margin-top`, `margin-right`, `margin-bottom`, `margin-left`
- `padding` - shorthand expansion
- `padding-top`, `padding-right`, `padding-bottom`, `padding-left`

**Expected Shorthand Expansion**:
```css
margin: 10px 20px 15px 5px;
```
Should become:
```json
{
  "margin-top": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
  "margin-right": {"$$type": "size", "value": {"size": 20, "unit": "px"}},
  "margin-bottom": {"$$type": "size", "value": {"size": 15, "unit": "px"}},
  "margin-left": {"$$type": "size", "value": {"size": 5, "unit": "px"}}
}
```

### 4. Border Properties (17 properties)
**Test Classes**: `.border-shorthand`, `.border-advanced`, `.border-individual-*`, `.border-keywords`

**Properties to Verify**:
- `border` - shorthand (width style color)
- `border-width`, `border-style`, `border-color` - shorthand forms
- Individual sides: `border-top-width`, `border-right-width`, etc.
- `border-radius` - shorthand and individual corners

**Critical Test**: Border shorthand should match native Elementor format:
```json
{
  "border-width": {"$$type": "size", "value": {"size": 2, "unit": "px"}},
  "border-style": {"$$type": "string", "value": "solid"},
  "border-color": {"$$type": "color", "value": "#333333"}
}
```

### 5. Background Properties (3 properties)
**Test Classes**: `.background-color`, `.background-image`, `.background-gradient`, `.background-shorthand`

**Properties to Verify**:
- `background-color` - all color formats
- `background-image` - url(), gradients
- `background` - shorthand with color/image extraction

### 6. Effects Properties (3 properties)
**Test Classes**: `.effects-filter`, `.effects-shadows`

**Properties to Verify**:
- `filter` - blur, brightness, contrast functions
- `box-shadow`, `text-shadow` - shadow syntax

### 7. Flexbox Properties (4 properties)
**Test Classes**: `.flex-shorthand`, `.flex-individual`, `.flex-keywords`

**Properties to Verify**:
- `flex` - shorthand expansion
- `flex-grow`, `flex-shrink`, `flex-basis` - individual properties

### 8. Position Properties (6 properties)
**Test Classes**: `.position-absolute`, `.position-relative`, `.position-units`

**Properties to Verify**:
- `position` - static, relative, absolute, fixed, sticky
- `top`, `right`, `bottom`, `left` - coordinates
- `z-index` - integer values, auto

### 9. SVG Stroke Properties (5 properties)
**Test Classes**: `.stroke-basic`, `.stroke-advanced`

**Properties to Verify**:
- `stroke` - color values
- `stroke-width` - size values
- `stroke-dasharray`, `stroke-linecap`, `stroke-linejoin`

### 10. Transition Properties (5 properties)
**Test Classes**: `.transition-shorthand`, `.transition-individual`, `.transition-multiple`

**Properties to Verify**:
- `transition` - shorthand expansion
- `transition-property`, `transition-duration`, `transition-timing-function`, `transition-delay`

## Test Execution Steps

### Step 1: Basic API Testing
```bash
# Test individual property groups
curl -X POST "http://elementor.local/wp-json/elementor/v2/css-converter/classes" \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: my-dev-token" \
  -d '{"css": ".typography-basic { color: #ff6600; font-size: 18px; font-weight: bold; }", "store": false}'
```

### Step 2: Comprehensive Testing
```bash
# Navigate to test directory and run full test
cd docs/test
./run-tests.sh full

# Or manually test the comprehensive class
curl -X POST "http://elementor.local/wp-json/elementor/v2/css-converter/classes" \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: my-dev-token" \
  -d '{"css": "$(cat docs/test/test-plan.css)", "store": true}'
```

### Step 3: Editor Verification
1. Open Elementor editor
2. Add a widget (e.g., Heading)
3. Go to Advanced → CSS Classes
4. Apply converted class names
5. Check Style tab controls show correct values
6. Verify frontend rendering matches expectations

### Step 4: Data Structure Verification
Check database for correct Global Classes structure:
```sql
SELECT option_value FROM wp_options WHERE option_name LIKE '%elementor_global_classes%';
```

## Expected Test Results

### Success Criteria
- ✅ All 54 properties convert without warnings
- ✅ Data structure matches Elementor's native format
- ✅ Editor controls display correct values
- ✅ Frontend rendering is accurate
- ✅ No console errors in editor
- ✅ Classes are preserved and not overwritten

### Common Issues to Check
- ❌ Properties marked as "unsupported"
- ❌ Incorrect data types (string vs size vs color)
- ❌ Missing `$$type` or `value` structure
- ❌ Unit conversion errors
- ❌ Color format normalization issues
- ❌ Shorthand expansion problems

## Test Commands

### Quick Property Test
```bash
# Test specific property
curl -X POST "http://elementor.local/wp-json/elementor/v2/css-converter/classes" \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: my-dev-token" \
  -d '{"css": ".test { PROPERTY: VALUE; }", "store": false}' | jq '.data.converted_classes[0].variants[0].props'
```

### Full Test Suite
```bash
# Using test runner (recommended)
cd docs/test && ./run-tests.sh full

# Or manually load entire test file
curl -X POST "http://elementor.local/wp-json/elementor/v2/css-converter/classes" \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: my-dev-token" \
  -d "{\"css\": \"$(cat docs/test/test-plan.css | tr '\n' ' ')\", \"store\": true}" | jq '.data.stats'
```

### Validation Test
```bash
# Using test runner (recommended)
cd docs/test && ./run-tests.sh validation

# Or manually check for warnings/errors
curl -X POST "http://elementor.local/wp-json/elementor/v2/css-converter/classes" \
  -H "Content-Type: application/json" \
  -H "X-DEV-TOKEN: my-dev-token" \
  -d "{\"css\": \"$(cat docs/test/test-plan.css | tr '\n' ' ')\", \"store\": false}" | jq '.data.warnings'
```

## Performance Benchmarks
- **Target**: < 2 seconds for full test suite
- **Memory**: < 50MB peak usage
- **Properties**: 54 properties across ~25 classes
- **Expected Output**: ~150 converted properties

## Regression Testing
Run this test suite after any changes to:
- Property mappers
- CSS parser
- Global Classes integration
- REST API endpoints
- Configuration updates

## Manual Testing Checklist
- [ ] Typography controls show correct values
- [ ] Layout controls reflect dimensions
- [ ] Spacing controls match CSS values
- [ ] Border controls display properly
- [ ] Background controls work correctly
- [ ] Effects render as expected
- [ ] Flexbox properties apply correctly
- [ ] Position properties work in editor
- [ ] SVG stroke properties function
- [ ] Transitions animate properly
- [ ] Frontend matches editor preview
- [ ] No console errors
- [ ] Performance is acceptable
