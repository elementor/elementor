<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\WpRest\Base\Query as Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class User_Query extends Base {
	const ENDPOINT = 'user';
	const SEARCH_FILTER_ACCEPTED_ARGS = 1;

	const CACHE_HIERARCHY_KEY = 'elementor_roles_hierarchy';

	private static ?array $roles_hierarchy = null;

	public function __construct() {
		 add_action( 'add_role', fn () => $this->arrange_roles_by_capabilities( true ), 10, 2 );
		 add_action( 'remove_role', fn () => $this->arrange_roles_by_capabilities( true ), 10, 2 );
		 add_action( 'add_cap', fn () => $this->arrange_roles_by_capabilities( true ), 10, 2 );
		 add_action( 'remove_cap', fn () => $this->arrange_roles_by_capabilities( true ), 10, 2 );

		 $this->arrange_roles_by_capabilities();
	}
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

		$keys_format_map = $params[ self::KEYS_CONVERSION_MAP_KEY ];

		$requested_count = $params[ self::ITEMS_COUNT_KEY ] ?? 0;
		$validated_count = max( $requested_count, 1 );
		$count = min( $validated_count, self::MAX_RESPONSE_COUNT );

		$query_args = [
			'number' => $count,
			'search' => "*$search_term*",
			'role__in' => $this->get_propagated_role_list( $included_roles ),
			'role__not_in' => $this->get_propagated_role_list( $excluded_roles ),
		];

		if ( ! empty( $params[ self::META_QUERY_KEY ] ) && is_array( $params[ self::META_QUERY_KEY ] ) ) {
			$query_args['meta_query'] = $params[ self::META_QUERY_KEY ];
		}

		$this->add_filter_to_customize_query();
		$users = Collection::make( get_users( $query_args ) );
		$this->remove_filter_to_customize_query();

		global $wp_roles;
		$roles = $wp_roles->roles;

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
		if ( ! in_array( 'ID', $columns, true ) ) {
			$columns[] = 'ID';
		}

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
				'type' => 'array',
				'required' => false,
				'default' => null,
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
			],
			self::EXCLUDED_TYPE_KEY => [
				'description' => 'User roles to exclude',
				'type' => 'array',
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
		];
	}

	private function get_propagated_role_list( $roles = [] ) {
		if ( empty( $roles ) ) {
			return [];
		}

		$this->arrange_roles_by_capabilities();
		$computed_roles = [];

		foreach ( $roles as $role ) {
			$role_index = array_search( $role, self::$roles_hierarchy, true );

			if ( false === $role_index || in_array( $role, $computed_roles, true ) ) {
				continue;
			}

			$computed_roles = array_slice( self::$roles_hierarchy, 0, $role_index + 1 );
		}

		return $computed_roles;
	}

	protected static function get_allowed_param_keys(): array {
		return [
			self::EXCLUDED_TYPE_KEY,
			self::INCLUDED_TYPE_KEY,
			self::KEYS_CONVERSION_MAP_KEY,
			self::META_QUERY_KEY,
			self::ITEMS_COUNT_KEY,
		];
	}

	protected static function get_keys_to_encode(): array {
		return [
			self::EXCLUDED_TYPE_KEY,
			self::INCLUDED_TYPE_KEY,
			self::KEYS_CONVERSION_MAP_KEY,
			self::META_QUERY_KEY,
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

	private function arrange_roles_by_capabilities( $force = false ) {
		$cached = $this->load_roles_hierarchy_from_cache();

		if ( ! $force && ! empty( $cached ) ) {
			self::$roles_hierarchy = $cached;

			return;
		}

		global $wp_roles;
		$roles = Collection::make( $wp_roles->roles )
			->map( fn( $role, $slug ) => array_merge( (array) $role, [ 'slug' => $slug ] ) )
			->all();

		self::$roles_hierarchy = array_column( array_values( $roles ), 'slug' );

		$temp_user_a_id = $this->generate_random_user();
		$temp_user_a = get_user_by( 'ID', $temp_user_a_id );

		$temp_user_b_id = $this->generate_random_user();
		$temp_user_b = get_user_by( 'ID', $temp_user_b_id );

		usort( self::$roles_hierarchy, function( $role_a, $role_b ) use ( $temp_user_a, $temp_user_b ) {
			$temp_user_a->set_role( $role_a );
			$temp_user_b->add_role( $role_b );

			$is_a_stronger = (int) $this->is_user_of_role( $temp_user_a, $role_b );
			$is_b_stronger = (int) $this->is_user_of_role( $temp_user_b, $role_a );

			return $is_b_stronger - $is_a_stronger;
		} );

		$this->save_roles_hierarchy_from_cache( $force );

		if ( ! function_exists( 'wp_delete_user' ) ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
		}

		wp_delete_user( $temp_user_a_id );
		wp_delete_user( $temp_user_b_id );
	}

	private function generate_random_user( $random_string = null ) {
		$random_string = $random_string ?? wp_generate_password( 12, false );
		$existing_user = get_user_by( 'login', $random_string );

		if ( $existing_user instanceof \WP_User ) {
			return $this->generate_random_user();
		}

		return wp_insert_user( [
			'user_login' => $random_string,
			'user_pass' => $random_string,
		] );
	}

	private function load_roles_hierarchy_from_cache() {
		return get_transient( self::CACHE_HIERARCHY_KEY ) ?? null;
	}

	private function save_roles_hierarchy_from_cache( $force ) {
		if ( $force || ! empty( $this->load_roles_hierarchy_from_cache() ) ) {
			set_transient( self::CACHE_HIERARCHY_KEY, self::$roles_hierarchy, DAY_IN_SECONDS );
		}
	}
}
