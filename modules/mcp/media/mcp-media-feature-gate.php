<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mcp_Media_Feature_Gate {

	public const ENABLED_FILTER = 'elementor/mcp/media/enabled';

	public static function is_enabled(): bool {
		return (bool) apply_filters( self::ENABLED_FILTER, false );
	}
}
