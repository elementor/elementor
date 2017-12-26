<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor slider control.
 *
 * A base control for creating slider control. Displays a draggable range slider.
 * The slider control can optionally have a number of unit types (`size_units`)
 * for the user to choose from. The control also accepts a range argument that
 * allows you to set the `min`, `max` and `step` values per unit type.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'width',
 *    	[
 *    		'label' => __( 'Width', 'plugin-domain' ),
 *    		'type' => Controls_Manager::SLIDER,
 *    		'default' => [
 *    			'size' => 1,
 *    		],
 *    		'size_units' => [ 'px', '%' ],
 *    		'range' => [
 *    			'px' => [
 *    				'min' => 0,
 *    				'max' => 1000,
 *    				'step' => 5,
 *    			],
 *    			'%' => [
 *    				'min' => 0,
 *    				'max' => 100,
 *    			],
 *    		],
 *    		'selectors' => [
 *    			'{{WRAPPER}} .box' => 'width: {{SIZE}}{{UNIT}};',
 *    		],
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    $width = $this->get_settings( 'width' );
 *    echo '<div style="width: ' . $width['size'] . $width['unit'] '"> ... </div>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <div style="width: {{ settings.width.size }}{{ settings.width.unit }}"> ... </div>';
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $title       Optional. The field title that appears on mouse
 *                            hover. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param array $default      {
 *     Optional. Defautl slider value.
 *
 *     @type int $size Optional. The initial size of slider. Default is empty.
 * }
 * @param array $size_units   Optional. An array of available CSS units like
 *                            'px', '%' and 'em'. Default is `[ 'px' ]`.
 *
 * @param array $range        {
 *     The range parameter is populated by default with ranges for each register
 *     size (e.g. px|em|rem|%|deg). @see Control_Base_Units::get_default_settings()
 *
 *     {
 *      @type integer $min  Optional.The minimum value of range.
 *      @type integer $max  Optional.The maximum value of range.
 *      @type integer $step Optional.The intervals value that will be incremented
 *                          or decremented when using the controls' spinners.
 *     },
 *     ...
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
 *                            separate line. Default is true.
 *
 * @return array {
 *     An array containing the size and the unit: `[ 'size' => '', 'unit' => '' ]`.
 *
 *     @type int    $size Selected size.
 *     @type string $unit Selected unit.
 * }
 */
class Control_Slider extends Control_Base_Units {

	/**
	 * Retrieve slider control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'slider';
	}

	/**
	 * Retrieve slider control default values.
	 *
	 * Get the default value of the slider control. Used to return the default
	 * values while initializing the slider control.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return array_merge(
			parent::get_default_value(), [
				'size' => '',
			]
		);
	}

	/**
	 * Retrieve slider control default settings.
	 *
	 * Get the default settings of the slider control. Used to return the
	 * default settings while initializing the slider control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return array_merge(
			parent::get_default_settings(), [
				'label_block' => true,
			]
		);
	}

	/**
	 * Render slider control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		$control_uid = $this->get_control_uid();
		?>
		<div class="elementor-control-field">
			<label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
			<?php $this->print_units_template(); ?>
			<div class="elementor-control-input-wrapper elementor-clearfix">
				<div class="elementor-slider"></div>
				<div class="elementor-slider-input">
					<input id="<?php echo $control_uid; ?>" type="number" min="{{ data.min }}" max="{{ data.max }}" step="{{ data.step }}" data-setting="size" />
				</div>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
