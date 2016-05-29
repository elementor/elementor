<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Textarea extends Control_Base {

	public function get_type() {
		return 'textarea';
	}

	public function content_template() {
		?>
		<label>
			<span class="elementor-control-title"><%= data.label %></span>
			<textarea rows="<%= data.rows || 5 %>" data-setting="<%= data.name %>" placeholder="<%= data.placeholder %>"></textarea>
		</label>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
