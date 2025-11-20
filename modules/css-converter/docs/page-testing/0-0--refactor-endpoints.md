# PRD: CSS Converter Endpoints Refactoring

## Overview
Refactor CSS Converter REST API endpoints to follow consistent patterns from Elementor core modules while maintaining backward compatibility.

## Current State Analysis

### Existing Endpoints
1. `POST /elementor/v2/widget-converter` - Widget conversion (336 lines)
2. `POST /elementor/v2/css-converter/classes` - Global classes import (346 lines)
3. `POST /elementor/v2/css-converter/classes/reset` - Reset classes
4. `POST /elementor/v2/css-converter/variables` - CSS variables import (599 lines)

### Problems Identified
1. **Bloated Route Classes**: Routes contain business logic (URL fetching, parsing, validation)
2. **Inconsistent Permission Handling**: All return `true` currently
3. **Mixed Concerns**: Routes handle HTTP, parsing, conversion, and storage
4. **Code Duplication**: URL fetching, UTF-8 BOM removal, validation repeated across routes
5. **Inconsistent Error Handling**: Different status codes and error formats
6. **Hard to Test**: Business logic tightly coupled to HTTP layer
7. **No Standard Response Format**: Each endpoint returns different structures

## Architectural Patterns Reference

### Pattern 1: Elementor Core Components (PREFERRED)
```php
Components_REST_API::register_routes() {
    register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
        'methods' => 'GET',
        'callback' => fn() => $this->route_wrapper( fn() => $this->get_components() ),
        'permission_callback' => fn() => is_user_logged_in(),
    ] );
}
```

**Characteristics:**
- Clean separation of concerns
- Route wrapper for consistent error handling
- Arrow functions for callbacks
- Business logic in separate methods
- Consistent response building

### Pattern 2: Atomic Widgets Query Builder
```php
Query_Builder::build() {
    return [
        'params' => $params,
        'url' => $url,
    ];
}
```

**Characteristics:**
- Configuration-driven
- Focuses on data transformation
- Reusable builders
- Less about HTTP, more about business logic

## Proposed Architecture

### Separation of Concerns

```
Routes Layer (HTTP)
    ↓
Request Handlers (Validation & Response)
    ↓
Services Layer (Business Logic)
    ↓
Repositories (Data Access)
```

### New Structure

```
routes/
├── base/
│   ├── base-route.php              # Abstract base with common functionality
│   └── route-response-builder.php # Standardized response formatting
├── widgets-route.php               # Slim - delegates to handlers
├── classes-route.php               # Slim - delegates to handlers  
└── variables-route.php             # Slim - delegates to handlers

handlers/
├── base-request-handler.php        # Common validation & error handling
├── widgets-request-handler.php
├── classes-request-handler.php
└── variables-request-handler.php

services/
├── http/
│   ├── url-fetcher.php             # Centralized URL fetching
│   └── content-validator.php      # Input validation
├── widgets/                        # Existing
├── css/                            # Existing
└── variables/                      # Existing
```

## Detailed Requirements

### Requirement 1: Base Route Class

**Acceptance Criteria:**
- All routes extend `Base_Route` abstract class
- Common functionality: permission checking, error handling, logging
- Standard hooks for route registration
- Consistent permission callback interface

**Implementation:**
```php
abstract class Base_Route {
    const API_NAMESPACE = 'elementor/v2';
    
    abstract protected function get_route_base(): string;
    abstract protected function register_endpoints(): void;
    
    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_endpoints' ] );
    }
    
    protected function route_wrapper( callable $callback, \WP_REST_Request $request ) {
        // Consistent error handling, logging, response formatting
    }
    
    protected function check_permissions(): bool {
        // Centralized permission logic
    }
}
```

### Requirement 2: Request Handlers

**Acceptance Criteria:**
- Each endpoint has dedicated handler class
- Handlers validate input and prepare data
- Handlers delegate to services for business logic
- Handlers format responses using standard builder

**Implementation:**
```php
class Widgets_Request_Handler extends Base_Request_Handler {
    private $conversion_service;
    private $url_fetcher;
    private $validator;
    
    public function handle( WP_REST_Request $request ): array {
        $validated = $this->validator->validate( $request );
        $content = $this->fetch_content( $validated );
        $result = $this->conversion_service->convert( $content );
        
        return $this->format_success_response( $result );
    }
}
```

### Requirement 3: Centralized Services

**Acceptance Criteria:**
- URL fetching moved to `Http\Url_Fetcher`
- Content validation in `Http\Content_Validator`
- UTF-8 BOM handling in validator
- Reusable across all routes

**Implementation:**
```php
class Url_Fetcher {
    public function fetch( string $url, array $options = [] ): Fetch_Result {
        // Centralized URL fetching logic
        // Returns result object with success/error states
    }
}

class Content_Validator {
    public function validate_css( string $css ): Validation_Result {
        // UTF-8 BOM removal
        // Size limits
        // Content type validation
    }
}
```

### Requirement 4: Standardized Response Format

**Acceptance Criteria:**
- All endpoints return consistent structure
- Success responses: `{success: true, data: {...}, meta: {...}}`
- Error responses: `{success: false, error: {...}, details: {...}}`
- HTTP status codes follow REST standards

**Implementation:**
```php
class Route_Response_Builder {
    public static function success( $data, $meta = [] ): WP_REST_Response {
        return new WP_REST_Response( [
            'success' => true,
            'data' => $data,
            'meta' => $meta,
        ], 200 );
    }
    
    public static function error( string $code, string $message, int $status = 400 ): WP_REST_Response {
        return new WP_REST_Response( [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ], $status );
    }
}
```

### Requirement 5: Permission Management

**Acceptance Criteria:**
- Centralized permission checking
- Support for dev token authentication
- Support for capability-based permissions
- Support for filter-based override

**Implementation:**
```php
class Route_Permission_Manager {
    public function check_permission( string $capability = 'edit_posts' ): bool {
        if ( $this->check_dev_token() ) {
            return true;
        }
        
        if ( apply_filters( 'elementor_css_converter_allow_public_access', false ) ) {
            return true;
        }
        
        return current_user_can( $capability );
    }
}
```

### Requirement 6: Error Handling Standards

**Acceptance Criteria:**
- All errors use standard HTTP status codes
- Consistent error message format
- Debug information in development mode only
- Proper exception catching and logging

**HTTP Status Code Standards:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (no permission)
- `413` - Payload Too Large (size limits)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error (unexpected)
- `502` - Bad Gateway (external fetch failed)
- `503` - Service Unavailable (dependency missing)

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. Create `Base_Route` abstract class
2. Create `Route_Response_Builder`
3. Create `Route_Permission_Manager`
4. Write unit tests for foundation classes

### Phase 2: Shared Services (Week 1-2)
1. Create `Http\Url_Fetcher` service
2. Create `Http\Content_Validator` service
3. Extract common validation logic
4. Write unit tests for services

### Phase 3: Request Handlers (Week 2)
1. Create `Base_Request_Handler`
2. Create `Widgets_Request_Handler`
3. Create `Classes_Request_Handler`
4. Create `Variables_Request_Handler`
5. Write unit tests for handlers

### Phase 4: Refactor Routes (Week 3)
1. Refactor `Widgets_Route` to use new architecture
2. Refactor `Classes_Route` to use new architecture
3. Refactor `Variables_Route` to use new architecture
4. Update integration tests
5. Test backward compatibility

### Phase 5: Documentation & Cleanup (Week 3)
1. Update API documentation
2. Add inline code documentation
3. Remove deprecated code
4. Final testing and QA

## Success Metrics

1. **Code Quality**
   - Route classes reduced from 300+ lines to <100 lines
   - Code duplication eliminated
   - Test coverage >80%

2. **Maintainability**
   - New endpoint can be added in <1 hour
   - Business logic changes don't affect HTTP layer
   - Easy to mock for testing

3. **Consistency**
   - All endpoints follow same pattern
   - Error responses standardized
   - Permission handling unified

4. **Backward Compatibility**
   - Existing API consumers not affected
   - Response formats remain compatible
   - No breaking changes

## Migration Strategy

### For Existing Code
1. Create new classes alongside existing
2. Update routes one at a time
3. Run parallel tests
4. Gradually phase out old code
5. Remove deprecated code after testing

### For API Consumers
- No changes required
- Response format remains compatible
- Only internal implementation changes

## Risk Assessment

### Risks
1. **Breaking Changes**: Accidentally changing response format
   - **Mitigation**: Comprehensive integration tests, parallel testing

2. **Performance Impact**: Additional abstraction layers
   - **Mitigation**: Benchmark before/after, optimize if needed

3. **Incomplete Migration**: Some routes remain inconsistent
   - **Mitigation**: Complete all routes in single release

4. **Testing Complexity**: More classes to test
   - **Mitigation**: Better separation = easier unit testing

## Open Questions

1. Should we version the API (v2 → v3)?
   - **Decision**: No, maintain v2 with internal refactoring

2. Should we deprecate old permission callback behavior?
   - **Decision**: Add proper implementation but maintain backward compatibility

3. Should we add rate limiting to all endpoints?
   - **Decision**: Yes, centralize in `Base_Route`

4. Should we add request/response logging?
   - **Decision**: Yes, in debug mode via `route_wrapper`

## References

- Elementor Core Components API: `plugins/elementor-css/modules/components/components-rest-api.php`
- Current Widgets Route: `plugins/elementor-css/modules/css-converter/routes/widgets-route.php`
- Current Classes Route: `plugins/elementor-css/modules/css-converter/routes/classes-route.php`
- WordPress REST API Best Practices: https://developer.wordpress.org/rest-api/extending-the-rest-api/routes-and-endpoints/
