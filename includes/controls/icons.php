<?php
namespace Elementor;

use Elementor\Core\Files\Assets\Svg\Svg_Handler;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Icons control.
 *
 * A base control for creating a Icons chooser control.
 * Used to select an Icon.
 *
 * Usage:
 *
 * @since 1.0.0
 */
class Control_Icons extends Control_Base_Multiple {

	/**
	 * Get media control type.
	 *
	 * Retrieve the control type, in this case `media`.
	 *
	 * @access public
	 * @since 2.4.0
	 * @return string Control type.
	 */
	public function get_type() {
		return 'icons';
	}

	/**
	 * Get Icons control default values.
	 *
	 * Retrieve the default value of the Icons control. Used to return the default
	 * values while initializing the Icons control.
	 *
	 * @access public
	 * @since 2.4.0
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [
			'value'   => 'fas fa-star',
			'library' => 'solid',
		];
	}

	/**
	 * Render Icons control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 2.4.0
	 * @access public
	 */
	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-control-icons elementor-control-tag-area elementor-control-preview-area elementor-aspect-ratio-169">
					<div class="elementor-control-icons-actions">
						<div class="elementor-control-icon-picker elementor-icons-control-action">
							<span><i class="eicon-folder" aria-hidden="true"></i><?php esc_html_e( 'Font Icons', 'elementor' ); ?></span>
						</div>
						<div class="elementor-control-svg-uploader elementor-icons-control-action">
							<span><i class="eicon-image" aria-hidden="true"></i><?php esc_html_e( 'SVG', 'elementor' ); ?></span>
						</div>
					</div>
					<div class="elementor-control-icons-area">
						<div class="elementor-control-icons-preview elementor-fit-aspect-ratio">
							<div class="elementor-control-icons-preview-placeholder"></div>
							<div class="elementor-control-icon-delete"><?php echo __( 'Delete', 'elementor' ); ?></div>
						</div>
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

	/**
	 * Get Icons control default settings.
	 *
	 * Retrieve the default settings of the Icons control. Used to return the default
	 * settings while initializing the Icons control.
	 *
	 * @since 2.4.0
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
			'search_bar' => true,
			'recommended' => false,
			'is_svg_enabled' => Svg_Handler::is_enabled(),
		];
	}
}
