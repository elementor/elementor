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
                    'args' => [
                        'token' => [
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Connect CLI token',
                        ],
                    ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            self::REST_BASE . '/disconnect',
            [
                [
                    'methods'             => \WP_REST_Server::DELETABLE, // DELETE
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

        // Mhttps://desktop.postman.com/?desktopVersion=11.44.0&webVersion=11.44.0-ui-250504-2334&userId=21887712&teamId=3945143&region=usock $_REQUEST for backward compatibility
        $_REQUEST['mode'] = 'rest';
        $_REQUEST['token'] = $request->get_param('token');
        try {
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