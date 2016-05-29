<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Choose extends Control_Base {

	public function get_type() {
		return 'choose';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-choices">
					<% _.each( data.options, function( options, value ) { %>
					<input id="elementor-choose-<%= data._cid + data.name + value %>" type="radio" name="elementor-choose-<%= data.name %>" value="<%= value %>">
					<label class="elementor-choices-label tooltip-target" for="elementor-choose-<%= data._cid + data.name + value %>" data-tooltip="<%= options.title %>" title="<%= options.title %>">
						<i class="fa fa-<%= options.icon %>"></i>
					</label>
					<% } ); %>
				</div>
			</div>
		</div>

		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}

	protected function get_default_settings() {
		return [
			'toggle' => true,
		];
	}
}
