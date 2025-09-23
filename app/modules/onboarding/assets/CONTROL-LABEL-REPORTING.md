
# Control Label Reporting Issue

## Problem Statement

The `post_onboarding_3rd_click` event is incorrectly tracking Elementor control interactions by capturing option values instead of the control label.

## Current Behavior (Incorrect)

**Event**: `post_onboarding_3rd_click`
**Tracked Data**:
- `element_title`: "None Attachment Caption Custom Caption" (concatenated option values)
- `element_id`: "elementor-control-default-c1542" 
- `element_type`: "select"

## Expected Behavior (Correct)

**Event**: `post_onboarding_3rd_click`
**Expected Data**:
- `element_title`: "Caption" (control label text)
- `element_id`: "elementor-control-default-c1542"
- `element_type`: "select"

## Root Cause Analysis

### Current Implementation
The `extractElementTitle()` method in `onboarding-event-tracking.js` correctly:
1. Calls `findElementorControlLabel()` to find the control container
2. Uses `extractControlTitle()` to get the `.elementor-control-title` text
3. Should return "Caption" for this control

### Investigation Required
The issue suggests either:
1. The control label extraction is failing for this specific control type
2. The fallback method `getFallbackElementTitle()` is being used instead
3. The DOM structure differs from expected patterns

## DOM Structure Analysis

```html
<div class="elementor-control elementor-control-caption_source elementor-control-type-select">
    <div class="elementor-control-content">
        <div class="elementor-control-field">
            <label for="elementor-control-default-c2635" class="elementor-control-title">Caption</label>
            <div class="elementor-control-input-wrapper">
                <select id="elementor-control-default-c2635" data-setting="caption_source">
                    <option value="none">None</option>
                    <option value="attachment">Attachment Caption</option>
                    <option value="custom">Custom Caption</option>
                </select>
            </div>
        </div>
    </div>
</div>
```

**Expected Label**: "Caption" (from `.elementor-control-title`)
**Actual Result**: "None Attachment Caption Custom Caption" (from select options)

## Debugging Steps

### 1. Verify Control Detection
Add debug logging to `findElementorControlContainer()`:
```javascript
static findElementorControlContainer( element ) {
    const container = element.closest( '.elementor-control' );
    console.log('🔍 Control container found:', container);
    return container;
}
```

### 2. Verify Label Extraction
Add debug logging to `extractControlTitle()`:
```javascript
static extractControlTitle( controlContainer ) {
    const labelElement = controlContainer.querySelector( '.elementor-control-title' );
    console.log('🔍 Label element:', labelElement);
    console.log('🔍 Label text:', labelElement?.textContent?.trim());
    
    if ( labelElement && labelElement.textContent ) {
        return labelElement.textContent.trim();
    }
    
    return null;
}
```

### 3. Verify Fallback Usage
Add debug logging to `extractElementTitle()`:
```javascript
static extractElementTitle( element ) {
    const elementorLabel = this.findElementorControlLabel( element );
    console.log('🔍 Elementor label found:', elementorLabel);
    
    if ( elementorLabel ) {
        return elementorLabel;
    }
    
    const fallback = this.getFallbackElementTitle( element );
    console.log('🔍 Using fallback title:', fallback);
    return fallback;
}
```

## Potential Solutions

### Solution 1: Fix Label Detection
If the control container detection is failing, ensure the clicked element is properly associated with its parent control.

### Solution 2: Improve Fallback Logic
If the label detection works but returns null, improve the `extractControlTitle()` method to handle edge cases.

### Solution 3: Prevent Option Text Concatenation
If the fallback is being used, ensure `getFallbackElementTitle()` doesn't concatenate all option texts for select elements.

## Testing Instructions

1. Navigate to Elementor editor after onboarding
2. Click on a select control (like Caption dropdown)
3. Check browser console for debug logs
4. Verify the `post_onboarding_3rd_click` event payload
5. Confirm `element_title` contains the control label, not option values

## Success Criteria

- [ ] `element_title` reports "Caption" instead of "None Attachment Caption Custom Caption"
- [ ] Control label extraction works for all Elementor control types
- [ ] Fallback method doesn't concatenate option values for select elements
- [ ] Debug logging helps identify the exact failure point