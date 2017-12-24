<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor gallery control.
 *
 * A base control for creating gallery chooser control. Based on the WordPress
 * media library galleries. Used to select images from the WordPress media library.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'gallery',
 *    	[
 *    		'label' => __( 'Add Images', 'plugin-domain' ),
 *    		'type' => Controls_Manager::GALLERY,
 *    		'default' => [],
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    $images = $this->get_settings( 'gallery' );
 *    foreach ( $images as $image ) {
 *    	echo '<img src="' . $image['url'] . '">';
 *    }
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <# _.each( settings.gallery, function( image ) { #>
 *    	<img src="{{ image.url }}">
 *    <# }); #>
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $title       Optional. The field title that appears on mouse
 *                            hover. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param array $default      {
 *     Optional. Defautl gallery images. An array of images containing the image
 *     ID and URL: `[ [ 'id' => '', 'url' => '' ], [ 'id' => '', 'url' => '' ], ... ]`
 *     Default is an empty array.
 *
 *     @type int    $id  Optional. Image id. Default is empty.
 *     @type string $url Optional. Image url. Default is empty.
 * }
 * @param string $separator   Optional. Set the position of the control separator.
 *                            Available values are 'default', 'before', 'after'
 *                            and 'none'. 'default' will position the separator
 *                            depending on the control type. 'before' / 'after'
 *                            will position the separator before/after the
 *                            control. 'none' will hide the separator. Default
 *                            is 'none'.
 * @param bool   $show_label  Optional. Whether to display the label. Default is
 *                            true.
 * @param bool   $label_block Optional. Whether to display the label in a
 *                            separate line. Default is true.
 *
 * @return array {
 *     An array of arrays containing the ID and URL for each image:
 *     `[ [ 'id' => '', 'url' => '' ], [ 'id' => '', 'url' => '' ], ... ]`
 *
 *     @type int    $id  Media id.
 *     @type string $url Media url.
 * }
 */
class Control_Gallery extends Base_Data_Control {

	/**
	 * Retrieve gallery control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'gallery';
	}

	/**
	 * Import gallery images.
	 *
	 * Used to import gallery control files from external sites while importing
	 * Elementor template JSON file, and replacing the old data.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $settings Control settings
	 *
	 * @return array Control settings.
	 */
	public function on_import( $settings ) {
		foreach ( $settings as &$attachment ) {
			if ( empty( $attachment['url'] ) ) {
				continue;
			}

			$attachment = Plugin::$instance->templates_manager->get_import_images_instance()->import( $attachment );
		}

		// Filter out attachments that don't exist
		$settings = array_filter( $settings );

		return $settings;
	}

	/**
	 * Render gallery control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		?>
		<div class="elementor-control-field">
			<div class="elementor-control-input-wrapper">
				<# if ( data.description ) { #>
				<div class="elementor-control-field-description">{{{ data.description }}}</div>
				<# } #>
				<div class="elementor-control-media">
					<div class="elementor-control-gallery-status">
						<span class="elementor-control-gallery-status-title">
							<# if ( data.controlValue.length ) {
								print( elementor.translate( 'gallery_images_selected', [ data.controlValue.length ] ) );
							} else { #>
								<?php _e( 'No Images Selected', 'elementor' ); ?>
							<# } #>
						</span>
						<span class="elementor-control-gallery-clear">(<?php _e( 'Clear', 'elementor' ); ?>)</span>
					</div>
					<div class="elementor-control-gallery-thumbnails">
						<# _.each( data.controlValue, function( image ) { #>
							<div class="elementor-control-gallery-thumbnail" style="background-image: url({{ image.url }})"></div>
						<# } ); #>
					</div>
					<button class="elementor-button elementor-control-gallery-add"><?php _e( '+ Add Images', 'elementor' ); ?></button>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Retrieve gallery control default settings.
	 *
	 * Get the default settings of the gallery control. Used to return the
	 * default settings while initializing the gallery control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'label_block' => true,
			'separator' => 'none',
		];
	}

	/**
	 * Retrieve gallery control default values.
	 *
	 * Get the default value of the gallery control. Used to return the default
	 * values while initializing the gallery control.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [];
	}
}
