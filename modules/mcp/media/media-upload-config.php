<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Upload_Config {

	const FETCH_TIMEOUT_SECONDS = 30;

	const MAX_REDIRECT_HOPS = 5;

	const MAX_BYTES = 10485760;

	public static function max_upload_bytes(): int {
		$wp_limit = wp_max_upload_size();
		$wp_limit = is_numeric( $wp_limit ) ? (int) $wp_limit : 0;

		if ( $wp_limit > 0 ) {
			$bytes = min( $wp_limit, self::MAX_BYTES );
		} else {
			$bytes = self::MAX_BYTES;
		}

		$filtered = apply_filters( 'elementor/mcp/media/max_upload_bytes', $bytes );

		return max( 1, (int) $filtered );
	}

	public static function assert_content_length_within_limit( $content_length ): ?\WP_Error {
		if ( ! is_numeric( $content_length ) || '' === $content_length ) {
			return null;
		}

		if ( (int) $content_length > self::max_upload_bytes() ) {
			return new \WP_Error(
				'file_too_large',
				__( 'The file exceeds the allowed upload size limit.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}
}
