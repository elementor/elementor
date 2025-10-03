# Onboarding AB Test Integration with Editor Assets

## Overview
Integrated the EditorAssetsAPI into the onboarding module to read AB test configuration from external editor assets, similar to how the home module works.

## Changes Made

### 1. New File: `api.php`
Created a new API class that:
- Accepts an `EditorAssetsAPI` instance via dependency injection
- Fetches AB testing configuration from editor assets
- Extracts core onboarding flag from the JSON response
- Provides `is_core_onboarding_enabled()` method to check if core onboarding AB test is enabled

**Key methods:**
- `get_ab_testing_data()` - Fetches and filters AB testing data
- `extract_ab_testing_config()` - Extracts AB testing config from JSON
- `is_core_onboarding_enabled()` - Returns boolean for core onboarding AB test status

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
3. `EditorAssetsAPI` fetches data from `https://assets.elementor.com/ab-testing/v1/ab-testing.json`
4. Data is cached for **1 hour** (via `EditorAssetsAPI::get_assets_data()`)
5. API extracts `coreOnboarding` value from first array item
6. Result can be filtered via `elementor/onboarding/ab_test_enabled` filter

### Configuration
```php
[
    EditorAssetsAPI::ASSETS_DATA_URL => 'https://assets.elementor.com/ab-testing/v1/ab-testing.json',
    EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => '_elementor_ab_testing_data',
    EditorAssetsAPI::ASSETS_DATA_KEY => 'ab-testing',
]
```

### Expected JSON Structure
From [https://assets.stg.elementor.red/ab-testing/v1/ab-testing.json](https://assets.stg.elementor.red/ab-testing/v1/ab-testing.json):
```json
{
    "lastUpdated": "2025-10-03T10:44:09.569Z",
    "ab-testing": [
        {
            "coreOnboarding": true
        }
    ]
}
```

## Caching Behavior
- **Cache Duration**: 1 hour
- **Cache Key**: `_elementor_ab_testing_data`
- **Implementation**: Via `EditorAssetsAPI::set_transient()` in `includes/editor-assets-api.php` (line 26)
- **Force Refresh**: Pass `$force_request = true` to bypass cache

## Integration Pattern
This implementation follows the same pattern as the `home` module:
1. Create API class that wraps `EditorAssetsAPI`
2. Configure URL, transient key, and data key
3. Extract relevant data from JSON response
4. Provide typed methods for accessing specific configuration values

## Filter Hooks
- `elementor/onboarding/ab_testing_data` - Filter raw AB testing data before extraction
- `elementor/onboarding/ab_test_enabled` - Filter final AB test enabled state

## Testing
Verify integration by:
1. Checking `window.elementorAppConfig.onboarding.abTestEnabled` in browser console
2. Value should match `coreOnboarding` from editor assets JSON
3. Cache can be cleared by deleting `_elementor_ab_testing_data` option
4. PHP syntax validated - no linting errors
5. Staging URL verified: [https://assets.stg.elementor.red/ab-testing/v1/ab-testing.json](https://assets.stg.elementor.red/ab-testing/v1/ab-testing.json)

## Production URL
- **Production**: `https://assets.elementor.com/ab-testing/v1/ab-testing.json`
- **Staging**: `https://assets.stg.elementor.red/ab-testing/v1/ab-testing.json`

## Future Enhancements
- Add support for additional AB test flags as needed
- Implement force refresh mechanism via admin action
- Add debug logging for cache hits/misses

