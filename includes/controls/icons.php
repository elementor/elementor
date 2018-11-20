<?php
namespace Elementor;

use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor media control.
 *
 * A base control for creating a media chooser control. Based on the WordPress
 * media library. Used to select an image from the WordPress media library.
 *
 * @since 1.0.0
 */
class Control_Icons extends Control_Base_Multiple {

	/**
	 * Tabs.
	 *
	 * Holds the list of all the tabs.
	 *
	 * @access private
	 * @static
	 *
	 * @var array
	 */
	private static $tabs;

	/**
	 * Get media control type.
	 *
	 * Retrieve the control type, in this case `media`.
	 *
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'icons';
	}

	/**
	 * Get media control default values.
	 *
	 * Retrieve the default value of the Icons control. Used to return the default
	 * values while initializing the Icons control.
	 *
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [
			'value'   => '',
			'library' => '',
		];
	}

	/**
	 * Enqueue media control scripts and styles.
	 *
	 * Used to register and enqueue custom scripts and styles used by the media
	 * control.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function enqueue() {
		global $wp_version;

		wp_enqueue_style( 'FA5', 'https://use.fontawesome.com/releases/v5.0.7/css/all.css' );
	}

	/**
	 * Render media control output in the editor.
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
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-control-icons elementor-control-tag-area elementor-control-preview-area elementor-aspect-ratio-169">
					<div class="elementor-control-icons-upload-button">
						<i class="fa fa-plus-circle" aria-hidden="true"></i>
					</div>
					<div class="elementor-control-icons-area">
						<div class="elementor-control-icons-preview"></div>
						<div class="elementor-control-media-delete"><?php echo __( 'Delete', 'elementor' ); ?></div>
					</div>
				</div>
			</div>
			<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
			<# } #>
			<input type="hidden" data-setting="{{ data.name }}"/>
		</div>
		<?php
	}

	private static function init_tabs() {
		self::$tabs = [
			'fontawesome5' => __( 'FontAwesome', 'elementor' ),
		];
	}

	public static function get_icon_manager_tabs() {
		if ( ! self::$tabs ) {
			self::init_tabs();
		}
		$additional_tabs = apply_filters( 'elementor/icons_manager/additional_tabs', [] );
		return array_merge( self::$tabs, $additional_tabs );
	}

	/**
	 * Get media control default settings.
	 *
	 * Retrieve the default settings of the media control. Used to return the default
	 * settings while initializing the media control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'label_block' => true,
			'dynamic'     => [
				'categories' => [ TagsModule::IMAGE_CATEGORY ],
				'returnType' => 'object',
			],
		];
	}
}
