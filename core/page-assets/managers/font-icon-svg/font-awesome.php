<?php
namespace Elementor\Core\Assets\Managers\Font_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Font Icon Svg.
 *
 * @since 3.3.0
 */
class Font_Awesome extends Base {
	protected static function get_font_name() {
		return 'font-awesome';
	}

	protected static function get_font_icon_asset_url( $file_name ) {
		return ELEMENTOR_ASSETS_URL . 'lib/font-awesome/json/' . $file_name;
	}
}
