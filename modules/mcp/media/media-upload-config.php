<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Upload_Config {

	const SOURCE_URL_META_KEY = '_elementor_mcp_source_url';

	const UPLOAD_TOKEN_HEADER = 'X-Elementor-Mcp-Upload-Token';

	const UPLOAD_SHA256_HEADER = 'X-Elementor-Mcp-Upload-Sha256';

	const UPLOAD_FILENAME_HEADER = 'X-Elementor-Mcp-Upload-Filename';

	const TOKEN_TRANSIENT_PREFIX = 'elementor_mcp_upload_';

	const TOKEN_TTL_SECONDS = 600;

	const FETCH_TIMEOUT_SECONDS = 30;

	const MAX_REDIRECT_HOPS = 5;

	const MAX_BYTES = 10485760;

	const ALLOWED_IMAGE_MIME_TYPES = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/avif',
	];

	const SVG_MIME_TYPE = 'image/svg+xml';

	public static function max_upload_bytes(): int {
		$wp_limit = wp_max_upload_size();

		if ( ! is_int( $wp_limit ) || $wp_limit <= 0 ) {
			return self::MAX_BYTES;
		}

		return min( self::MAX_BYTES, $wp_limit );
	}

	public static function allowed_mime_types(): array {
		$mimes = self::ALLOWED_IMAGE_MIME_TYPES;

		if ( self::is_svg_upload_allowed() ) {
			$mimes[] = self::SVG_MIME_TYPE;
		}

		return $mimes;
	}

	public static function is_svg_upload_allowed(): bool {
		return \Elementor\Core\Files\File_Types\Svg::file_sanitizer_can_run()
			&& \Elementor\Core\Files\Uploads_Manager::are_unfiltered_uploads_enabled();
	}
}
