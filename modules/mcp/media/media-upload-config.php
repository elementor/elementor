<?php

namespace Elementor\Modules\Mcp\Media;

use Elementor\Core\Files\Uploads_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Upload_Config {

	const SOURCE_URL_META_KEY = '_elementor_mcp_source_url';

	const UPLOAD_TOKEN_HEADER = 'X-Elementor-Mcp-Upload-Token';

	const UPLOAD_FILENAME_HEADER = 'X-Elementor-Mcp-Upload-Filename';

	const UPLOAD_TITLE_HEADER = 'X-Elementor-Mcp-Upload-Title';

	const UPLOAD_ALT_HEADER = 'X-Elementor-Mcp-Upload-Alt';

	const MAX_METADATA_LENGTH = 255;

	const TOKEN_TRANSIENT_PREFIX = 'elementor_mcp_upload_';

	const TOKEN_TTL_SECONDS = 600;

	const FETCH_TIMEOUT_SECONDS = 30;

	const TOTAL_FETCH_TIMEOUT_SECONDS = 60;

	const TOTAL_BATCH_TIMEOUT_SECONDS = 60;

	const MAX_REDIRECT_HOPS = 5;

	const MAX_BYTES = 10485760;

	const MAX_UPLOADS_PER_REQUEST = 10;

	const MAX_URL_IMPORTS_PER_REQUEST = 5;

	const ALLOWED_IMAGE_MIME_TYPES = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/avif',
	];

	const SVG_MIME_TYPE = 'image/svg+xml';

	const REQUIRED_CAPABILITY = 'upload_files';

	const SVG_REQUIRED_CAPABILITY = 'manage_options';

	public static function max_upload_bytes(): int {
		$wp_limit = wp_max_upload_size();
		$wp_limit = is_numeric( $wp_limit ) ? (int) $wp_limit : 0;

		if ( $wp_limit > 0 ) {
			$bytes = min( $wp_limit, self::MAX_BYTES );
		} else {
			$bytes = self::MAX_BYTES;
		}

		$filtered = apply_filters( 'elementor/mcp/media/max_upload_bytes', $bytes );

		return min( $bytes, max( 1, (int) $filtered ) );
	}

	public static function allowed_mime_types(): array {
		$mimes = self::ALLOWED_IMAGE_MIME_TYPES;

		if ( self::is_svg_upload_allowed() ) {
			$mimes[] = self::SVG_MIME_TYPE;
		}

		return $mimes;
	}

	public static function is_svg_upload_allowed(): bool {
		return Uploads_Manager::are_unfiltered_uploads_enabled()
			&& current_user_can( self::SVG_REQUIRED_CAPABILITY );
	}
}
