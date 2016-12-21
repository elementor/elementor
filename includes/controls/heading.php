<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A UI only control. Show a text heading between controls.
 *
 * @param string $label   The label to show
 *
 * @since 1.0.0
 */
class Control_Heading extends Control_Base {

	public function get_type() {
		return 'heading';
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
		];
	}

	public function content_template() {
		?>
		<h3 class="elementor-control-title">{{ data.label }}</h3>
		<?php
	}
}
