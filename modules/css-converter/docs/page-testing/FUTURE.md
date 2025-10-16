# Future Features & Improvements

**Last Updated**: October 16, 2025  
**Status**: Planning phase

---

## 🎯 Planned Features

### 1. Media Query Variable Support

**Status**: 🔴 **Not Implemented**  
**Priority**: High  
**Effort**: 3-5 hours  
**Test**: `should handle media query variables as separate scope`

#### Overview
Support CSS variables declared within `@media` queries as separate scope variants. When the same variable is declared in both root and media query with different values, create separate suffixed variables.

#### Example
```css
:root { 
  --font-size: 16px; 
  --spacing: 20px; 
}

@media (max-width: 768px) { 
  :root { 
    --font-size: 14px;  /* Should create --font-size-1 */
    --spacing: 16px;    /* Should create --spacing-1 */
  }
}
```

**Expected Output**:
```
--font-size: 16px (root)
--font-size-1: 14px (media query)
--spacing: 20px (root)
--spacing-1: 16px (media query)
```

#### Root Cause
The `extract_variables_with_scope_recursive()` method in `css-parser.php` was not properly detecting `@media` rules due to incorrect namespace path for `AtRuleBlockList`. Fixed in code but integration not complete.

#### Investigation Done
- ✅ Identified namespace issue: `Sabberworm\CSS\AtRuleBlockList` vs `Sabberworm\CSS\CSSList\AtRuleBlockList`
- ✅ Fixed the import and instanceof check in `css-parser.php`
- ⚠️ Extraction now encounters 0 variables (need further debugging)
- 📋 See: `NESTED-VARIABLES-ISSUE-ANALYSIS.md` Section "Issue #1: Media Query Scope Detection"

#### Next Steps
1. Debug why extraction returns 0 variables after @media fix
2. Ensure both root and media query variables are extracted with correct scopes
3. Update `separate_nested_variables()` to properly handle media query scopes
4. Run tests to verify all 12 pass

#### Related Files
- `tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts` (line 85, skipped)
- `modules/css-converter/parsers/css-parser.php`
- `modules/css-converter/services/variables/nested-variable-extractor.php`
- `modules/css-converter/routes/variables-route.php`

---

### 2. Complex Suffix Generation (3+ Variants)

**Status**: 🟡 **Partially Tested**  
**Priority**: High  
**Effort**: 2-3 hours  
**Test**: `should handle suffix collision detection`

#### Overview
Support variables with 3 or more different values across different scopes. Currently supports up to 2 variants correctly, but the 3rd+ variant suffix is not generated.

#### Example
```css
:root { 
  --color: #ff0000;  /* red */
}

.theme-1 { 
  --color: #ff0000;  /* red - same, reuse */
}

.theme-2 { 
  --color: #00ff00;  /* green - different, create --color-1 */
}

.theme-3 { 
  --color: #0000ff;  /* blue - different, create --color-2 */
}
```

**Expected Output**:
```
--color: #ff0000 (red)
--color-1: #00ff00 (green)
--color-2: #0000ff (blue)
```

**Current Output** (BROKEN):
```
--color: #ff0000 (red)
--color-1: #00ff00 (green)
/* Missing: --color-2 */
```

#### Root Cause
The suffix counter and mapping logic in `extract_and_rename_nested_variables()` may have an off-by-one error or instance filtering issue. Requires detailed logging to diagnose.

#### Investigation Done
- 📋 See: `NESTED-VARIABLES-ISSUE-ANALYSIS.md` Section "Issue #2: Complex Suffix Generation"
- Identified 4 potential causes and solutions (2A-2D)

#### Next Steps
1. Add detailed logging to `extract_and_rename_nested_variables()`
2. Trace suffix assignment for 3+ variants
3. Fix counter logic or instance filtering
4. Run tests to verify all 12 pass

#### Related Files
- `tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts` (line 221)
- `modules/css-converter/routes/variables-route.php` (extract_and_rename_nested_variables)
- `modules/css-converter/services/variables/nested-variable-renamer.php`

---

## 📚 Reference Documentation

### Analysis Documents
- `NESTED-VARIABLES-ISSUE-ANALYSIS.md` - Deep technical analysis of both issues
- `NESTED-VARIABLES-VISUAL-GUIDE.md` - Visual diagrams and flowcharts
- `DOCUMENTATION-INDEX.md` - Navigation guide to all documentation
- `MAX-DEBUG-MODE-RESEARCH.md` - WordPress debugging tools and techniques
- `DEBUG-MODE-QUICK-REFERENCE.md` - Quick reference for debugging

### Code References
- `plugins/elementor-css/modules/css-converter/docs/page-testing/1-NESTED-VARIABLES.md` - Main implementation spec
- `plugins/elementor-css/tests/playwright/sanity/modules/css-converter/variables/nested-variables.test.ts` - Test suite

---

## 🚀 Implementation Plan

### Phase 1: Media Query Support
**Timeline**: Week 1  
**Tasks**:
1. Debug why extraction returns 0 after @media fix
2. Ensure scopes are properly constructed (not just `:root`)
3. Verify both root and media query variables are extracted
4. Update scope handling logic
5. Test and verify

### Phase 2: Complex Suffix Support
**Timeline**: Week 1-2  
**Tasks**:
1. Add comprehensive logging to suffix assignment
2. Identify exact failure point for 3+ variants
3. Fix counter or instance filtering logic
4. Test with various scenarios
5. Verify performance impact

### Phase 3: Final Testing & Deployment
**Timeline**: Week 2  
**Tasks**:
1. Run full test suite (all 12 tests)
2. Run linting and fix any issues
3. Performance testing
4. Deploy to production

---

## ✅ Completion Criteria

- [x] Issue #1 root cause identified (namespace issue)
- [ ] Issue #1 fully fixed and tested (media queries)
- [ ] Issue #2 root cause identified (counter/filtering)
- [ ] Issue #2 fully fixed and tested (3+ suffixes)
- [ ] All 12 tests passing (100%)
- [ ] 0 new linting errors
- [ ] Performance acceptable (< 5s for test suite)
- [ ] Documentation updated

---

## 💡 Notes for Future Developer

1. **Namespace Issues**: Sabberworm CSS parser has multiple namespaces (e.g., `CSSList\` vs direct namespace). Check imports carefully.

2. **Scope Handling**: Media query scopes need to be constructed properly to distinguish `@media (768px) :root` from just `:root`.

3. **Testing Strategy**: Use `error_log()` extensively to trace data flow through the pipeline. The most valuable debug technique is logging before and after each major step.

4. **Variable Deduplication**: Keys use `md5(scope_string)` to avoid collisions. Different scopes = different keys, even if variable name is identical.

5. **Debug Log Location**: WordPress debug logs are in `/wp-content/debug.log` when `WP_DEBUG_LOG` is defined in `wp-config.php`.

6. **Regression Testing**: After fixing these issues, re-run all 12 tests to ensure no regressions in other functionality.

---

## 📞 Questions to Ask

When resuming this work:
1. Has the media query issue been debugged further elsewhere?
2. Are there other variable scope types we should handle (e.g., `@supports`)?
3. Should we support more than 3+ variants? (currently planning for unlimited)
4. What's the performance impact of media query handling?
5. Should media query variables be treated as "nested" (different scope) or grouped by media condition?

