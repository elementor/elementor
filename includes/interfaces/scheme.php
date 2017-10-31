<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Scheme interface.
 */
interface Scheme_Interface {

	/**
	 * Retrieve Scheme type.
	 *
	 * @access public
	 * @static
	 */
	public static function get_type();

	/**
	 * Retrieve scheme title.
	 *
	 * @access public
	 */
	public function get_title();

	/**
	 * Retrieve scheme disabled title.
	 *
	 * @access public
	 */
	public function get_disabled_title();

	/**
	 * Retrieve scheme titles.
	 *
	 * @access public
	 */
	public function get_scheme_titles();

	/**
	 * Retrieve default scheme.
	 *
	 * @access public
	 */
	public function get_default_scheme();

	/**
	 * Print template content.
	 *
	 * @access public
	 */
	public function print_template_content();
}
