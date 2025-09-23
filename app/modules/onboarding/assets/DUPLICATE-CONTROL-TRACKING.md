# Duplicate Post-Onboarding Click Tracking Issue

## Problem Statement

The `post_onboarding_2nd_click` and `post_onboarding_3rd_click` events are being duplicated, resulting in multiple identical events being fired for the same user interaction.

## Current Behavior (Incorrect)

**Observed Issue**: Multiple events fired for single click interactions
- `post_onboarding_2nd_click` - Fired multiple times for the same click
- `post_onboarding_3rd_click` - Fired multiple times for the same click

**Example Duplicate Event**:
```
Event: post_onboarding_3rd_click
Selector: div.elementor-control-content > div.elementor-control-field > div.elementor-control-input-wrapper.elementor-control-unit-5 > select#elementor-control-default-c1542
Title: None Attachment Caption Custom Caption
```

## Expected Behavior (Correct)

**Expected**: Each click should generate exactly ONE event
- `post_onboarding_2nd_click` - Fired once per unique click
- `post_onboarding_3rd_click` - Fired once per unique click

## Root Cause Analysis

### Current Implementation Review

The post-onboarding click tracking system in `onboarding-event-tracking.js`:

1. **Event Listener Setup**: `setupPostOnboardingClickTracking()` adds a global click listener
2. **Click Counter**: Uses `localStorage` to track click count (1, 2, 3)
3. **Event Dispatch**: Fires appropriate event based on click count
4. **Cleanup**: Removes listener after 3 clicks

### Potential Root Causes

#### 1. **Multiple Event Listener Registration**
```javascript
// Potential issue: setupPostOnboardingClickTracking() called multiple times
static setupPostOnboardingClickTracking() {
    const handleClick = ( event ) => {
        this.trackPostOnboardingClick( event );
    };
    
    document.addEventListener( 'click', handleClick, true ); // ❌ Could be added multiple times
}
```

**Problem**: If `setupPostOnboardingClickTracking()` is called multiple times, multiple identical event listeners are registered.

#### 2. **Event Bubbling/Capturing Issues**
```javascript
document.addEventListener( 'click', handleClick, true ); // Uses capture phase
```

**Problem**: Using capture phase (`true`) might cause events to fire multiple times if there are nested elements or other event handlers.

#### 3. **Cleanup Failure**
```javascript
static cleanupPostOnboardingTracking() {
    document.removeEventListener( 'click', this.trackPostOnboardingClick ); // ❌ Wrong reference
}
```

**Problem**: The cleanup uses `this.trackPostOnboardingClick` but the listener was added with an anonymous function `handleClick`.

#### 4. **Race Conditions in Click Counter**
```javascript
const currentCount = parseInt( localStorage.getItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT ) || '0', 10 );
const newCount = currentCount + 1;
localStorage.setItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT, newCount.toString() );
```

**Problem**: If multiple event handlers fire simultaneously, they might read the same `currentCount` value before any of them update it.

## Debugging Strategy

### 1. **Verify Multiple Listener Registration**
Add debug logging to track listener setup:
```javascript
static setupPostOnboardingClickTracking() {
    console.log( '🔍 setupPostOnboardingClickTracking called' );
    console.log( '🔍 Existing listeners count:', this.getClickListenerCount() );
    
    if ( this.isClickTrackingSetup ) {
        console.log( '⚠️ Click tracking already setup, skipping' );
        return;
    }
    
    const handleClick = ( event ) => {
        console.log( '🖱️ Click handler fired:', event.target );
        this.trackPostOnboardingClick( event );
    };
    
    document.addEventListener( 'click', handleClick, true );
    this.isClickTrackingSetup = true;
    this.clickHandler = handleClick; // Store reference for cleanup
}
```

### 2. **Fix Cleanup Reference Issue**
```javascript
static cleanupPostOnboardingTracking() {
    try {
        if ( this.clickHandler ) {
            document.removeEventListener( 'click', this.clickHandler, true );
            this.clickHandler = null;
            this.isClickTrackingSetup = false;
            console.log( '✅ Click tracking cleaned up successfully' );
        }
    } catch ( error ) {
        this.handleStorageError( 'Failed to cleanup post-onboarding tracking:', error );
    }
}
```

### 3. **Add Click Event Deduplication**
```javascript
static trackPostOnboardingClick( event ) {
    try {
        // Prevent duplicate processing of the same event
        if ( this.lastProcessedEvent === event ) {
            console.log( '🚫 Duplicate event detected, skipping' );
            return;
        }
        this.lastProcessedEvent = event;
        
        const currentCount = parseInt( localStorage.getItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT ) || '0', 10 );
        
        if ( currentCount >= 3 ) {
            return;
        }
        
        console.log( '🖱️ Processing click:', { currentCount, target: event.target } );
        
        // Use atomic increment to prevent race conditions
        const newCount = this.incrementClickCountAtomically();
        
        // Rest of existing logic...
    } catch ( error ) {
        this.handleStorageError( 'Failed to track post-onboarding click:', error );
    }
}

static incrementClickCountAtomically() {
    const key = ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT;
    const currentCount = parseInt( localStorage.getItem( key ) || '0', 10 );
    const newCount = currentCount + 1;
    localStorage.setItem( key, newCount.toString() );
    return newCount;
}
```

### 4. **Event Listener Audit**
Add debugging to track all click listeners:
```javascript
static auditClickListeners() {
    const listeners = [];
    const originalAddEventListener = document.addEventListener;
    
    document.addEventListener = function( type, listener, options ) {
        if ( type === 'click' ) {
            listeners.push({ listener, options, stack: new Error().stack });
            console.log( '🔍 Click listener added:', { listener: listener.name, options } );
        }
        return originalAddEventListener.call( this, type, listener, options );
    };
    
    return listeners;
}
```

## Potential Solutions

### Solution 1: **Prevent Multiple Setup**
```javascript
static setupPostOnboardingClickTracking() {
    if ( this.clickTrackingActive ) {
        console.log( '⚠️ Click tracking already active' );
        return;
    }
    
    this.clickTrackingActive = true;
    // ... rest of setup
}
```

### Solution 2: **Use Event Delegation with Specific Selectors**
Instead of global click listener, use targeted selectors:
```javascript
static setupPostOnboardingClickTracking() {
    const elementorEditor = document.querySelector( '#elementor-editor-wrapper' );
    if ( elementorEditor ) {
        elementorEditor.addEventListener( 'click', this.handleElementorClick.bind( this ) );
    }
}
```

### Solution 3: **Debounce Click Events**
```javascript
static trackPostOnboardingClick = this.debounce( function( event ) {
    // Original tracking logic
}, 100 ); // 100ms debounce
```

### Solution 4: **Event Timestamp Deduplication**
```javascript
static trackPostOnboardingClick( event ) {
    const eventKey = `${event.target.id}-${event.timeStamp}`;
    
    if ( this.processedEvents.has( eventKey ) ) {
        console.log( '🚫 Event already processed:', eventKey );
        return;
    }
    
    this.processedEvents.add( eventKey );
    // ... rest of logic
}
```

## Testing Instructions

### 1. **Reproduction Test**
1. Complete onboarding flow
2. Enter Elementor editor
3. Click on any control (button, select, input)
4. Check browser console and network tab
5. Verify only ONE event is fired per click

### 2. **Multiple Setup Test**
1. Add debug logging to `setupPostOnboardingClickTracking()`
2. Monitor console for multiple setup calls
3. Verify listener count doesn't increase beyond 1

### 3. **Cleanup Test**
1. Trigger 3 clicks to reach cleanup threshold
2. Verify `cleanupPostOnboardingTracking()` is called
3. Confirm no more events fire after cleanup
4. Check that event listener is actually removed

## Success Criteria

- [ ] Each click generates exactly ONE event (no duplicates)
- [ ] Click counter increments correctly (1 → 2 → 3)
- [ ] Event listener setup happens only once
- [ ] Event listener cleanup works properly after 3 clicks
- [ ] No race conditions in localStorage operations
- [ ] Debug logging helps identify exact duplication cause

## Implementation Priority

1. **HIGH**: Fix event listener cleanup reference issue
2. **HIGH**: Add duplicate event prevention
3. **MEDIUM**: Implement setup prevention for multiple calls
4. **MEDIUM**: Add comprehensive debug logging
5. **LOW**: Consider event delegation as alternative approach