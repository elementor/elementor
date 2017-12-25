<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor dimension control.
 *
 * A base control for creating dimension control. Displays input fields for top,
 * right, bottom, left and the option to link them together.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'margin',
 *    	[
 *    		'label' => __( 'Margin', 'plugin-domain' ),
 *    		'type' => Controls_Manager::DIMENSIONS,
 *    		'size_units' => [ 'px', '%', 'em' ],
 *    		'selectors' => [
 *    			'{{WRAPPER}} .your-class' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
 *    		],
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    echo '<div class="your-class"> ... </div>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <div class="your-class"> ... </div>
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
 *     Optional. Defautl dimension values.
 *
 *     @type int    $top      Optional. Top dimension. Default is empty.
 *     @type int    $right    Optional. Right dimension. Default is empty.
 *     @type int    $bottom   Optional. Bottom dimension. Default is empty.
 *     @type int    $left     Optional. Left dimension. Default is empty.
 *     @type string $unit     Optional. The CSS unit type. Available units are
 *                            '%', 'px', 'em', 'rem' or 'deg'. Default is 'px'.
 *     @type bool   $isLinked Optional. Whether to link all the values together
 *                            or not. Used to prevent setting different values
 *                            foreach dimension location (top, right, bottom,
 *                            left). Default is true, all the dimension are linked.
 * }
 * @param array|string $allowed_dimensions Optional. Which fields to show.
 *                                         Available values are 'all',
 *                                         'horizontal', 'vertical',
 *                                         [ 'top', 'left' ... ]. Default is 'all'.
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
 *     An array containing the dimensions values - top / right / bottom / left:
 *     `[ 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'unit' => '', 'isLinked' => '' ]`.
 *
 *     @type int    $top      Top dimension.
 *     @type int    $right    Right dimension.
 *     @type int    $bottom   Bottom dimension.
 *     @type int    $left     Left dimension.
 *     @type string $unit     The CSS unit type.
 *     @type bool   $isLinked Whether to link all the values together or not.
 * }
 */
class Control_Dimensions extends Control_Base_Units {

	/**
	 * Retrieve dimensions control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'dimensions';
	}

	/**
	 * Retrieve dimensions control default values.
	 *
	 * Get the default value of the dimensions control. Used to return the
	 * default values while initializing the dimensions control.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return array_merge(
			parent::get_default_value(), [
				'top' => '',
				'right' => '',
				'bottom' => '',
				'left' => '',
				'isLinked' => true,
			]
		);
	}

	/**
	 * Retrieve dimensions control default settings.
	 *
	 * Get the default settings of the dimensions control. Used to return the
	 * default settings while initializing the dimensions control.
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
				'allowed_dimensions' => 'all',
				'placeholder' => '',
			]
		);
	}

	/**
	 * Render dimensions control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		$dimensions = [
			'top' => __( 'Top', 'elementor' ),
			'right' => __( 'Right', 'elementor' ),
			'bottom' => __( 'Bottom', 'elementor' ),
			'left' => __( 'Left', 'elementor' ),
		];
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<?php $this->print_units_template(); ?>
			<div class="elementor-control-input-wrapper">
				<ul class="elementor-control-dimensions">
					<?php
					foreach ( $dimensions as $dimension_key => $dimension_title ) :
						$control_uid = $this->get_control_uid( $dimension_key );
						?>
						<li class="elementor-control-dimension">
							<input id="<?php echo $control_uid; ?>" type="number" data-setting="<?php echo esc_attr( $dimension_key ); ?>"
								   placeholder="<#
							   if ( _.isObject( data.placeholder ) ) {
								if ( ! _.isUndefined( data.placeholder.<?php echo $dimension_key; ?> ) ) {
									print( data.placeholder.<?php echo $dimension_key; ?> );
								}
							   } else {
								print( data.placeholder );
							   } #>"
							<# if ( -1 === _.indexOf( allowed_dimensions, '<?php echo $dimension_key; ?>' ) ) { #>
								disabled
								<# } #>
									/>
							<label for="<?php echo $control_uid; ?>" class="elementor-control-dimension-label"><?php echo $dimension_title; ?></label>
						</li>
					<?php endforeach; ?>
					<li>
						<button class="elementor-link-dimensions tooltip-target" data-tooltip="<?php _e( 'Link values together', 'elementor' ); ?>">
							<span class="elementor-linked">
								<i class="fa fa-link" aria-hidden="true"></i>
								<span class="elementor-screen-only"><?php esc_html_e( 'Link values together', 'elementor' ); ?></span>
							</span>
							<span class="elementor-unlinked">
								<i class="fa fa-chain-broken" aria-hidden="true"></i>
								<span class="elementor-screen-only"><?php esc_html_e( 'Unlinked values', 'elementor' ); ?></span>
							</span>
						</button>
					</li>
				</ul>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
