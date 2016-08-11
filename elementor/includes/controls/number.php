<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Number extends Control_Base {

	public function get_type() {
		return 'number';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<input type="number" min="<%= data.min %>" max="<%= data.max %>" step="<%= data.step %>" class="tooltip-target" data-tooltip="<%= data.title %>" title="<%= data.title %>" data-setting="<%= data.name %>" placeholder="<%= data.placeholder %>" />
			</div>
		</div>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
