<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Plugin;
use Elementor\Core\Base\Document;

class Elementor_Document_Manager {

	public function ensure_post_exists( ?int $post_id, string $post_type ): int {
		if ( $post_id ) {
			$post = get_post( $post_id );
			if ( ! $post ) {
				throw new \Exception( "Post with ID {$post_id} not found" );
			}
			return $post_id;
		}

		$post_data = [
			'post_title' => 'Elementor Widget Conversion - ' . date( 'Y-m-d H:i:s' ),
			'post_type' => $post_type,
			'post_status' => 'draft',
			'post_content' => '',
			'meta_input' => [
				'_elementor_edit_mode' => 'builder',
				'_elementor_template_type' => 'wp-post',
				'_elementor_version' => ELEMENTOR_VERSION,
			],
		];

		$new_post_id = wp_insert_post( $post_data );
		if ( is_wp_error( $new_post_id ) ) {
			throw new \Exception( 'Failed to create post: ' . $new_post_id->get_error_message() );
		}

		return $new_post_id;
	}

	public function get_elementor_document( int $post_id ): Document {
		if ( ! class_exists( 'Elementor\Plugin' ) ) {
			throw new \Exception( 'Elementor Plugin not available' );
		}

		$document = Plugin::$instance->documents->get( $post_id );
		if ( ! $document ) {
			throw new \Exception( "Failed to get Elementor document for post {$post_id}" );
		}

		return $document;
	}

	public function save_to_document( Document $document, array $elementor_elements ): void {
		if ( ! $document instanceof Document ) {
			throw new \Exception( 'Invalid Elementor document' );
		}

		try {
			$post_id = $document->get_main_id();

			$json_value = wp_slash( wp_json_encode( $elementor_elements ) );

			update_metadata( 'post', $post_id, '_elementor_data', $json_value );
			update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
			update_post_meta( $post_id, '_elementor_template_type', 'wp-page' );
			update_post_meta( $post_id, '_elementor_version', '3.34.0' );
		} catch ( \Exception $e ) {
			throw new \Exception( 'Failed to save elements to document: ' . $e->getMessage() );
		}
	}

	public function get_edit_url( int $post_id ): string {
		if ( function_exists( 'elementor_get_edit_url' ) ) {
			return elementor_get_edit_url( $post_id );
		}
		return admin_url( 'post.php?post=' . $post_id . '&action=elementor' );
	}
}
