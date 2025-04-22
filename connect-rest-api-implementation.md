# Elementor Library Connect REST API - Technical Implementation Plan

## 1. Implementation Structure

### 1.1 New Files
- `/core/common/modules/connect/rest-api.php` - Main REST API controller class

### 1.2 Modified Files
- `/core/common/modules/connect/apps/base-app.php` - Add support for 'rest' auth mode
=
## 2. Implementation Details

### 2.1 REST API Controller Class

The REST API controller will handle registration of endpoints and processing of requests:

```php
<?php
namespace Elementor\Core\Common\Modules\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Elementor Library Connect REST API.
 *
 * REST API controller for handling library connect operations.
 *
 * @since x.x.x
 */
class Rest_Api {

    /**
     * REST API namespace.
     */
    const REST_NAMESPACE = 'elementor/v1';

    /**
     * REST API base.
     */
    const REST_BASE = 'library';

    /**
     * Register REST API routes.
     *
     * @since x.x.x
     * @access public
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            self::REST_NAMESPACE,
            self::REST_BASE . '/connect',
            [
                [
                    'methods'             => \WP_REST_Server::CREATABLE, // POST
                    'callback'            => [ $this, 'connect' ],
                    'permission_callback' => [ $this, 'connect_permissions_check' ],
                ],
            ]
        );

        // Add disconnect endpoint
        register_rest_route(
            self::REST_NAMESPACE,
            self::REST_BASE . '/disconnect',
            [
                [
                    'methods'             => \WP_REST_Server::CREATABLE, // POST
                    'callback'            => [ $this, 'disconnect' ],
                    'permission_callback' => [ $this, 'connect_permissions_check' ],
                ],
            ]
        );
    }

    /**
     * Check if user has permission to connect.
     *
     * @since x.x.x
     * @access public
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return bool|\WP_Error True if the request has permission, WP_Error otherwise.
     */
    public function connect_permissions_check( $request ) {
        if ( ! current_user_can( 'manage_options' ) ) {
            return new \WP_Error(
                'rest_forbidden',
                esc_html__( 'Sorry, you are not allowed to connect to the library.', 'elementor' ),
                [ 'status' => rest_authorization_required_code() ]
            );
        }

        return true;
    }

    /**
     * Connect to Elementor Library.
     *
     * @since x.x.x
     * @access public
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error on failure.
     */
    public function connect( $request ) {
        // Get library app
        $connect = Plugin::$instance->common->get_component( 'connect' );
        if ( ! $connect ) {
            return new \WP_Error(
                'elementor_connect_not_available',
                esc_html__( 'Elementor Connect module is not available.', 'elementor' ),
                [ 'status' => 500 ]
            );
        }

        $app = $connect->get_app( 'library' );
        if ( ! $app ) {
            $connect->init();
            $app = $connect->get_app( 'library' );
            
            if ( ! $app ) {
                return new \WP_Error(
                    'elementor_library_app_not_available',
                    esc_html__( 'Elementor Library app is not available.', 'elementor' ),
                    [ 'status' => 500 ]
                );
            }
        }

        // Set REST auth mode
        $app->set_auth_mode( 'rest' );

        // Mock $_REQUEST for backward compatibility
        $_REQUEST['mode'] = 'rest';

        try {
            // Generate client ID and get token
            $response = $app->request(
                'get_client_id',
                [
                    'source' => 'rest-api',
                ]
            );

            if ( is_wp_error( $response ) ) {
                return $response;
            }

            $_REQUEST['token'] = $response->auth_secret;

		$app = $this->get_library_app();

		$app->set_auth_mode( 'rest' );

		$app->action_authorize();

		$app->action_get_token();

            // Check if connection was successful
            if ( $app->is_connected() ) {
                return rest_ensure_response( [
                    'success' => true,
                    'message' => esc_html__( 'Connected successfully.', 'elementor' ),
                ] );
            } else {
                return new \WP_Error(
                    'elementor_library_not_connected',
                    esc_html__( 'Failed to connect to Elementor Library.', 'elementor' ),
                    [ 'status' => 500 ]
                );
            }
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'elementor_library_connect_error',
                $e->getMessage(),
                [ 'status' => 500 ]
            );
        }
    }

    /**
     * Disconnect from Elementor Library.
     *
     * @since x.x.x
     * @access public
     *
     * @param \WP_REST_Request $request Full data about the request.
     * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error on failure.
     */
    public function disconnect( $request ) {
        // Get library app
        $connect = Plugin::$instance->common->get_component( 'connect' );
        if ( ! $connect ) {
            return new \WP_Error(
                'elementor_connect_not_available',
                esc_html__( 'Elementor Connect module is not available.', 'elementor' ),
                [ 'status' => 500 ]
            );
        }

        $app = $connect->get_app( 'library' );
        if ( ! $app ) {
            $connect->init();
            $app = $connect->get_app( 'library' );
            
            if ( ! $app ) {
                return new \WP_Error(
                    'elementor_library_app_not_available',
                    esc_html__( 'Elementor Library app is not available.', 'elementor' ),
                    [ 'status' => 500 ]
                );
            }
        }

        // Set REST auth mode
        $app->set_auth_mode( 'rest' );

        // Mock $_REQUEST for backward compatibility
        $_REQUEST['mode'] = 'rest';

        try {
            // Disconnect
            $app->action_disconnect();

            return rest_ensure_response( [
                'success' => true,
                'message' => esc_html__( 'Disconnected successfully.', 'elementor' ),
            ] );
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'elementor_library_disconnect_error',
                $e->getMessage(),
                [ 'status' => 500 ]
            );
        }
    }
}
```

### 2.2 Modifications to Base App Class

Add support for 'rest' auth mode in the Base_App class:

```php
// In /core/common/modules/connect/apps/base-app.php
// In the init_auth_mode() method:

private function init_auth_mode() {
    $is_rest = defined( 'REST_REQUEST' ) && REST_REQUEST;
    $is_ajax = wp_doing_ajax();

    if ( $is_rest || $is_ajax ) {
        // Set default to 'xhr' if rest or ajax request.
        $this->set_auth_mode( 'xhr' );
    }

    $mode = Utils::get_super_global_value( $_REQUEST, 'mode' );

    if ( $mode ) {
        $allowed_auth_modes = [
            'popup',
            'rest', // Add 'rest' as an allowed auth mode
        ];

        if ( defined( 'WP_CLI' ) && WP_CLI ) {
            $allowed_auth_modes[] = 'cli';
        }

        if ( in_array( $mode, $allowed_auth_modes, true ) ) {
            $this->set_auth_mode( $mode );
        }
    }
}
```

### 2.3 Integration with Module Class

Register the REST API in the Connect Module:

```php
// In /core/common/modules/connect/module.php
// In the constructor or init method:

/**
 * Register REST routes.
 *
 * @since x.x.x
 * @access private
 */
private function register_rest_routes() {
    add_action( 'rest_api_init', function() {
        $rest_api = new Rest_Api();
        $rest_api->register_routes();
    } );
}
```

## 3. Usage Examples

### 3.1 REST API Request Example (PHP)

```php
/**
 * Example of connecting to Elementor Library using the REST API.
 */
function example_connect_to_elementor_library() {
    // Make the connection request
    $api_response = wp_remote_post(
        rest_url( 'elementor/v1/library/connect' ),
        [
            'headers' => [
                'X-WP-Nonce' => wp_create_nonce( 'wp_rest' ),
            ],
        ]
    );

    if ( is_wp_error( $api_response ) ) {
        return $api_response;
    }

    $body = json_decode( wp_remote_retrieve_body( $api_response ), true );
    
    return $body;
}
```

### 3.2 JavaScript Implementation Example

```javascript
/**
 * Example of connecting to Elementor Library using the REST API.
 */
function connectToElementorLibrary() {
    return fetch(`/wp-json/elementor/v1/library/connect`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpApiSettings.nonce
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Connected successfully!');
            return data;
        } else {
            throw new Error(data.message || 'Failed to connect to Elementor Library');
        }
    });
}
```

## 4. Testing Plan

### 4.1 Unit Tests

Create unit tests to verify:

1. Endpoint registration
2. Permission checks
3. Connection process
4. Token retrieval flow

Example test structure:

```php
class Test_Library_Connect_REST_API extends WP_UnitTestCase {
    
    public function test_register_routes() {
        // Test that routes are registered
    }
    
    public function test_connect_permissions_check() {
        // Test permission checks
    }
    
    public function test_connect_success() {
        // Test successful connection
    }
    
    public function test_disconnect() {
        // Test disconnection process
    }
}
```

### 4.2 Integration Tests

1. Test the complete connection flow in a single API call
2. Verify user permissions are properly enforced
3. Test error handling for various scenarios

## 5. Security Considerations

### 5.1 Authentication

- Ensure proper WordPress authentication for REST requests
- Validate user permissions before processing requests
- Use state parameters to prevent CSRF attacks

### 5.2 Error Handling

- Provide meaningful error messages
- Avoid exposing sensitive information in error responses
- Log all connection attempts for security auditing

## 6. Performance Considerations

- Implement rate limiting for connect attempts
- Optimize token generation and validation process
- Use caching where appropriate 