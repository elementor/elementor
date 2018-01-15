<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor image size control.
 *
 * A base control for creating image size control. Displays input fields to define
 * one of the default image sizes (thumbnail, medium, medium_large, large) or set
 * a custom dimension.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_group_control(
 *    	Group_Control_Image_Size::get_type(),
 *    	[
 *    		'name' => 'thumbnail',
 *    		'default' => 'large',
 *    		'exclude' => [],
 *    		'include' => [],
 *    		'separator' => 'before',
 *    	]
 *    );
 *
 * @since 1.0.0
 *
 * @param string $name        The field name.
 * @param string $default     Optional. The default image size. Default is empty.
 * @param array  $exclude     Optional. Image size to exclude. Default is empty.
 * @param array  $include     Optional. Image size to include. Default is empty.
 * @param string $separator   Optional. Set the position of the control separator.
 *                            Available values are 'default', 'before', 'after'
 *                            and 'none'. 'default' will position the separator
 *                            depending on the control type. 'before' / 'after'
 *                            will position the separator before/after the
 *                            control. 'none' will hide the separator. Default
 *                            is 'default'.
 */
class Group_Control_Image_Size extends Group_Control_Base {

	/**
	 * Fields.
	 *
	 * Holds all the image size control fields.
	 *
	 * @since 1.2.2
	 * @access protected
	 * @static
	 *
	 * @var array Image size control fields.
	 */
	protected static $fields;

	/**
	 * Retrieve type.
	 *
	 * Get image size control type.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'image-size';
	}

	/**
	 * Retrieve attachment image HTML.
	 *
	 * Get the attachment image HTML code.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @param array  $settings    {
	 *     Control settings.
	 *
	 *     @type array  $image           {
	 *         Optional. Image data.
	 *
	 *         @type string $id  Optional. Image ID.
	 *         @type string $url Optional. Image URL.
	 *     }
	 *     @type string $image_size      Optional. Image size.
	 *     @type string $hover_animation Optional. Hover animation.
	 * }
	 * @param string $setting_key Optional. Settings key. Default is `image`.
	 *
	 * @return string Image HTML.
	 */
	public static function get_attachment_image_html( $settings, $setting_key = 'image' ) {
		$id  = $settings[ $setting_key ]['id'];

		// Old version of image settings.
		if ( ! isset( $settings[ $setting_key . '_size' ] ) ) {
			$settings[ $setting_key . '_size' ] = '';
		}

		$size = $settings[ $setting_key . '_size' ];

		$image_class = ! empty( $settings['hover_animation'] ) ? 'elementor-animation-' . $settings['hover_animation'] : '';

		$html = '';

		// If is the new version - with image size.
		$image_sizes = get_intermediate_image_sizes();

		$image_sizes[] = 'full';

		if ( ! empty( $id ) && in_array( $size, $image_sizes ) ) {
			$image_class .= " attachment-$size size-$size";
			$image_attr = [
				'class' => trim( $image_class ),
			];

			$html .= wp_get_attachment_image( $id, $size, false, $image_attr );
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

	/**
	 * Retrieve all image sizes.
	 *
	 * Get available image sizes with data like `width`, `height` and `crop`.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array An array of available image sizes.
	 */
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

		/** This filter is documented in wp-admin/includes/media.php */
		return apply_filters( 'image_size_names_choose', $image_sizes );
	}

	/**
	 * Get attachment image src.
	 *
	 * Retrieve the attachment image source URL.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @param string $attachment_id The attachment ID.
	 * @param string $group_name    Group name.
	 * @param array  $settings      Control settings.
	 *
	 * @return string Attachment image source URL.
	 */
	public static function get_attachment_image_src( $attachment_id, $group_name, array $settings ) {
		if ( empty( $attachment_id ) ) {
			return false;
		}

		$size = $settings[ $group_name . '_size' ];

		if ( 'custom' !== $size ) {
			$attachment_size = $size;
		} else {
			// Use BFI_Thumb script
			// TODO: Please rewrite this code.
			require_once( ELEMENTOR_PATH . 'includes/libraries/bfi-thumb/bfi-thumb.php' );

			$custom_dimension = $settings[ $group_name . '_custom_dimension' ];

			$attachment_size = [
				// Defaults sizes
				0 => null, // Width.
				1 => null, // Height.

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

	/**
	 * Retrieve child default arguments.
	 *
	 * Get the default arguments for all the child controls for a specific group
	 * control.
	 *
	 * @since 1.2.2
	 * @access protected
	 *
	 * @return array Default arguments for all the child controls.
	 */
	protected function get_child_default_args() {
		return [
			'include' => [],
			'exclude' => [],
		];
	}

	/**
	 * Init fields.
	 *
	 * Initialize image size control fields.
	 *
	 * @since 1.2.2
	 * @access protected
	 *
	 * @return array Control fields.
	 */
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
				'size' => 'custom',
			],
			'separator' => 'none',
		];

		return $fields;
	}

	/**
	 * Prepare fields.
	 *
	 * Process image size control fields before adding them to `add_control()`.
	 *
	 * @since 1.2.2
	 * @access protected
	 *
	 * @param array $fields Image size control fields.
	 *
	 * @return array Processed fields.
	 */
	protected function prepare_fields( $fields ) {
		$image_sizes = $this->_get_image_sizes();

		$args = $this->get_args();

		if ( ! empty( $args['default'] ) && isset( $image_sizes[ $args['default'] ] ) ) {
			$default_value = $args['default'];
		} else {
			// Get the first item for default value.
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

	/**
	 * Retrieve image sizes.
	 *
	 * Get available image sizes after filtering `include` and `exclude` arguments.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @return array Filtered image sizes.
	 */
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
			$control_title = ucwords( str_replace( '_', ' ', $size_key ) );
			if ( is_array( $size_attributes ) ) {
				$control_title .= sprintf( ' - %d x %d', $size_attributes['width'], $size_attributes['height'] );
			}

			$image_sizes[ $size_key ] = $control_title;
		}

		$image_sizes['full'] = _x( 'Full', 'Image Size Control', 'elementor' );

		if ( ! empty( $args['include']['custom'] ) || ! in_array( 'custom', $args['exclude'] ) ) {
			$image_sizes['custom'] = _x( 'Custom', 'Image Size Control', 'elementor' );
		}

		return $image_sizes;
	}

	/**
	 * @since 1.9.0
	 * @access protected
	 */
	protected function get_default_options() {
		return [
			'popover' => false,
		];
	}
}
