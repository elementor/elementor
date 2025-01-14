<?php

namespace Elementor\Core\Common\Data\Global_Query\Endpoints;

use Elementor\Core\Utils\Collection;
use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Post extends Endpoint_Base {

	public function get_name(): string {
		return 'post';
	}

	public function get_format(): string {
		return 'global-query/post';
	}

	protected function get_items( $request ) {
		$params = $request->get_params();
		$term = $params['term'] ?? '';
		$excluded_post_types = $params['excluded_post_types'] ?? [];

		return $this->get_posts( $term, $excluded_post_types );
	}

	protected function register() {
		$args = [
			'excluded_post_types' => [
				'description' => 'Post type to exclude',
				'type' => 'array',
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
		];

		$this->register_items_route( \WP_REST_Server::READABLE, $args );
	}

	public function sanitize_string_array( array $arr ) {
		$arr = new Collection( $arr );

		return $arr
			->map( 'sanitize_text_field' )
			->all();
	}

	private function get_posts( $term, $excluded_types = [] ) {
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

		return $posts->all();
	}
}
