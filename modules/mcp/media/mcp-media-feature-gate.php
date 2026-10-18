<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mcp_Media_Feature_Gate {

	public const ENABLED_FILTER = 'elementor/mcp/media/enabled';

	public static function is_enabled(): bool {
		return (bool) apply_filters( self::ENABLED_FILTER, true );
	}

	public static function disabled_error(): \WP_Error {
		return new \WP_Error(
			'mcp_media_disabled',
			__( 'MCP media upload is disabled.', 'elementor' ),
			[ 'status' => \WP_Http::NOT_FOUND ]
		);
	}
}
