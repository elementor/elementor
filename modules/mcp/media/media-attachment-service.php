<?php

namespace Elementor\Modules\Mcp\Media;

use Elementor\Core\Files\File_Types\Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Attachment_Service {

	public static function find_by_source_url( string $source_url ): ?int {
		$ids = get_posts( [
			'post_type' => 'attachment',
			'post_status' => 'inherit',
			'posts_per_page' => 1,
			'fields' => 'ids',
			'meta_key' => Media_Upload_Config::SOURCE_URL_META_KEY,
			'meta_value' => $source_url,
			'no_found_rows' => true,
		] );

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
		if ( ! current_user_can( 'upload_files' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to upload files.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$mime = Media_Mime_Validator::sniff_mime_type( $file['tmp_name'] );
		$mime_error = Media_Mime_Validator::assert_allowed_mime( $mime );
		if ( $mime_error ) {
			self::delete_temp( $file['tmp_name'] );

			return $mime_error;
		}

		if ( Media_Upload_Config::SVG_MIME_TYPE === $mime ) {
			$sanitized = ( new Svg() )->sanitize_svg( $file['tmp_name'] );
			if ( ! $sanitized ) {
				self::delete_temp( $file['tmp_name'] );

				return new \WP_Error(
					'svg_sanitization_failed',
					__( 'The SVG file could not be sanitized.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}
		}

		self::load_admin_media_includes();

		$file_array = [
			'name' => self::normalize_filename( $file['name'], $mime ),
			'tmp_name' => $file['tmp_name'],
		];

		$sideload_filters = self::install_svg_sideload_filters( $mime );
		$attachment_id = media_handle_sideload( $file_array, 0, $title ?? '', [ 'test_form' => false ] );
		self::remove_svg_sideload_filters( $sideload_filters );

		if ( is_wp_error( $attachment_id ) ) {
			self::delete_temp( $file['tmp_name'] );

			return $attachment_id;
		}

		if ( is_string( $source_url ) && '' !== $source_url ) {
			update_post_meta( $attachment_id, Media_Upload_Config::SOURCE_URL_META_KEY, $source_url );
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
		if ( ! current_user_can( 'upload_files' ) ) {
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

		self::apply_meta( $attachment_id, $title, $alt );

		return self::format_attachment( $attachment_id );
	}

	private static function apply_meta( int $attachment_id, ?string $title, ?string $alt ): void {
		if ( is_string( $title ) && '' !== trim( $title ) ) {
			wp_update_post( [
				'ID' => $attachment_id,
				'post_title' => sanitize_text_field( $title ),
			] );
		}

		if ( is_string( $alt ) ) {
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt ) );
		}
	}

	private static function normalize_filename( string $name, string $mime ): string {
		$name = sanitize_file_name( $name );
		$extension = Media_Mime_Validator::extension_for_mime( $mime );

		if ( ! preg_match( '/\.' . preg_quote( $extension, '/' ) . '$/i', $name ) ) {
			$name = preg_replace( '/\.[^.]+$/', '', $name ) . '.' . $extension;
		}

		return $name;
	}

	private static function load_admin_media_includes(): void {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
	}

	private static function install_svg_sideload_filters( string $mime ): array {
		if ( Media_Upload_Config::SVG_MIME_TYPE !== $mime ) {
			return [];
		}

		$mime_filter = static function ( array $mimes ) {
			$mimes['svg'] = Media_Upload_Config::SVG_MIME_TYPE;

			return $mimes;
		};

		add_filter( 'upload_mimes', $mime_filter );

		return [
			'mime' => $mime_filter,
		];
	}

	private static function remove_svg_sideload_filters( array $filters ): void {
		if ( isset( $filters['mime'] ) ) {
			remove_filter( 'upload_mimes', $filters['mime'] );
		}
	}

	private static function delete_temp( string $path ): void {
		if ( is_string( $path ) && '' !== $path && file_exists( $path ) ) {
			wp_delete_file( $path );
		}
	}
}
