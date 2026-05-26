<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Response {

	public static function envelope( string $operation, int $post_id, array $extras = [] ): array {
		$envelope = [
			'success' => true,
			'operation' => $operation,
			'post_id' => $post_id,
		];

		if ( $post_id > 0 ) {
			$envelope['post_type'] = (string) get_post_type( $post_id );
			$envelope['edit_url'] = self::edit_url_for( $post_id );
			$envelope['permalink'] = (string) get_permalink( $post_id );
		}

		return array_merge( $envelope, $extras );
	}

	public static function with_css_gaps( array $response, array $gaps ): array {
		if ( ! empty( $gaps ) ) {
			$response['css_gaps'] = $gaps;
		}

		return $response;
	}

	private static function edit_url_for( int $post_id ): string {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( $document ) {
			return $document->get_edit_url();
		}

		return (string) admin_url( 'post.php?post=' . $post_id . '&action=edit' );
	}
}
