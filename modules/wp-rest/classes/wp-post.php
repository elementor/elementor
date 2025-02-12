<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\GlobalClasses\Utils\Error_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class WP_Post {
	const MAX_COUNT = 100;
	const NAMESPACE = 'elementor/v1';
	const ENDPOINT = 'post';

	const EXCLUDED_POST_TYPES_KEY = 'excluded_post_types';
	const TERM_KEY = 'term';
	const KEYS_FORMAT_MAP_KEY = 'keys_format_map';
	const MAX_COUNT_KEY = 'max_count';
	const NONCE_KEY = 'x_wp_nonce';

	private ?Wordpress_Adapter_Interface $wp_adapter = null;

	public function __construct( ?Wordpress_Adapter_Interface $wp_adapter = null ) {
		$this->wp_adapter = $wp_adapter ?? new Wordpress_Adapter();
	}

	public function register( bool $override_existing_endpoints = false ): void {
		register_rest_route( self::NAMESPACE, self::ENDPOINT, [
			[
				'methods' => \WP_REST_Server::READABLE,
				'permission_callback' => fn ( \WP_REST_Request $request ) => $this->validate_access_permission( $request ),
				'args' => $this->get_args(),
				'sanitize_callback' => 'esc_attr',
				'callback' => fn ( \WP_REST_Request $request ) => $this->route_wrapper( fn() => $this->get_posts( $request ) ),
			],
		], $override_existing_endpoints );
	}

	/**
	 * Builds the query parameters for the REST request.
	 *
	 * @param $args array{
	 *     excluded_post_types: array,
	 *     keys_format_map: array,
	 *     max_count: int,
	 * } The query parameters
	 * @return array The query parameters.
	 */
	public static function build_query_params( array $args ): array {
		$allowed_keys = [ self::EXCLUDED_POST_TYPES_KEY, self::KEYS_FORMAT_MAP_KEY, self::MAX_COUNT_KEY ];
		$keys_to_encode = [ self::EXCLUDED_POST_TYPES_KEY, self::KEYS_FORMAT_MAP_KEY ];

		$params = [];

		foreach ( $args as $key => $value ) {
			if ( ! in_array( $key, $allowed_keys, true ) || ! isset( $value ) ) {
				continue;
			}

			if ( ! in_array( $key, $keys_to_encode, true ) ) {
				$params[ $key ] = $value;
				continue;
			}

			$params[ $key ] = wp_json_encode( $value );
		}

		return $params;
	}

	private function validate_access_permission( $request ): bool {
		$nonce = $request->get_header( self::NONCE_KEY );

		return current_user_can( 'edit_posts' ) && wp_verify_nonce( $nonce, 'wp_rest' );
	}

	/**
	 * Alters the SQL search query to filter by post title or ID.
	 *
	 * @param string $search_term The original search query.
	 * @param \WP_Query $wp_query The WP_Query instance.
	 * @return string Modified search query.
	 */
	private function customize_search( string $search_term, \WP_Query $wp_query ) {
		$term = $wp_query->get( 'search_term' ) ?? '';
		$is_custom_search = $wp_query->get( 'custom_search' ) ?? false;

		if ( $is_custom_search && ! empty( $term ) ) {
			$search_term .= ' AND (';
			$search_term .= "post_title LIKE '%" . esc_sql( $term ) . "%' ";
			$search_term .= "OR ID LIKE '%" . esc_sql( $term ) . "%')";
		}

		return $search_term;
	}

	/**
	 * Wraps the route callback with try/catch to handle exceptions.
	 *
	 * @param callable $cb The route callback.
	 * @return \WP_REST_Response | \WP_Error
	 */
	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( $e->getCode() )
				->set_message( $e->getMessage() )
				->build();
		}

		return $response;
	}

	/**
	 * Fetches posts based on the search term, formats them based on the keys format map, and returns them.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	private function get_posts( \WP_REST_Request $request ) {
		$params = $request->get_params();
		$term = $params[ self::TERM_KEY ];

		if ( empty( $term ) ) {
			return new \WP_REST_Response( [
				'success' => true,
				'data' => [
					'value' => [],
				],
			], 200 );
		}

		$excluded_types = $params[ self::EXCLUDED_POST_TYPES_KEY ];
		$keys_format_map = $params[ self::KEYS_FORMAT_MAP_KEY ];
		$requested_count = $params[ self::MAX_COUNT_KEY ] ?? 0;
		$validated_count = max( $requested_count, 1 );
		$max_count = min( $validated_count, self::MAX_COUNT );
		$post_types = new Collection( $this->wp_adapter->get_post_types( [ 'public' => true ], 'object' ) );

		$post_types = $post_types->filter( function ( $post_type ) use ( $excluded_types ) {
			return ! in_array( $post_type->name, $excluded_types, true );
		} );

		$post_type_slugs = $post_types->map( function ( $post_type ) {
			return $post_type->name;
		} );

		$this->add_filter_to_customize_query();

		$posts = new Collection( $this->wp_adapter->get_posts( [
			'post_type' => $post_type_slugs->all(),
			'numberposts' => $max_count,
			'suppress_filters' => false,
			'custom_search' => true,
			'search_term' => $term,
		] ) );

		$this->remove_filter_to_customize_query();

		return new \WP_REST_Response( [
			'success' => true,
			'data' => [
				'value' => $posts
					->map( function ( $post ) use ( $keys_format_map, $post_types ) {
						$post_object = (array) $post;

						if ( isset( $post_object['post_type'] ) ) {
							$post_object['post_type'] = $post_types->get( ( $post_object['post_type'] ) )->label;
						}

						return $this->translate_keys( $post_object, $keys_format_map );
					} )
					->all(),
			],
		], 200 );
	}

	/**
	 * Hooks into the flow of wordpress's get_post querying.
	 *
	 * @return void
	 */
	private function add_filter_to_customize_query() {
		add_filter( 'posts_search', fn ( $search_term, $wp_query ) => $this->customize_search( $search_term, $wp_query ), 10, 2 );
	}

	/**
	 * Hooks out of the flow of wordpress's get_post querying.
	 *
	 * @return void
	 */
	private function remove_filter_to_customize_query() {
		remove_filter( 'posts_search', fn ( $search_term, $wp_query ) => $this->customize_search( $search_term, $wp_query ), 10, 2 );
	}

	/**
	 * Arguments for registering an endpoint.
	 *
	 * @return array
	 */
	private function get_args() {
		return [
			self::EXCLUDED_POST_TYPES_KEY => [
				'description' => 'Post type to exclude',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => [ 'e-floating-buttons', 'e-landing-page', 'elementor_library', 'attachment' ],
				'sanitize_callback' => fn ( ...$args ) => $this->sanitize_string_array( ...$args ),
			],
			self::TERM_KEY => [
				'description' => 'Posts to search',
				'type' => 'string',
				'required' => false,
				'default' => '',
				'sanitize_callback' => 'sanitize_text_field',
			],
			self::KEYS_FORMAT_MAP_KEY => [
				'description' => 'Specify keys to extract and convert, i.e. ["key_1" => "new_key_1"].',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => [],
				'sanitize_callback' => fn ( ...$args ) => $this->sanitize_string_array( ...$args ),
			],
			self::MAX_COUNT_KEY => [
				'description' => 'Max count of returned items',
				'type' => 'number',
				'required' => false,
				'default' => self::MAX_COUNT,
			],
		];
	}

	/**
	 * Sanitizes an array of strings.
	 * Ensures the input is an array, converts it if necessary,
	 * and applies `sanitize_text_field` to each element.
	 *
	 * @param Array<string>|string $input The input data, expected to be an array or JSON-encoded string.
	 * @return array The sanitized array of strings.
	 */
	private function sanitize_string_array( $input ) {
		if ( ! is_array( $input ) ) {
			$input = json_decode( sanitize_text_field( $input ) ) ?? [];
		}

		$array = new Collection( json_decode( json_encode( $input ), true ) );

		return $array
			->map( 'sanitize_text_field' )
			->all();
	}

	/**
	 * Replaces array keys based on a dictionary mapping.
	 *
	 * @param array $item The input array with original keys.
	 * @param array $dictionary An associative array mapping old keys to new keys.
	 * @return array The array with translated keys.
	 */
	private function translate_keys( array $item, array $dictionary ): array {
		if ( empty( $dictionary ) ) {
			return $item;
		}

		$replaced = [];

		foreach ( $item as $key => $value ) {
			if ( ! isset( $dictionary[ $key ] ) ) {
				continue;
			}

			$replaced[ $dictionary[ $key ] ] = $value;
		}

		return $replaced;
	}
}
