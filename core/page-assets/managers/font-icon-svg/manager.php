<?php
namespace Elementor\Core\Page_Assets\Managers\Font_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Font Icon Svg Manager.
 *
 * @since 3.3.0
 */
class Manager {
	private static $font_icon_svg_data = [];

	private static function init_font_icon_svg_data() {
		if ( self::$font_icon_svg_data ) {
			return;
		}

		self::$font_icon_svg_data = [
			'font-awesome' => [
				'regex' => '/fa(.*) fa-/',
				'manager' => Font_Awesome::class,
			],
		];
	}

	public static function get_font_family_manager( $font_family ) {
		self::init_font_icon_svg_data();

		return self::$font_icon_svg_data[ $font_family ]['manager'];
	}

	public static function get_font_family( $icon_name ) {
		self::init_font_icon_svg_data();

		foreach ( self::$font_icon_svg_data as $family => $data ) {
			if ( preg_match( $data['regex'], $icon_name ) ) {
				return $family;
			}
		}

		return '';
	}
}
