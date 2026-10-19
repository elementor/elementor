<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Mime_Validator {

	public static function sniff_mime_type( string $file_path ): ?string {
		if ( ! is_readable( $file_path ) ) {
			return null;
		}

		if ( function_exists( 'wp_get_image_mime' ) ) {
			$mime = wp_get_image_mime( $file_path );
			if ( is_string( $mime ) && '' !== $mime ) {
				return $mime;
			}
		}

		if ( self::looks_like_svg( $file_path ) ) {
			return Media_Upload_Config::SVG_MIME_TYPE;
		}

		return null;
	}

	/**
	 * Detects SVG markup that may start with a byte order mark, an XML declaration, comments or a doctype.
	 */
	private static function looks_like_svg( string $file_path ): bool {
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$head = file_get_contents( $file_path, false, null, 0, 8192 );

		if ( ! is_string( $head ) || '' === $head ) {
			return false;
		}

		$head = preg_replace( '/^\xEF\xBB\xBF/', '', $head );
		$head = preg_replace( '/^(?:\s+|<\?xml\b.*?\?>|<!--.*?-->|<!DOCTYPE[^>]*>)+/is', '', (string) $head );

		return 1 === preg_match( '/^<svg[\s>]/iD', (string) $head );
	}

	public static function assert_allowed_mime( ?string $mime ): ?\WP_Error {
		if ( ! is_string( $mime ) || '' === $mime ) {
			return new \WP_Error(
				'invalid_mime',
				__( 'The file type could not be determined or is not allowed.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$mime = strtolower( $mime );

		if ( Media_Upload_Config::SVG_MIME_TYPE === $mime && ! Media_Upload_Config::is_svg_upload_allowed() ) {
			return new \WP_Error(
				'svg_not_allowed',
				__( 'SVG uploads require unfiltered file uploads to be enabled in Elementor, and are limited to site administrators.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! in_array( $mime, Media_Upload_Config::allowed_mime_types(), true ) ) {
			return new \WP_Error(
				'invalid_mime',
				__( 'The file type could not be determined or is not allowed.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	public static function extension_for_mime( string $mime ): string {
		$map = [
			'image/jpeg' => 'jpg',
			'image/png' => 'png',
			'image/gif' => 'gif',
			'image/webp' => 'webp',
			'image/avif' => 'avif',
			'image/svg+xml' => 'svg',
		];

		return $map[ strtolower( $mime ) ] ?? 'img';
	}
}
