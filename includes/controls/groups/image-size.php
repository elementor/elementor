<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Group_Control_Image_size extends Group_Control_Base {

	public static function get_type() {
		return 'image-size';
	}

	private function _get_image_sizes() {
		$wp_image_sizes = get_intermediate_image_sizes();

		$image_sizes = [];
		foreach ( $wp_image_sizes as $image_size ) {
			$image_sizes[ $image_size ] = ucwords( str_replace( '_', ' ', $image_size ) );
		}

		return $image_sizes;
	}

	protected function _get_controls( $args ) {
		$controls = [];

		$image_sizes = $this->_get_image_sizes();

		// Get the first item for default value
		$default_value = array_keys( $image_sizes );
		$default_value = array_shift( $default_value );
		$controls['size'] = [
			'label' => _x( 'Image Size', 'Image Size Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => $image_sizes,
			'default' => $default_value,
		];

		return $controls;
	}
}
