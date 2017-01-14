<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A UI only control. Shows a tab header for a set of controls.
 * Do not use it directly, instead use: `$widget->start_controls_tab()` and in the end `$widget->end_controls_tab()`
 *
 * @since 1.0.0
 */
class Control_Tab extends Control_Base {

	public function get_type() {
		return 'tab';
	}

	public function content_template() {
		?>
			<div class="elementor-panel-tab-heading">
				{{{ data.label }}}
			</div>
		<?php
	}

	protected function get_default_settings() {
		return [
			'separator' => 'none',
		];
	}
}
