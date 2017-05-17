<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Group_Control_Image_Size extends Group_Control_Base {

	protected static $fields;

	public static function get_type() {
		return 'image-size';
	}

	/**
	 * @param array  $settings [ image => [ id => '', url => '' ], image_size => '', hover_animation => '' ]
	 *
	 * @param string $setting_key
	 *
	 * @return string
	 */
	public static function get_attachment_image_html( $settings, $setting_key = 'image' ) {
		$id  = $settings[ $setting_key ]['id'];

		// Old version of image settings
		if ( ! isset( $settings[ $setting_key . '_size' ] ) ) {
			$settings[ $setting_key . '_size' ] = '';
		}

		$size = $settings[ $setting_key . '_size' ];

		$image_class = ! empty( $settings['hover_animation'] ) ? 'elementor-animation-' . $settings['hover_animation'] : '';

		$html = '';

		// If is the new version - with image size
		$image_sizes   = get_intermediate_image_sizes();

		$image_sizes[] = 'full';

		if ( ! empty( $id ) && in_array( $size, $image_sizes ) ) {
			$image_class .= " attachment-$size size-$size";

			$html .= wp_get_attachment_image( $id, $size, false, [ 'class' => trim( $image_class ) ] );
		} else {
			$image_src = self::get_attachment_image_src( $id, $setting_key, $settings );

			if ( ! $image_src && isset( $settings[ $setting_key ]['url'] ) ) {
				$image_src = $settings[ $setting_key ]['url'] ;
			}

			if ( ! empty( $image_src ) ) {
				$image_class_html = ! empty( $image_class ) ? ' class="' . $image_class . '"' : '';

				$html .= sprintf( '<img src="%s" title="%s" alt="%s"%s />', esc_attr( $image_src ), Control_Media::get_image_title( $settings[ $setting_key ] ), Control_Media::get_image_alt( $settings[ $setting_key ] ), $image_class_html );
			}
		}

		return $html;
	}

	public static function get_all_image_sizes() {
		global $_wp_additional_image_sizes;

		$default_image_sizes = [ 'thumbnail', 'medium', 'medium_large', 'large' ];

		$image_sizes = [];

		foreach ( $default_image_sizes as $size ) {
			$image_sizes[ $size ] = [
				'width' => (int) get_option( $size . '_size_w' ),
				'height' => (int) get_option( $size . '_size_h' ),
				'crop' => (bool) get_option( $size . '_crop' ),
			];
		}

		if ( $_wp_additional_image_sizes ) {
			$image_sizes = array_merge( $image_sizes, $_wp_additional_image_sizes );
		}

		return $image_sizes;
	}

	protected function get_child_default_args() {
		return [
			'include' => [],
			'exclude' => [],
		];
	}

	private function _get_image_sizes() {
		$wp_image_sizes = self::get_all_image_sizes();

		$args = $this->get_args();

		if ( $args['include'] ) {
			$wp_image_sizes = array_intersect_key( $wp_image_sizes, array_flip( $args['include'] ) );
		} elseif ( $args['exclude'] ) {
			$wp_image_sizes = array_diff_key( $wp_image_sizes, array_flip( $args['exclude'] ) );
		}

		$image_sizes = [];

		foreach ( $wp_image_sizes as $size_key => $size_attributes ) {
			$image_sizes[ $size_key ] = ucwords( str_replace( '_', ' ', $size_key ) ) . sprintf( ' - %d x %d', $size_attributes['width'], $size_attributes['height'] );
		}

		$image_sizes['full'] = _x( 'Full', 'Image Size Control', 'elementor' );

		if ( ! empty( $args['include']['custom'] ) || ! in_array( 'custom', $args['exclude'] ) ) {
			$image_sizes['custom'] = _x( 'Custom', 'Image Size Control', 'elementor' );
		}

		return $image_sizes;
	}

	protected function init_fields() {
		$fields = [];

		$fields['size'] = [
			'label' => _x( 'Image Size', 'Image Size Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'label_block' => false,
		];

		$fields['custom_dimension'] = [
			'label' => _x( 'Image Dimension', 'Image Size Control', 'elementor' ),
			'type' => Controls_Manager::IMAGE_DIMENSIONS,
			'description' => __( 'You can crop the original image size to any custom size. You can also set a single value for height or width in order to keep the original size ratio.', 'elementor' ),
			'condition' => [
				'size' => [ 'custom' ],
			],
			'separator' => 'none',
		];

		return $fields;
	}

	protected function prepare_fields( $fields ) {
		$image_sizes = $this->_get_image_sizes();

		$args = $this->get_args();

		if ( ! empty( $args['default'] ) && isset( $image_sizes[ $args['default'] ] ) ) {
			$default_value = $args['default'];
		} else {
			// Get the first item for default value
			$default_value = array_keys( $image_sizes );
			$default_value = array_shift( $default_value );
		}

		$fields['size']['options'] = $image_sizes;

		$fields['size']['default'] = $default_value;

		if ( ! isset( $image_sizes['custom'] ) ) {
			unset( $fields['custom_dimension'] );
		}

		return parent::prepare_fields( $fields );
	}

	public static function get_attachment_image_src( $attachment_id, $group_name, $instance ) {
		if ( empty( $attachment_id ) )
			return false;

		$size = $instance[ $group_name . '_size' ];

		if ( 'custom' !== $size ) {
			$attachment_size = $size;
		} else {
			// Use BFI_Thumb script
			// TODO: Please rewrite this code
			require_once( ELEMENTOR_PATH . 'includes/libraries/bfi-thumb/bfi-thumb.php' );

			$custom_dimension = $instance[ $group_name . '_custom_dimension' ];

			$attachment_size = [
				// Defaults sizes
				0 => null, // Width
				1 => null, // Height

				'bfi_thumb' => true,
				'crop' => true,
			];

			$has_custom_size = false;
			if ( ! empty( $custom_dimension['width'] ) ) {
				$has_custom_size = true;
				$attachment_size[0] = $custom_dimension['width'];
			}

			if ( ! empty( $custom_dimension['height'] ) ) {
				$has_custom_size = true;
				$attachment_size[1] = $custom_dimension['height'];
			}

			if ( ! $has_custom_size ) {
				$attachment_size = 'full';
			}
		}

		$image_src = wp_get_attachment_image_src( $attachment_id, $attachment_size );

		return ! empty( $image_src[0] ) ? $image_src[0] : '';
	}
}
