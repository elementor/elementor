<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * An Hover Animation effect select box control.
 * @see Control_Hover_Animation::get_animations() fot all available animations.
 *
 * @param string $default     The selected effect key
 *                            Default empty
 *
 * @since 1.0.0
 */
class Control_Hover_Animation extends Control_Base {

	private static $_animations;

	public function get_type() {
		return 'hover_animation';
	}

	public static function get_animations() {
		if ( is_null( self::$_animations ) ) {
			self::$_animations = [
				'grow' => 'Grow',
				'shrink' => 'Shrink',
				'pulse' => 'Pulse',
				'pulse-grow' => 'Pulse Grow',
				'pulse-shrink' => 'Pulse Shrink',
				'push' => 'Push',
				'pop' => 'Pop',
				'bounce-in' => 'Bounce In',
				'bounce-out' => 'Bounce Out',
				'rotate' => 'Rotate',
				'grow-rotate' => 'Grow Rotate',
				'float' => 'Float',
				'sink' => 'Sink',
				'bob' => 'Bob',
				'hang' => 'Hang',
				'skew' => 'Skew',
				'skew-forward' => 'Skew Forward',
				'skew-backward' => 'Skew Backward',
				'wobble-vertical' => 'Wobble Vertical',
				'wobble-horizontal' => 'Wobble Horizontal',
				'wobble-to-bottom-right' => 'Wobble To Bottom Right',
				'wobble-to-top-right' => 'Wobble To Top Right',
				'wobble-top' => 'Wobble Top',
				'wobble-bottom' => 'Wobble Bottom',
				'wobble-skew' => 'Wobble Skew',
				'buzz' => 'Buzz',
				'buzz-out' => 'Buzz Out',
			];
		}

		return self::$_animations;
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<select data-setting="{{ data.name }}">
					<option value=""><?php _e( 'None', 'elementor' ); ?></option>
					<?php foreach ( self::get_animations() as $animation_name => $animation_title ) : ?>
						<option value="<?php echo $animation_name; ?>"><?php echo $animation_title; ?></option>
					<?php endforeach; ?>
				</select>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
		];
	}
}
