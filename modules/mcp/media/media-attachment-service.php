<?php

namespace Elementor\Modules\Mcp\Media;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Attachment_Service {

	/**
	 * URLs with a query string are neither stored nor matched: they may carry signed
	 * access values and the query can decide which file is served.
	 */
	public static function source_url_for_storage( string $source_url ): ?string {
		$parts = wp_parse_url( $source_url );

		if ( ! is_array( $parts ) || isset( $parts['query'] ) ) {
			return null;
		}

		$without_fragment = explode( '#', $source_url, 2 )[0];

		return '' === $without_fragment ? null : $without_fragment;
	}

	public static function find_by_source_url( string $source_url, ?int $author_id = null ): ?int {
		$source_url = self::source_url_for_storage( $source_url );

		if ( null === $source_url ) {
			return null;
		}

		$author_id = null === $author_id ? get_current_user_id() : (int) $author_id;

		$query = [
			'post_type' => 'attachment',
			'post_status' => 'inherit',
			'posts_per_page' => 1,
			'fields' => 'ids',
			'meta_key' => Media_Upload_Config::SOURCE_URL_META_KEY,
			'meta_value' => $source_url,
			'no_found_rows' => true,
		];

		if ( $author_id > 0 ) {
			$query['author'] = $author_id;
		}

		$ids = get_posts( $query );

		if ( empty( $ids ) ) {
			return null;
		}

		return (int) $ids[0];
	}

	/**
	 * @param array{tmp_name:string,name:string} $file
	 */
	public static function create_from_temp_file(
		array $file,
		?string $title = null,
		?string $alt = null,
		?string $source_url = null
	) {
		$mime = Media_Mime_Validator::sniff_mime_type( $file['tmp_name'] );
		$mime_error = Media_Mime_Validator::assert_allowed_mime( $mime );
		if ( $mime_error ) {
			self::delete_temp( $file['tmp_name'] );

			return $mime_error;
		}

		self::load_admin_media_includes();

		$file_array = [
			'name' => self::normalize_filename( $file['name'], $mime ),
			'tmp_name' => $file['tmp_name'],
		];

		$attachment_id = self::sideload( $file_array, $title, Media_Upload_Config::SVG_MIME_TYPE === $mime );

		if ( is_wp_error( $attachment_id ) ) {
			self::delete_temp( $file['tmp_name'] );

			return $attachment_id;
		}

		$stored_source_url = is_string( $source_url ) ? self::source_url_for_storage( $source_url ) : null;
		if ( null !== $stored_source_url ) {
			update_post_meta( $attachment_id, Media_Upload_Config::SOURCE_URL_META_KEY, $stored_source_url );
		}

		self::apply_meta( $attachment_id, $title, $alt );

		return self::format_attachment( $attachment_id );
	}

	public static function format_attachment( int $attachment_id ): array {
		$post = get_post( $attachment_id );
		$metadata = wp_get_attachment_metadata( $attachment_id );

		return [
			'attachment_id' => $attachment_id,
			'url' => (string) wp_get_attachment_url( $attachment_id ),
			'mime' => $post ? (string) $post->post_mime_type : '',
			'width' => isset( $metadata['width'] ) ? (int) $metadata['width'] : null,
			'height' => isset( $metadata['height'] ) ? (int) $metadata['height'] : null,
			'alt' => (string) get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
		];
	}

	public static function update_title_and_alt( int $attachment_id, ?string $title, ?string $alt ) {
		if ( ! current_user_can( Media_Upload_Config::REQUIRED_CAPABILITY ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to upload files.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$post = get_post( $attachment_id );
		if ( ! $post || 'attachment' !== $post->post_type ) {
			return new \WP_Error(
				'invalid_attachment',
				__( 'The attachment was not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		if ( ! current_user_can( 'edit_post', $attachment_id ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to edit this attachment.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		self::apply_meta( $attachment_id, $title, $alt );

		return self::format_attachment( $attachment_id );
	}

	private static function apply_meta( int $attachment_id, ?string $title, ?string $alt ): void {
		if ( is_string( $title ) && '' !== trim( $title ) ) {
			wp_update_post( [
				'ID' => $attachment_id,
				'post_title' => self::limit_length( sanitize_text_field( $title ) ),
			] );
		}

		if ( is_string( $alt ) ) {
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', self::limit_length( sanitize_text_field( $alt ) ) );
		}
	}

	private static function limit_length( string $value ): string {
		return mb_substr( $value, 0, Media_Upload_Config::MAX_METADATA_LENGTH );
	}

	private static function normalize_filename( string $name, string $mime ): string {
		$name = sanitize_file_name( $name );
		$extension = Media_Mime_Validator::extension_for_mime( $mime );

		if ( ! preg_match( '/\.' . preg_quote( $extension, '/' ) . '$/iD', $name ) ) {
			$name = preg_replace( '/\.[^.]+$/', '', $name ) . '.' . $extension;
		}

		return $name;
	}

	public static function load_admin_media_includes(): void {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
	}

	/**
	 * SVG files go through Elementor's Uploads_Manager, which allows the type and runs the SVG
	 * sanitizer on wp_handle_sideload_prefilter, the same way other Elementor uploads do.
	 *
	 * @return int|\WP_Error
	 */
	private static function sideload( array $file_array, ?string $title, bool $is_svg ) {
		$uploads_manager = Plugin::$instance->uploads_manager;

		if ( $is_svg ) {
			$uploads_manager->set_elementor_upload_state( true );
		}

		try {
			return media_handle_sideload( $file_array, 0, $title ?? '' );
		} finally {
			if ( $is_svg ) {
				$uploads_manager->set_elementor_upload_state( false );
			}
		}
	}

	private static function delete_temp( string $path ): void {
		if ( is_string( $path ) && '' !== $path && file_exists( $path ) ) {
			wp_delete_file( $path );
		}
	}
}
