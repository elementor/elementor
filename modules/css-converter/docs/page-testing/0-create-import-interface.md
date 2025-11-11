# CSS Converter Import Interface - PRD (Finalized)

## Executive Summary

Create an admin interface under the Elementor menu (`wp-admin/admin.php?page=elementor-css-converter`) that allows users to import HTML/CSS content via URL or direct input and convert it to Elementor v4 atomic widgets using the existing Widget Converter API.

**Key Decisions:**
- Default import type: URL with selector support
- Display: Side-by-side iframes (400px × 600px each)
- Loading: Modal with progress indicator
- Results: Unified success/error display in modal
- Post-conversion: Link to edit + "Convert Another" button

---

## Requirements Summary

### Answered Questions

1. **Menu Position**: Bottom of Elementor submenu (before Help)
2. **Default Import Type**: URL (with selector field: `.classname, #id`)
3. **Textarea Size**: 500px height, no syntax highlighting, resizable
4. **URL Validation**: Absolute URLs only (validation nice to have)
5. **Submit Button**: Text "Submit" (processing behavior nice to have)
6. **Spinner Location**: Modal overlay
7. **Feedback Display**: Unified success/error format in modal
8. **Edit URL Iframe**: Use preview URLs (sufficient)
9. **Preview for Drafts**: Use pragmatic approach that works
10. **Input Iframe**: Raw HTML/CSS display
11. **Converted Iframe**: Preview URL, side-by-side layout
12. **Iframe Dimensions**: 400px width × 600px height (fixed)
13. **Error Handling**: Modal dialog
14. **Success Actions**: Edit link (new tab) + "Convert Another" button
15. **Additional Options**: Post type selector only
16. **CSS URLs**: Auto-extract from URL (no manual field)
17. **Follow Imports**: Follow all @import statements by default (true)
18. **Form Layout**: Single column
19. **Loading States**: Progress indicator + "Fetching URL..." + estimated time
20. **Accessibility**: Not applicable (standard WordPress admin)

---

## Product Requirements Document (PRD)

### Technical Context

#### Menu Registration
- **Hook**: `elementor/admin/menu/register`
- **Parent Slug**: `'elementor'` (Settings::PAGE_ID)
- **Menu Slug**: `'elementor-css-converter'`
- **Menu Label**: "CSS Converter"
- **Position**: Bottom of submenu (before Help) - index: 140
- **URL**: `wp-admin/admin.php?page=elementor-css-converter`
- **Interface**: Implement `Admin_Menu_Item_With_Page`
- **Capability**: `manage_options`

#### API Endpoint
- **URL**: `/wp-json/elementor/v2/widget-converter`
- **Method**: POST
- **Authentication**: WordPress nonce (X-WP-Nonce header)
- **Request Format**:
  ```json
  {
    "type": "url",
    "content": "https://example.com",
    "selector": ".classname",
    "followImports": true,
    "options": {
      "postType": "page"
    }
  }
  ```
- **Response Format**:
  ```json
  {
    "success": true,
    "post_id": 123,
    "edit_url": "https://site.com/wp-admin/post.php?post=123&action=elementor",
    "widgets_created": 5,
    "global_classes_created": 2,
    "stats": {...},
    "warnings": [...],
    "error_report": {...}
  }
  ```

#### UI Components
- Use WordPress `@wordpress/components`: Button, SelectControl, TextareaControl, TextControl, Spinner, Modal, Notice
- Use React hooks for state management
- Follow Elementor UI patterns from existing admin pages

---

### Functional Requirements

#### FR1: Menu Item
- **Priority**: P0 (Must Have)
- **Description**: Add "CSS Converter" menu item at bottom of Elementor submenu
- **Acceptance Criteria**:
  - Menu item appears in Elementor submenu
  - Menu label: "CSS Converter"
  - Position: Bottom (index 140, before Help at 150)
  - URL: `wp-admin/admin.php?page=elementor-css-converter`
  - Requires `manage_options` capability

#### FR2: Import Type Selection
- **Priority**: P0 (Must Have)
- **Description**: Radio buttons for import type selection
- **Options**:
  - URL (default selected)
  - HTML/CSS
- **Acceptance Criteria**:
  - URL option selected by default on page load
  - Selection toggles visible form fields
  - Radio buttons clearly labeled

#### FR3: URL Input Fields (Default View)
- **Priority**: P0 (Must Have)
- **Description**: URL input with optional selector field
- **Fields**:
  1. **URL Input**:
     - Label: "URL"
     - Placeholder: `https://elementor.com`
     - Validation: Absolute URLs only
     - Error message: "Please enter a valid absolute URL"
  2. **Selector Input**:
     - Label: "Selector (Optional)"
     - Placeholder: `.classname, #id`
     - Help text: "CSS selector to extract specific content from the page"
- **Acceptance Criteria**:
  - URL field displays when "URL" is selected
  - Selector field displays below URL field
  - URL validation prevents submission of relative URLs
  - Selector is optional (empty = convert entire page)

#### FR4: HTML/CSS Input Field
- **Priority**: P0 (Must Have)
- **Description**: Large textarea for direct HTML/CSS content input
- **Specifications**:
  - Height: 500px
  - Resizable: Yes (vertical)
  - Syntax highlighting: No
  - Placeholder:
    ```html
    <style>
      .hero-section { 
        background-color: #f0f0f0; 
        padding: 40px; 
      }
      .hero-title { 
        color: #333; 
        font-size: 32px; 
        text-align: center; 
      }
    </style>
    <div class="hero-section">
      <h1 class="hero-title">Welcome to Our Site</h1>
      <p>This is a hero section with custom styling.</p>
      <button style="background-color: #007cba; color: white; padding: 10px 20px;">Get Started</button>
    </div>
    ```
- **Acceptance Criteria**:
  - Textarea displays when "HTML/CSS" is selected
  - Initial height: 500px
  - User can resize vertically
  - Placeholder shows complete example

#### FR5: Post Type Selector
- **Priority**: P0 (Must Have)
- **Description**: Dropdown to select post type for created content
- **Options**:
  - Page (default)
  - Post
  - Any custom post types (if applicable)
- **Acceptance Criteria**:
  - Dropdown always visible (both URL and HTML/CSS modes)
  - Default selection: "Page"
  - Located below import type fields

#### FR6: Submit Button
- **Priority**: P0 (Must Have)
- **Description**: Button to trigger conversion
- **Specifications**:
  - Text: "Submit"
  - Processing state: Nice to have (can keep "Submit" text)
  - Disabled during API call: Nice to have
- **Acceptance Criteria**:
  - Button triggers API call on click
  - Button text: "Submit"
  - Form validation before submission

#### FR7: Loading Modal with Progress
- **Priority**: P0 (Must Have)
- **Description**: Modal overlay during conversion process
- **Display Elements**:
  - Spinner/progress indicator
  - Text: "Fetching URL..." (for URL mode) or "Converting..." (for HTML/CSS mode)
  - Estimated time remaining (nice to have)
- **Acceptance Criteria**:
  - Modal appears immediately after submit
  - Modal blocks UI interaction
  - Modal shows progress indicator
  - Modal hides on completion (success or error)

#### FR8: Results Modal
- **Priority**: P0 (Must Have)
- **Description**: Modal displaying conversion results (success or error)
- **Success Display**:
  - Success message: "✓ Conversion Successful"
  - Post ID
  - Widgets created: `{count}`
  - Global classes created: `{count}`
  - Stats summary (total elements, converted, etc.)
  - Warnings (if any, expandable)
  - Actions:
    - Button: "Open in Editor" (opens edit_url in new tab)
    - Button: "Convert Another" (resets form, closes modal)
- **Error Display**:
  - Error message: "✗ Conversion Failed"
  - Error code
  - Error message/description
  - Recommendations (if available)
  - Action:
    - Button: "Try Again" (closes modal, keeps form filled)
- **Acceptance Criteria**:
  - Unified modal for both success and error
  - Clear visual distinction (green for success, red for error)
  - All required information displayed
  - Action buttons functional

#### FR9: Side-by-Side Iframes
- **Priority**: P1 (Should Have)
- **Description**: Display original content and converted preview side-by-side
- **Specifications**:
  - Layout: Side-by-side (horizontal)
  - Dimensions: 400px width × 600px height (each iframe)
  - Fixed size (not responsive)
  - Display: Only after successful conversion
- **Left Iframe (Input Content)**:
  - Title: "Original Content"
  - Content: Raw HTML/CSS as entered (using `srcdoc`)
  - Sandbox: Basic sandbox attributes
- **Right Iframe (Converted Content)**:
  - Title: "Converted Preview"
  - Content: Elementor preview URL
  - URL pattern: `?elementor-preview={post_id}&ver={timestamp}`
- **Acceptance Criteria**:
  - Iframes display in success modal (or below modal)
  - Left iframe shows original HTML/CSS rendered
  - Right iframe shows Elementor preview
  - Both iframes 400px × 600px
  - Iframes load after modal success display

#### FR10: Form Reset ("Convert Another")
- **Priority**: P0 (Must Have)
- **Description**: Reset form to initial state for new conversion
- **Behavior**:
  - Clear all input fields
  - Reset to default state (URL mode, Page post type)
  - Close results modal
  - Scroll to top
- **Acceptance Criteria**:
  - "Convert Another" button in success modal
  - Clicking resets entire form
  - Default import type selected (URL)
  - All fields cleared

---

### Technical Implementation

#### File Structure
```
plugins/elementor-css/modules/css-converter/
├── admin/
│   ├── css-converter-admin-menu.php    # Menu registration class
│   └── assets/
│       ├── js/
│       │   ├── css-converter-app.js    # React app entry point
│       │   └── components/
│       │       ├── import-form.js      # Main form component
│       │       ├── import-type-selector.js
│       │       ├── url-input-fields.js
│       │       ├── html-textarea.js
│       │       ├── post-type-selector.js
│       │       ├── loading-modal.js
│       │       ├── results-modal.js
│       │       └── iframe-viewer.js
│       └── scss/
│           └── css-converter-admin.scss
└── module.php (update to register admin menu)
```

#### Component Architecture
```
App (Root Component)
├── ImportForm
│   ├── ImportTypeSelector (Radio: URL | HTML/CSS)
│   ├── URLInputFields (conditional - URL mode)
│   │   ├── URLInput (text input)
│   │   └── SelectorInput (text input, optional)
│   ├── HTMLTextarea (conditional - HTML/CSS mode)
│   ├── PostTypeSelector (select dropdown)
│   └── SubmitButton
├── LoadingModal (conditional - during API call)
│   ├── Spinner
│   ├── ProgressText
│   └── EstimatedTime (nice to have)
└── ResultsModal (conditional - after completion)
    ├── SuccessView (conditional - success)
    │   ├── SuccessMessage
    │   ├── StatsPanel
    │   ├── WarningsPanel (expandable)
    │   └── ActionButtons
    │       ├── OpenEditorButton
    │       └── ConvertAnotherButton
    ├── ErrorView (conditional - error)
    │   ├── ErrorMessage
    │   ├── Recommendations
    │   └── TryAgainButton
    └── IframeViewer (below modal or in modal)
        ├── InputIframe (400×600)
        └── ConvertedIframe (400×600)
```

#### State Management
```javascript
const [importType, setImportType] = useState('url'); // 'url' | 'html'
const [urlContent, setUrlContent] = useState('');
const [selectorContent, setSelectorContent] = useState('');
const [htmlContent, setHtmlContent] = useState('');
const [postType, setPostType] = useState('page');
const [isLoading, setIsLoading] = useState(false);
const [loadingText, setLoadingText] = useState('');
const [result, setResult] = useState(null);
const [error, setError] = useState(null);
const [showResultsModal, setShowResultsModal] = useState(false);
```

#### API Integration
```javascript
const convertContent = async () => {
  setIsLoading(true);
  setLoadingText(importType === 'url' ? 'Fetching URL...' : 'Converting...');
  setError(null);
  
  const requestData = {
    type: importType,
    content: importType === 'url' ? urlContent : htmlContent,
    followImports: true,
    options: {
      postType: postType
    }
  };
  
  if (importType === 'url' && selectorContent) {
    requestData.selector = selectorContent;
  }
  
  try {
    const response = await apiFetch({
      path: '/elementor/v2/widget-converter',
      method: 'POST',
      data: requestData
    });
    
    setResult(response);
    setShowResultsModal(true);
  } catch (err) {
    setError(err);
    setShowResultsModal(true);
  } finally {
    setIsLoading(false);
  }
};
```

#### Preview URL Construction
```javascript
const getPreviewUrl = (postId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?p=${postId}&elementor-preview=${postId}&ver=${Date.now()}`;
};
```

#### Form Reset Logic
```javascript
const resetForm = () => {
  setImportType('url');
  setUrlContent('');
  setSelectorContent('');
  setHtmlContent('');
  setPostType('page');
  setResult(null);
  setError(null);
  setShowResultsModal(false);
  window.scrollTo(0, 0);
};
```

#### Menu Registration (PHP)
```php
<?php
namespace Elementor\Modules\CssConverter\Admin;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Settings;

class Css_Converter_Admin_Menu implements Admin_Menu_Item_With_Page {
    
    const MENU_SLUG = 'elementor-css-converter';
    
    public function is_visible() {
        return true;
    }
    
    public function get_parent_slug() {
        return Settings::PAGE_ID;
    }
    
    public function get_label() {
        return esc_html__( 'CSS Converter', 'elementor' );
    }
    
    public function get_page_title() {
        return esc_html__( 'CSS Converter', 'elementor' );
    }
    
    public function get_capability() {
        return 'manage_options';
    }
    
    public function render() {
        echo '<div class="wrap">';
        echo '<h1>' . esc_html__( 'CSS Converter', 'elementor' ) . '</h1>';
        echo '<div id="elementor-css-converter-root"></div>';
        echo '</div>';
    }
}
```

#### Module Registration (PHP)
```php
// In modules/css-converter/module.php
add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
    $admin_menu->register( 
        Css_Converter_Admin_Menu::MENU_SLUG, 
        new Css_Converter_Admin_Menu() 
    );
}, 140 ); // Position 140 (before Help at 150)

add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
    if ( ! empty( $hooks[ Css_Converter_Admin_Menu::MENU_SLUG ] ) ) {
        add_action( 
            "admin_print_scripts-{$hooks[ Css_Converter_Admin_Menu::MENU_SLUG ]}", 
            [ $this, 'enqueue_assets' ] 
        );
    }
}, 10, 2 );
```

---

### Design Specifications

#### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ CSS Converter                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Import Type:  ○ URL (default)  ○ HTML/CSS         │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ URL: https://elementor.com                  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Selector (Optional): .classname, #id        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Post Type: [Page ▼]                                │
│                                                     │
│  [Submit]                                           │
│                                                     │
└─────────────────────────────────────────────────────┘

When HTML/CSS selected:
┌─────────────────────────────────────────────────────┐
│ CSS Converter                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Import Type:  ○ URL  ● HTML/CSS                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ HTML/CSS:                                   │   │
│  │                                             │   │
│  │ <style>                                     │   │
│  │   .hero-section { ... }                     │   │
│  │ </style>                                    │   │
│  │ <div class="hero-section">...</div>         │   │
│  │                           ↕ (resizable)     │   │
│  │                                             │   │
│  │                        (500px height)       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Post Type: [Page ▼]                                │
│                                                     │
│  [Submit]                                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Loading Modal
```
┌─────────────────────────────────────┐
│                                     │
│        ⟳  (spinner)                 │
│                                     │
│        Fetching URL...              │
│                                     │
│     Estimated: 5 seconds            │
│                                     │
└─────────────────────────────────────┘
```

#### Success Modal with Iframes
```
┌───────────────────────────────────────────────────────┐
│  ✓ Conversion Successful                   [×]        │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Post ID: 123                                         │
│  Widgets Created: 5                                   │
│  Global Classes Created: 2                            │
│                                                       │
│  Stats: 6 elements, 5 converted, 15 properties        │
│  ⚠ 2 warnings (show/hide)                             │
│                                                       │
│  [Open in Editor]  [Convert Another]                  │
│                                                       │
├───────────────────────────────────────────────────────┤
│  Original Content    │    Converted Preview           │
│  ┌─────────────────┐ │ ┌─────────────────┐           │
│  │                 │ │ │                 │           │
│  │                 │ │ │                 │           │
│  │   (iframe)      │ │ │   (iframe)      │           │
│  │   400×600       │ │ │   400×600       │           │
│  │                 │ │ │                 │           │
│  └─────────────────┘ │ └─────────────────┘           │
└───────────────────────────────────────────────────────┘
```

#### Error Modal
```
┌─────────────────────────────────────┐
│  ✗ Conversion Failed       [×]      │
├─────────────────────────────────────┤
│                                     │
│  Error Code: conversion_error       │
│                                     │
│  Failed to fetch URL: timeout       │
│                                     │
│  Recommendations:                   │
│  • Check URL is accessible          │
│  • Try again with shorter content   │
│                                     │
│  [Try Again]                        │
│                                     │
└─────────────────────────────────────┘
```

---

### Non-Functional Requirements

#### Performance
- API request timeout: 30 seconds (default)
- Show loading modal immediately (<100ms)
- URL validation: Instant (no debounce needed)
- Form reset: Instant

#### Security
- Sanitize all user inputs on server side
- Validate URLs (absolute only, valid format)
- Use WordPress nonces for API authentication
- Iframe sandboxing for input content:
  - `sandbox="allow-same-origin allow-scripts"`

#### Accessibility
- Standard WordPress admin accessibility
- Focus management: Focus submit button after reset
- Error messages: Announced via modal
- Form labels: Proper `<label>` elements

#### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- WordPress admin compatibility
- No mobile support required (admin interface)

---

### Testing Requirements

#### Manual Testing Checklist
- [ ] Menu item appears at bottom of Elementor menu
- [ ] Default state: URL mode selected
- [ ] URL input: Validates absolute URLs
- [ ] Selector input: Optional, accepts CSS selectors
- [ ] HTML/CSS mode: Textarea displays, resizable
- [ ] Post type selector: Shows options, defaults to "Page"
- [ ] Submit: Triggers loading modal
- [ ] Loading modal: Shows spinner + text
- [ ] URL conversion: Successfully converts and creates post
- [ ] HTML/CSS conversion: Successfully converts and creates post
- [ ] Selector conversion: Converts only selected content
- [ ] Success modal: Displays all stats correctly
- [ ] "Open in Editor" link: Opens edit URL in new tab
- [ ] Iframes: Display original and converted content side-by-side
- [ ] Left iframe: Shows raw HTML/CSS
- [ ] Right iframe: Shows Elementor preview
- [ ] Error modal: Displays on API failure
- [ ] "Try Again": Closes modal, keeps form filled
- [ ] "Convert Another": Resets entire form
- [ ] Form reset: Clears all fields, selects URL mode

#### Edge Cases
- Very large HTML content (>1MB)
- Invalid URLs (relative, malformed)
- Network timeout (>30 seconds)
- URL returns 404/500
- Selector not found on page
- HTML with no convertible elements
- API returns warnings
- Concurrent conversions (prevent or queue)

#### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

### Dependencies

#### WordPress
- WordPress 5.0+
- Elementor Core (for menu system)
- REST API
- WordPress nonces

#### JavaScript
- React (via `@wordpress/element`)
- `@wordpress/components` (Button, Modal, Spinner, TextControl, TextareaControl, SelectControl, RadioControl)
- `@wordpress/api-fetch`
- `@wordpress/i18n`

#### PHP
- Elementor Core Admin Menu system
- CSS Converter Widget Converter API (`/wp-json/elementor/v2/widget-converter`)
- Admin menu interfaces

#### Build Tools
- npm/webpack (for React compilation)
- SCSS compiler (for styles)

---

### Success Metrics

- ✓ Menu item accessible from Elementor menu
- ✓ URL conversions complete successfully (>90% success rate)
- ✓ HTML/CSS conversions complete successfully (>90% success rate)
- ✓ Selector conversions extract correct content
- ✓ Average conversion time < 10 seconds
- ✓ Preview iframes render correctly
- ✓ Zero critical bugs in production
- ✓ User can complete entire workflow without errors

---

### Implementation Notes

#### API Response Handling
- `edit_url` is provided in response
- `preview_url` is NOT in response - construct using:
  ```javascript
  const previewUrl = `${baseUrl}/?p=${post_id}&elementor-preview=${post_id}&ver=${Date.now()}`;
  ```

#### Iframe Security
- Left iframe (input): Use `srcdoc` attribute with HTML content
- Right iframe (preview): Use `src` with preview URL
- Both: Apply sandbox attributes for security

#### Follow Imports
- Set `followImports: true` by default in all requests
- No UI toggle needed (follow all @import statements automatically)

#### Error Recovery
- "Try Again" button: Keeps form filled for retry
- "Convert Another" button: Complete reset for new conversion
- Network errors: Display retry option
- API errors: Display error message with recommendations

---

### Open Questions (Resolved)

1. ~~Iframe Feasibility~~ → Use preview URLs (sufficient, pragmatic)
2. ~~Preview URL Construction~~ → Construct from post_id: `?p={id}&elementor-preview={id}&ver={timestamp}`
3. ~~Follow Imports~~ → Follow all by default (set to `true`)
4. ~~Estimated Time~~ → Nice to have, not critical

---

### Next Steps for Implementation

1. **Phase 1**: Menu Registration
   - Create `Css_Converter_Admin_Menu` class
   - Register in module with priority 140
   - Render basic page skeleton

2. **Phase 2**: Form Components
   - Create React app entry point
   - Build `ImportTypeSelector` component
   - Build `URLInputFields` component (URL + Selector)
   - Build `HTMLTextarea` component
   - Build `PostTypeSelector` component
   - Build `SubmitButton` component

3. **Phase 3**: Loading & Results
   - Build `LoadingModal` component
   - Build `ResultsModal` component (success & error views)
   - Implement API integration with `apiFetch`

4. **Phase 4**: Iframes
   - Build `IframeViewer` component
   - Implement left iframe (srcdoc with raw HTML)
   - Implement right iframe (preview URL)
   - Add side-by-side layout (400×600 each)

5. **Phase 5**: Testing
   - Manual testing all scenarios
   - Edge case testing
   - Browser compatibility testing
   - Fix any issues

6. **Phase 6**: Polish
   - Add estimated time (nice to have)
   - Add processing button state (nice to have)
   - Optimize performance
   - Final QA

---

## Approval

**PRD Status**: ✓ Finalized
**Ready for Implementation**: Yes
**Pending Questions**: None

---

*Document Version: 2.0*  
*Last Updated: 2025-11-11*  
*Author: AI Assistant*  
*Approved by: User*
