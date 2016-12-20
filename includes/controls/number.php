<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A media chooser control. Based on the WordPress media library
 *
 * @param integer $default  The default value
 *                          Default empty
 * @param integer $min      The minimum number (it's only affect the spinners, But the user can enter a lower value)
 *                          Default empty
 * @param integer $max      The maximum number (it's only affect the spinners, But the user can enter a bigger value)
 *                          Default empty
 * @param integer $step     The intervals for the scroll bars
 *                          Default empty (The value will be incremented by 1)
 *
 * @since 1.0.0
 */
class Control_Number extends Control_Base {

	public function get_type() {
		return 'number';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<input type="number" min="{{ data.min }}" max="{{ data.max }}" step="{{ data.step }}" class="tooltip-target" data-tooltip="{{ data.title }}" title="{{ data.title }}" data-setting="{{ data.name }}" placeholder="{{ data.placeholder }}" />
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
