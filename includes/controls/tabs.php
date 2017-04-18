<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A UI only control. Render a tabs header for `tab` controls
 * Do not use it directly, instead use: `$widget->start_controls_tabs()` and in the end `$widget->end_controls_tabs()`
 *
 * @since 1.0.0
 */
class Control_Tabs extends Base_UI_Control {

	public function get_type() {
		return 'tabs';
	}

	public function content_template() {}

	protected function get_default_settings() {
		return [
			'separator' => 'none',
		];
	}
}
