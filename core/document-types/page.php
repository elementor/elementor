<?php
namespace Elementor\Core\DocumentTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Page extends PageBase {

	/**
	 * Get Properties
	 *
	 * Return the page document configuration properties.
	 *
	 * @access public
	 * @static
	 *
	 * @return array
	 */
	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['cpt'] = [ 'page' ];
		$properties['support_kit'] = true;

		return $properties;
	}

	/**
	 * Get Type
	 *
	 * Return the page document type.
	 *
	 * @return string
	 */
	public static function get_type() {
		return 'wp-page';
	}

	/**
	 * Get Title
	 *
	 * Return the page document title.
	 *
	 * @access public
	 * @static
	 *
	 * @return string
	 */
	public static function get_title() {
		return esc_html__( 'Page', 'elementor' );
	}

	/**
	 * Get Plural Title
	 *
	 * Return the page document plural title.
	 *
	 * @access public
	 * @static
	 *
	 * @return string
	 */
	public static function get_plural_title() {
		return esc_html__( 'Pages', 'elementor' );
	}
}
