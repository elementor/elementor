<?php

namespace Elementor\Modules\Mcp\Abilities\Post;

use Elementor\Modules\Mcp\Abilities\Services\Post_Context;
use Elementor\Modules\Mcp\Abilities\Services\Post_Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lifecycle_Operation extends Post_Operation {

	private const VALID_VERBS = [ 'trash', 'restore', 'delete' ];

	private string $verb;

	public function __construct( string $verb ) {
		if ( ! in_array( $verb, self::VALID_VERBS, true ) ) {
			throw new \InvalidArgumentException( 'Invalid lifecycle verb: ' . esc_html( $verb ) );
		}

		$this->verb = $verb;
	}

	public function handle( array $input ) {
		$post_id = Post_Context::resolve_post_id( $input );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$permission_error = $this->check_permission( $post_id );
		if ( $permission_error ) {
			return $permission_error;
		}

		$result = $this->dispatch( $post_id );

		if ( ! $result ) {
			return new \WP_Error(
				$this->verb . '_failed',
				sprintf(
					/* translators: %s: lifecycle verb (trash, restore, delete). */
					__( 'Could not %s post.', 'elementor' ),
					$this->verb
				),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		if ( 'delete' === $this->verb ) {
			return [
				'success' => true,
				'operation' => 'delete',
				'post_id' => $post_id,
				'deleted' => true,
			];
		}

		return Post_Response::envelope( $this->verb, $post_id, [
			'post_status' => (string) get_post_status( $post_id ),
		] );
	}

	private function check_permission( int $post_id ): ?\WP_Error {
		if ( 'restore' === $this->verb ) {
			if ( current_user_can( 'edit_post', $post_id ) ) {
				return null;
			}

			return new \WP_Error(
				'rest_cannot_edit',
				__( 'Sorry, you are not allowed to restore this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		if ( current_user_can( 'delete_post', $post_id ) ) {
			return null;
		}

		$message = 'trash' === $this->verb
			? __( 'Sorry, you are not allowed to trash this post.', 'elementor' )
			: __( 'Sorry, you are not allowed to delete this post.', 'elementor' );

		return new \WP_Error(
			'rest_cannot_delete',
			$message,
			[ 'status' => \WP_Http::FORBIDDEN ]
		);
	}

	private function dispatch( int $post_id ) {
		switch ( $this->verb ) {
			case 'trash':
				return wp_trash_post( $post_id );
			case 'restore':
				return wp_untrash_post( $post_id );
			case 'delete':
				return wp_delete_post( $post_id, true );
		}

		return false;
	}
}
