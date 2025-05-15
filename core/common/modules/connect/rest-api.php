<?php
namespace Elementor\Core\Common\Modules\Connect;

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
	 * @access public
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			self::REST_NAMESPACE,
			self::REST_BASE . '/connect',
			[
				[
					'methods' => \WP_REST_Server::CREATABLE, // POST
					'callback' => [ $this, 'connect' ],
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
			self::REST_BASE . '/connect',
			[
				[
					'methods' => \WP_REST_Server::DELETABLE, // DELETE
					'callback' => [ $this, 'disconnect' ],
					'permission_callback' => [ $this, 'connect_permissions_check' ],
				],
			]
		);
	}
	public function connect( \WP_REST_Request $request ) {
		$app = $this->get_connect_app();
		if ( ! $app ) {
			return $this->error_response( 'elementor_library_app_not_available', __( 'Elementor Library app is not available.', 'elementor' ), 500 );
		}
		$app->set_auth_mode( 'rest' );
		$_REQUEST['mode'] = 'rest';
		$_REQUEST['token'] = $request->get_param( 'token' );
		try {
			$app->action_authorize();
			$app->action_get_token();
			if ( $app->is_connected() ) {
				return $this->success_response( [ 'message' => __( 'Connected successfully.', 'elementor' ) ] );
			} else {
				return $this->error_response( 'elementor_library_not_connected', __( 'Failed to connect to Elementor Library.', 'elementor' ), 500 );
			}
		} catch ( \Exception $e ) {
			return $this->error_response( 'elementor_library_connect_error', $e->getMessage(), 500 );
		}
	}

	public function disconnect( \WP_REST_Request $request ) {
		$app = $this->get_connect_app();
		if ( ! $app ) {
			return $this->error_response( 'elementor_library_app_not_available', __( 'Elementor Library app is not available.', 'elementor' ), 500 );
		}
		$app->set_auth_mode( 'rest' );
		$_REQUEST['mode'] = 'rest';
		try {
			$app->action_disconnect();
			return $this->success_response( [ 'message' => __( 'Disconnected successfully.', 'elementor' ) ] );
		} catch ( \Exception $e ) {
			return $this->error_response( 'elementor_library_disconnect_error', $e->getMessage(), 500 );
		}
	}

	public function connect_permissions_check( \WP_REST_Request $request ) {
		return current_user_can( 'manage_options' );
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return $this->error_response( 'unexpected_error', __( 'Something went wrong', 'elementor' ), 500 );
		}
		return $response;
	}

	private function error_response( $code, $message, $status = 400 ) {
		return new \WP_Error(
			$code,
			$message,
			[ 'status' => $status ]
		);
	}

	private function success_response( $data = [], $status = 200 ) {
		return rest_ensure_response( array_merge( [ 'success' => true ], $data ) );
	}

	/**
	 * Get the connect app.
	 *
	 * @return \Elementor\Core\Common\Modules\Connect\Apps\Library|null
	 */
	private function get_connect_app() {
		$connect = Plugin::$instance->common->get_component( 'connect' );
		if ( ! $connect ) {
			return null;
		}
		$app = $connect->get_app( 'library' );
		if ( ! $app ) {
			$connect->init();
			$app = $connect->get_app( 'library' );
		}
		return $app;
	}
}
