# Phase 2: Module Loading & Route Registration - Root Cause Analysis

## Summary
Phase 2 focuses on fixing the module loading system and REST API route registration to ensure the atomic widgets endpoint is properly accessible.

## Changes Applied

### 1. Module Loading System (`module.php`)
**File**: `modules/css-converter/module.php`

#### Changes:
- ✅ Added `$atomic_widgets_route` property to Module class
- ✅ Changed `init_routes()` from `private` to `public`
- ✅ Moved route initialization to `rest_api_init` hook: `add_action( 'rest_api_init', [ $this, 'init_routes' ] );`
- ✅ Disabled old widgets route: `// $this->initialize_widgets_route();`
- ✅ Added comprehensive class loading in `get_required_files()`:
  - CSS Service Files (13 files)
  - Property Mapper Classes (28 files)
  - Atomic Widgets Services (11 files)
  - Widget Creator Architecture (19 files)
- ✅ Fixed atomic widgets route instantiation:
  ```php
  $this->atomic_widgets_route = new \Elementor\Modules\CssConverter\Routes\Atomic_Widgets_Route();
  add_action( 'rest_api_init', [ $this->atomic_widgets_route, 'register_routes' ] );
  ```

### 2. Atomic Widgets Route (`atomic-widgets-route.php`)
**File**: `modules/css-converter/routes/atomic-widgets-route.php`

#### Changes:
- ✅ Added constructor with dependency loading:
  ```php
  public function __construct() {
      require_once __DIR__ . '/../services/atomic-widgets/atomic-widgets-orchestrator.php';
      require_once __DIR__ . '/../services/atomic-widgets/atomic-data-parser.php';
      require_once __DIR__ . '/../services/atomic-widgets/atomic-widget-json-creator.php';
      require_once __DIR__ . '/../services/atomic-widgets/widget-styles-integrator.php';
      require_once __DIR__ . '/../services/atomic-widgets/conversion-stats-calculator.php';
      require_once __DIR__ . '/../services/atomic-widgets/error-handler.php';
      require_once __DIR__ . '/../services/atomic-widgets/performance-monitor.php';
  }
  ```
- ✅ Changed route endpoint from `/atomic-widgets/convert` to `/widget-converter` to match test expectations
- ✅ Added support for legacy `content` parameter: `$html = $request->get_param( 'html' ) ?: $request->get_param( 'content' );`
- ✅ Added `css` parameter to args:
  ```php
  'css' => [
      'required' => false,
      'type' => 'string',
      'description' => 'CSS content to apply to HTML (legacy parameter)',
      'default' => '',
  ],
  ```
- ✅ Added CSS embedding logic (matching old widgets route):
  ```php
  if ( ! empty( $css ) ) {
      $html = '<html><head><style>' . $css . '</style></head><body>' . $html . '</body></html>';
  }
  ```
- ✅ Added `type` parameter for backward compatibility
- ✅ Made `html` and `content` parameters optional (not both required)

### 3. Variables Route (`variables-route.php`)
**File**: `modules/css-converter/routes/variables-route.php`

#### Changes:
- ✅ Removed unnecessary `require_once` statements (classes now loaded by module system)

## Root Causes Identified

### Root Cause #1: Missing CSS Parameter Support
**Problem**: Tests were sending a `css` parameter, but the atomic-widgets-route didn't accept it.

**Evidence**:
- Test helper sends: `{ type: 'html', content: htmlContent, css: cssContent, options: {...} }`
- Old widgets route had `css` parameter and embedded it: `'<html><head><style>' . $css . '</style></head><body>' . $content . '</body></html>'`
- Atomic widgets route was missing this parameter entirely

**Fix**: Added `css` parameter to args and CSS embedding logic to match old route behavior.

### Root Cause #2: Route Registration Timing
**Problem**: Routes were being registered too early, before WordPress REST API was initialized.

**Evidence**:
- `init_routes()` was called directly in constructor
- WordPress REST API routes must be registered on `rest_api_init` hook

**Fix**: Changed to `add_action( 'rest_api_init', [ $this, 'init_routes' ] );`

### Root Cause #3: Missing Dependency Loading
**Problem**: Atomic widgets orchestrator and its dependencies weren't being loaded by the module system.

**Evidence**:
- 11 atomic widgets service files were missing from `get_required_files()`
- Route constructor had to manually `require_once` dependencies

**Fix**: Added all atomic widgets services to module's `get_required_files()` array.

### Root Cause #4: Route Endpoint Mismatch
**Problem**: Tests expected `/widget-converter` but route was registered as `/atomic-widgets/convert`.

**Evidence**:
- Test helper calls: `/wp-json/elementor/v2/widget-converter`
- Route was registered as: `/atomic-widgets/convert`

**Fix**: Changed route registration to `/widget-converter`.

### Root Cause #5: Parameter Name Mismatch
**Problem**: Tests send `content` parameter, but route expected `html`.

**Evidence**:
- Test payload: `{ type: 'html', content: htmlContent, ... }`
- Route only checked for `html` parameter

**Fix**: Added fallback: `$html = $request->get_param( 'html' ) ?: $request->get_param( 'content' );`

## Current Status

### ✅ Completed
1. Route registration moved to `rest_api_init` hook
2. Atomic widgets route properly instantiated with dependencies
3. CSS parameter support added
4. Route endpoint changed to match tests
5. Legacy parameter support added (`content`, `type`, `css`)
6. Comprehensive class loading in module system

### ⏸️ Pending Investigation
**Tests still skipping** - Possible remaining issues:
1. API validation might be failing for other reasons
2. Response format might not match expected structure
3. Post creation or Elementor document integration might be failing
4. Property mappers might be throwing errors

## Next Steps for Debugging

1. **Add detailed logging** to see actual API response:
   - Log API response in test helper
   - Check what validation is actually failing

2. **Check response structure**:
   - Ensure response has `success`, `post_id`, `edit_url` fields
   - Verify no errors in response

3. **Test API directly** with curl or Postman:
   ```bash
   curl -X POST http://localhost/wp-json/elementor/v2/widget-converter \
     -H "Content-Type: application/json" \
     -d '{"type":"html","content":"<p>Test</p>","css":"p{color:red;}","options":{}}'
   ```

4. **Check debug.log** for PHP errors during API call

## Files Modified (Phase 2 Only)

1. `modules/css-converter/module.php` - Enhanced loading system + route registration
2. `modules/css-converter/routes/atomic-widgets-route.php` - Fixed registration + CSS support
3. `modules/css-converter/routes/variables-route.php` - Removed require_once

## Testing Command

```bash
npx playwright test tests/playwright/sanity/modules/css-converter/prop-types/background-prop-type.test.ts --max-failures=1
```

## Expected Outcome

Tests should:
1. ✅ Call `/wp-json/elementor/v2/widget-converter` successfully
2. ✅ Receive valid response with `post_id` and `edit_url`
3. ✅ Pass validation and not skip
4. ✅ Open editor and verify background colors

## Actual Outcome

- Tests are still skipping
- Need to investigate validation failure reason
- API endpoint is now properly registered (based on code changes)
- CSS parameter is now accepted

