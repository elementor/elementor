<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A UI only control. Shows a collapsible header for a set of controls. text between controls
 * Do not use it directly, instead use: `$widget->start_controls_section()` and in the end `$widget->end_controls_section()`
 *
 * @since 1.0.0
 */
class Control_Section extends Control_Base {

	public function get_type() {
		return 'section';
	}

	public function content_template() {
		?>
		<div class="elementor-panel-heading">
			<div class="elementor-panel-heading-toggle elementor-section-toggle" data-collapse_id="{{ data.name }}">
				<i class="fa"></i>
			</div>
			<div class="elementor-panel-heading-title elementor-section-title">{{{ data.label }}}</div>
		</div>
		<?php
	}

	protected function get_default_settings() {
		return [
			'separator' => 'none',
		];
	}
}
