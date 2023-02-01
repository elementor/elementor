<?php
namespace Elementor\Core\Schemes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor color picker scheme.
 *
 * Elementor color picker scheme class is responsible for initializing a scheme
 * for color pickers.
 *
 * @since 1.0.0
 */
class Color_Picker extends Base {

	/**
	 * Get color picker scheme type.
	 *
	 * Retrieve the color picker scheme type.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Color picker scheme type.
	 */
	public static function get_type() {
		return 'color-picker';
	}

	/**
	 * Get default color picker scheme.
	 *
	 * Retrieve the default color picker scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Default color picker scheme.
	 */
	public function get_default_scheme() {
		return [
			1 => '#6ec1e4',
			2 => '#54595f',
			3 => '#7a7a7a',
			4 => '#61ce70',
			5 => '#4054b2',
			6 => '#23a455',
			7 => '#000',
			8 => '#fff',
		];
	}
}
