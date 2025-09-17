# Mixpanel Source Tracking Analysis

## 📊 Current Implementation Status

### ✅ **Step 1: Onboarding Source Event Tracking (COMPLETED)**

**Event Name:** `onboarding_source`

**Implementation Location:** `good-to-go.js` page (Step 4 of onboarding)

**Source Values Tracked:**
- `'site_planner'` - AI Site Planner option
- `'kit_library'` - Template Library option  
- `'blank_canvas'` - Blank Editor option

**Event Structure:**
```javascript
{
    event: 'onboarding_source',
    location: 'plugin_onboarding',
    trigger: 'click',
    step_number: 4,
    step_name: 'good_to_go',
    onboarding_source: 'site_planner' | 'kit_library' | 'blank_canvas'
}
```

**Files Modified:**
- `utils/onboarding-event-tracking.js` - Added `ONBOARDING_SOURCE` event and `sendOnboardingSource()` method
- `pages/good-to-go.js` - Added `clickAction` to all three Card components

---

## 🎯 **Target Goal: Editor First Load Tracking**

**Desired Event:** `editor_first_load_post_onboarding`

**Required Property:** `editor_loaded_from_onboarding_source: {site_planner/kit_library/blank_canvas}`

---

## 🔍 **Mixpanel Query Analysis**

### ❌ **Client-Side Query Limitations**

**Current Mixpanel Integration (`events-manager/assets/js/module.js`):**
```javascript
// WRITE-ONLY operations available:
mixpanel.track(eventName, eventData);     // ✅ Send events
mixpanel.people.set_once(userProperties); // ✅ Set user properties  
mixpanel.identify(userId);                 // ✅ Identify user
```

**Missing Query Capabilities:**
- ❌ No `mixpanel.get_property()` method
- ❌ No `mixpanel.query_events()` method
- ❌ No client-side data retrieval APIs

### 🚫 **Why Mixpanel Query Approach Won't Work**

1. **Security Constraints**: Event querying requires server-side API calls with project credentials
2. **Library Limitations**: `mixpanel-browser` SDK is designed for write-only operations
3. **Performance Impact**: API queries would add latency to editor loading
4. **Reliability Issues**: Editor functionality would depend on external Mixpanel availability

---

## 🛠️ **Recommended Implementation Strategy**

### **Hybrid Approach: WordPress Storage + Mixpanel Events**

**Step 1: Enhanced Source Tracking (COMPLETED)**
- ✅ Send `onboarding_source` event to Mixpanel when user selects option
- ✅ Track all three source types: `site_planner`, `kit_library`, `blank_canvas`

**Step 2: WordPress Storage Integration (PENDING)**
```javascript
// In good-to-go.js Card onClick:
OnboardingEventTracking.sendOnboardingSource('site_planner'); // → Mixpanel
saveOnboardingSourceToWP('site_planner');                     // → WordPress DB
```

**Step 3: Editor Load Detection (PENDING)**
```javascript
// In main editor initialization:
elementorCommon.elements.$window.on('elementor:loaded', () => {
    const source = getOnboardingSourceFromWP(); // Fast local query
    if (source && !hasTrackedFirstLoad()) {
        elementorCommon.eventsManager.dispatchEvent('editor_first_load_post_onboarding', {
            editor_loaded_from_onboarding_source: source
        });
        clearOnboardingSourceFlag();
    }
});
```

---

## 📋 **Implementation Plan**

### **Phase 1: WordPress Storage (Next)**
- [ ] Add WordPress option storage when source is selected
- [ ] Create helper functions for storing/retrieving source data
- [ ] Use similar pattern to checklist module's `elementor_checklist` option

### **Phase 2: Editor Load Tracking (Final)**
- [ ] Hook into `elementor:loaded` event in main editor
- [ ] Check for stored onboarding source data
- [ ] Send tracking event with source information
- [ ] Clear flag after first successful tracking

### **Phase 3: Testing & Validation**
- [ ] Test complete flow: onboarding → source selection → editor load → tracking
- [ ] Verify both Mixpanel events are sent correctly
- [ ] Ensure no duplicate tracking occurs

---

## 🔧 **Technical References**

**Checklist Module Pattern:**
- Uses `elementor_checklist` WordPress option for persistence
- Tracks editor visit count with `e_editor_counter` option
- Hooks into `elementor:loaded` for editor initialization detection

**Event Manager Integration:**
- Uses `elementorCommon.eventsManager.dispatchEvent()` for Mixpanel events
- Follows `editor_events` configuration pattern
- Includes standard event metadata (location, trigger, step info)

**Files to Modify Next:**
- `onboarding/module.php` - Add WordPress storage methods
- `assets/js/pages/good-to-go.js` - Add WordPress storage calls
- Main editor files - Add first-load detection logic

---

## 📝 **Notes**

- **Current Status**: Step 1 complete, source selection tracking implemented
- **Next Priority**: WordPress storage integration for reliable source persistence
- **Alternative Considered**: Direct Mixpanel querying (rejected due to technical limitations)
- **Pattern Reference**: Following checklist module's approach for editor load detection
