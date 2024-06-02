<?php
namespace Elementor;

use Elementor\Core\Utils\Hints;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor gallery control.
 *
 * A base control for creating gallery chooser control. Based on the WordPress
 * media library galleries. Used to select images from the WordPress media library.
 *
 * @since 1.0.0
 */
class Control_Gallery extends Base_Data_Control {

	/**
	 * Get gallery control type.
	 *
	 * Retrieve the control type, in this case `gallery`.
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
			<div class="elementor-control-title">{{{ data.label }}}</div>
			<div class="elementor-control-input-wrapper">
				<# if ( data.description ) { #>
				<div class="elementor-control-field-description">{{{ data.description }}}</div>
				<# } #>
				<div class="elementor-control-media__content elementor-control-tag-area">
					<div class="elementor-control-gallery-status elementor-control-dynamic-switcher-wrapper">
						<span class="elementor-control-gallery-status-title"></span>
						<button class="elementor-control-gallery-clear elementor-control-unit-1 tooltip-target" data-tooltip="<?php echo esc_attr__( 'Clear gallery', 'elementor' ); ?>">
							<i class="eicon-trash-o" aria-hidden="true"></i>
							<span class="elementor-screen-only"><?php echo esc_html__( 'Clear gallery', 'elementor' ); ?></span>
						</button>
					</div>
					<div class="elementor-control-gallery-content">
						<div class="elementor-control-gallery-thumbnails" tabindex="0"></div>
						<div class="elementor-control-gallery-edit">
							<span><i class="eicon-pencil" aria-hidden="true"></i></span>
							<span class="elementor-screen-only"><?php echo esc_html__( 'Edit gallery', 'elementor' ); ?></span>
						</div>
						<button class="elementor-button elementor-control-gallery-add tooltip-target" data-tooltip="<?php echo esc_attr__( 'Add Images', 'elementor' ); ?>">
							<i class="eicon-plus-circle" aria-hidden="true"></i>
							<span class="elementor-screen-only"><?php echo esc_html__( 'Add Images', 'elementor' ); ?></span>
						</button>
					</div>
				</div>

				<?php /* ?>
				<div class="elementor-control-media__warnings" role="alert" style="display: none;">
					<?php
					Hints::get_notice_template( [
						'type' => 'warning',
						'content' => esc_html__( 'This image doesn’t contain ALT text - which is necessary for accessibility and SEO.', 'elementor' ),
						'icon' => true,
					] );
					?>
				</div>
				<?php */ ?>

				<?php if ( Hints::should_display_hint( 'image-optimization' ) ) : ?>
				<div class="elementor-control-media__promotions" role="alert" style="display: none;">
					<?php
					Hints::get_notice_template( [
						'display' => ! Hints::is_dismissed( 'image-optimization' ),
						'type' => 'info',
						'content' => __( 'Optimize your images to enhance site performance by using Image Optimizer.', 'elementor' ),
						'icon' => true,
						'dismissible' => 'image_optimizer_hint',
						'button_text' => Hints::is_plugin_installed( 'image-optimization' ) ? __( 'Activate Plugin', 'elementor' ) : __( 'Install Plugin', 'elementor' ),
						'button_event' => 'image_optimizer_hint',
						'button_data' => [
							'action_url' => Hints::get_plugin_action_url( 'image-optimization' ),
						],
					] ); ?>
				</div>
				<?php endif; ?>

			</div>
		</div>
		<?php
	}

	/**
	 * Get gallery control default settings.
	 *
	 * Retrieve the default settings of the gallery control. Used to return the
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
			'dynamic' => [
				'categories' => [ TagsModule::GALLERY_CATEGORY ],
				'returnType' => 'object',
			],
		];
	}

	/**
	 * Get gallery control default values.
	 *
	 * Retrieve the default value of the gallery control. Used to return the default
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
