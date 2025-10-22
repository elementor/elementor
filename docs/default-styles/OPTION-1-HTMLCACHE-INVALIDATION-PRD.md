# PRD: htmlCache Invalidation for CSS Converter Widgets

## Document Information
- **Created**: October 9, 2025
- **Status**: Draft
- **Priority**: High
- **Complexity**: Medium

---

## Problem Statement

CSS converter widgets display default base classes (`e-paragraph-base`, `e-heading-base`) in the Elementor editor preview despite PHP and JavaScript solutions to remove them.

**Root Cause**: Editor preview uses cached HTML (`htmlCache`) that was generated during widget creation with base classes already baked in. The cached HTML bypasses our runtime PHP logic.

**Reference**: See `TWIG-RENDERING-ARCHITECTURE.md` for complete technical analysis.

---

## Success Criteria

### Must Have
1. ✅ CSS converter widgets in **editor preview** show NO base classes on inner elements
2. ✅ CSS converter widgets on **frontend** show NO base classes (already working)
3. ✅ Regular atomic widgets (non-converter) are NOT affected
4. ✅ Solution works for ALL atomic widget types (paragraph, heading, button, etc.)
5. ✅ No breaking changes to existing Elementor functionality

### Nice to Have
1. 🎯 Minimal performance impact
2. 🎯 No visible loading delay in editor
3. 🎯 Code remains maintainable and clean

---

## Solution Overview

**Strategy**: Force CSS converter widgets to regenerate their HTML by invalidating `htmlCache`, triggering Elementor's existing `renderRemoteServer()` mechanism.

**Key Insight**: Elementor already has infrastructure to re-render widgets via AJAX when `htmlCache` is empty or invalid. We leverage this existing system.

---

## Technical Implementation

### Phase 1: Clear htmlCache on Widget Load

**File**: `plugins/elementor-css/modules/atomic-widgets/assets/js/editor/css-converter-base-styles-override.js`

**Approach**: Detect CSS converter widgets when editor loads and clear their `htmlCache`.

```javascript
( function() {
    'use strict';

    jQuery( window ).on( 'elementor:init', function() {
        
        // Hook into document loaded event
        elementor.on( 'document:loaded', function() {
            clearHtmlCacheForConverterWidgets();
        });

        function clearHtmlCacheForConverterWidgets() {
            // Iterate through all elements in the document
            const elements = elementor.getPreviewView().collection.models;
            
            elements.forEach( ( element ) => {
                clearIfConverterWidget( element );
                
                // Recursively check child elements
                const children = element.get( 'elements' );
                if ( children && children.models ) {
                    children.models.forEach( clearIfConverterWidget );
                }
            });
        }

        function clearIfConverterWidget( model ) {
            // Only process widgets
            if ( model.get( 'elType' ) !== 'widget' ) {
                return;
            }

            // Check if this is a CSS converter widget
            const editorSettings = model.get( 'editor_settings' ) || {};
            const isConverterWidget = 
                editorSettings.disable_base_styles === true ||
                editorSettings.css_converter_widget === true ||
                model.get( 'version' ) === '0.0';

            if ( ! isConverterWidget ) {
                return;
            }

            // Clear the htmlCache to force re-render
            model.setHtmlCache( null );
            
            // Trigger remote render if widget view exists
            if ( model.remoteRender ) {
                model.renderRemoteServer();
            }
        }
    });
}() );
```

**Why This Works**:
1. `setHtmlCache(null)` clears cached HTML
2. `renderRemoteServer()` triggers AJAX call to server
3. Server calls PHP `render()` with our updated `get_base_styles_dictionary()`
4. New HTML without base classes is cached and displayed

---

### Phase 2: Ensure PHP Logic is Correct (Already Done)

**File**: `plugins/elementor-css/modules/atomic-widgets/elements/has-base-styles.php`

**Current Implementation** (already working):
```php
public function get_base_styles_dictionary() {
    // Detect registration vs runtime context
    $is_registration_context = true;
    try {
        $widget_data = $this->get_data();
        $has_id = isset( $widget_data['id'] ) && ! empty( $widget_data['id'] );
        $is_registration_context = empty( $widget_data ) || ! $has_id;
    } catch ( \Throwable $e ) {
        $is_registration_context = true;
    }

    // If CSS converter widget at runtime, return EMPTY array
    if ( ! $is_registration_context && $this->is_css_converter_widget() ) {
        return []; // NO BASE CLASSES
    }

    // Regular widgets get normal base styles
    $result = [];
    $base_styles = array_keys( $this->define_base_styles() );
    foreach ( $base_styles as $key ) {
        $base_class_id = $this->generate_base_style_id( $key );
        $result[ $key ] = $base_class_id;
    }
    return $result;
}
```

**Status**: ✅ Already implemented and working on frontend

---

### Phase 3: Handle Widget Container Classes (Already Done)

**File**: `plugins/elementor-css/modules/atomic-widgets/assets/js/editor/css-converter-base-styles-override.js`

**Current Implementation** (already working):
```javascript
// Override the function
elementor.helpers.getAtomicWidgetBaseStyles = function( model ) {
    const editorSettings = model?.get?.( 'editor_settings' ) || {};
    const isConverterWidget = 
        editorSettings.disable_base_styles === true ||
        editorSettings.css_converter_widget === true;

    if ( isConverterWidget ) {
        return {}; // Empty object = no base styles for container
    }

    // Call original function for regular widgets
    return originalGetAtomicWidgetBaseStyles.call( this, model );
};
```

**Status**: ✅ Already implemented and working for widget containers

---

## Implementation Steps

### Step 1: Update JavaScript Override
- [ ] Add `document:loaded` event listener
- [ ] Implement `clearHtmlCacheForConverterWidgets()` function
- [ ] Implement `clearIfConverterWidget()` helper
- [ ] Test with single CSS converter widget
- [ ] Test with multiple CSS converter widgets
- [ ] Test with nested widgets

### Step 2: Test in Editor
- [ ] Verify htmlCache is cleared on load
- [ ] Verify `renderRemoteServer()` is called
- [ ] Verify AJAX request completes
- [ ] Verify new HTML has no base classes
- [ ] Check browser console for errors
- [ ] Monitor network tab for AJAX calls

### Step 3: Verify PHP Rendering
- [ ] Add debug logging to `render()` method
- [ ] Confirm `get_base_styles_dictionary()` returns `[]`
- [ ] Verify Twig template receives empty `base_styles`
- [ ] Check generated HTML structure
- [ ] Remove debug logging

### Step 4: Performance Testing
- [ ] Measure AJAX call duration
- [ ] Test with 10+ CSS converter widgets
- [ ] Check for race conditions
- [ ] Verify no memory leaks
- [ ] Test editor responsiveness

### Step 5: Edge Case Testing
- [ ] Test with mixed converter/regular widgets
- [ ] Test with deeply nested structures
- [ ] Test with dynamic content
- [ ] Test with undo/redo operations
- [ ] Test with widget duplication
- [ ] Test with copy/paste operations

### Step 6: Playwright Automation
- [ ] Update test assertions
- [ ] Add wait for AJAX completion
- [ ] Test multiple widget types
- [ ] Verify frontend still works
- [ ] Run full test suite

### Step 7: Clean Up
- [ ] Remove all debug logging
- [ ] Add code comments
- [ ] Update documentation
- [ ] Run linter
- [ ] Final code review

---

## Technical Considerations

### Timing & Events

**Critical Timing**: htmlCache must be cleared AFTER document loads but BEFORE widgets render.

**Event Sequence**:
```
1. elementor:init
2. document:loaded          ← CLEAR CACHE HERE
3. preview:loaded
4. Widget views initialize
5. renderRemoteServer()     ← AJAX CALL HAPPENS
6. remote:render            ← NEW HTML RECEIVED
7. Widget displays
```

**Why `document:loaded`?**
- Ensures widget models exist
- Happens before view rendering
- Single execution per document load

---

### Race Conditions

**Potential Issue**: Multiple widgets calling `renderRemoteServer()` simultaneously.

**Mitigation**: Elementor already throttles `renderRemoteServer()` to 1000ms (see `element.js` line 45).

**Additional Safety**: 
```javascript
// Check if remote request already active
if ( model.isRemoteRequestActive() ) {
    return; // Don't trigger duplicate requests
}
```

---

### Performance Impact

**AJAX Calls**: Each CSS converter widget triggers one AJAX request.

**Expected Overhead**:
- Single widget: ~100-200ms
- 10 widgets: ~1-2 seconds (parallel requests)
- 50 widgets: ~3-5 seconds (throttled)

**Optimization Strategies**:
1. ✅ Use existing throttle mechanism (1000ms)
2. ✅ Parallel AJAX requests (browser handles concurrency)
3. 🎯 **Future**: Batch render API (render multiple widgets in one request)

---

### Fallback Behavior

**If AJAX Fails**:
- Widget keeps old htmlCache
- Still shows base classes (degraded state)
- User can manually refresh editor
- No errors thrown

**Graceful Degradation**:
```javascript
model.on( 'remote:render:error', function() {
    console.warn( 'Failed to render CSS converter widget, using cached HTML' );
});
```

---

## Alternative Approaches Considered

### Alternative 1: Clear htmlCache on Widget Creation (Server-Side)
**Approach**: Don't send `htmlCache` when creating CSS converter widgets.

**File**: `plugins/elementor-css/modules/css-converter/services/widgets/widget-creator.php`

```php
public function create_elementor_widget( ... ) {
    // ... existing code ...
    
    // Don't generate htmlCache for converter widgets
    return [
        'id' => $widget_id,
        'elType' => 'widget',
        'widgetType' => $widget_type,
        'settings' => $settings,
        'editor_settings' => [
            'disable_base_styles' => true,
            'css_converter_widget' => true,
        ],
        'version' => '0.0',
        // htmlCache intentionally omitted
    ];
}
```

**Pros**:
- ✅ Cleaner approach
- ✅ No JavaScript intervention needed
- ✅ Works from widget creation

**Cons**:
- ❌ Only works for NEW widgets
- ❌ Doesn't fix EXISTING widgets in database
- ❌ Requires database migration for old widgets

**Decision**: Use as complementary approach, not primary solution.

---

### Alternative 2: Modify htmlCache Content (String Replacement)
**Approach**: Use regex to remove base classes from cached HTML.

```javascript
function stripBaseClasses( htmlCache ) {
    return htmlCache
        .replace( /\be-paragraph-base\b/g, '' )
        .replace( /\be-heading-base\b/g, '' )
        .replace( /class="\s*"/g, '' ); // Remove empty class attributes
}
```

**Pros**:
- ✅ No AJAX calls
- ✅ Instant rendering

**Cons**:
- ❌ Fragile (breaks if HTML structure changes)
- ❌ Must know all base class names
- ❌ Regex complexity for nested classes
- ❌ Doesn't handle dynamic attributes
- ❌ Maintenance nightmare

**Decision**: Rejected - too fragile and unmaintainable.

---

### Alternative 3: Override Twig Rendering Context
**Approach**: Intercept Twig context before rendering.

**Cons**:
- ❌ No client-side Twig rendering exists
- ❌ Would require implementing Twig in JavaScript
- ❌ Massive complexity

**Decision**: Rejected - technically infeasible.

---

## Testing Strategy

### Unit Tests (JavaScript)

**File**: `tests/qunit/editor/css-converter-htmlcache.test.js`

```javascript
QUnit.module( 'CSS Converter - htmlCache Invalidation' );

QUnit.test( 'clearIfConverterWidget clears cache for converter widgets', function( assert ) {
    const model = createMockModel({
        elType: 'widget',
        widgetType: 'e-paragraph',
        editor_settings: {
            css_converter_widget: true
        },
        _htmlCache: '<p class="e-paragraph-base">Test</p>'
    });

    clearIfConverterWidget( model );

    assert.strictEqual( model.getHtmlCache(), null, 'htmlCache should be cleared' );
});

QUnit.test( 'clearIfConverterWidget does not affect regular widgets', function( assert ) {
    const model = createMockModel({
        elType: 'widget',
        widgetType: 'e-paragraph',
        editor_settings: {},
        _htmlCache: '<p class="e-paragraph-base">Test</p>'
    });

    const originalCache = model.getHtmlCache();
    clearIfConverterWidget( model );

    assert.strictEqual( model.getHtmlCache(), originalCache, 'htmlCache should remain unchanged' );
});
```

---

### Integration Tests (Playwright)

**File**: `tests/playwright/sanity/modules/css-converter/default-styles/default-styles-removal.test.ts`

**Updated Test Flow**:
```typescript
test( 'should remove default styles from e-paragraph widgets', async ({ page }) => {
    // 1. Create CSS converter widgets
    const apiResult = await callWidgetConverterAPI( page, testHTML );
    
    // 2. Load editor
    await page.goto( apiResult.edit_url );
    
    // 3. Wait for document:loaded event
    await page.evaluate( () => {
        return new Promise( resolve => {
            elementor.on( 'document:loaded', resolve );
        });
    });
    
    // 4. Wait for AJAX requests to complete
    await page.waitForLoadState( 'networkidle' );
    
    // 5. Get preview iframe
    const previewFrame = page.frameLocator( '#elementor-preview-iframe' );
    
    // 6. Verify NO base classes on inner elements
    const paragraph = previewFrame.locator( '.elementor-widget-e-paragraph p' ).first();
    const classes = await paragraph.getAttribute( 'class' );
    
    expect( classes ).not.toContain( 'e-paragraph-base' );
});
```

**Key Additions**:
- Wait for `document:loaded` event
- Wait for network idle (AJAX completion)
- Verify inner element classes, not just container

---

### Manual Testing Checklist

**Editor Preview**:
- [ ] Single paragraph widget
- [ ] Single heading widget
- [ ] Multiple paragraphs
- [ ] Multiple headings
- [ ] Mixed paragraph + heading
- [ ] Nested containers with widgets
- [ ] Widgets with custom styles
- [ ] Widgets with explicit margins

**Frontend Display**:
- [ ] Verify no base classes (should already work)
- [ ] Verify custom styles still applied
- [ ] Verify explicit margins work

**Editor Operations**:
- [ ] Duplicate widget
- [ ] Copy/paste widget
- [ ] Undo/redo
- [ ] Delete and restore
- [ ] Change widget settings
- [ ] Add new converter widget

**Performance**:
- [ ] Load time with 1 widget
- [ ] Load time with 10 widgets
- [ ] Load time with 50 widgets
- [ ] CPU usage during load
- [ ] Memory usage
- [ ] No console errors

---

## Success Metrics

### Functional Metrics
- ✅ 100% of CSS converter widgets show NO base classes in editor
- ✅ 100% of CSS converter widgets show NO base classes on frontend
- ✅ 0 regressions in regular atomic widgets
- ✅ 0 breaking changes to existing functionality

### Performance Metrics
- 🎯 < 500ms additional load time for 10 widgets
- 🎯 < 2s additional load time for 50 widgets
- 🎯 < 5% CPU increase during editor load
- 🎯 < 10MB memory increase

### Quality Metrics
- ✅ All Playwright tests passing
- ✅ No linter errors
- ✅ No console errors or warnings
- ✅ Code coverage > 80%

---

## Rollout Plan

### Phase 1: Development (Day 1-2)
- Implement htmlCache clearing logic
- Add debug logging
- Manual testing with single widget
- Fix any immediate issues

### Phase 2: Testing (Day 3-4)
- Comprehensive manual testing
- Update Playwright tests
- Performance benchmarking
- Edge case testing

### Phase 3: Review (Day 5)
- Code review
- Documentation review
- Final testing
- Prepare for deployment

### Phase 4: Deployment (Day 6)
- Deploy to staging
- Smoke testing
- Deploy to production
- Monitor for issues

---

## Risk Assessment

### High Risk
**Issue**: AJAX failures prevent widget rendering  
**Mitigation**: Fallback to cached HTML, graceful error handling  
**Severity**: Medium - Editor still works but shows base classes

### Medium Risk
**Issue**: Performance degradation with many widgets  
**Mitigation**: Throttling, parallel requests, batch API (future)  
**Severity**: Low - Acceptable delay for editor load

### Low Risk
**Issue**: Race conditions with rapid widget creation  
**Mitigation**: Existing throttle mechanism, request queuing  
**Severity**: Very Low - Rare edge case

---

## Future Enhancements

### Batch Render API
Create server endpoint to render multiple widgets in single request:

```php
// New endpoint: /wp-json/elementor/v1/widgets/batch-render
public function batch_render_widgets( $request ) {
    $widget_ids = $request->get_param( 'widget_ids' );
    $results = [];
    
    foreach ( $widget_ids as $widget_id ) {
        $results[ $widget_id ] = $this->render_widget( $widget_id );
    }
    
    return $results;
}
```

**Benefits**:
- Single HTTP request for all widgets
- Reduced network overhead
- Faster editor load time

---

## Documentation Updates Required

### User Documentation
- [ ] Update CSS Converter user guide
- [ ] Add note about editor preview refresh
- [ ] Document expected load times

### Developer Documentation
- [ ] Update architecture docs
- [ ] Document htmlCache clearing mechanism
- [ ] Add code examples for similar patterns

### API Documentation
- [ ] No API changes (uses existing endpoints)

---

## Appendix

### Related Documents
- `TWIG-RENDERING-ARCHITECTURE.md` - Complete rendering flow analysis
- `20251009-OPTION-A-RESEARCH-SUMMARY.md` - Initial research
- `20251008-DEFAULT-STYLES-REMOVAL-OPTIONS.md` - Options analysis

### Code References
- `plugins/elementor/assets/dev/js/editor/elements/models/element.js` - renderRemoteServer()
- `plugins/elementor/includes/base/widget-base.php` - get_raw_data() and htmlCache
- `plugins/elementor-css/modules/atomic-widgets/elements/has-base-styles.php` - PHP logic
- `plugins/elementor-css/modules/atomic-widgets/assets/js/editor/css-converter-base-styles-override.js` - JS override

### Key Elementor Events
- `elementor:init` - Editor initialized
- `document:loaded` - Document data loaded
- `preview:loaded` - Preview iframe loaded
- `before:remote:render` - Before AJAX call
- `remote:render` - After AJAX success

---

## Sign-off

**Prepared By**: AI Assistant  
**Date**: October 9, 2025  
**Status**: Ready for Implementation  
**Estimated Effort**: 2-3 days  
**Risk Level**: Low-Medium

