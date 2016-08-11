<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Checkbox extends Control_Base {

	public function get_type() {
		return 'checkbox';
	}

	public function content_template() {
		?>
		<label class="elementor-control-title">
			<span><%= data.label %></span>
			<input type="checkbox" data-setting="<%= data.name %>" />
		</label>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
