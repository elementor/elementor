<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Permissions {

	public static function validate_post_type( string $post_type ): ?\WP_Error {
		if ( ! post_type_exists( $post_type ) || ! post_type_supports( $post_type, 'elementor' ) ) {
			return new \WP_Error(
				'invalid_post_type',
				__( 'This post type does not support Elementor.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	public static function check_create( string $post_type, string $post_status ): ?\WP_Error {
		$post_type_object = get_post_type_object( $post_type );

		if ( ! $post_type_object ) {
			return new \WP_Error(
				'invalid_post_type',
				__( 'Unknown post type.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! current_user_can( $post_type_object->cap->create_posts ) ) {
			return new \WP_Error(
				'rest_cannot_create',
				__( 'Sorry, you are not allowed to create posts of this type.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		if ( 'publish' === $post_status && ! current_user_can( $post_type_object->cap->publish_posts ) ) {
			return new \WP_Error(
				'rest_cannot_publish',
				__( 'Sorry, you are not allowed to publish posts of this type.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return null;
	}

	public static function check_publish_transition( int $post_id, string $next_status ): ?\WP_Error {
		if ( 'publish' !== $next_status ) {
			return null;
		}

		if ( current_user_can( 'publish_post', $post_id ) ) {
			return null;
		}

		return new \WP_Error(
			'rest_cannot_publish',
			__( 'Sorry, you are not allowed to publish this post.', 'elementor' ),
			[ 'status' => \WP_Http::FORBIDDEN ]
		);
	}
}
