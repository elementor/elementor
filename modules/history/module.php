<?php
namespace Elementor\Modules\History;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Module extends BaseModule {

	public function get_name() {
		return 'history';
	}

	public function localize_settings( $settings ) {
		$settings = array_replace_recursive( $settings, [
			'i18n' => [
				'history' => __( 'History', 'elementor' ),
				'no_history_1' => __( 'Once you start working, you\'ll be able to redo / undo any action you make in the editor.', 'elementor' ),
				'no_history_2' => __( 'You can undo changes with Ctrl / Cmd + Z and redo them with Ctrl / Cmd + Shift + Z', 'elementor' ),
				'template' => __( 'Template', 'elementor' ),
				'added' => __( 'Added', 'elementor' ),
				'removed' => __( 'Removed', 'elementor' ),
				'edited' => __( 'Edited', 'elementor' ),
				'moved' => __( 'Moved', 'elementor' ),
				'duplicated' => __( 'Duplicated', 'elementor' ),
				'editing_started' => __( 'Editing Started', 'elementor' ),
			],
		] );
		return $settings;
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/editor/localize_settings', [ $this, 'localize_settings' ] );

		Plugin::$instance->editor->add_editor_template( __DIR__ . '/views/history-panel-template.php' );
		Plugin::$instance->editor->add_editor_template( __DIR__ . '/views/revisions-panel-template.php' );
	}
}
