<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Gallery extends Control_Base {

	public function get_type() {
		return 'gallery';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<div class="elementor-control-input-wrapper">
				<% if ( data.description ) { %>
				<div class="elementor-control-description"><%= data.description %></div>
				<% } %>
				<div class="elementor-control-media">
					<div class="elementor-control-media-upload-button">
						<button class="elementor-gallery-create-gallery elementor-button"><?php _e( 'Create A New Gallery', 'elementor' ); ?></button>
						<button class="elementor-gallery-add-gallery elementor-button"><?php _e( 'Add To Gallery', 'elementor' ); ?></button>
						<button class="elementor-gallery-edit-gallery elementor-button"><?php _e( 'Edit Gallery', 'elementor' ); ?></button>
					</div>
					<div class="elementor-control-media-image-area">
						<div class="elementor-control-media-image"></div>
					</div>
				</div>
			</div>
			<input type="hidden" data-setting="<%= data.name %>" />
		</div>
		<?php
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
		];
	}
}
