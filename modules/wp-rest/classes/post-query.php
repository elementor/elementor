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
	const POSTS_SEARCH_FILTER_PRIORITY = 10;
	const POSTS_SEARCH_FILTER_ACCEPTED_ARGS = 2;
	const INCLUDED_POST_TYPE_KEY = 'included_post_types';
	const META_QUERY_KEY = 'meta_query';
	const IS_PUBLIC_KEY = 'is_public';
	const POSTS_PER_PAGE_KEY = 'posts_per_page';
	const SEARCH_TERM_KEY = 'term';
	const POST_KEYS_CONVERSION_MAP = 'post_keys_conversion_map';
	const NONCE_KEY = 'x_wp_nonce';
	const DEFAULT_FORBIDDEN_POST_TYPES = [ 'e-floating-buttons', 'e-landing-page', 'elementor_library', 'attachment' ];

	public function register( bool $override_existing_endpoints = false ): void {
		register_rest_route( self::NAMESPACE, self::ENDPOINT, [
			[
				'methods' => \WP_REST_Server::READABLE,
				'permission_callback' => fn ( \WP_REST_Request $request ) => $this->validate_access_permission( $request ),
				'args' => $this->get_endpoint_registration_args(),
				'callback' => fn ( \WP_REST_Request $request ) => $this->route_wrapper( fn() => $this->get_posts( $request ) ),
			],
		], $override_existing_endpoints );
	}

	/**
	 * @param $args array{
	 *     excluded_post_types: array,
	 *     post_keys_conversion_map: array,
	 *     included_post_types: array,
	 * } The query parameters
	 * @return array The query parameters.
	 */
	public static function build_query_params( array $args ): array {
		$allowed_keys = [
			self::EXCLUDED_POST_TYPE_KEYS,
			self::INCLUDED_POST_TYPE_KEY,
			self::POST_KEYS_CONVERSION_MAP,
			self::META_QUERY_KEY,
			self::IS_PUBLIC_KEY,
			self::POSTS_PER_PAGE_KEY,
		];
		$keys_to_encode = [
			self::EXCLUDED_POST_TYPE_KEYS,
			self::INCLUDED_POST_TYPE_KEY,
			self::POST_KEYS_CONVERSION_MAP,
			self::META_QUERY_KEY,
		];

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
	 * @param string    $search_term The original search query.
	 * @param \WP_Query $wp_query The WP_Query instance.
	 * @return string Modified search query.
	 */
	public function customize_search( string $search_term, \WP_Query $wp_query ) {
		$term = $wp_query->get( 'search_term' ) ?? '';
		$is_custom_search = $wp_query->get( 'custom_search' ) ?? false;

		if ( $is_custom_search && ! empty( $term ) ) {
			$escaped = esc_sql( $term );
			$search_term .= ' AND (';
			$search_term .= "post_title LIKE '%{$escaped}%'";
			if ( ctype_digit( $term ) ) {
				$search_term .= ' OR ID = ' . intval( $term );
			} else {
				$search_term .= " OR ID LIKE '%{$escaped}%'";
			}
			$search_term .= ')';
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

		$excluded_types = array_unique( array_merge( self::DEFAULT_FORBIDDEN_POST_TYPES, $params[ self::EXCLUDED_POST_TYPE_KEYS ] ?? [] ) );
		$included_types = $params[ self::INCLUDED_POST_TYPE_KEY ] ?? [];
		$keys_format_map = $params[ self::POST_KEYS_CONVERSION_MAP ] ?? [];

		$requested_count = $params[ self::POSTS_PER_PAGE_KEY ] ?? 0;
		$validated_count = max( $requested_count, 1 );
		$post_count = min( $validated_count, self::MAX_RESPONSE_COUNT );

		$is_public_param = $params[ self::IS_PUBLIC_KEY ] ?? true;
		$is_public = ! in_array( strtolower( (string) $is_public_param ), [ '0', 'false' ], true );

		$post_types = new Collection( get_post_types( [ 'public' => $is_public ], 'objects' ) );
		$post_types = $post_types->filter( function ( $post_type ) use ( $excluded_types, $included_types ) {
			return ! in_array( $post_type->name, $excluded_types, true ) &&
				( empty( $included_types ) || in_array( $post_type->name, $included_types, true ) );
		} );

		$this->add_filter_to_customize_query();

		$query_args = [
			'post_type' => array_keys( $post_types->all() ),
			'numberposts' => $post_count,
			'suppress_filters' => false,
			'custom_search' => true,
			'search_term' => $term,
		];

		if ( ! empty( $params[ self::META_QUERY_KEY ] ) && is_array( $params[ self::META_QUERY_KEY ] ) ) {
			$query_args['meta_query'] = $params[ self::META_QUERY_KEY ];
		}

		$posts = new Collection( get_posts( $query_args ) );

		$this->remove_filter_to_customize_query();

		$post_type_labels = ( new Collection( $post_types->all() ) )
			->map( function ( $pt ) {
				return $pt->label;
			} )
			->all();

		return new \WP_REST_Response( [
			'success' => true,
			'data' => [
				'value' => $posts
					->map( function ( $post ) use ( $keys_format_map, $post_type_labels ) {
						$post_object = (array) $post;

						if ( isset( $post_object['post_type'] ) ) {
							$pt_name = $post_object['post_type'];
							if ( isset( $post_type_labels[ $pt_name ] ) ) {
								$post_object['post_type'] = $post_type_labels[ $pt_name ];
							}
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
		$priority = self::POSTS_SEARCH_FILTER_PRIORITY;
		$accepted_args = self::POSTS_SEARCH_FILTER_ACCEPTED_ARGS;

		add_filter( 'posts_search', [ $this, 'customize_search' ], $priority, $accepted_args );
	}

	/**
	 * @return void
	 */
	private function remove_filter_to_customize_query() {
		$priority = self::POSTS_SEARCH_FILTER_PRIORITY;
		$accepted_args = self::POSTS_SEARCH_FILTER_ACCEPTED_ARGS;

		remove_filter( 'posts_search', [ $this, 'customize_search' ], $priority, $accepted_args );
	}

	/**
	 * @return array
	 */
	private function get_endpoint_registration_args() {
		return [
			self::INCLUDED_POST_TYPE_KEY => [
				'description' => 'Included post types',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => null,
				'sanitize_callback' => fn ( ...$args ) => $this->sanitize_string_array( ...$args ),
			],
			self::EXCLUDED_POST_TYPE_KEYS => [
				'description' => 'Post type to exclude',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => self::DEFAULT_FORBIDDEN_POST_TYPES,
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
			self::POSTS_PER_PAGE_KEY => [
				'description' => 'Posts per page',
				'type' => 'integer',
				'required' => false,
				'default' => self::MAX_RESPONSE_COUNT,
			],
			self::IS_PUBLIC_KEY => [
				'description' => 'Whether to include only public post types',
				'type' => 'boolean',
				'required' => false,
				'default' => true,
			],
			self::META_QUERY_KEY => [
				'description' => 'WP_Query meta_query array',
				'type' => 'array',
				'required' => false,
				'default' => [],
				'sanitize_callback' => fn ( $value ) => is_array( $value ) ? $value : [],
			],
		];
	}

	/**
	 * @param array<string>|string $input The input data, expected to be an array or JSON-encoded string.
	 * @return array The sanitized array of strings.
	 */
	private function sanitize_string_array( $input ) {
		if ( ! is_array( $input ) ) {
			$raw = sanitize_text_field( $input );
			$decoded = json_decode( $raw, true );
			if ( is_array( $decoded ) ) {
				$input = $decoded;
			} else {
				$input = false !== strpos( $raw, ',' ) ? explode( ',', $raw ) : ( '' !== $raw ? [ $raw ] : [] );
			}
		}

		$array = new Collection( json_decode( json_encode( $input ), true ) );

		return $array
			->map( 'sanitize_text_field' )
			->filter( function ( $value ) {
				return '' !== $value;
			} )
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
