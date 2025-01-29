<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Core\Utils\Collection;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class WP_Post {
	const MAX_COUNT = 100;
	const FORMAT = 'post';

	public function register(): void {
		register_rest_route( 'elementor/v1', self::FORMAT, [
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
		] );
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

	public function restrict_search_to_title( $search, $wp_query ) {
		$search_term = $wp_query->get( 'search_term' ) ?? '';
		$is_search_titles_only = $wp_query->get( 'search_titles_only' ) ?? false;

		if ( $is_search_titles_only && ! empty( $search_term ) ) {
			$search .= " AND (";
			$search .= "post_title LIKE '%" . esc_sql( $search_term ) . "%' ";
			$search .= "OR guid LIKE '%" . esc_sql( $search_term ) . "%')";
		}

		return $search;
	}

	private function get_posts( \WP_REST_Request $request ) {
		$params = $request->get_params();
		$term = $params['term'];
		$excluded_types = $params['excluded_post_types'];
		$keys_to_extract = $params['keys_to_extract'];
		$keys_dictionary = $params['keys_dictionary'];
		$max_count = isset( $params['max_count'] ) && 0 < $params['max_count'] ? $params['max_count'] : self::MAX_COUNT;
		$post_types = new Collection( get_post_types( [ 'public' => true ], 'object' ) );

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

		add_filter( 'posts_search', [ $this, 'restrict_search_to_title' ], 10, 2 );

		$posts = new Collection( get_posts( [
			'post_type' => $post_type_slugs->all(),
			'numberposts' => min( $max_count, self::MAX_COUNT ),
			'suppress_filters' => false,
			'search_titles_only' => true,
			'search_term' => $term,
		] ) );

		remove_filter( 'posts_search', [ $this, 'restrict_search_to_title' ], 10, 2 );

		return $posts
			->map( function ( $post ) use ( $keys_to_extract ) {
				return $this->get_filtered_props_from_post( $post, $keys_to_extract );
			} )
			->map( function ( $post ) use ( $keys_dictionary, $post_types ) {
				if ( isset( $post['post_type'] ) ) {
					$post['post_type'] = $post_types->get( ( $post['post_type'] ) )->label;
				}

				return Utils::replace_keys_in_object( $post, $keys_dictionary );
			} )
			->all();
	}

	private function get_filtered_props_from_post( \WP_Post $post, $keys_to_extract = [] ) {
		if ( empty( $keys_to_extract ) ) {
			return $post;
		}

		$post_object = (array) $post;
		$filtered_post = [];

		foreach ( $keys_to_extract as $key ) {
			if ( array_key_exists( $key, $post_object ) ) {
				$filtered_post[ $key ] = $post_object[ $key ];
			}
		}

		return $filtered_post;
	}

	private function get_args() {
		return [
			'excluded_post_types' => [
				'description' => 'Post type to exclude',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => [ 'e-floating-buttons', 'e-landing-page', 'elementor_library', 'attachment' ],
				'sanitize_callback' => fn ( ...$args ) => $this->sanitize_string_array( ...$args ),
				'validate_callback' => 'rest_validate_request_arg',
			],
			'term' => [
				'description' => 'Posts to search',
				'type' => 'string',
				'required' => false,
				'default' => '',
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => 'rest_validate_request_arg',
			],
			'keys_to_extract' => [
				'description' => 'Specify keys which values are to be included in the response. Leave empty for all keys',
				'type' => [ 'array', 'string' ],
				'required' => true,
				'default' => [],
				'sanitize_callback' => fn ( ...$args ) => $this->sanitize_string_array( ...$args ),
				'validate_callback' => 'rest_validate_request_arg',
			],
			'keys_dictionary' => [
				'description' => 'Specify conversion dictionary for keys, i.e. ["key_1" => "new_key_1"].',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => [],
				'sanitize_callback' => fn ( ...$args ) => $this->sanitize_string_array( ...$args ),
				'validate_callback' => 'rest_validate_request_arg',
			],
			'values_dictionary' => [
				'description' => 'Specify conversion dictionary for values, i.e. ["value_1" => "new_value_1"].',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => [],
				'sanitize_callback' => fn ( ...$args ) => $this->sanitize_string_array( ...$args ),
				'validate_callback' => 'rest_validate_request_arg',
			],
			'max_count' => [
				'description' => 'Max count of returned items',
				'type' => 'number',
				'required' => false,
				'default' => self::MAX_COUNT,
				'validate_callback' => 'rest_validate_request_arg',
			],
		];
	}
}
