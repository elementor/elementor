<?php
namespace Elementor\TemplateLibrary\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor template library import images.
 *
 * Elementor template library import images handler class is responsible for
 * importing remote images used by the template library.
 *
 * @since 1.0.0
 */
class Import_Images {

	/**
	 * Replaced images IDs.
	 *
	 * The IDs of all the new imported images. An array containing the old
	 * attachment ID and the new attachment ID generated after the import.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var array
	 */
	private $_replace_image_ids = [];

	/**
	 * Get image hash.
	 *
	 * Retrieve the sha1 hash of the image URL.
	 *
	 * @since 2.0.0
	 * @access private
	 *
	 * @param string $attachment_url The attachment URL.
	 *
	 * @return string Image hash.
	 */
	private function get_hash_image( $attachment_url ) {
		return sha1( $attachment_url );
	}

	/**
	 * Get saved image.
	 *
	 * Retrieve new image ID, if the image has a new ID after the import.
	 *
	 * @since 2.0.0
	 * @access private
	 *
	 * @param array $attachment The attachment.
	 *
	 * @return false|array New image ID  or false.
	 */
	private function get_saved_image( $attachment ) {
		global $wpdb;

		if ( isset( $this->_replace_image_ids[ $attachment['id'] ] ) ) {
			return $this->_replace_image_ids[ $attachment['id'] ];
		}

		$post_id = $wpdb->get_var(
			$wpdb->prepare(
				'SELECT `post_id` FROM `' . $wpdb->postmeta . '`
					WHERE `meta_key` = \'_elementor_source_image_hash\'
						AND `meta_value` = %s
				;',
				$this->get_hash_image( $attachment['url'] )
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

	/**
	 * Import image.
	 *
	 * Import a single image from a remote server, upload the image WordPress
	 * uploads folder, create a new attachment in the database and updates the
	 * attachment metadata.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $attachment The attachment.
	 *
	 * @return false|array Imported image data, or false.
	 */
	public function import( $attachment ) {
		$saved_image = $this->get_saved_image( $attachment );

		if ( $saved_image ) {
			return $saved_image;
		}

		// Extract the file name and extension from the url.
		$filename = basename( $attachment['url'] );

		$file_content = wp_remote_retrieve_body( wp_safe_remote_get( $attachment['url'] ) );

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
			// return new \WP_Error( 'attachment_processing_error', __( 'Invalid file type.', 'elementor' ) );
		}

		$post_id = wp_insert_attachment( $post, $upload['file'] );
		wp_update_attachment_metadata(
			$post_id,
			wp_generate_attachment_metadata( $post_id, $upload['file'] )
		);
		update_post_meta( $post_id, '_elementor_source_image_hash', $this->get_hash_image( $attachment['url'] ) );

		$new_attachment = [
			'id' => $post_id,
			'url' => $upload['url'],
		];
		$this->_replace_image_ids[ $attachment['id'] ] = $new_attachment;
		return $new_attachment;
	}

	/**
	 * Template library import images constructor.
	 *
	 * Initializing the images import class used by the template library through
	 * the WordPress Filesystem API.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		WP_Filesystem();
	}
}
