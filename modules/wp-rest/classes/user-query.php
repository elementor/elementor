<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\WpRest\Base\Query as Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @deprecated Use wp/v2/users instead. This endpoint proxies to wp/v2/users internally
 *             and will be removed in 4.6.0 version.
 */
class User_Query extends Base {
	const ENDPOINT = 'user';

	protected function get( \WP_REST_Request $request ) {
		$params = $request->get_params();
		$search_term = trim( $params[ self::SEARCH_TERM_KEY ] ?? '' );

		if ( empty( $search_term ) ) {
			return new \WP_REST_Response( [
				'success' => true,
				'data' => [
					'value' => [],
				],
			], 200 );
		}

		$keys_format_map = $params[ self::KEYS_CONVERSION_MAP_KEY ];

		$requested_count = $params[ self::ITEMS_COUNT_KEY ] ?? 0;
		$validated_count = max( $requested_count, 1 );
		$count = min( $validated_count, self::MAX_RESPONSE_COUNT );

		$wp_request = new \WP_REST_Request( 'GET', '/wp/v2/users' );
		$wp_request->set_param( 'search', $search_term );
		$wp_request->set_param( 'per_page', $count );
		$wp_request->set_param( 'context', 'edit' );

		$response = rest_do_request( $wp_request );

		if ( $response->is_error() ) {
			return new \WP_REST_Response( [
				'success' => true,
				'data' => [
					'value' => [],
				],
			], 200 );
		}

		global $wp_roles;
		$roles = $wp_roles->roles;

		$users = Collection::make( $response->get_data() );

		$result = new \WP_REST_Response( [
			'success' => true,
			'data' => [
				'value' => array_values( $users->map( function ( $user ) use ( $keys_format_map, $roles ) {
					$user_data = [
						'ID' => $user['id'],
						'display_name' => $user['name'],
					];

					if ( ! empty( $user['roles'][0] ) ) {
						$user_role = $user['roles'][0];
						$role_name = $roles[ $user_role ]['name'] ?? ucfirst( $user_role );
						$user_data['role'] = $role_name;
					}

					return $this->translate_keys( $user_data, $keys_format_map );
				} )->all() ),
			],
		], 200 );

		_doing_it_wrong(
			'elementor/v1/user',
			'Use wp/v2/users instead. This endpoint will be removed in 4.6.0 version.',
			'4.0.4'
		);

		return $result;
	}

	protected function get_endpoint_registration_args(): array {
		return [
			self::SEARCH_TERM_KEY => [
				'description' => 'Users to search',
				'type' => 'string',
				'required' => false,
				'default' => '',
				'sanitize_callback' => 'sanitize_text_field',
			],
			self::KEYS_CONVERSION_MAP_KEY => [
				'description' => 'Specify keys to extract and convert, i.e. ["key_1" => "new_key_1"].',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => [
					'ID' => 'id',
					'display_name' => 'label',
					'role' => 'groupLabel',
				],
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
			],
			self::ITEMS_COUNT_KEY => [
				'description' => 'Number of users to return',
				'type' => 'integer',
				'required' => false,
				'default' => self::MAX_RESPONSE_COUNT,
			],
		];
	}

	protected static function get_allowed_param_keys(): array {
		return [
			self::KEYS_CONVERSION_MAP_KEY,
			self::ITEMS_COUNT_KEY,
		];
	}

	protected static function get_keys_to_encode(): array {
		return [ self::KEYS_CONVERSION_MAP_KEY ];
	}
}
