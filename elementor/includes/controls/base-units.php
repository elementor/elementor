<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Control_Base_Units extends Control_Base_Multiple {

	public function get_default_value() {
		return [
			'unit' => 'px',
		];
	}

	protected function get_default_settings() {
		return [
			'size_units' => [ 'px' ],
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 100,
					'step' => 1,
				],
				'em' => [
					'min' => 0.1,
					'max' => 10,
					'step' => 0.1,
				],
				'rem' => [
					'min' => 0.1,
					'max' => 10,
					'step' => 0.1,
				],
				'%' => [
					'min' => 0,
					'max' => 100,
					'step' => 1,
				],
				'deg' => [
					'min' => 0,
					'max' => 360,
					'step' => 1,
				],
			],
		];
	}

	protected function print_units_template() {
		?>
		<% if ( data.size_units.length > 1 ) { %>
		<div class="elementor-units-choices">
			<% _.each( data.size_units, function( unit ) { %>
			<input id="elementor-choose-<%= data._cid + data.name + unit %>" type="radio" name="elementor-choose-<%= data.name %>" data-setting="unit" value="<%= unit %>">
			<label class="elementor-units-choices-label" for="elementor-choose-<%= data._cid + data.name + unit %>"><%= unit %></label>
			<% } ); %>
		</div>
		<% } %>
		<?php
	}
}
