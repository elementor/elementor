# CSS Converter Test Suite

This directory contains the comprehensive test suite for the Elementor CSS Class Converter.

## Files

### `test-plan.css`
Comprehensive CSS file containing 37 test classes covering all 54 supported CSS properties:
- Typography properties (color, font-size, font-weight, etc.)
- Layout properties (display, width, height, opacity, etc.)
- Spacing properties (margin, padding)
- Border properties (border shorthand, individual properties)
- Background properties (color, image, shorthand)
- Effects properties (filter, shadows)
- Flexbox properties (flex shorthand, individual)
- Position properties (position, coordinates, z-index)
- SVG stroke properties
- Transition properties

### `run-tests.sh`
Automated test runner script with multiple test modes:

```bash
# Quick test (typography + border)
./run-tests.sh quick

# Full test suite (stores in database)
./run-tests.sh full

# Individual property groups
./run-tests.sh individual

# Validation test (check for warnings)
./run-tests.sh validation

# Performance test
./run-tests.sh performance
```

### `test-class-conversion.php`
Comprehensive PHP test file for manual testing and debugging:

```bash
# Run via WP-CLI
wp eval-file docs/test/test-class-conversion.php

# Run via browser (if enabled)
# Access: /wp-content/plugins/elementor/modules/css-converter/docs/test/test-class-conversion.php?run_tests=1
```

## Usage

1. **Navigate to test directory:**
   ```bash
   cd docs/test
   ```

2. **Run tests:**
   ```bash
   # Quick validation
   ./run-tests.sh quick
   
   # Full test with database storage
   ./run-tests.sh full
   
   # Check for any issues
   ./run-tests.sh validation
   ```

3. **Manual testing in Elementor:**
   - Run tests with `store: true`
   - Open Elementor editor
   - Add widget → Advanced → CSS Classes
   - Apply test class names
   - Verify Style tab shows correct values

## Expected Results

- **37 classes tested**
- **141+ properties converted**
- **94%+ success rate**
- **Minimal warnings** (only edge cases)

## Test Categories

1. **Typography** - 7 properties
2. **Layout** - 8 properties  
3. **Spacing** - 10 properties
4. **Border** - 17 properties
5. **Background** - 3 properties
6. **Effects** - 3 properties
7. **Flexbox** - 4 properties
8. **Position** - 6 properties
9. **SVG Stroke** - 5 properties
10. **Transitions** - 5 properties

## Documentation

See `../CSS-CONVERTER-TEST-PLAN.md` for detailed testing methodology and `../TEST-RESULTS-SUMMARY.md` for analysis of test results.
