<?php

namespace Elementor\Modules\Mcp\Abilities\Post;

use Elementor\Modules\Mcp\Abilities\Services\Post_Context;
use Elementor\Modules\Mcp\Abilities\Services\Post_Permissions;
use Elementor\Modules\Mcp\Abilities\Services\Post_Response;
use Elementor\Modules\Mcp\Abilities\Services\Post_Template_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Update_Post_Operation extends Post_Operation {

	public function handle( array $input ) {
		$post_id = Post_Context::resolve_post_id( $input );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$auth_error = $this->authorize( $input, $post_id );
		if ( $auth_error ) {
			return $auth_error;
		}

		$update_error = $this->apply_post_fields( $input, $post_id );
		if ( $update_error ) {
			return $update_error;
		}

		$template = Post_Template_Resolver::resolve( $input, false );
		if ( null !== $template ) {
			update_post_meta( $post_id, '_wp_page_template', sanitize_text_field( $template ) );
		}

		return Post_Response::envelope( 'update', $post_id, [
			'post_status' => (string) get_post_status( $post_id ),
		] );
	}

	private function authorize( array $input, int $post_id ): ?\WP_Error {
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'rest_cannot_edit',
				__( 'Sorry, you are not allowed to edit this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		if ( ! isset( $input['post_status'] ) || ! is_string( $input['post_status'] ) || '' === $input['post_status'] ) {
			return null;
		}

		return Post_Permissions::check_publish_transition( $post_id, sanitize_key( $input['post_status'] ) );
	}

	private function apply_post_fields( array $input, int $post_id ): ?\WP_Error {
		$update_args = [ 'ID' => $post_id ];

		if ( isset( $input['title'] ) && is_string( $input['title'] ) ) {
			$update_args['post_title'] = $input['title'];
		}

		if ( isset( $input['slug'] ) && is_string( $input['slug'] ) ) {
			$update_args['post_name'] = sanitize_title( $input['slug'] );
		}

		if ( isset( $input['post_status'] ) && is_string( $input['post_status'] ) && '' !== $input['post_status'] ) {
			$update_args['post_status'] = sanitize_key( $input['post_status'] );
		}

		if ( count( $update_args ) <= 1 ) {
			return null;
		}

		$result = wp_update_post( $update_args, true );

		if ( is_wp_error( $result ) ) {
			return new \WP_Error(
				'wp_update_post_failed',
				$result->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return null;
	}
}
