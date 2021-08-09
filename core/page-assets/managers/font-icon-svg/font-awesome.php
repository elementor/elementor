<?php
namespace Elementor\Core\Page_Assets\Managers\Font_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Font Icon Svg.
 *
 * @since 3.4.0
 */
class Font_Awesome extends Base {
	const FONT_AWESOME_CURRENT_VERSION = 5;

	protected static function get_font_name() {
		return 'font-awesome';
	}

	protected static function get_config_file_path() {
		$icon_file_name = str_replace( 'fa-', '', self::$icon['library'] );

		return ELEMENTOR_ASSETS_PATH . 'lib/font-awesome/json/' . $icon_file_name . '.json';
	}

	protected static function get_config_key() {
		// i.e. 'fab-apple' | 'far-cart'.
		return str_replace( ' fa-', '-', self::$icon['value'] );
	}

	protected static function get_config_version() {
		return self::FONT_AWESOME_CURRENT_VERSION;
	}

	protected static function get_config_data() {
		preg_match( '/fa(.*) fa-/', self::$icon['value'], $matches );
		$icon_name = str_replace( $matches[0], '', self::$icon['value'] );

		return [
			'icon_data' => [
				'name' => $icon_name,
				'library' => self::$icon['library'],
			],
		];
	}
}
