<?php

namespace Elementor\Core\Common\Data\WP_Query\Endpoints;

use Elementor\Core\Utils\Collection;
use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Post extends Endpoint_Base {

	public function get_name(): string {
		return 'post';
	}

	public function get_format(): string {
		return 'wp-query/post';
	}

	protected function get_items( $request ) {
		$params = $request->get_params();
		$term = $params['term'] ?? '';
		$excluded_post_types = $params['excluded_post_types'];
		$keys_to_extract = $params['keys_to_extract'];

		return $this->get_posts( $term, $excluded_post_types, $keys_to_extract );
	}

	protected function register() {
		$args = [
			'excluded_post_types' => [
				'description' => 'Post type to exclude',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => [ 'e-floating-buttons', 'e-landing-page', 'elementor_library', 'attachment' ],
				'sanitize_callback' => [ $this, 'sanitize_string_array' ],
				'validate_callback' => 'rest_validate_request_arg',
			],
			'term' => [
				'description' => 'Posts to search',
				'type' => 'string',
				'required' => true,
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => 'rest_validate_request_arg',
			],
			'keys_to_extract' => [
				'description' => 'Specify keys which values are to be included in the response. Leave empty for all keys',
				'type' => [ 'array', 'string' ],
				'required' => true,
				'default' => [],
				'sanitize_callback' => [ $this, 'sanitize_string_array' ],
				'validate_callback' => 'rest_validate_request_arg',
			],
		];

		$this->register_items_route( \WP_REST_Server::READABLE, $args );
	}

	public function sanitize_string_array( $arr ) {
		if ( ! is_array( $arr ) ) {
			$arr = json_decode( sanitize_text_field( $arr ) ) ?? [];
		}

		$arr = new Collection( $arr );

		return $arr
			->map( 'sanitize_text_field' )
			->all();
	}

	private function get_posts( $term, $excluded_types = [], $keys_to_extract = [] ) {
		$post_types = new Collection( get_post_types( [ 'public' => true ], 'object' ) );

		if ( ! empty( $excluded_types ) ) {
			$post_types = $post_types->filter( function( $post_type ) use ( $excluded_types ) {
				return ! in_array( $post_type->name, $excluded_types, true );
			} );
		}

		$post_type_slugs = $post_types->map( function( $post_type ) {
			return $post_type->name;
		} );

		$posts = new Collection( get_posts( [
			'post_type' => $post_type_slugs->all(),
			'numberposts' => -1,
			's' => $term,
		] ) );

		return $posts
			->map( function ( $post ) use ( $keys_to_extract ) {
				return $this->get_filtered_props_from_post( $post, $keys_to_extract );
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
}
