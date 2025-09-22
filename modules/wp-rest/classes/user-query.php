<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\WpRest\Base\Query as Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class User_Query extends Base {
	const ENDPOINT = 'user';

	/**
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
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

		$included_roles = $params[ self::INCLUDED_TYPE_KEY ];
		$excluded_roles = $params[ self::EXCLUDED_TYPE_KEY ];

		$fields = $params[ self::FIELDS_KEY ];
		$fields = is_array( $fields ) && 1 === count( $fields ) ? $fields[0] : $fields;
		$keys_format_map = $params[ self::KEYS_CONVERSION_MAP_KEY ];

		$requested_count = $params[ self::ITEMS_COUNT_KEY ] ?? 0;
		$validated_count = max( $requested_count, 1 );
		$count = min( $validated_count, self::MAX_RESPONSE_COUNT );

		$query_args = [
			'number' => $count,
			'search' => "*$search_term*",
			'fields' => $fields,
		];

		if ( ! empty( $params[ self::META_QUERY_KEY ] ) && is_array( $params[ self::META_QUERY_KEY ] ) ) {
			$query_args['meta_query'] = $params[ self::META_QUERY_KEY ];
		}

		$this->add_filter_to_customize_query();

		$users = Collection::make( get_users( $query_args ) )
			->filter( function ( $user ) use ( $included_roles, $excluded_roles ) {
				if ( ! ( $user instanceof \WP_User ) ) {
					return false;
				}

				$is_of_included_role = empty( $included_roles )
					|| Collection::make( $included_roles )
						->some( fn( $role_slug ) => $this->is_user_of_role( $user, $role_slug ) );

				$is_not_of_excluded_role = empty( $excluded_roles )
					|| ! Collection::make( $excluded_roles )
					->some( fn( $role_slug ) => $this->is_user_of_role( $user, $role_slug ) );

				return $is_of_included_role && $is_not_of_excluded_role;
			} );

		$this->remove_filter_to_customize_query();

		global $wp_roles;
		$roles = Collection::make( $wp_roles->roles );

		return new \WP_REST_Response( [
			'success' => true,
			'data' => [
				'value' => array_values( $users
					->map( function ( $user ) use ( $keys_format_map, $roles ) {
						$user_object = (array) $user;
						$user_object['display_name'] = $user->data->display_name;

						if ( isset( $user_object['roles'][0] ) ) {
							$user_role = $user_object['roles'][0];
							$role = $roles[ $user_role ]['name'];
							$user_object['role'] = $role ?? ucfirst( $user_role );
						}

						return $this->translate_keys( $user_object, $keys_format_map );
					} )
				->all() ),
			],
		], 200 );
	}

	public function customize_user_query( $columns ) {
		$columns[] = 'ID';

		return $columns;
	}

	/**
	 * @return void
	 */
	private function add_filter_to_customize_query() {
		$priority = self::SEARCH_FILTER_PRIORITY;
		$accepted_args = self::SEARCH_FILTER_ACCEPTED_ARGS;

		add_filter( 'user_search_columns', [ $this, 'customize_user_query' ], $priority, $accepted_args );
	}

	/**
	 * @return void
	 */
	private function remove_filter_to_customize_query() {
		$priority = self::SEARCH_FILTER_PRIORITY;
		$accepted_args = self::SEARCH_FILTER_ACCEPTED_ARGS;

		remove_filter( 'user_search_columns', [ $this, 'customize_user_query' ], $priority, $accepted_args );
	}

	/**
	 * @return array
	 */
	protected function get_endpoint_registration_args(): array {
		return [
			self::INCLUDED_TYPE_KEY => [
				'description' => 'User roles to include',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => null,
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
			],
			self::EXCLUDED_TYPE_KEY => [
				'description' => 'User roles to exclude',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => null,
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
			],
			self::SEARCH_TERM_KEY => [
				'description' => 'Posts to search',
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
				'description' => 'Posts per page',
				'type' => 'integer',
				'required' => false,
				'default' => self::MAX_RESPONSE_COUNT,
			],
			self::META_QUERY_KEY => [
				'description' => 'WP_Query meta_query array',
				'type' => 'array',
				'required' => false,
				'default' => null,
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
			],
			self::FIELDS_KEY => [
				'description' => 'Term fields to query for',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => 'all',
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
				'validate_callback' => fn ( $fields ) => ! $fields || in_array( $fields, [
					'all',
					'ID',
					'display_name',
					'login',
					'user_login',
					'nicename',
					'user_nicename',
					'email',
					'user_email',
					'url',
					'user_url',
					'registered',
					'user_registered',
				], true ),
			],
		];
	}

	protected static function get_allowed_param_keys(): array {
		return [
			self::EXCLUDED_TYPE_KEY,
			self::INCLUDED_TYPE_KEY,
			self::KEYS_CONVERSION_MAP_KEY,
			self::META_QUERY_KEY,
			self::ITEMS_COUNT_KEY,
			self::FIELDS_KEY,
		];
	}

	protected static function get_keys_to_encode(): array {
		return [
			self::EXCLUDED_TYPE_KEY,
			self::INCLUDED_TYPE_KEY,
			self::KEYS_CONVERSION_MAP_KEY,
			self::META_QUERY_KEY,
			self::FIELDS_KEY,
		];
	}

	private function is_user_of_role( \WP_User $user, string $role_slug ) {
		$role = get_role( $role_slug );

		if ( ! $role ) {
			return false;
		}

		return ! Collection::make( $role->capabilities )->some( function( $enabled, $capability ) use ( $user ) {
				return ! $user->has_cap( $capability ) && ! ( $user->allcaps[ $capability ] ?? false );
		} );
	}
}
