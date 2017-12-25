<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor animation control.
 *
 * A base control for creating entrance animation control. Displays a select box
 * with the available entrance animation effects @see Control_Animation::get_animations()
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'animation',
 *    	[
 *    		'label' => __( 'Entrance Animation', 'plugin-domain' ),
 *    		'type' => Controls_Manager::ANIMATION,
 *    		'prefix_class' => 'animated ',
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    echo '<div class="' . $this->get_settings( 'animation' ) . '"> ... </div>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <div class="{{ settings.animation }}"> ... </div>
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param string $default     Optional. The selected animation key. Default is
 *                            empty.
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
 */
class Control_Animation extends Base_Data_Control {

	/**
	 * List of animations.
	 *
	 * Holds the list of all the available animations.
	 *
	 * @access private
	 * @static
	 *
	 * @var array
	 */
	private static $_animations;

	/**
	 * Retrieve control type.
	 *
	 * Get the animation control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'animation';
	}

	/**
	 * Retrieve animations list.
	 *
	 * Get the list of all the available animations.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public static function get_animations() {
		if ( is_null( self::$_animations ) ) {
			self::$_animations = [
				'Fading' => [
					'fadeIn' => 'Fade In',
					'fadeInDown' => 'Fade In Down',
					'fadeInLeft' => 'Fade In Left',
					'fadeInRight' => 'Fade In Right',
					'fadeInUp' => 'Fade In Up',
				],
				'Zooming' => [
					'zoomIn' => 'Zoom In',
					'zoomInDown' => 'Zoom In Down',
					'zoomInLeft' => 'Zoom In Left',
					'zoomInRight' => 'Zoom In Right',
					'zoomInUp' => 'Zoom In Up',
				],
				'Bouncing' => [
					'bounceIn' => 'Bounce In',
					'bounceInDown' => 'Bounce In Down',
					'bounceInLeft' => 'Bounce In Left',
					'bounceInRight' => 'Bounce In Right',
					'bounceInUp' => 'Bounce In Up',
				],
				'Sliding' => [
					'slideInDown' => 'Slide In Down',
					'slideInLeft' => 'Slide In Left',
					'slideInRight' => 'Slide In Right',
					'slideInUp' => 'Slide In Up',
				],
				'Rotating' => [
					'rotateIn' => 'Rotate In',
					'rotateInDownLeft' => 'Rotate In Down Left',
					'rotateInDownRight' => 'Rotate In Down Right',
					'rotateInUpLeft' => 'Rotate In Up Left',
					'rotateInUpRight' => 'Rotate In Up Right',
				],
				'Attention Seekers' => [
					'bounce' => 'Bounce',
					'flash' => 'Flash',
					'pulse' => 'Pulse',
					'rubberBand' => 'Rubber Band',
					'shake' => 'Shake',
					'headShake' => 'Head Shake',
					'swing' => 'Swing',
					'tada' => 'Tada',
					'wobble' => 'Wobble',
					'jello' => 'Jello',
				],
				'Light Speed' => [
					'lightSpeedIn' => 'Light Speed In',
				],
				'Specials' => [
					'rollIn' => 'Roll In',
				],
			];
		}

		return self::$_animations;
	}

	/**
	 * Render animations control template.
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
			<div class="elementor-control-input-wrapper">
				<select id="<?php echo $control_uid; ?>" data-setting="{{ data.name }}">
					<option value=""><?php _e( 'None', 'elementor' ); ?></option>
					<?php foreach ( self::get_animations() as $animations_group_name => $animations_group ) : ?>
						<optgroup label="<?php echo $animations_group_name; ?>">
							<?php foreach ( $animations_group as $animation_name => $animation_title ) : ?>
								<option value="<?php echo $animation_name; ?>"><?php echo $animation_title; ?></option>
							<?php endforeach; ?>
						</optgroup>
					<?php endforeach; ?>
				</select>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
