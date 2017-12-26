<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor image dimensions control.
 *
 * A base control for creating image dimension control. Displays image width
 * input, image height input and an apply button.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'custom_dimension',
 *    	[
 *    		'label' => __( 'Image Dimension', 'plugin-domain' ),
 *    		'type' => Controls_Manager::IMAGE_DIMENSIONS,
 *    		'description' => __( 'Crop the original image size to any custom size. Set custom width or height to keep the original size ratio.', 'plugin-domain' ),
 *    	]
 *    );
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param string $placeholder Optional. The field placeholder that appears when
 *                            the field has no values. Default is empty.
 * @param array  $default     {
 *     Optional. Defautl image dimension values.
 *
 *     @type int $width  Optional. Image width. Default is empty.
 *     @type int $height Optional. Image height. Default is empty.
 * }
 * @param string $separator   Optional. Set the position of the control separator.
 *                            Available values are 'default', 'before', 'after'
 *                            and 'none'. 'default' will position the separator
 *                            depending on the control type. 'before' / 'after'
 *                            will position the separator before/after the
 *                            control. 'none' will hide the separator. Default
 *                            is 'default'.
 * @param bool   $show_label  Optional. Whether to display the label. Default is
 *                            false.
 * @param bool   $label_block Optional. Whether to display the label in a
 *                            separate line. Default is true.
 *
 * @return array {
 *     An array containing the image dimension values - width and height:
 *     `[ 'width' => '', 'height' => '' ]`.
 *
 *     @type int $width  Optional. Image width.
 *     @type int $height Optional. Image height.
* }
 */
class Control_Image_Dimensions extends Control_Base_Multiple {

	/**
	 * Retrieve image dimensions control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'image_dimensions';
	}

	/**
	 * Retrieve image dimensions control default values.
	 *
	 * Get the default value of the image dimensions control. Used to return the
	 * default values while initializing the image dimensions control.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [
			'width' => '',
			'height' => '',
		];
	}

	/**
	 * Retrieve image dimensions control default settings.
	 *
	 * Get the default settings of the image dimensions control. Used to return
	 * the default settings while initializing the image dimensions control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'show_label' => false,
			'label_block' => true,
		];
	}

	/**
	 * Render image dimensions control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		if ( ! $this->_is_image_editor_supports() ) : ?>
			<div class="elementor-panel-alert elementor-panel-alert-danger">
				<?php _e( 'The server does not have ImageMagick or GD installed and/or enabled! Any of these libraries are required for WordPress to be able to resize images. Please contact your server administrator to enable this before continuing.', 'elementor' ); ?>
			</div>
		<?php
			return;
		endif;
		?>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-image-dimensions-field">
					<?php $control_uid = $this->get_control_uid( 'width' ); ?>
					<input id="<?php echo $control_uid; ?>" type="text" data-setting="width" />
					<label for="<?php echo $control_uid; ?>" class="elementor-image-dimensions-field-description"><?php _e( 'Width', 'elementor' ); ?></label>
				</div>
				<div class="elementor-image-dimensions-separator">x</div>
				<div class="elementor-image-dimensions-field">
					<?php $control_uid = $this->get_control_uid( 'height' ); ?>
					<input id="<?php echo $control_uid; ?>" type="text" data-setting="height" />
					<label for="<?php echo $control_uid; ?>" class="elementor-image-dimensions-field-description"><?php _e( 'Height', 'elementor' ); ?></label>
				</div>
				<button class="elementor-button elementor-button-success elementor-image-dimensions-apply-button"><?php _e( 'Apply', 'elementor' ); ?></button>
			</div>
		</div>
		<?php
	}

	/**
	 * Image editor support.
	 *
	 * Used to determine whether the editor supports a given image mime-type.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @return bool Whether the editor supports the given mime-type.
	 */
	private function _is_image_editor_supports() {
		$arg = [
			'mime_type' => 'image/jpeg',
		];
		return ( wp_image_editor_supports( $arg ) );
	}
}
