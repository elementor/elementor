# Duplicate Detection Tests

**Feature**: Smart duplicate detection for global classes and CSS variables  
**Test Coverage**: Classes, Variables, Integration, Performance

---

## 📁 Test Files

### 1. `class-duplicate-detection.test.ts`
Tests for class duplicate detection functionality.

**Test Suites**:
- Identical Classes - Reuse (3 tests)
- Different Classes - Create Suffixed (3 tests)
- Property Comparison (3 tests)
- Performance Monitoring (2 tests)
- Batch Import (3 tests)
- Edge Cases (4 tests)
- API Response Format (3 tests)

**Total**: 21 tests

### 2. `variable-duplicate-detection.test.ts`
Tests for variable duplicate detection functionality.

**Test Suites**:
- Incremental Naming Mode (6 tests)
- Update Mode - Legacy (3 tests)
- Variable Type Detection (4 tests)
- Batch Variable Import (2 tests)
- Edge Cases (4 tests)
- API Response Format (3 tests)
- Migration from Old Behavior (1 test)

**Total**: 23 tests

### 3. `integration.test.ts`
End-to-end integration tests.

**Test Suites**:
- Classes and Variables Together (2 tests)
- Real-World Scenarios (3 tests)
- Performance at Scale (3 tests)
- Error Handling (4 tests)
- Consistency Checks (3 tests)

**Total**: 15 tests

---

## 🚀 Running Tests

### Run All Duplicate Detection Tests
```bash
npx playwright test duplicates/
```

### Run Specific Test File
```bash
npx playwright test duplicates/class-duplicate-detection.test.ts
npx playwright test duplicates/variable-duplicate-detection.test.ts
npx playwright test duplicates/integration.test.ts
```

### Run in Watch Mode
```bash
npx playwright test duplicates/ --watch
```

### Run with UI
```bash
npx playwright test duplicates/ --ui
```

### Run Specific Test
```bash
npx playwright test duplicates/ -g "should reuse existing class"
```

---

## 📊 Test Coverage

### Classes
- ✅ Identical class reuse
- ✅ Suffix generation for different styling
- ✅ Property order normalization
- ✅ Nested property comparison
- ✅ Suffixed variant matching
- ✅ Performance monitoring
- ✅ Batch processing
- ✅ Edge cases (empty, case-insensitive, hyphens, numbers)
- ✅ API response format validation

### Variables
- ✅ Incremental naming mode (default)
- ✅ Legacy update-in-place mode
- ✅ Value comparison
- ✅ Suffix generation
- ✅ Type detection (colors, sizes, percentages)
- ✅ Batch processing
- ✅ Edge cases
- ✅ API response format validation
- ✅ Migration scenarios

### Integration
- ✅ Classes + variables together
- ✅ Real-world design system imports
- ✅ Theme update scenarios
- ✅ Performance at scale (50+ classes/variables)
- ✅ Error handling
- ✅ Consistency checks
- ✅ Concurrent imports

---

## 🎯 Key Test Scenarios

### Scenario 1: Reuse Identical Class
```typescript
// Import same class twice → should reuse
const css1 = '.button { background: blue; }';
const css2 = '.button { background: blue; }';

// First import creates, second reuses
expect(result2.stats.classes_reused).toBe(1);
```

### Scenario 2: Create Suffixed Class
```typescript
// Import different class with same name → create suffix
const css1 = '.button { background: blue; }';
const css2 = '.button { background: red; }';

// Second import creates .button-1
expect(result2.converted_classes[0].label).toBe('button-1');
```

### Scenario 3: Match Suffixed Variant
```typescript
// Import class that matches existing suffixed variant
const css1 = '.button { bg: blue; }';     // Creates .button
const css2 = '.button { bg: red; }';      // Creates .button-1
const css3 = '.button { bg: red; }';      // Reuses .button-1

expect(result3.reused_classes[0].matched_class_label).toBe('button-1');
```

### Scenario 4: Variables Incremental Naming
```typescript
// Default mode creates suffixed variables
const vars1 = '--primary: #ff0000;';
const vars2 = '--primary: #00ff00;';  // Creates --primary-1

expect(result2.stored_variables.created).toBeGreaterThanOrEqual(1);
```

### Scenario 5: Variables Legacy Update
```typescript
// Update mode overwrites existing variable
const result = await convertCssVariables(css, 'update');

expect(result.stored_variables.updated).toBeGreaterThanOrEqual(1);
expect(result.stored_variables.update_mode).toBe('update');
```

---

## 🧪 Test Helpers

The tests use helper functions from `../helper.ts`:

### `convertCssClasses(css: string)`
Converts CSS to global classes via API endpoint.

**Returns**:
```typescript
{
  converted_classes: Array<GlobalClass>,
  reused_classes: Array<ReuseInfo>,
  skipped_classes: Array<SkipInfo>,
  stats: {
    classes_converted: number,
    classes_reused: number,
    classes_skipped: number,
  },
  performance: {
    total_comparisons: number,
    total_time: number,
    average_time: number,
    max_time: number,
    reused_count: number,
    created_count: number,
  },
  warnings: Array<string>
}
```

### `convertCssVariables(css: string, updateMode?: string)`
Converts CSS variables via API endpoint.

**Parameters**:
- `css`: CSS string with variables
- `updateMode`: 'create_new' (default) or 'update'

**Returns**:
```typescript
{
  stored_variables: {
    created: number,
    updated: number,
    reused: number,
    errors: Array<any>,
    update_mode: string,
    reused_variables?: Array<ReuseInfo>
  }
}
```

---

## 📈 Performance Benchmarks

### Expected Performance (Phase 1)
- **10 classes**: < 0.1s
- **50 classes**: < 0.5s  
- **100 classes**: < 2s
- **100 classes vs 1000 existing**: < 5s

### Tests Validate
- Performance stats are included in response
- Slow comparisons are tracked
- Batch processing works efficiently
- Cache optimization is effective

---

## ⚠️ Known Limitations (By Design)

These are **NOT** bugs, but Phase 1 limitations:

- ✅ Single desktop breakpoint only (multi-breakpoint in Phase 4)
- ✅ O(n×m) comparison algorithm (hash optimization in Phase 2)
- ✅ Strict property matching (semantic equivalence in Phase 3)
- ✅ No state variants (:hover, :active - Phase 4)

---

## 🔧 Test Maintenance

### Adding New Tests
```typescript
test('should handle my new scenario', async () => {
  const css = '.my-class { ... }';
  const result = await convertCssClasses(css);
  
  expect(result.stats.classes_converted).toBe(1);
});
```

### Debugging Failing Tests
```bash
# Run with debug mode
DEBUG=pw:api npx playwright test duplicates/

# Run headed (see browser)
npx playwright test duplicates/ --headed

# Generate trace
npx playwright test duplicates/ --trace on
```

### Updating Expectations
If API response format changes, update assertions in:
- `API Response Format` test suites
- Helper function return types
- Integration test expectations

---

## 📝 Test Checklist

When adding new duplicate detection features:

- [ ] Add unit test for specific behavior
- [ ] Add integration test for real-world scenario
- [ ] Add edge case tests
- [ ] Test performance with large datasets
- [ ] Test error handling
- [ ] Validate API response format
- [ ] Update this README if needed

---

## 🎓 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Names**: Test names describe exactly what they test
3. **Assertions**: Use specific expectations, not generic ones
4. **Performance**: Tests should complete in < 30s total
5. **Coverage**: Test happy path, edge cases, and errors

---

## 📞 Questions?

- See [PHASE-1-IMPLEMENTATION-COMPLETE.md](../../../docs/page-testing/PHASE-1-IMPLEMENTATION-COMPLETE.md)
- See [README-PHASE-1.md](../../../docs/page-testing/README-PHASE-1.md)
- Check API documentation in PRD

---

**Total Tests**: 59 (21 + 23 + 15)  
**Coverage**: Comprehensive  
**Status**: ✅ Complete  
**Last Updated**: 2025-10-16

