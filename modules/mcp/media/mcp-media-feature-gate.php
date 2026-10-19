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

	/**
	 * Availability result for the media abilities: true when enabled, otherwise the disabled error.
	 *
	 * @return true|\WP_Error
	 */
	public static function availability() {
		return self::is_enabled() ? true : self::disabled_error();
	}

	public static function disabled_error(): \WP_Error {
		return new \WP_Error(
			'mcp_media_disabled',
			__( 'MCP media upload is disabled.', 'elementor' ),
			[ 'status' => \WP_Http::NOT_FOUND ]
		);
	}
}
