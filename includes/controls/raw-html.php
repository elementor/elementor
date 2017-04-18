<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A UI only control. Show HTML markup between controls
 *
 * @param string $raw     The HTML markup
 *                        Default empty
 * @param string $classes Additional classes for the HTML wrapper
 *                        Default empty
 *
 * @since 1.0.0
 */
class Control_Raw_Html extends Base_UI_Control {

	public function get_type() {
		return 'raw_html';
	}

	public function content_template() {
		?>
		<# if ( data.label ) { #>
		<span class="elementor-control-title">{{{ data.label }}}</span>
		<# } #>
		<div class="elementor-control-raw-html {{ data.content_classes }}">{{{ data.raw }}}</div>
		<?php
	}

	public function get_default_settings() {
		return [
			'content_classes' => '',
		];
	}
}
