<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Wysiwyg extends Control_Base {

	public function get_type() {
		return 'wysiwyg';
	}

	public function content_template() {
		?>
		<label>
			<span class="elementor-control-title"><%= data.label %></span>
			<textarea data-setting="<%= data.name %>"></textarea>
		</label>
		<?php
	}
}
