<?php
namespace Elementor\Core\DocumentTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Post extends PageBase {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = true;

		return $properties;
	}

	/**
	 * @access public
	 */
	public function get_name() {
		return 'wp-post';
	}

	/**
	 * @access public
	 * @static
	 */
	public static function get_title() {
		return __( 'Post', 'elementor' );
	}
}
