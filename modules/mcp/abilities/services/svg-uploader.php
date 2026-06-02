<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

use Elementor\Core\Files\File_Types\Svg;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sideloads inline `<svg>…</svg>` markup into the WordPress media library.
 *
 * Friendly e-svg nodes accept a raw `svg_markup` string; e-svg itself only
 * references an attachment id or hosted url. This service bridges the two: it
 * sanitizes the markup with Elementor's {@see Svg_Sanitizer} (the same gate used
 * for media-library SVG uploads), writes it to the uploads directory, registers
 * the attachment, and caches the sanitized markup in the inline-svg post meta so
 * the renderer can serve it without re-reading the file.
 *
 * Returns the new attachment id, or null when sanitization fails / the SVG
 * sanitizer is unavailable. Never throws — callers fall back to the placeholder.
 *
 * Uploads are deduplicated by a content hash of the sanitized markup (stored in
 * the {@see self::HASH_META_KEY} post meta): re-saving the same SVG returns the
 * existing attachment instead of spamming the media library.
 */
class Svg_Uploader {

	const HASH_META_KEY = '_elementor_mcp_svg_hash';

	public static function make(): self {
		return new self();
	}

	public function upload_inline( string $markup, string $title = '' ): ?int {
		if ( ! Svg::file_sanitizer_can_run() ) {
			return null;
		}

		$markup = trim( $markup );
		if ( '' === $markup ) {
			return null;
		}

		$sanitized = ( new Svg_Sanitizer() )->sanitize( $markup );
		if ( false === $sanitized || '' === trim( $sanitized ) ) {
			return null;
		}

		$hash = md5( $sanitized );

		$existing = $this->find_existing_by_hash( $hash );
		if ( null !== $existing ) {
			return $existing;
		}

		$filename = $this->build_filename( $sanitized, $title );

		add_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );
		Plugin::$instance->uploads_manager->set_elementor_upload_state( true );
		$upload = wp_upload_bits( $filename, null, $sanitized );
		Plugin::$instance->uploads_manager->set_elementor_upload_state( false );
		remove_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );

		if ( ! empty( $upload['error'] ) || empty( $upload['file'] ) ) {
			return null;
		}

		$file_path = $upload['file'];

		$attachment_id = wp_insert_attachment(
			[
				'post_mime_type' => 'image/svg+xml',
				'post_title' => '' !== $title ? sanitize_text_field( $title ) : sanitize_file_name( $filename ),
				'post_content' => '',
				'post_status' => 'inherit',
				'guid' => $upload['url'] ?? '',
			],
			$file_path
		);

		if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
			return null;
		}

		$attachment_id = (int) $attachment_id;

		if ( function_exists( 'wp_generate_attachment_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/image.php';
			wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $file_path ) );
		}

		update_post_meta( $attachment_id, Svg::META_KEY, $sanitized );
		update_post_meta( $attachment_id, self::HASH_META_KEY, $hash );

		return $attachment_id;
	}

	private function find_existing_by_hash( string $hash ): ?int {
		$ids = get_posts(
			[
				'post_type' => 'attachment',
				'post_status' => 'inherit',
				'post_mime_type' => 'image/svg+xml',
				'posts_per_page' => 1,
				'fields' => 'ids',
				'no_found_rows' => true,
				'meta_key' => self::HASH_META_KEY,
				'meta_value' => $hash,
			]
		);

		if ( empty( $ids ) ) {
			return null;
		}

		$id = (int) $ids[0];
		$path = get_attached_file( $id );

		return ( $path && file_exists( $path ) ) ? $id : null;
	}

	private function build_filename( string $sanitized, string $title ): string {
		$base = '' !== $title ? sanitize_title( $title ) : '';
		if ( '' === $base ) {
			$base = 'mcp-svg-' . substr( md5( $sanitized ), 0, 8 );
		}

		return $base . '.svg';
	}
}
