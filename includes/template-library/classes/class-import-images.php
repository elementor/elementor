<?php
namespace Elementor\TemplateLibrary\Classes;

class Import_Images {

	private $_replace_image_ids = [];

	private function _get_hash_image( $attachment_url ) {
		return sha1( $attachment_url );
	}

	private function _return_saved_image( $attachment ) {
		global $wpdb;

		if ( isset( $this->_replace_image_ids[ $attachment['id'] ] ) )
			return $this->_replace_image_ids[ $attachment['id'] ];

		$post_id = $wpdb->get_var(
			$wpdb->prepare(
				'SELECT `post_id` FROM %1$s
					WHERE `meta_key` = \'_elementor_source_image_hash\'
						AND `meta_value` = \'%2$s\'
				;',
				$wpdb->postmeta,
				$this->_get_hash_image( $attachment['url'] )
			)
		);

		if ( $post_id ) {
			$new_attachment = [
				'id' => $post_id,
				'url' => wp_get_attachment_url( $post_id ),
			];
			$this->_replace_image_ids[ $attachment['id'] ] = $new_attachment;

			return $new_attachment;
		}

		return false;
	}

	public function import( $attachment ) {
		$saved_image = $this->_return_saved_image( $attachment );
		if ( $saved_image )
			return $saved_image;

		// Extract the file name and extension from the url
		$filename = basename( $attachment['url'] );

		if ( function_exists( 'file_get_contents' ) ) {
			$options = [
				'http' => [
						'user_agent' => 'Mozilla/5.0 (X11; Ubuntu; Linux i686 on x86_64; rv:49.0) Gecko/20100101 Firefox/49.0',
				],
			];

			$context = stream_context_create( $options );

			$file_content = file_get_contents( $attachment['url'], false, $context );
		} else {
			$file_content = wp_remote_retrieve_body( wp_safe_remote_get( $attachment['url'] ) );
		}

		if ( empty( $file_content ) ) {
			return false;
		}

		$upload = wp_upload_bits(
			$filename,
			null,
			$file_content
		);

		$post = [
			'post_title' => $filename,
			'guid' => $upload['url'],
		];

		$info = wp_check_filetype( $upload['file'] );
		if ( $info ) {
			$post['post_mime_type'] = $info['type'];
		} else {
			// For now just return the origin attachment
			return $attachment;
			//return new \WP_Error( 'attachment_processing_error', __( 'Invalid file type', 'elementor' ) );
		}

		$post_id = wp_insert_attachment( $post, $upload['file'] );
		wp_update_attachment_metadata(
			$post_id,
			wp_generate_attachment_metadata( $post_id, $upload['file'] )
		);
		update_post_meta( $post_id, '_elementor_source_image_hash', $this->_get_hash_image( $attachment['url'] ) );

		$new_attachment = [
			'id' => $post_id,
			'url' => $upload['url'],
		];
		$this->_replace_image_ids[ $attachment['id'] ] = $new_attachment;
		return $new_attachment;
	}

	public function __construct() {
		if ( ! function_exists( 'WP_Filesystem' ) )
			require_once ABSPATH . 'wp-admin/includes/file.php';

		WP_Filesystem();
	}
}
