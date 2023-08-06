<?php
namespace Elementor\Core\Schemes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor typography scheme.
 *
 * Elementor typography scheme class is responsible for initializing a scheme
 * for typography.
 *
 * @since 1.0.0
 * @deprecated 3.15.0 Use Global_Typography instead
 */
class Typography {

	/**
	 * 1st typography scheme.
	 * @deprecated 3.15.0 Use Global_Typography::TYPOGRAPHY_PRIMARY instead
	 */
	const TYPOGRAPHY_1 = '1';

	/**
	 * 2nd typography scheme.
	 * @deprecated 3.15.0 Use Global_Typography::TYPOGRAPHY_SECONDARY instead
	 */
	const TYPOGRAPHY_2 = '2';

	/**
	 * 3rd typography scheme.
	 * @deprecated 3.15.0 Use Global_Typography::TYPOGRAPHY_TEXT instead
	 */
	const TYPOGRAPHY_3 = '3';

	/**
	 * 4th typography scheme.
	 * @deprecated 3.15.0 Use Global_Typography::TYPOGRAPHY_ACCENT instead
	 */
	const TYPOGRAPHY_4 = '4';

	/**
	 * Get typography scheme type.
	 *
	 * Retrieve the typography scheme type.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 * @deprecated 3.15.0
	 *
	 * @return string Typography scheme type.
	 */
	public static function get_type() {
		return 'typography';
	}

	/**
	 * Get typography scheme title.
	 *
	 * Retrieve the typography scheme title.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.15.0
	 *
	 * @return string Typography scheme title.
	 */
	public function get_title() {
		return '';
	}

	/**
	 * Get typography scheme disabled title.
	 *
	 * Retrieve the typography scheme disabled title.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.15.0
	 *
	 * @return string Typography scheme disabled title.
	 */
	public function get_disabled_title() {
		return '';
	}

	/**
	 * Get typography scheme titles.
	 *
	 * Retrieve the typography scheme titles.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.15.0
	 *
	 * @return array Typography scheme titles.
	 */
	public function get_scheme_titles() {
		return [];
	}

	/**
	 * Get default typography scheme.
	 *
	 * Retrieve the default typography scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.15.0
	 *
	 * @return array Default typography scheme.
	 */
	public function get_default_scheme() {
		return [];
	}

	/**
	 * Print typography scheme content template.
	 *
	 * Used to generate the HTML in the editor using Underscore JS template. The
	 * variables for the class are available using `data` JS object.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 3.15.0
	 */
	public function print_template_content() {}
}
