# Security & Validation

## WordPress Security Checklist

Apply these patterns to REST endpoints, Ajax handlers, admin pages, and any database interaction.

---

## Core Security Checks

### 1. Guard Files
Prevent direct file access:
```php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
```

### 2. Verify Nonce and Capabilities
Always verify nonce early, then check user capabilities:

```php
public function handle_ajax_request() {
    // Verify nonce
    check_ajax_referer( 'my_nonce_action', 'nonce' );
    
    // Check user capabilities
    if ( ! current_user_can( 'edit_posts' ) ) {
        wp_send_json_error( 'Insufficient permissions', 403 );
    }
    
    // Process request
}
```

For non-AJAX requests:
```php
if ( ! wp_verify_nonce( $_POST['_wpnonce'], 'my_action' ) ) {
    wp_die( 'Security check failed' );
}

if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( 'Insufficient permissions' );
}
```

### 3. Sanitize on Input
Always sanitize user input before processing:

```php
// Text fields
$title = sanitize_text_field( $_POST['title'] );

// Integer values
$user_id = absint( $_POST['user_id'] );

// Keys (alphanumeric, dashes, underscores only)
$key = sanitize_key( $_POST['key'] );

// URLs
$url = esc_url_raw( $_POST['url'] );

// Email addresses
$email = sanitize_email( $_POST['email'] );

// Textarea content
$content = sanitize_textarea_field( $_POST['content'] );
```

### 4. Escape on Output
Always escape output based on context:

```php
// HTML content
echo esc_html( $user_input );

// HTML attributes
echo '<div class="' . esc_attr( $class_name ) . '">';

// URLs
echo '<a href="' . esc_url( $link ) . '">';

// JavaScript
echo '<script>var myVar = ' . wp_json_encode( $data ) . ';</script>';

// Translation with HTML
echo wp_kses_post( __( 'Welcome <strong>user</strong>', 'textdomain' ) );
```

### 5. SQL Queries
Always use `$wpdb->prepare` for dynamic queries:

```php
global $wpdb;

// Single parameter
$results = $wpdb->get_results( 
    $wpdb->prepare( 
        "SELECT * FROM {$wpdb->prefix}table WHERE user_id = %d", 
        $user_id 
    ) 
);

// Multiple parameters
$results = $wpdb->get_results( 
    $wpdb->prepare( 
        "SELECT * FROM {$wpdb->prefix}table WHERE user_id = %d AND status = %s", 
        $user_id,
        $status
    ) 
);
```

### 6. HTML Output with wp_kses
Use `wp_kses` with allowed tags array when outputting rich content:

```php
$allowed_html = [
    'a' => [
        'href' => [],
        'title' => [],
    ],
    'strong' => [],
    'em' => [],
    'p' => [],
];

echo wp_kses( $user_content, $allowed_html );
```

---

## REST API Security

### Permission Callbacks
Always implement permission callbacks for REST endpoints:

```php
register_rest_route( 'my-plugin/v1', '/data', [
    'methods' => 'POST',
    'callback' => [ $this, 'create_data' ],
    'permission_callback' => [ $this, 'check_permissions' ],
] );

public function check_permissions() {
    return current_user_can( 'edit_posts' );
}
```

### Validation Callbacks
Implement validation for request parameters:

```php
register_rest_route( 'my-plugin/v1', '/data', [
    'methods' => 'POST',
    'callback' => [ $this, 'create_data' ],
    'permission_callback' => [ $this, 'check_permissions' ],
    'args' => [
        'title' => [
            'required' => true,
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => function( $value ) {
                return strlen( $value ) > 3 && strlen( $value ) < 100;
            },
        ],
        'age' => [
            'type' => 'integer',
            'minimum' => 18,
            'maximum' => 120,
        ],
    ],
] );
```

---

## AJAX Security

### Complete AJAX Handler Example
```php
public function register_ajax_actions() {
    add_action( 'wp_ajax_my_action', [ $this, 'handle_ajax' ] );
    add_action( 'wp_ajax_nopriv_my_action', [ $this, 'handle_ajax_public' ] );
}

public function handle_ajax() {
    // Verify nonce
    check_ajax_referer( 'my_nonce_action', 'nonce' );
    
    // Check capabilities
    if ( ! current_user_can( 'edit_posts' ) ) {
        wp_send_json_error( 'Insufficient permissions', 403 );
    }
    
    // Sanitize input
    $title = sanitize_text_field( $_POST['title'] ?? '' );
    $user_id = absint( $_POST['user_id'] ?? 0 );
    
    // Validate input
    if ( empty( $title ) || 0 === $user_id ) {
        wp_send_json_error( 'Invalid input', 400 );
    }
    
    // Process request
    $result = $this->process_data( $title, $user_id );
    
    // Return response
    wp_send_json_success( $result );
}

public function enqueue_scripts() {
    wp_enqueue_script( 'my-script', 'script.js', [ 'jquery' ], '1.0', true );
    wp_localize_script( 'my-script', 'myAjax', [
        'ajaxurl' => admin_url( 'admin-ajax.php' ),
        'nonce' => wp_create_nonce( 'my_nonce_action' ),
    ] );
}
```

---

## Recommended Security Tests

### Permission Tests
Test that permission callbacks work correctly:
```php
public function test_unauthorized_user_cannot_access_endpoint() {
    wp_set_current_user( 0 ); // No user
    
    $request = new WP_REST_Request( 'POST', '/my-plugin/v1/data' );
    $response = rest_do_request( $request );
    
    $this->assertEquals( 401, $response->get_status() );
}
```

### Nonce Tests
Test that nonce is required:
```php
public function test_ajax_requires_valid_nonce() {
    $_POST['title'] = 'Test';
    
    try {
        $this->handler->handle_ajax();
        $this->fail( 'Expected exception for missing nonce' );
    } catch ( WPDieException $e ) {
        $this->assertStringContainsString( 'nonce', $e->getMessage() );
    }
}
```

### Input Validation Tests
Test that invalid input is rejected:
```php
public function test_rejects_invalid_data_types() {
    $request = new WP_REST_Request( 'POST', '/my-plugin/v1/data' );
    $request->set_param( 'age', 'not-a-number' );
    
    $response = rest_do_request( $request );
    
    $this->assertEquals( 400, $response->get_status() );
}
```

---

## HTTP Status Codes

Use specific HTTP status codes, not just 200 and 500:

- **200** - OK (successful GET, PUT, PATCH)
- **201** - Created (successful POST that creates a resource)
- **204** - No Content (successful DELETE)
- **400** - Bad Request (invalid input)
- **401** - Unauthorized (not authenticated)
- **403** - Forbidden (authenticated but not authorized)
- **404** - Not Found (resource doesn't exist)
- **422** - Unprocessable Entity (validation errors)
- **500** - Internal Server Error (unexpected server error)

---

## File Upload Security

### Validate File Uploads
```php
function validate_uploaded_file( $file ) {
    // Check for upload errors
    if ( UPLOAD_ERR_OK !== $file['error'] ) {
        return new WP_Error( 'upload_error', 'File upload failed' );
    }
    
    // Check file size
    $max_size = 5 * 1024 * 1024; // 5MB
    if ( $file['size'] > $max_size ) {
        return new WP_Error( 'file_too_large', 'File exceeds maximum size' );
    }
    
    // Check file type
    $allowed_types = [ 'image/jpeg', 'image/png', 'image/gif' ];
    $file_type = wp_check_filetype( $file['name'] );
    
    if ( ! in_array( $file_type['type'], $allowed_types, true ) ) {
        return new WP_Error( 'invalid_file_type', 'File type not allowed' );
    }
    
    return true;
}
```

---

## Additional Security Best Practices

### Rate Limiting
Implement rate limiting for sensitive operations:
```php
function check_rate_limit( $user_id, $action ) {
    $transient_key = "rate_limit_{$action}_{$user_id}";
    $attempts = get_transient( $transient_key );
    
    if ( false === $attempts ) {
        set_transient( $transient_key, 1, HOUR_IN_SECONDS );
        return true;
    }
    
    if ( $attempts >= 10 ) {
        return false;
    }
    
    set_transient( $transient_key, $attempts + 1, HOUR_IN_SECONDS );
    return true;
}
```

### Logging
Log security-relevant events:
```php
function log_security_event( $event_type, $details ) {
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( sprintf(
            '[Security] %s: %s',
            $event_type,
            wp_json_encode( $details )
        ) );
    }
}
```

