<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Slider extends Control_Base_Units {

	public function get_type() {
		return 'slider';
	}

	public function get_default_value() {
		return array_merge( parent::get_default_value(), [
			'size' => '',
		] );
	}

	protected function get_default_settings() {
		return array_merge( parent::get_default_settings(), [
			'label_block' => true,
		] );
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">
				<%= data.label %>
				<?php $this->print_units_template(); ?>
			</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-slider"></div>
				<div class="elementor-slider-input">
					<input type="number" min="<%= data.min %>" max="<%= data.max %>" step="<%= data.step %>" data-setting="size" />
				</div>
			</div>
		</div>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
