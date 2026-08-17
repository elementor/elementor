<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Derives the full V3 element_config allowlist from widget controls (no per-key registry).
 */
class V3_Allowed_Setting_Keys {

	/**
	 * @param array<string, mixed> $controls Widget controls from get_config()['controls'].
	 * @return string[]
	 */
	public static function from_controls( array $controls ): array {
		return V3_Style_Setting_Keys::from_controls( $controls );
	}

	/**
	 * @param string $widget_type
	 * @return string[]
	 */
	public static function for_widget_type( string $widget_type ): array {
		$config = Widget_Context_Helper::get_widget_config( $widget_type );
		$controls = is_array( $config['controls'] ?? null ) ? $config['controls'] : [];

		return self::from_controls( $controls );
	}
}
