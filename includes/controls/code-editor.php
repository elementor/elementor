<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Code_Editor extends Control_Base {

	public function get_type() {
		return 'code_editor';
	}

	function get_default_settings() {
		return [
			'label_block' => true,
			'language' => 'html', // html / css
		];
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<pre style="height: 160px;" class="elementor-input-style elementor-code-editor" data-setting="{{ data.name }}"></pre>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
