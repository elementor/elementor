<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Scheme interface.
 *
 * An interface for Elementor Scheme.
 *
 * @since 1.0.0
 */
interface Scheme_Interface {

	/**
	 * Get scheme type.
	 *
	 * Retrieve the scheme type.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 */
	public static function get_type();

	/**
	 * Get scheme title.
	 *
	 * Retrieve the scheme title.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function get_title();

	/**
	 * Get scheme disabled title.
	 *
	 * Retrieve the scheme disabled title.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function get_disabled_title();

	/**
	 * Get scheme titles.
	 *
	 * Retrieve the scheme titles.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function get_scheme_titles();

	/**
	 * Get default scheme.
	 *
	 * Retrieve the default scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function get_default_scheme();

	/**
	 * Print scheme content template.
	 *
	 * Used to generate the HTML in the editor using Underscore JS template. The
	 * variables for the class are available using `data` JS object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function print_template_content();
}
