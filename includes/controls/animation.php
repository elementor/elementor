<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Animation extends Control_Base {

	private static $_animations;

	public function get_type() {
		return 'animation';
	}

	public static function is_animations_enabled() {
		return 'yes' !== get_option( 'elementor_disable_animations' );
	}

	public static function get_animations() {
		if ( null === self::$_animations ) {
			self::$_animations = [
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
				'Bouncing' => [
					'bounceIn' => 'Bounce In',
					'bounceInDown' => 'Bounce In Down',
					'bounceInLeft' => 'Bounce In Left',
					'bounceInRight' => 'Bounce In Right',
					'bounceInUp' => 'Bounce In Up',
				],
				'Fading' => [
					'fadeIn' => 'Fade In',
					'fadeInDown' => 'Fade In Down',
					'fadeInLeft' => 'Fade In Left',
					'fadeInRight' => 'Fade In Right',
					'fadeInUp' => 'Fade In Up',
				],
				'Light Speed' => [
					'lightSpeedIn' => 'Light Speed In',
				],
				'Rotating' => [
					'rotateIn' => 'Rotate In',
					'rotateInDownLeft' => 'Rotate In Down Left',
					'rotateInDownRight' => 'Rotate In Down Right',
					'rotateInUpLeft' => 'Rotate In Up Left',
					'rotateInUpRight' => 'Rotate In Up Right',
				],
				'Specials' => [
					'rollIn' => 'Roll In',
				],
				'Zooming' => [
					'zoomIn' => 'Zoom In',
					'zoomInDown' => 'Zoom In Down',
					'zoomInLeft' => 'Zoom In Left',
					'zoomInRight' => 'Zoom In Right',
					'zoomInUp' => 'Zoom In Up',
				],
				'Sliding' => [
					'slideInDown' => 'Slide In Down',
					'slideInLeft' => 'Slide In Left',
					'slideInRight' => 'Slide In Right',
					'slideInUp' => 'Slide In Up',
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
					<option value=""><?php _e( 'None', 'elementor' ); ?></option>
					<?php foreach ( self::get_animations() as $animations_group_name => $animations_group ) : ?>
						<optgroup label="<?php echo $animations_group_name; ?>">
							<?php foreach ( $animations_group  as $animation_name => $animation_title ) : ?>
								<option value="<?php echo $animation_name; ?>"><?php echo $animation_title; ?></option>
							<?php endforeach; ?>
						</optgroup>
					<?php endforeach; ?>
				</select>
			</div>
		</div>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
