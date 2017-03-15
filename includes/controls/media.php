<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A Media Chooser control. Based on the WordPress media library
 *
 * @param array  $default {
 * 		@type string  $url   Default empty
 * 		@type integer $id    Default empty
 * }
 *
 * @since 1.0.0
 */
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

	/**
	 * Fetch images and replace to new
	 *
	 * @param $settings
	 *
	 * @return array|bool
	 */
	public function on_import( $settings ) {
		if ( empty( $settings['url'] ) ) {
			return $settings;
		}

		$settings = Plugin::$instance->templates_manager->get_import_images_instance()->import( $settings );

		if ( ! $settings ) {
			$settings = [
				'id' => '',
				'url' => Utils::get_placeholder_image_src(),
			];
		}

		return $settings;
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
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-control-media">
					<div class="elementor-control-media-upload-button">
						<i class="fa fa-plus-circle"></i>
					</div>
					<div class="elementor-control-media-image-area">
						<div class="elementor-control-media-image" style="background-image: url({{ data.controlValue.url }});"></div>
						<div class="elementor-control-media-delete"><?php _e( 'Delete', 'elementor' ); ?></div>
					</div>
				</div>
			</div>
			<# if ( data.description ) { #>
				<div class="elementor-control-field-description">{{{ data.description }}}</div>
			<# } #>
			<input type="hidden" data-setting="{{ data.name }}" />
		</div>
		<?php
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
		];
	}

	public static function get_image_title( $attachment ) {
		if ( empty( $attachment['id'] ) )
			return '';

		return get_the_title( $attachment['id'] );
	}

	public static function get_image_alt( $instance ) {
		if ( empty( $instance['id'] ) )
			return '';

		$attachment_id = $instance['id'];
		if ( ! $attachment_id )
			return '';

		$attachment = get_post( $attachment_id );
		if ( ! $attachment )
			return '';

		$alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
		if ( ! $alt ) {
			$alt = $attachment->post_excerpt;
			if ( ! $alt ) {
				$alt = $attachment->post_title;
			}
		}
		return trim( strip_tags( $alt ) );
	}
}
