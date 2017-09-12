<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A UI only control. Start a controls popup.
 *
 * @param string $label   The label to show
 *
 * @since 1.8.0
 */
class Control_Popup_Starter extends Base_UI_Control {

	public function get_type() {
		return 'popup_starter';
	}

	protected function get_default_settings() {
		return [
			'toggle_title' => '',
		];
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-control-popup-starter-toggle">{{{ data.toggle_title }}}</div>
			</div>
		</div>
		<?php
	}
}
