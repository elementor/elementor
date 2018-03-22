<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A UI only control. Show a divider between controls
 *
 * @since 1.0.0
 */

class Control_Divider extends Base_UI_Control {

	public function get_type() {
		return 'divider';
	}

	protected function get_default_settings() {
		return [
			'style' => 'default',
			'separator' => 'none',
		];
	}

	public function content_template() {
		?>
		<hr class="elementor-divider-style--{{ data.style }}">
		<?php
	}
}
