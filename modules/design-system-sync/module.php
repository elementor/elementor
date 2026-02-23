<?php

namespace Elementor\Modules\DesignSystemSync;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Modules\DesignSystemSync\Classes\Kit_Stylesheet_Extended;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const MODULE_NAME = 'design-system-sync';
	const EXPERIMENT_NAME = 'e_design_system_sync';

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Design System Sync', 'elementor' ),
			'description' => esc_html__( 'Sync V4 design system (variables, classes) to V3 Global Styles.', 'elementor' ),
			'hidden' => true,
			'default' => ExperimentsManager::STATE_INACTIVE,
			'release_status' => ExperimentsManager::RELEASE_STATUS_ALPHA,
		];
	}

	public function __construct() {
		parent::__construct();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		$this->register_hooks();
	}

	private function is_experiment_active(): bool {
		return \Elementor\Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	private function register_hooks() {
		( new Kit_Stylesheet_Extended() )->register_hooks();
		( new Classes\Global_Colors_Extension() )->register_hooks();
		( new Classes\Global_Typography_Extension() )->register_hooks();

		add_action( 'elementor/controls/register', [ $this, 'register_controls' ] );
		add_action( 'elementor/editor/after_enqueue_styles', [ $this, 'enqueue_editor_styles' ] );
		add_action( 'elementor/global_classes/update', [ $this, 'clear_classes_cache' ] );
	}

	public function register_controls( $controls_manager ) {
		require_once __DIR__ . '/controls/v4-color-variable-list.php';
		require_once __DIR__ . '/controls/v4-typography-list.php';

		$controls_manager->register( new Controls\V4_Color_Variable_List() );
		$controls_manager->register( new Controls\V4_Typography_List() );
	}

	public function enqueue_editor_styles() {
		wp_enqueue_style(
			'elementor-design-system-sync-editor',
			plugins_url( 'assets/css/editor.css', __FILE__ ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function clear_classes_cache() {
		Classes\Classes_Provider::clear_cache();
	}
}
