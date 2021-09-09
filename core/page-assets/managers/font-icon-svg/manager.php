<?php
namespace Elementor\Core\Page_Assets\Managers\Font_Icon_Svg;

use Elementor\Core\Base\Base_Object;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Font Icon Svg Manager.
 *
 * @since 3.4.0
 */
class Manager extends Base_Object {
	private static $font_icon_svg_data = [];

	private static function get_font_icon_svg_data() {
		if ( ! self::$font_icon_svg_data ) {
			self::$font_icon_svg_data = [
				'font-awesome' => [
					'regex' => '/^fa-/',
					'manager' => Font_Awesome::class,
				],
			];
		}

		return self::$font_icon_svg_data;
	}

	public static function get_font_family_manager( $font_family ) {
		$font_icon_svg_data = self::get_font_icon_svg_data();

		return $font_icon_svg_data[ $font_family ]['manager'];
	}

	public static function get_font_family( $icon_library ) {
		foreach ( self::get_font_icon_svg_data() as $family => $data ) {
			if ( preg_match( $data['regex'], $icon_library ) ) {
				return $family;
			}
		}

		return '';
	}
}
