# A/B Testing Technical Documentation

## Architecture Overview

### Event Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Onboarding Module                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐       ┌──────────────────┐                       │
│  │ hello-theme  │       │ Other Pages      │                       │
│  │  (Step 2)    │       │ (Steps 1,3,4,5,6)│                       │
│  └──────┬───────┘       └────────┬─────────┘                       │
│         │                        │                                 │
│         │ useEffect()           │ Various actions                 │
│         │                        │                                 │
│         v                        v                                 │
│  ┌────────────────────────────────────────┐                        │
│  │    onboarding-tracker.js               │                        │
│  │  ┌──────────────────────────────────┐  │                        │
│  │  │ sendExperimentStarted()          │  │ NEW                    │
│  │  │ - Gets variant                   │  │                        │
│  │  │ - Calls mixpanel.track directly  │  │                        │
│  │  └──────────────────────────────────┘  │                        │
│  │                                        │                        │
│  │  ┌──────────────────────────────────┐  │                        │
│  │  │ All other tracking methods       │  │ Existing               │
│  │  │ - sendHelloBizContinue()        │  │                        │
│  │  │ - trackStepAction()             │  │                        │
│  │  │ - sendStepEndState()            │  │                        │
│  │  └─────────┬────────────────────────┘  │                        │
│  └────────────┼───────────────────────────┘                        │
│               │                                                     │
└───────────────┼─────────────────────────────────────────────────────┘
                │
                │ dispatchEvent()
                v
┌─────────────────────────────────────────────────────────────────────┐
│                    event-dispatcher.js                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ dispatch(eventName, payload)                                  │  │
│  │ - Checks if events manager available                         │  │
│  │ - Checks if can_send_events                                  │  │
│  └─────────────────────────┬────────────────────────────────────┘  │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            │ elementorCommon.eventsManager.dispatchEvent()
                            v
┌─────────────────────────────────────────────────────────────────────┐
│            core/common/modules/events-manager/module.js             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ dispatchEvent(name, data)                                     │  │
│  │ ┌────────────────────────────────────────────────────────┐   │  │
│  │ │ Adds global properties:                                 │   │  │
│  │ │ - user_id, subscription_id, user_tier                  │   │  │
│  │ │ - url, wp_version, client_id                           │   │  │
│  │ │ - app_version, site_language                           │   │  │
│  │ │ - ab_test_variant (NEW)                                │   │  │
│  │ └────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────┬────────────────────────────────────┘  │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            │ mixpanel.track(name, eventData)
                            v
                    ┌───────────────┐
                    │   Mixpanel    │
                    └───────────────┘
```

### Key Components

#### 1. onboarding-tracker.js
**Location**: `assets/js/utils/modules/onboarding-tracker.js`

**Purpose**: Central tracking orchestrator for onboarding events

**Key Methods**:
- `sendExperimentStarted()` - NEW: Sends $experiment_started event
- `getExperimentVariant()` - NEW: Retrieves variant from config
- `onStepLoad(stepNumber)` - Called when each step loads
- `trackStepAction(stepNumber, action, data)` - Tracks user actions
- `sendStepEndState(stepNumber)` - Sends state when leaving step
- `setupAllUpgradeButtons(currentStep)` - Sets up upgrade button tracking

**Event Storage Keys** (from storage-manager.js):
- `STEP1_ACTIONS`, `STEP2_ACTIONS`, `STEP3_ACTIONS`, `STEP4_ACTIONS`
- `PENDING_SKIP`, `PENDING_TOP_UPGRADE`, `PENDING_EXIT_BUTTON`
- `STEP4_SITE_STARTER_CHOICE`

#### 2. event-dispatcher.js
**Location**: `assets/js/utils/modules/event-dispatcher.js`

**Purpose**: Wrapper around elementorCommon.eventsManager

**Key Functions**:
- `dispatch(eventName, payload)` - Main dispatch function
- `canSendEvents()` - Checks if tracking enabled
- `createStepEventPayload(step, name, data)` - Creates standardized payload
- `dispatchStepEvent(name, step, stepName, data)` - Helper for step events

**Event Names** (ONBOARDING_EVENTS_MAP):
```javascript
CORE_ONBOARDING: 'core_onboarding'
HELLO_BIZ_CONTINUE: 'core_onboarding_s2_hellobiz'
STEP1_END_STATE: 'core_onboarding_s1_end_state'
STEP2_END_STATE: 'core_onboarding_s2_end_state'
STEP3_END_STATE: 'core_onboarding_s3_end_state'
STEP4_END_STATE: 'core_onboarding_s4_end_state'
// ... more events
```

**Step Names** (ONBOARDING_STEP_NAMES):
```javascript
CONNECT: 'connect'              // Step 1
HELLO_BIZ: 'hello_biz'          // Step 2
PRO_FEATURES: 'pro_features'    // Step 3
SITE_STARTER: 'site_starter'    // Step 4
SITE_NAME: 'site_name'          // Step 5
SITE_LOGO: 'site_logo'          // Step 6
```

#### 3. events-manager/module.js
**Location**: `core/common/modules/events-manager/assets/js/module.js`

**Purpose**: Core events infrastructure, directly interfaces with Mixpanel

**Key Methods**:
- `onInit()` - Initializes mixpanel with token
- `enableTracking()` - Sets up user identification
- `dispatchEvent(name, data)` - Adds global properties and calls mixpanel.track()

**Global Properties Added**:
```javascript
{
    user_id: // from library_connect
    subscription_id: // from editor_events
    user_tier: // from library_connect (free/essential/advanced/expert/agency/pro)
    url: // hashed site URL
    wp_version: // WordPress version
    client_id: // site key
    app_version: // Elementor version
    site_language: // locale
    // ...custom event data
}
```

#### 4. module.php (Server-side)
**Location**: `core/common/modules/events-manager/module.php`

**Purpose**: PHP configuration for events manager

**Key Method**: `get_editor_events_config()`
- Checks if tracking enabled
- Prepares config for JS
- Sets Mixpanel token

---

## Onboarding Flow Details

### Step Mapping
```
Page ID       → Step Number → Step Name      → Route
─────────────────────────────────────────────────────────────
account       → 1           → connect        → /onboarding (default)
connect       → 1           → connect        → /onboarding
hello         → 2           → hello_biz      → /onboarding/hello
hello_biz     → 2           → hello_biz      → /onboarding/hello
chooseFeatures→ 3           → pro_features   → /onboarding/chooseFeatures
pro_features  → 3           → pro_features   → /onboarding/chooseFeatures
site_starter  → 4           → site_starter   → /onboarding/goodToGo
goodToGo      → 4           → site_starter   → /onboarding/goodToGo
siteName      → 5           → site_name      → /onboarding/siteName
siteLogo      → 6           → site_logo      → /onboarding/siteLogo
```

### Step 2 (Hello Theme) - Event Flow

**On Page Load**:
1. Component mounts: `hello-theme.js`
2. `useEffect()` runs (lines 36-47)
3. Calls: `OnboardingEventTracking.setupAllUpgradeButtons(state.currentStep)`
4. Calls: `OnboardingEventTracking.onStepLoad(2)`
5. **NEW**: Will call `OnboardingEventTracking.sendExperimentStarted()`

**User Actions Tracked**:
- Button click: `trackStepAction(2, 'continue_hello_biz')`
- Upgrade hover: Tracked via `setupAllUpgradeButtons()`
- Exit: `sendExitButtonEvent(currentStep)`
- Skip: Via skip button handler

**On Page Exit**:
- `sendStepEndState(2)` → fires `core_onboarding_s2_end_state`
- Includes all step actions in `step2_actions` array

### Event Payload Structure

**Standard Step Event**:
```javascript
{
    // Global properties (added by events-manager)
    user_id: "12345",
    subscription_id: "sub_abc",
    user_tier: "free",
    url: "hashed_url",
    wp_version: "6.4",
    client_id: "site_key_123",
    app_version: "3.32.0",
    site_language: "en_US",
    ab_test_variant: "A", // NEW
    
    // Event-specific properties
    location: "plugin_onboarding",
    trigger: "click",
    step_number: 2,
    step_name: "hello_biz",
    time_spent: "45s",
    step_time_spent: "30s",
    
    // Action-specific data
    // ... varies by event
}
```

**$experiment_started Event**:
```javascript
{
    // Note: May or may not include global properties
    // depending on implementation approach
    "Experiment name": "onboarding-a-b",
    "Variant name": "A"
}
```

---

## Configuration & Data Sources

### Window Objects Available

#### elementorAppConfig
```javascript
elementorAppConfig = {
    onboarding: {
        eventPlacement: "Onboarding wizard",
        onboardingAlreadyRan: false,
        onboardingVersion: "1.0.0",
        isLibraryConnected: true/false,
        helloInstalled: true/false,
        helloActivated: true/false,
        helloOptOut: true/false,
        siteName: "Site Name",
        siteLogo: { id, url },
        urls: { kitLibrary, sitePlanner, createNewPage, ... },
        utms: { connectTopBar, connectCta, ... },
        nonce: "wp_nonce",
        experiment: true,
        abVariant: "A" // NEW - to be added
    }
}
```

#### elementorCommon
```javascript
elementorCommon = {
    config: {
        editor_events: {
            can_send_events: true/false,
            token: "mixpanel_token",
            subscription_id: "sub_123",
            elementor_version: "3.32.0",
            site_url: "hashed_url",
            wp_version: "6.4",
            site_language: "en_US",
            site_key: "key_123"
        },
        library_connect: {
            is_connected: true/false,
            user_id: "user_123",
            current_access_tier: "free",
            current_access_level: 0,
            plan_type: "free"
        }
    },
    eventsManager: {
        dispatchEvent: function(name, data) { ... }
    }
}
```

---

## Implementation Patterns

### Pattern 1: Direct Event Tracking
```javascript
// Used for standard events via event-dispatcher
OnboardingEventTracking.trackStepAction(2, 'action_name', {
    custom_property: 'value'
});
```

### Pattern 2: Direct Mixpanel Call
```javascript
// Used for special events like $experiment_started
if (typeof mixpanel !== 'undefined') {
    mixpanel.track('$experiment_started', {
        'Experiment name': 'onboarding-a-b',
        'Variant name': variant
    });
}
```

### Pattern 3: Stored Events (for offline/delayed tracking)
```javascript
// Events stored in localStorage if tracking not available
this.sendEventOrStore('EVENT_TYPE', eventData);
// Later retrieved and sent when tracking becomes available
this.sendAllStoredEvents();
```

---

## Storage & Persistence

### localStorage Keys Used
```
elementor_onboarding_step1_actions
elementor_onboarding_step2_actions
elementor_onboarding_step3_actions
elementor_onboarding_step4_actions
elementor_onboarding_pending_skip
elementor_onboarding_pending_top_upgrade
elementor_onboarding_pending_exit
elementor_onboarding_step4_site_starter_choice
elementor_onboarding_initiated
elementor_onboarding_start_time
elementor_onboarding_step_{n}_start_time
```

### Data Structures Stored
```javascript
// Step actions
[
    { action: "continue_hello_biz", timestamp: 1234567890 },
    { action: "upgrade_hover", upgrade_hovered: "on_topbar", timestamp: 1234567891 }
]

// Site starter choice
{
    site_starter: "kit_library",
    timestamp: 1234567890,
    return_event_sent: false
}
```

---

## A/B Testing Implementation Plan

### Changes Required

#### 1. Add Variant to Config (PHP)
**File**: `module.php` (line ~123)
```php
Plugin::$instance->app->set_settings('onboarding', [
    // ... existing settings
    'abVariant' => $this->get_ab_test_variant(), // NEW
]);
```

#### 2. Add Experiment Started Method (JS)
**File**: `onboarding-tracker.js` (after line 860)
```javascript
sendExperimentStarted() {
    const variant = this.getExperimentVariant();
    
    if (!variant) {
        return;
    }
    
    // Check if already sent (one-time only)
    if (StorageManager.exists(ONBOARDING_STORAGE_KEYS.EXPERIMENT_STARTED)) {
        return;
    }
    
    // Direct mixpanel call
    if (typeof mixpanel !== 'undefined') {
        mixpanel.track('$experiment_started', {
            'Experiment name': 'onboarding-a-b',
            'Variant name': variant
        });
        
        // Mark as sent
        StorageManager.setString(
            ONBOARDING_STORAGE_KEYS.EXPERIMENT_STARTED, 
            'true'
        );
    }
}

getExperimentVariant() {
    return elementorAppConfig?.onboarding?.abVariant || null;
}
```

#### 3. Add Storage Key
**File**: `storage-manager.js`
```javascript
export const ONBOARDING_STORAGE_KEYS = {
    // ... existing keys
    EXPERIMENT_STARTED: 'elementor_onboarding_experiment_started', // NEW
};
```

#### 4. Call from Step 2
**File**: `hello-theme.js` (in useEffect around line 46)
```javascript
useEffect(() => {
    // ... existing code
    OnboardingEventTracking.setupAllUpgradeButtons(state.currentStep);
    OnboardingEventTracking.onStepLoad(2);
    OnboardingEventTracking.sendExperimentStarted(); // NEW
}, []);
```

#### 5. Add Variant to All Events
**File**: `events-manager/module.js` (in dispatchEvent around line 46)
```javascript
dispatchEvent(name, data) {
    // ... existing checks
    
    const eventData = {
        user_id: elementorCommon.config.library_connect?.user_id || null,
        // ... existing properties
        ab_test_variant: this.getAbTestVariant(), // NEW
        ...data,
    };
    
    mixpanel.track(name, { ...eventData });
}

getAbTestVariant() {
    return elementorAppConfig?.onboarding?.abVariant || null;
}
```

---

## Testing Scenarios

### Scenario 1: User with Variant A
1. Load onboarding → variant "A" assigned
2. Navigate to Step 2
3. Check: $experiment_started sent with Variant name: "A"
4. Complete onboarding
5. Check: All events have ab_test_variant: "A"

### Scenario 2: User with Variant B
Same as Scenario 1, but with "B"

### Scenario 3: User without Variant
1. Load onboarding → no variant assigned
2. Navigate to Step 2
3. Check: $experiment_started NOT sent
4. Complete onboarding
5. Check: All events have ab_test_variant: null

### Scenario 4: User Navigates Back to Step 2
1. Load Step 2 → $experiment_started sent
2. Navigate to Step 3
3. Navigate back to Step 2
4. Check: $experiment_started NOT sent again (one-time only)

---

## Mixpanel Events Reference

### Existing Onboarding Events
```
core_onboarding                           - Onboarding initiated
core_onboarding_s1_end_state              - Step 1 complete
core_onboarding_s2_hellobiz               - Hello Biz continue clicked
core_onboarding_s2_end_state              - Step 2 complete
core_onboarding_s3_upgrade_now            - Upgrade clicked on Step 3
core_onboarding_s3_end_state              - Step 3 complete
core_onboarding_s4_end_state              - Step 4 complete
core_onboarding_s4_return                 - User returns to Step 4
core_onboarding_skip                      - Skip button clicked
core_onboarding_exit_button               - Exit button clicked
core_onboarding_top_upgrade               - Top upgrade button clicked
core_onboarding_connect_status            - Connection status
core_onboarding_s1_create_my_account      - Create account clicked
core_onboarding_create_account_status     - Account creation status
core_onboarding_s1_clicked_connect        - Connect button clicked
editor_loaded_from_onboarding             - Editor loaded after onboarding
post_onboarding_1st_click                 - First post-onboarding click
post_onboarding_2nd_click                 - Second post-onboarding click
post_onboarding_3rd_click                 - Third post-onboarding click
```

### New Event
```
$experiment_started                       - A/B test experiment started
  Properties:
    - Experiment name: "onboarding-a-b"
    - Variant name: "A" or "B"
```

---

## Debugging & Monitoring

### Browser Console Checks
```javascript
// Check if variant is available
console.log(elementorAppConfig?.onboarding?.abVariant);

// Check if events manager available
console.log(elementorCommon?.eventsManager);

// Check if tracking enabled
console.log(elementorCommon?.config?.editor_events?.can_send_events);

// Check mixpanel
console.log(typeof mixpanel !== 'undefined');

// Check storage
console.log(localStorage.getItem('elementor_onboarding_experiment_started'));
```

### Mixpanel Dashboard Queries
```
// Count $experiment_started events
Event: $experiment_started
Filter: Experiment name = "onboarding-a-b"
Group by: Variant name

// Check variant distribution
Event: ANY onboarding event
Filter: ab_test_variant != null
Group by: ab_test_variant

// Funnel by variant
Funnel: 
  Step 1: core_onboarding
  Step 2: core_onboarding_s2_hellobiz
  Step 3: core_onboarding_s3_end_state
Group by: ab_test_variant
```

---

## Best Practices & Gotchas

### Do's
✅ Always check if mixpanel is available before calling
✅ Use StorageManager for localStorage operations
✅ Follow existing event naming conventions
✅ Add defensive checks for config values
✅ Test with tracking enabled AND disabled
✅ Document experiment name and purpose

### Don'ts
❌ Don't assume window objects are always available
❌ Don't call mixpanel.track directly except for special events
❌ Don't modify event names (breaks Mixpanel integrations)
❌ Don't store sensitive data in localStorage
❌ Don't send events if can_send_events is false

### Common Issues
1. **Event not showing in Mixpanel**: Check can_send_events flag
2. **Duplicate events**: Check storage keys and one-time guards
3. **Missing properties**: Check if config is populated on window
4. **Variant not persisting**: Check localStorage and config source

---

## Future Enhancements

### Potential Improvements
- Support for multiple simultaneous experiments
- Experiment-specific event filtering
- Automatic variant assignment in JS (without PHP)
- Experiment end date/condition tracking
- Variant exposure logging
- More granular experiment scoping (per-step experiments)

### Scalability Considerations
- Use event name prefixes for experiment-specific events
- Consider separate storage keys per experiment
- Add experiment registry/config system
- Implement experiment lifecycle management

