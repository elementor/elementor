<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Utils\Collection;

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

	private ?Wordpress_Adapter_Interface $wp_adapter = null;

	public function __construct( ?Wordpress_Adapter_Interface $wp_adapter = null ) {
		$this->wp_adapter = $wp_adapter ?? new Wordpress_Adapter();
	}

	public function register( bool $override_existing_endpoints = false ): void {
		register_rest_route( self::NAMESPACE, self::ENDPOINT, [
			[
				'methods' => \WP_REST_Server::READABLE,
				'permission_callback' => function (): bool {
					return current_user_can( 'edit_posts' );
				},
				'args' => $this->get_args(),
				'sanitize_callback' => function ( string $param ): string {
					return esc_attr( $param );
				},
				'callback' => fn ( $request ): \WP_REST_Response => $this->fetch( $request ),
			],
		], $override_existing_endpoints );
	}

	/**
	 * Alters the SQL search query to filter by post title or ID.
	 *
	 * @param string   $search_term The original search query.
	 * @param \WP_Query $wp_query   The WP_Query instance.
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
	 * Tries to fetch posts, wraps the result in a response object, and returns it.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	private function fetch( \WP_REST_Request $request ): \WP_REST_Response {
		try {
			return new \WP_REST_Response( [
				'success' => true,
				'data' => [
					'value' => $this->get_posts( $request ),
				],
			], 200 );
		} catch ( \Exception $e ) {
			return new \WP_REST_Response( [
				'success' => false,
				'data' => [
					'message' => $e->getMessage(),
				],
			], 500 );
		}
	}

	/**
	 * Fetches posts based on the search term, formats them based on the keys format map, and returns them.
	 *
	 * @param \WP_REST_Request $request
	 * @return array
	 */
	private function get_posts( \WP_REST_Request $request ) {
		$params = $request->get_params();
		$term = $params[ self::TERM_KEY ];

		if ( empty( $term ) ) {
			return [];
		}

		$excluded_types = $params[ self::EXCLUDED_POST_TYPES_KEY ];
		$keys_format_map = $params[ self::KEYS_FORMAT_MAP_KEY ];
		$max_count = isset( $params[ self::MAX_COUNT_KEY ] ) && 0 < $params[ self::MAX_COUNT_KEY ] ? $params[ self::MAX_COUNT_KEY ] : self::MAX_COUNT;
		$max_count = min( $max_count, self::MAX_COUNT );
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

		return $posts
			->map( function ( $post ) use ( $keys_format_map, $post_types ) {
				$post_object = (array) $post;

				if ( isset( $post_object['post_type'] ) ) {
					$post_object['post_type'] = $post_types->get( ( $post_object['post_type'] ) )->label;
				}

				return $this->translate_keys( $post_object, $keys_format_map );
			} )
			->all();
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
				'validate_callback' => 'rest_validate_request_arg',
			],
			self::TERM_KEY => [
				'description' => 'Posts to search',
				'type' => 'string',
				'required' => false,
				'default' => '',
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => 'rest_validate_request_arg',
			],
			self::KEYS_FORMAT_MAP_KEY => [
				'description' => 'Specify keys to extract and convert, i.e. ["key_1" => "new_key_1"].',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => [],
				'sanitize_callback' => fn ( ...$args ) => $this->sanitize_string_array( ...$args ),
				'validate_callback' => 'rest_validate_request_arg',
			],
			self::MAX_COUNT_KEY => [
				'description' => 'Max count of returned items',
				'type' => 'number',
				'required' => false,
				'default' => self::MAX_COUNT,
				'validate_callback' => 'rest_validate_request_arg',
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
	 * @param array $item       The input array with original keys.
	 * @param array $dictionary An associative array mapping old keys to new keys.
	 * @return array The array with translated keys.
	 */
	private function translate_keys( array $item, array $dictionary ): array {
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
