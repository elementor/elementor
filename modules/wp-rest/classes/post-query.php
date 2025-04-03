<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\GlobalClasses\Utils\Error_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Post_Query {
	const MAX_RESPONSE_COUNT = 100;
	const NAMESPACE = 'elementor/v1';
	const ENDPOINT = 'post';

	const EXCLUDED_POST_TYPE_KEYS = 'excluded_post_types';
	const SEARCH_TERM_KEY = 'term';
	const POST_KEYS_CONVERSION_MAP = 'post_keys_conversion_map';
	const MAX_COUNT_KEY = 'max_count';
	const NONCE_KEY = 'x_wp_nonce';

	const FORBIDDEN_POST_TYPES = [ 'e-floating-buttons', 'e-landing-page', 'elementor_library', 'attachment' ];

	public function register( bool $override_existing_endpoints = false ): void {
		register_rest_route( self::NAMESPACE, self::ENDPOINT, [
			[
				'methods' => \WP_REST_Server::READABLE,
				'permission_callback' => fn ( \WP_REST_Request $request ) => $this->validate_access_permission( $request ),
				'args' => $this->get_endpoint_registration_args(),
				'sanitize_callback' => 'esc_attr',
				'callback' => fn ( \WP_REST_Request $request ) => $this->route_wrapper( fn() => $this->get_posts( $request ) ),
			],
		], $override_existing_endpoints );
	}

	/**
	 * @param $args array{
	 *     excluded_post_types: array,
	 *     post_keys_conversion_map: array,
	 *     max_count: int,
	 * } The query parameters
	 * @return array The query parameters.
	 */
	public static function build_query_params( array $args ): array {
		$allowed_keys = [ self::EXCLUDED_POST_TYPE_KEYS, self::POST_KEYS_CONVERSION_MAP, self::MAX_COUNT_KEY ];
		$keys_to_encode = [ self::EXCLUDED_POST_TYPE_KEYS, self::POST_KEYS_CONVERSION_MAP ];

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
	 * @param string $search_term The original search query.
	 * @param \WP_Query $wp_query The WP_Query instance.
	 * @return string Modified search query.
	 */
	public function customize_search( string $search_term, \WP_Query $wp_query ) {
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
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	private function get_posts( \WP_REST_Request $request ) {
		$params = $request->get_params();
		$term = trim( $params[ self::SEARCH_TERM_KEY ] ?? '' );

		if ( empty( $term ) ) {
			return new \WP_REST_Response( [
				'success' => true,
				'data' => [
					'value' => [],
				],
			], 200 );
		}

		$excluded_types = array_merge( self::FORBIDDEN_POST_TYPES, $params[ self::EXCLUDED_POST_TYPE_KEYS ] ?? [] );
		$keys_format_map = $params[ self::POST_KEYS_CONVERSION_MAP ];
		$requested_count = $params[ self::MAX_COUNT_KEY ] ?? 0;
		$validated_count = max( $requested_count, 1 );
		$max_count = min( $validated_count, self::MAX_RESPONSE_COUNT );
		$post_types = new Collection( get_post_types( [ 'public' => true ], 'object' ) );

		$post_types = $post_types->filter( function ( $post_type ) use ( $excluded_types ) {
			return ! in_array( $post_type->name, $excluded_types, true );
		} );

		$post_type_slugs = $post_types->map( function ( $post_type ) {
			return $post_type->name;
		} );

		$this->add_filter_to_customize_query();

		$posts = new Collection( get_posts( [
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
	 * @return void
	 */
	private function add_filter_to_customize_query() {
		$priority = 10;
		$accepted_args = 2;

		add_filter( 'posts_search', [ $this, 'customize_search' ], $priority, $accepted_args );
	}

	/**
	 * @return void
	 */
	private function remove_filter_to_customize_query() {
		$priority = 10;
		$accepted_args = 2;

		remove_filter( 'posts_search', [ $this, 'customize_search' ], $priority, $accepted_args );
	}

	/**
	 * @return array
	 */
	private function get_endpoint_registration_args() {
		return [
			self::EXCLUDED_POST_TYPE_KEYS => [
				'description' => 'Post type to exclude',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => self::FORBIDDEN_POST_TYPES,
				'sanitize_callback' => fn ( ...$args ) => $this->sanitize_string_array( ...$args ),
			],
			self::SEARCH_TERM_KEY => [
				'description' => 'Posts to search',
				'type' => 'string',
				'required' => false,
				'default' => '',
				'sanitize_callback' => 'sanitize_text_field',
			],
			self::POST_KEYS_CONVERSION_MAP => [
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
				'default' => self::MAX_RESPONSE_COUNT,
			],
		];
	}

	/**
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
