<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Text extends Control_Base {

	public function get_type() {
		return 'text';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<input type="text" class="tooltip-target" data-tooltip="<%- data.title %>" title="<%- data.title %>" data-setting="<%- data.name %>" placeholder="<%- data.placeholder %>" />
			</div>
		</div>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
