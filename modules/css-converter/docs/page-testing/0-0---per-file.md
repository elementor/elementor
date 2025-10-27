## per-file-parsing.test.ts (4 passed, 1 failed)

### Failed Tests:
- per-file-parsing.test.ts:38 - Convert URL with selector

---

# PRD: Fix URL with Selector Conversion

## Problem Statement

The test "Convert URL with selector" is failing when attempting to convert a URL (`https://oboxthemes.com/`) with a specific selector (`.elementor-element-6d397c1`) into Elementor widgets.

**Test Location**: `per-file-parsing.test.ts:38`

**Expected Behavior**: 
- API should return `success: true`
- Should create widgets (`widgets_created > 0`)
- Should return a valid `post_id`

## Root Cause Analysis Required

### Investigation Steps:
1. **API Endpoint Analysis**
   - Verify the CSS converter API handles `type: 'url'` requests
   - Check if selector parameter is properly processed
   - Confirm URL fetching and parsing logic

2. **Selector Processing**
   - Validate `.elementor-element-6d397c1` selector extraction
   - Ensure DOM parsing works with external URLs
   - Check if CSS styles are correctly associated with the selector

3. **Error Identification**
   - Capture actual API response vs expected
   - Check for network timeouts or CORS issues
   - Verify external URL accessibility

## Technical Requirements

### Must Fix:
- [ ] URL fetching mechanism for external sites
- [ ] Selector-based content extraction from fetched HTML
- [ ] CSS parsing and widget creation from URL content
- [ ] Proper error handling for external URL failures

### API Contract:
```typescript
POST /css-converter/api
{
  type: 'url',
  content: 'https://oboxthemes.com/',
  selector: '.elementor-element-6d397c1'
}

Expected Response:
{
  success: true,
  widgets_created: number > 0,
  post_id: string
}
```

## Implementation Plan

### Phase 1: Diagnosis
1. Add debug logging to URL processing pipeline
2. Test with simplified URL and selector
3. Verify external URL accessibility and CORS policies

### Phase 2: Fix Implementation
1. Enhance URL fetching with proper error handling
2. Implement robust selector-based content extraction
3. Ensure CSS parsing works with external stylesheets
4. Add timeout and retry mechanisms

### Phase 3: Validation
1. Run failing test to confirm fix
2. Test with various external URLs and selectors
3. Verify no regression in other per-file parsing tests

## Acceptance Criteria

- [ ] Test `per-file-parsing.test.ts:38` passes consistently
- [ ] API returns `success: true` for valid URL + selector combinations
- [ ] `widgets_created` count is greater than 0
- [ ] Valid `post_id` is returned
- [ ] Proper error handling for invalid URLs or selectors
- [ ] No performance degradation in URL processing

## Risk Assessment

**High Risk**: External URL dependency may cause flaky tests
**Mitigation**: Implement proper timeout handling and consider mocking for CI

**Medium Risk**: CORS restrictions on external sites
**Mitigation**: Add proper headers and fallback mechanisms
