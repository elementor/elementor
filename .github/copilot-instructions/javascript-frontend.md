# JavaScript & Frontend Development

## Code Style and Syntax

### Modern ES6+ Features
- Use modern ES6+ syntax (arrow functions, destructuring, template literals)
- Use `const` for values that won't be reassigned
- Use `let` for variables that will change
- Prefer template literals over string concatenation
- Use object shorthand notation when appropriate

### Naming Conventions
- **camelCase** for variables and functions
- **PascalCase** for classes
- **UPPER_CASE** for constants
- Use descriptive names that eliminate need for comments

### Examples
```javascript
const MAX_RETRY_ATTEMPTS = 3;
const userSettings = { theme: 'dark', language: 'en' };

const getUserPreferences = ( userId ) => {
    return fetchData( `users/${userId}/preferences` );
};

class UserManager {
    constructor( options ) {
        this.config = { ...DEFAULT_CONFIG, ...options };
    }
}
```

---

## Event Handling

### Event Types
Use appropriate event types for different interactions:
- `mouseenter`/`mouseleave` for hover effects
- `click` for button and link interactions
- `keydown`/`keyup` for keyboard navigation
- `focus`/`blur` for form interactions
- `input`/`change` for form field updates

### Accessibility
- **Implement both mouse and keyboard interaction patterns**
- Support keyboard navigation alongside mouse interactions
- Provide visual feedback for all interactive elements
- Use proper ARIA attributes (`aria-hidden`, `aria-expanded`, `aria-label`)
- Implement focus management for dynamic content
- Support screen readers with semantic HTML

### Event Delegation
- Use event delegation when appropriate to handle dynamic content
- Prevent default behavior only when necessary and provide alternatives

### Examples
```javascript
const button = document.querySelector( '.interactive-button' );

button.addEventListener( 'click', handleClick );
button.addEventListener( 'keydown', ( event ) => {
    if ( 'Enter' === event.key || ' ' === event.key ) {
        event.preventDefault();
        handleClick( event );
    }
} );

button.setAttribute( 'role', 'button' );
button.setAttribute( 'tabindex', '0' );
button.setAttribute( 'aria-label', 'Perform action' );
```

---

## State Management

### Clear State Variables
- Use descriptive state variable names
- Maintain consistency between UI state and data attributes
- Use constants for state values to avoid magic strings
- Implement proper state transitions with validation
- Handle edge cases like rapid user interactions

### Examples
```javascript
const STATE_IDLE = 'idle';
const STATE_LOADING = 'loading';
const STATE_SUCCESS = 'success';
const STATE_ERROR = 'error';

class ComponentState {
    constructor() {
        this.currentState = STATE_IDLE;
    }
    
    transitionTo( newState ) {
        const validTransitions = {
            [STATE_IDLE]: [STATE_LOADING],
            [STATE_LOADING]: [STATE_SUCCESS, STATE_ERROR],
            [STATE_SUCCESS]: [STATE_IDLE],
            [STATE_ERROR]: [STATE_IDLE],
        };
        
        if ( validTransitions[this.currentState]?.includes( newState ) ) {
            this.currentState = newState;
            this.updateUI();
        }
    }
}
```

---

## Error Handling and Validation

### User-Friendly Error Messages
- Provide clear, actionable error messages
- Validate inputs and state before performing actions
- Use try-catch blocks for operations that might fail
- Implement graceful degradation when features fail
- Log errors appropriately for debugging while maintaining user experience

### Examples
```javascript
const processUserData = async ( userData ) => {
    if ( ! isValidEmail( userData.email ) ) {
        throw new Error( 'Please enter a valid email address' );
    }
    
    try {
        const response = await fetch( '/api/users', {
            method: 'POST',
            body: JSON.stringify( userData ),
        } );
        
        if ( ! response.ok ) {
            throw new Error( `Server error: ${response.status}` );
        }
        
        return await response.json();
    } catch ( error ) {
        console.error( 'Failed to process user data:', error );
        throw new Error( 'Unable to save user data. Please try again.' );
    }
};
```

---

## Performance and Optimization

### Event Throttling and Debouncing
- Use event throttling/debouncing for high-frequency events (scroll, resize)
- Minimize DOM queries by caching selectors when possible
- Use `requestAnimationFrame` for smooth animations
- Implement proper cleanup for event listeners and timers
- Avoid memory leaks by removing event listeners when elements are destroyed

### Examples
```javascript
const debounce = ( func, delay ) => {
    let timeoutId;
    return ( ...args ) => {
        clearTimeout( timeoutId );
        timeoutId = setTimeout( () => func( ...args ), delay );
    };
};

const throttle = ( func, limit ) => {
    let inThrottle;
    return ( ...args ) => {
        if ( ! inThrottle ) {
            func( ...args );
            inThrottle = true;
            setTimeout( () => inThrottle = false, limit );
        }
    };
};

const DEBOUNCE_DELAY = 300;
const handleSearch = debounce( ( query ) => {
    performSearch( query );
}, DEBOUNCE_DELAY );

const SCROLL_THROTTLE = 100;
const handleScroll = throttle( () => {
    updateScrollPosition();
}, SCROLL_THROTTLE );

window.addEventListener( 'scroll', handleScroll );
```

### DOM Optimization
```javascript
const cachedElements = {
    header: document.querySelector( '.site-header' ),
    nav: document.querySelector( '.main-nav' ),
    footer: document.querySelector( '.site-footer' ),
};

const animateElement = ( element ) => {
    requestAnimationFrame( () => {
        element.classList.add( 'animated' );
    } );
};
```

---

## Testing and Debugging

### Test Coverage
- Write tests that cover both positive and negative scenarios
- Test accessibility features alongside functional features
- Use Playwright's debugging tools for frontend testing
- Test on different devices and viewport sizes
- Verify state changes after user interactions

### Examples
```javascript
const validateUserInput = ( input ) => {
    if ( ! input ) {
        throw new Error( 'Input cannot be empty' );
    }
    
    if ( input.length > 100 ) {
        throw new Error( 'Input exceeds maximum length' );
    }
    
    return true;
};
```

---

## Progressive Enhancement

### Core Functionality
- Ensure core functionality works without JavaScript
- Enhance user experience progressively with interactive features
- Provide fallbacks for unsupported features
- Test with JavaScript disabled to ensure basic functionality

### Examples
```html
<!-- Base HTML works without JS -->
<form action="/submit" method="post">
    <input type="text" name="search" required>
    <button type="submit">Search</button>
</form>

<script>
// Enhance with JS
const form = document.querySelector( 'form' );
form.addEventListener( 'submit', async ( event ) => {
    event.preventDefault();
    
    const formData = new FormData( form );
    const results = await performAjaxSearch( formData );
    displayResults( results );
} );
</script>
```

---

## Clean Code Patterns

### ✅ Good Examples

```javascript
const DEFAULT_TIMEOUT = 3000;
const API_BASE_URL = '/api/v1';

const fetchUserData = async ( userId ) => {
    const response = await fetch( `${API_BASE_URL}/users/${userId}` );
    return response.json();
};

class UserProfile {
    constructor( userId ) {
        this.userId = userId;
        this.data = null;
    }
    
    async load() {
        this.data = await fetchUserData( this.userId );
        this.render();
    }
    
    render() {
        const container = document.querySelector( '#user-profile' );
        container.innerHTML = this.getTemplate();
    }
    
    getTemplate() {
        return `
            <div class="profile">
                <h2>${this.data.name}</h2>
                <p>${this.data.email}</p>
            </div>
        `;
    }
}
```

### ❌ Bad Examples

```javascript
// Magic numbers, no constants
setTimeout( () => {
    fetch( '/api/users/123' ).then( r => r.json() );
}, 3000 );

// Poor naming
const d = document.querySelector( '#x' );
const f = async ( i ) => {
    const r = await fetch( '/api/users/' + i );
    return r.json();
};

// No error handling
const getData = () => {
    fetch( url ).then( response => {
        const data = response.json();
        updateUI( data );
    } );
};
```

---

## Accessibility Checklist

- [ ] Use semantic HTML elements
- [ ] Implement proper ARIA attributes
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Handle focus management properly
- [ ] Provide proper alt text for images
- [ ] Use sufficient color contrast
- [ ] Support reduced motion preferences
- [ ] Make interactive elements keyboard accessible
- [ ] Provide visual feedback for all states

