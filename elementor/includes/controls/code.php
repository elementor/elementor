<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Code extends Control_Base {

	public function get_type() {
		return 'code';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<textarea rows="<%= data.rows || 5 %>" data-setting="<%= data.name %>" placeholder="<%= data.placeholder %>"></textarea>
			</div>
		</div>
		<?php
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
		];
	}
}
