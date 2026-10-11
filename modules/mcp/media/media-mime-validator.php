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

		if ( class_exists( 'finfo' ) ) {
			$finfo = new \finfo( FILEINFO_MIME_TYPE );
			$detected = $finfo->file( $file_path );

			if ( is_string( $detected ) && '' !== $detected ) {
				return $detected;
			}
		}

		return null;
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
				__( 'SVG uploads are not enabled or cannot be sanitized on this site.', 'elementor' ),
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
