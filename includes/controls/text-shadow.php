<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor text shadow control.
 *
 * A base control for creating text shadows control. Displays input fields for
 * horizontal shadow, vertical shadow, shadow blur and shadow color.
 *
 * @since 1.6.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param string $placeholder Optional. The field placeholder that appears when
 *                            the field has no values. Default is empty.
 * @param array $default      {
 *     Optional. Defautl text shadow values.
 *
 *     @type int    $horizontal Optional. Horizontal shadow. Default is 0.
 *     @type int    $vertical   Optional. Vertical shadow. Default is 0.
 *     @type int    $blur       Optional. Shadow blur. Default is 10.
 *     @type string $color      Optional. Shadow color. Available values are
 *                              `rgb`, `rgba`, `hex` or `format`. Default is
 *                              `rgba(0,0,0,0.3)`.
 * }
 * @param string $separator   Optional. Set the position of the control separator.
 *                            Available values are 'default', 'before', 'after'
 *                            and 'none'. 'default' will position the separator
 *                            depending on the control type. 'before' / 'after'
 *                            will position the separator before/after the
 *                            control. 'none' will hide the separator. Default
 *                            is 'default'.
 * @param bool   $show_label  Optional. Whether to display the label. Default is
 *                            true.
 * @param bool   $label_block Optional. Whether to display the label in a
 *                            separate line. Default is false.
 *
 * @return array {
 *     Text shadow values.
 *
 *     @type int    $horizontal Horizontal shadow.
 *     @type int    $vertical   Vertical shadow.
 *     @type int    $blur       Shadow blur.
 *     @type string $color      Shadow color.
 * }
 */
class Control_Text_Shadow extends Control_Base_Multiple {

	/**
	 * Retrieve text shadow control type.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'text_shadow';
	}

	/**
	 * Retrieve text shadow control default values.
	 *
	 * Get the default value of the text shadow control. Used to return the
	 * default values while initializing the text shadow control.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [
			'horizontal' => 0,
			'vertical' => 0,
			'blur' => 10,
			'color' => 'rgba(0,0,0,0.3)',
		];
	}

	/**
	 * Retrieve text shadow control sliders.
	 *
	 * Get the sliders of the text shadow control. Sliders are used while
	 * rendering the control output in the editor.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @return array Control sliders.
	 */
	public function get_sliders() {
		return [
			'blur' => [
				'label' => __( 'Blur', 'elementor' ),
				'min' => 0,
				'max' => 100,
			],
			'horizontal' => [
				'label' => __( 'Horizontal', 'elementor' ),
				'min' => -100,
				'max' => 100,
			],
			'vertical' => [
				'label' => __( 'Vertical', 'elementor' ),
				'min' => -100,
				'max' => 100,
			],
		];
	}

	/**
	 * Render text shadow control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.6.0
	 * @access public
	 */
	public function content_template() {
		?>
		<#
		var defaultColorValue = '';

		if ( data.default.color ) {
			defaultColorValue = ' data-default-color=' + data.default.color; // Quotes added automatically.
		}
		#>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><?php _e( 'Color', 'elementor' ); ?></label>
			<div class="elementor-control-input-wrapper">
				<input data-setting="color" class="elementor-shadow-color-picker" type="text" placeholder="<?php echo esc_attr( 'Hex/rgba', 'elementor' ); ?>" data-alpha="true"{{{ defaultColorValue }}} />
			</div>
		</div>
		<?php
		foreach ( $this->get_sliders() as $slider_name => $slider ) :
			$control_uid = $this->get_control_uid( $slider_name );
			?>
			<div class="elementor-shadow-slider">
				<label for="<?php echo $control_uid; ?>" class="elementor-control-title"><?php echo $slider['label']; ?></label>
				<div class="elementor-control-input-wrapper">
					<div class="elementor-slider" data-input="<?php echo $slider_name; ?>"></div>
					<div class="elementor-slider-input">
						<input id="<?php echo $control_uid; ?>" type="number" min="<?php echo $slider['min']; ?>" max="<?php echo $slider['max']; ?>" data-setting="<?php echo $slider_name; ?>"/>
					</div>
				</div>
			</div>
		<?php endforeach; ?>
		<?php
	}
}
