<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Image_Dimensions extends Control_Base_Multiple {

	public function get_type() {
		return 'image_dimensions';
	}

	public function get_default_value() {
		return [
			'width' => '',
			'height' => '',
		];
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
		];
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<input type="text" data-setting="width" />
				x
				<input type="text" data-setting="height" />
				
				<button class="elementor-image-dimensions-apply-button"><?php _e( 'Apply', 'elementor' ); ?></button>
			</div>
		</div>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
