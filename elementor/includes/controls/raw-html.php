<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Raw_html extends Control_Base {

	public function get_type() {
		return 'raw_html';
	}

	public function content_template() {
		?>
		<% if ( data.label ) { %>
		<span class="elementor-control-title"><%= data.label %></span>
		<% } %>
		<div class="elementor-control-raw-html <%- data.classes %>"><%= data.raw %></div>
		<?php
	}

	public function get_default_settings() {
		return [
			'classes' => '',
		];
	}
}
