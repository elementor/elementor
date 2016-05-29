<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Media extends Control_Base_Multiple {

	public function get_type() {
		return 'media';
	}

	public function get_default_value() {
		return [
			'url' => '',
			'id' => '',
		];
	}

	public function enqueue() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
		wp_enqueue_media();

		wp_enqueue_style(
			'media',
			admin_url( '/css/media' . $suffix . '.css' )
		);

		wp_register_script(
			'image-edit',
			admin_url( '/js/image-edit' . $suffix . '.js' ),
			[
				'jquery',
				'json2',
				'imgareaselect',
			],
			false,
			true
		);

		wp_enqueue_script( 'image-edit' );
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<% if ( data.description ) { %>
				<div class="elementor-control-description"><%= data.description %></div>
				<% } %>
				<div class="elementor-control-media">
					<div class="elementor-control-media-upload-button">
						<i class="fa fa-plus-circle"></i>
					</div>
					<div class="elementor-control-media-image-area">
						<div class="elementor-control-media-image" style="background-image: url(<%= data.controlValue.url %>);"></div>
						<div class="elementor-control-media-delete"><?php _e( 'Delete', 'elementor' ); ?></div>
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
