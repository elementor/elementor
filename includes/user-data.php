<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class User_Data {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = '/user-data/current-user';

	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'register_routes' ] );
	}

	public static function register_routes() {
		register_rest_route( self::API_NAMESPACE, self::API_BASE, [
			[
				'methods' => \WP_REST_Server::READABLE,
				'callback' => [ __CLASS__, 'get_current_user' ],
				'permission_callback' => [ __CLASS__, 'check_permissions' ],
			],
			[
				'methods' => \WP_REST_Server::EDITABLE,
				'callback' => [ __CLASS__, 'update_current_user' ],
				'permission_callback' => [ __CLASS__, 'check_permissions' ],
				'args' => [
					'suppressedMessages' => [
						'required' => false,
						'type' => 'array',
						'description' => 'Array of suppressed message keys',
						'items' => [
							'type' => 'string',
						],
						'validate_callback' => function( $param, $request, $key ) {
							return is_array( $param );
						},
						'sanitize_callback' => function( $param, $request, $key ) {
							return is_array( $param ) ? $param : null;
						},
					],
				],
			],
		] );
	}

	/**
	 * Check permissions for the endpoint
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return bool|\WP_Error Whether the user has permission.
	 */
	public static function check_permissions( $request ) {
		if ( ! is_user_logged_in() ) {
			return new \WP_Error( 'rest_not_logged_in', 'You are not currently logged in.', [ 'status' => 401 ] );
		}

		return true;
	}

	/**
	 * Get current user data
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response|\WP_Error Response object or error.
	 */
	public static function get_current_user( $request ) {
		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			return new \WP_Error( 'rest_not_logged_in', 'You are not currently logged in.', [ 'status' => 401 ] );
		}

		$current_user = wp_get_current_user();
		$introduction_meta = User::get_introduction_meta();

		$suppressed_messages = [];
		if ( is_array( $introduction_meta ) ) {
			foreach ( $introduction_meta as $key => $value ) {
				if ( $value ) {
					$suppressed_messages[] = $key;
				}
			}
		}

		$capabilities = array_keys( $current_user->allcaps );

		$data = [
			'suppressedMessages' => $suppressed_messages,
			'capabilities' => $capabilities,
		];

		return new \WP_REST_Response( $data, 200 );
	}

	/**
	 * Update current user data
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response|\WP_Error Response object or error.
	 */
	public static function update_current_user( $request ) {
		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			return new \WP_Error( 'rest_not_logged_in', 'You are not currently logged in.', [ 'status' => 401 ] );
		}

		$suppressed_messages = $request->get_param( 'suppressedMessages' );

		if ( $request->has_param( 'suppressedMessages' ) && is_array( $suppressed_messages ) ) {
			$introduction_meta = [];
			foreach ( $suppressed_messages as $message ) {
				$introduction_meta[ $message ] = true;
			}

			update_user_meta( $user_id, User::INTRODUCTION_KEY, $introduction_meta );
		}

		return self::get_current_user( $request );
	}
} 