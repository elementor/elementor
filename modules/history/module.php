<?php
namespace Elementor\Modules\History;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor history module.
 *
 * Elementor history module handler class is responsible for registering and
 * managing Elementor history modules.
 *
 * @since 1.7.0
 */
class Module extends BaseModule {

	/**
	 * Get module name.
	 *
	 * Retrieve the history module name.
	 *
	 * @since 1.7.0
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'history';
	}

	/**
	 * Localize settings.
	 *
	 * Add new localized settings for the history module.
	 *
	 * Fired by `elementor/editor/localize_settings` filter.
	 *
	 * @since 1.7.0
	 * @access public
	 *
	 * @param array $settings Localized settings.
	 *
	 * @return array Localized settings.
	 */
	public function localize_settings( $settings ) {
		$settings = array_replace_recursive( $settings, [
			'i18n' => [
				'history' => __( 'History', 'elementor' ),
				'template' => __( 'Template', 'elementor' ),
				'added' => __( 'Added', 'elementor' ),
				'removed' => __( 'Removed', 'elementor' ),
				'edited' => __( 'Edited', 'elementor' ),
				'moved' => __( 'Moved', 'elementor' ),
				'editing_started' => __( 'Editing Started', 'elementor' ),
				'style_pasted' => __( 'Style Pasted', 'elementor' ),
				'style_reset' => __( 'Style Reset', 'elementor' ),
				'all_content' => __( 'All Content', 'elementor' ),
			],
		] );

		return $settings;
	}

	/**
	 * History module constructor.
	 *
	 * Initializing Elementor history module.
	 *
	 * @since 1.7.0
	 * @access public
	 */
	public function __construct() {
		add_filter( 'elementor/editor/localize_settings', [ $this, 'localize_settings' ] );

		Plugin::$instance->editor->add_editor_template( __DIR__ . '/views/history-panel-template.php' );
		Plugin::$instance->editor->add_editor_template( __DIR__ . '/views/revisions-panel-template.php' );
	}
}
