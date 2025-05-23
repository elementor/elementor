<?php
namespace Elementor\Core\DocumentTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Post extends PageBase {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['support_kit'] = true;
		$properties['cpt'] = [ 'post' ];

		return $properties;
	}

	public static function get_type() {
		return 'wp-post';
	}

	/**
	 * @access public
	 * @static
	 */
	public static function get_title() {
		return esc_html__( 'Post', 'elementor' );
	}

	public static function get_plural_title() {
		return esc_html__( 'Posts', 'elementor' );
	}
}
