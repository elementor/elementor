<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

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
		<h3 class="elementor-control-title"><%= data.label %></h3>
		<?php
	}
}
