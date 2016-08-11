<?php
// Attention: DO NOT use this control since it has bugs
// TODO: This control is unused
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Select2 extends Control_Base {

	public function get_type() {
		return 'select2';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<select class="elementor-select2" data-setting="<%= data.name %>">
					<% _.each( data.options, function( option_title, option_value ) { %>
					<option value="<%= option_value %>"><%= option_title %></option>
					<% } ); %>
				</select>
			</div>
		</div>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
