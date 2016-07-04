<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Time extends Control_Base_Multiple {

	public function get_type() {
		return 'time';
	}

	protected function get_default_settings() {
		$padded = array( '00','01','02','03','04','05','06','07','08','09' );

		return [
			'label_block' => false,
			'hours' => array_merge( $padded,range( 10, 23 ) ),
			'minutes' => array_merge( $padded, range( 10, 59 ) ),
		];
	}

	public function content_template() {
		?>
		<div class="elementor-control-field elementor-control-time">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<select class="elementor-control-time-hours">
					<% _.each( data.hours, function( hour ) { %>
						<option value="<%- hour %>"><%= hour %></option>
					<% } ); %>
				</select>
				<select class="elementor-control-time-minutes">
					<% _.each( data.minutes, function( minute ) { %>
						<option value="<%- minute %>"><%= minute %></option>
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
