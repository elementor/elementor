# CSS Generation Issues - Comprehensive Fix

## Issues Identified

### 1. CSS Variable Definitions Missing ✅ ANALYZED
**Issue**: `color: var(--e-global-color-e66ebc9);` but variable definition not generated
**Root Cause**: Variable definitions are not present in the source CSS - they're defined by Elementor elsewhere
**Status**: This is expected behavior - variables used without definitions should be preserved as-is

### 2. Order Property Target ⏳ IN PROGRESS  
**Issue**: `order: 0;` applied to widget instead of `.elementor-element`
**Root Cause**: Property mapping targeting wrong selector
**Fix Needed**: Update property mapper to apply `order` to container element

### 3. Missing Nested Selectors ⏳ PENDING
**Issue**: `body.loaded .loading { background: none; }` not being processed
**Root Cause**: Nested selector processing not handling complex selectors
**Fix Needed**: Improve nested selector detection and processing

### 4. Broken Font-Size Values ⏳ PENDING
**Issue**: 
- `font-size: 15.rem;` (invalid - should be `15rem`)
- `font-size: 0var(--e-global-typography-text-font-size);` (invalid - missing space)
**Root Cause**: CSS parsing/cleaning corrupting values
**Fix Needed**: Improve CSS value sanitization

### 5. Empty CSS Rules ⏳ PENDING
**Issue**: Empty rules being generated:
```css
.elementor .elementor-element { }
.elementor .e-con { }
.elementor .loading--body-loaded { }
```
**Root Cause**: Rules with no properties being output
**Fix Needed**: Filter out empty rules before CSS generation

### 6. Nested Class Naming ⏳ PENDING
**Issue**: `loading--body-loaded` should be `loading--loaded` (remove HTML tag)
**Root Cause**: Nested class generation including HTML tag names
**Fix Needed**: Update nested class naming to exclude HTML tags

### 7. Background None Conversion ⏳ PENDING
**Issue**: `background: none;` might need conversion to `background: transparent;`
**Root Cause**: Browser compatibility for `none` value
**Fix Needed**: Convert `none` to `transparent` if needed

## Implementation Plan

### Phase 1: Property Target Fixes
- [ ] Fix `order` property targeting
- [ ] Fix other layout properties targeting correct elements

### Phase 2: CSS Value Sanitization
- [ ] Fix broken font-size values (remove dots, fix spacing)
- [ ] Convert `background: none` to `background: transparent`
- [ ] Improve CSS value parsing

### Phase 3: Selector Processing
- [ ] Improve nested selector detection for complex selectors
- [ ] Fix nested class naming to exclude HTML tags
- [ ] Add missing complex nested selectors

### Phase 4: CSS Output Optimization
- [ ] Filter out empty CSS rules
- [ ] Optimize CSS generation
- [ ] Remove redundant rules

## Files to Modify

1. **Property Mappers**: Fix targeting and value processing
2. **CSS Processor**: Improve selector processing and value sanitization  
3. **CSS Generator**: Add empty rule filtering and optimization
4. **Nested Class Service**: Fix class naming logic

## Expected Results

After fixes:
- ✅ Proper property targeting (order on .elementor-element)
- ✅ Clean font-size values (15rem, proper spacing)
- ✅ All nested selectors processed correctly
- ✅ No empty CSS rules
- ✅ Clean nested class names
- ✅ Proper background value handling
