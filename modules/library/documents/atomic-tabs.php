<?php
namespace Elementor\Modules\Library\Documents;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Atomic_Tabs library document.
 *
 * Elementor atomic tabs library document handler class is responsible for
 * handling a document of an atomic tabs type.
 *
 * @since 3.31.0
 */
class Atomic_Tabs extends Library_Document {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = true;

		return $properties;
	}

	/**
	 * Get document name.
	 *
	 * Retrieve the document name.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @return string Document name.
	 */
	public function get_name() {
		return 'e-tabs';
	}

	/**
	 * Get document title.
	 *
	 * Retrieve the document title.
	 *
	 * @since 2.0.0
	 * @access public
	 * @static
	 *
	 * @return string Document title.
	 */
	public static function get_title() {
		return esc_html__( 'Atomic Tabs', 'elementor' );
	}

	/**
	 * Get Type
	 *
	 * Return the atomic tabs document type.
	 *
	 * @return string
	 */
	public static function get_type() {
		return 'e-tabs';
	}
} 