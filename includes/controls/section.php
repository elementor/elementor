<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Section extends Control_Base {

	public function get_type() {
		return 'section';
	}

	public function content_template() {
		?>
		<div class="elementor-panel-heading">
			<div class="elementor-panel-heading-toggle elementor-section-toggle" data-collapse_id="<% data.name %>">
				<i class="fa"></i>
			</div>
			<div class="elementor-panel-heading-title elementor-section-title"><%= data.label %></div>
		</div>
		<?php
	}

	protected function get_default_settings() {
		return [
			'separator' => 'none',
		];
	}
}
