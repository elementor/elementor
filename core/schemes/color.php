<?php
namespace Elementor\Core\Schemes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor color scheme.
 *
 * Elementor color scheme class is responsible for initializing a scheme for
 * colors.
 *
 * @since 1.0.0
 * @deprecated 3.0.0 Use `Global_Colors` instead.
 */
class Color {

	/**
	 * 1st color scheme.
	 * @deprecated 3.0.0 Use `Global_Colors::COLOR_PRIMARY` instead.
	 */
	const COLOR_1 = '1';

	/**
	 * 2nd color scheme.
	 * @deprecated 3.0.0 Use `Global_Colors::COLOR_SECONDARY` instead.
	 */
	const COLOR_2 = '2';

	/**
	 * 3rd color scheme.
	 * @deprecated 3.0.0 Use `Global_Colors::COLOR_TEXT` instead.
	 */
	const COLOR_3 = '3';

	/**
	 * 4th color scheme.
	 * @deprecated 3.0.0 Use `Global_Colors::COLOR_ACCENT` instead.
	 */
	const COLOR_4 = '4';

	/**
	 * Get color scheme type.
	 *
	 * Retrieve the color scheme type.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 * @deprecated 3.0.0
	 *
	 * @return string Color scheme type.
	 */
	public static function get_type() {
		return 'color';
	}

	/**
	 * Get color scheme title.
	 *
	 * Retrieve the color scheme title.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @return string Color scheme title.
	 */
	public function get_title() {
		return '';
	}

	/**
	 * Get color scheme disabled title.
	 *
	 * Retrieve the color scheme disabled title.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @return string Color scheme disabled title.
	 */
	public function get_disabled_title() {
		return '';
	}

	/**
	 * Get color scheme titles.
	 *
	 * Retrieve the color scheme titles.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @return array Color scheme titles.
	 */
	public function get_scheme_titles() {
		return [];
	}

	/**
	 * Get default color scheme.
	 *
	 * Retrieve the default color scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 *
	 * @return array Default color scheme.
	 */
	public function get_default_scheme() {
		return [];
	}

	/**
	 * Print color scheme content template.
	 *
	 * Used to generate the HTML in the editor using Underscore JS template. The
	 * variables for the class are available using `data` JS object.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.0.0
	 */
	public function print_template_content() {}
}
