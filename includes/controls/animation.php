<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Animation extends Control_Base {

	public function get_type() {
		return 'animation';
	}

	private static $_animations;

	public static function is_animations_enabled() {
		return 'yes' === get_option( 'elementor_disable_animations' );
	}

	public static function get_animations() {
		if ( null === self::$_animations ) {
			self::$_animations = [
				__( 'Attention Seekers', 'elementor' ) => [
					'bounce' => __( 'Bounce', 'elementor' ),
					'flash' => __( 'Flash', 'elementor' ),
					'pulse' => __( 'Pulse', 'elementor' ),
					'rubberBand' => __( 'Rubber Band', 'elementor' ),
					'shake' => __( 'Shake', 'elementor' ),
					'headShake' => __( 'Head Shake', 'elementor' ),
					'swing' => __( 'Swing', 'elementor' ),
					'tada' => __( 'Tada', 'elementor' ),
					'wobble' => __( 'Wobble', 'elementor' ),
					'jello' => __( 'Jello', 'elementor' ),
				],
				__( 'Bouncing', 'elementor' ) => [
					'bounceIn' => __( 'Bounce In', 'elementor' ),
					'bounceInDown' => __( 'Bounce In Down', 'elementor' ),
					'bounceInLeft' => __( 'Bounce In Left', 'elementor' ),
					'bounceInRight' => __( 'Bounce In Right', 'elementor' ),
					'bounceInUp' => __( 'Bounce In Up', 'elementor' ),
				],
				__( 'Fading', 'elementor' ) => [
					'fadeIn' => __( 'Fade In', 'elementor' ),
					'fadeInDown' => __( 'Fade In Down', 'elementor' ),
					'fadeInLeft' => __( 'Fade In Left', 'elementor' ),
					'fadeInRight' => __( 'Fade In Right', 'elementor' ),
					'fadeInUp' => __( 'Fade In Up', 'elementor' ),
				],
				__( 'Light Speed', 'elementor' ) => [
					'lightSpeedIn' => __( 'Light Speed In', 'elementor' ),
				],
				__( 'Rotating', 'elementor' ) => [
					'rotateIn' => __( 'Rotate In', 'elementor' ),
					'rotateInDownLeft' => __( 'Rotate In Down Left', 'elementor' ),
					'rotateInDownRight' => __( 'Rotate In Down Right', 'elementor' ),
					'rotateInUpLeft' => __( 'Rotate In Up Left', 'elementor' ),
					'rotateInUpRight' => __( 'Rotate In Up Right', 'elementor' ),
				],
				__( 'Specials', 'elementor' ) => [
					'rollIn' => __( 'Roll In', 'elementor' ),
				],
				__( 'Zooming', 'elementor' ) => [
					'zoomIn' => __( 'Zoom In', 'elementor' ),
					'zoomInDown' => __( 'Zoom In Down', 'elementor' ),
					'zoomInLeft' => __( 'Zoom In Left', 'elementor' ),
					'zoomInRight' => __( 'Zoom In Right', 'elementor' ),
					'zoomInUp' => __( 'Zoom In Up', 'elementor' ),
				],
				__( 'Sliding', 'elementor' ) => [
					'slideInDown' => __( 'Slide In Down', 'elementor' ),
					'slideInLeft' => __( 'Slide In Left', 'elementor' ),
					'slideInRight' => __( 'Slide In Right', 'elementor' ),
					'slideInUp' => __( 'Slide In Up', 'elementor' ),
				],
			];
		}

		return self::$_animations;
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<select data-setting="<%= data.name %>">
					<?php foreach ( self::get_animations() as $animations_group_name => $animations_group ) { ?>
						<option value=""><?php _e( 'None', 'elementor' ); ?></option>
						<optgroup label="<?php echo $animations_group_name; ?>">
							<?php foreach ( $animations_group  as $animation_name => $animation_title ) { ?>
								<option value="<?php echo $animation_name; ?>"><?php echo $animation_title; ?></option>
							<?php } ?>
						</optgroup>
					<?php } ?>
				</select>
			</div>
		</div>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
