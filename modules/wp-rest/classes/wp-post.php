<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Utils\Collection;
use Elementor\Utils;

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

	public function register(): void {
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
				'callback' => function ( $request ): \WP_REST_Response {
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
				},
			],
		], true );
	}

	public function sanitize_string_array( $arr ) {
		if ( ! is_array( $arr ) ) {
			$arr = json_decode( sanitize_text_field( $arr ) ) ?? [];
		}

		$arr = new Collection( json_decode( json_encode( $arr ), true ) );

		return $arr
			->map( 'sanitize_text_field' )
			->all();
	}

	public function advanced_search( $search, $wp_query ) {
		$search_term = $wp_query->get( 'search_term' ) ?? '';
		$is_advanced_search = $wp_query->get( 'advanced_search' ) ?? false;

		if ( $is_advanced_search && ! empty( $search_term ) ) {
			$search .= ' AND (';
			$search .= "post_title LIKE '%" . esc_sql( $search_term ) . "%' ";
			$search .= "OR ID LIKE '%" . esc_sql( $search_term ) . "%')";
		}

		return $search;
	}

	private function get_posts( \WP_REST_Request $request ) {
		$params = $request->get_params();
		$term = $params[ self::TERM_KEY ];
		$excluded_types = $params[ self::EXCLUDED_POST_TYPES_KEY ];
		$keys_format_map = $params[ self::KEYS_FORMAT_MAP_KEY ];
		$max_count = isset( $params[ self::MAX_COUNT_KEY ] ) && 0 < $params[ self::MAX_COUNT_KEY ] ? $params[ self::MAX_COUNT_KEY ] : self::MAX_COUNT;
		$post_types = new Collection( $this->wp_adapter->get_post_types( [ 'public' => true ], 'object' ) );

		if ( empty( $term ) ) {
			return [];
		}

		if ( ! empty( $excluded_types ) ) {
			$post_types = $post_types->filter( function ( $post_type ) use ( $excluded_types ) {
				return ! in_array( $post_type->name, $excluded_types, true );
			} );
		}

		$post_type_slugs = $post_types->map( function ( $post_type ) {
			return $post_type->name;
		} );

		add_filter( 'posts_search', [ $this, 'advanced_search' ], 10, 2 );

		$posts = new Collection( $this->wp_adapter->get_posts( [
			'post_type' => $post_type_slugs->all(),
			'numberposts' => min( $max_count, self::MAX_COUNT ),
			'suppress_filters' => false,
			'advanced_search' => true,
			'search_term' => $term,
		] ) );

		remove_filter( 'posts_search', [ $this, 'advanced_search' ], 10, 2 );

		return $posts
			->map( function ( $post ) use ( $keys_format_map, $post_types ) {
				$post_object = (array) $post;

				if ( isset( $post_object['post_type'] ) ) {
					$post_object['post_type'] = $post_types->get( ( $post_object['post_type'] ) )->label;
				}

				return Utils::replace_keys_in_object( $post_object, $keys_format_map );
			} )
			->all();
	}

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
}
