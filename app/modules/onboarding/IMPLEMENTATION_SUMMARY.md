# Onboarding AB Test Integration with Editor Assets

## Overview
Integrated the EditorAssetsAPI into the onboarding module to read AB test configuration from external editor assets, similar to how the home module works.

## Changes Made

### 1. New File: `api.php`
Created a new API class that:
- Accepts an `EditorAssetsAPI` instance via dependency injection
- Fetches onboarding configuration from editor assets
- Extracts AB testing configuration from the JSON response
- Provides `is_step2_ab_testing_active()` method to check if Step 2 AB testing is enabled

**Key methods:**
- `get_onboarding_data()` - Fetches and filters onboarding data
- `extract_onboarding_config()` - Extracts AB testing config from JSON
- `is_step2_ab_testing_active()` - Returns boolean for Step 2 AB test status

### 2. Modified: `module.php`
Updated the onboarding module to:
- Import `EditorAssetsAPI` class
- Add private `$api` property to store API instance
- Modified `is_ab_test_enabled()` to read from editor assets via API
- Added `get_api()` method to initialize API with EditorAssetsAPI
- Added `get_api_config()` to configure the editor assets URL and cache key

## How It Works

### Data Flow
1. `is_ab_test_enabled()` calls `get_api()`
2. `get_api()` creates `EditorAssetsAPI` with configuration
3. `EditorAssetsAPI` fetches data from `https://assets.elementor.com/onboarding/v1/onboarding.json`
4. Data is cached for **1 hour** (via `EditorAssetsAPI::get_assets_data()`)
5. API extracts `AbTesting.step2AbTestingActive` value
6. Result can be filtered via `elementor/onboarding/ab_test_enabled` filter

### Configuration
```php
[
    EditorAssetsAPI::ASSETS_DATA_URL => 'https://assets.elementor.com/onboarding/v1/onboarding.json',
    EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => '_elementor_onboarding_data',
    EditorAssetsAPI::ASSETS_DATA_KEY => 'onboarding',
]
```

### Expected JSON Structure
From `editor-assets/src/onboarding/index.js`:
```json
[
    {
        "AbTesting": {
            "step1": "b",
            "step2AbTestingActive": true
        }
    }
]
```

## Caching Behavior
- **Cache Duration**: 1 hour
- **Cache Key**: `_elementor_onboarding_data`
- **Implementation**: Via `EditorAssetsAPI::set_transient()` in `includes/editor-assets-api.php` (line 26)
- **Force Refresh**: Pass `$force_request = true` to bypass cache

## Integration Pattern
This implementation follows the same pattern as the `home` module:
1. Create API class that wraps `EditorAssetsAPI`
2. Configure URL, transient key, and data key
3. Extract relevant data from JSON response
4. Provide typed methods for accessing specific configuration values

## Filter Hooks
- `elementor/onboarding/assets_data` - Filter raw assets data before extraction
- `elementor/onboarding/ab_test_enabled` - Filter final AB test enabled state

## Testing
Verify integration by:
1. Checking `window.elementorAppConfig.onboarding.abTestEnabled` in browser console
2. Value should match `step2AbTestingActive` from editor assets JSON
3. Cache can be cleared by deleting `_elementor_onboarding_data` option
4. PHP syntax validated - no linting errors

## Future Enhancements
- Add support for `step1` variant from editor assets if needed
- Implement force refresh mechanism via admin action
- Add debug logging for cache hits/misses

