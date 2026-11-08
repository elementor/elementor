<?php

namespace Elementor\Modules\WidgetCreation;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Utils\Hints;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = Atomic_Widgets_Module::EXPERIMENT_NAME;
	const ANGIE_IN_PANELS_EXPERIMENT_NAME = 'e_angie_in_panels';
	const MODULE_NAME = 'widget-creation';

	const PACKAGES = [
		'editor-widget-creation',
	];

	const ANGIE_PACKAGE = 'editor-angie';

	const ANGIE_FLOATING_PANELS_PACKAGE = 'editor-floating-panels';

	const ANGIE_PANEL_PACKAGE = 'editor-angie-panel';

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function get_angie_in_panels_experimental_data(): array {
		return [
			'name' => self::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			'title' => esc_html__( 'Angie in editor panels', 'elementor' ),
			'description' => esc_html__( 'Load Angie in a docked floating panel in the editor instead of the legacy push sidebar.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public static function is_angie_plugin_active(): bool {
		return Hints::is_plugin_active( 'angie' );
	}

	public static function can_create_widget(): bool {
		return self::is_angie_plugin_active() && current_user_can( 'manage_options' );
	}

	public function __construct() {
		parent::__construct();
		$this->register_angie_in_panels_experiment();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
		add_filter( 'elementor/editor/localize_settings', fn( $settings ) => $this->add_localize_settings( $settings ) );
		add_action( 'elementor/editor/v2/scripts/enqueue', [ $this, 'print_angie_config' ] );
	}

	private function register_angie_in_panels_experiment(): void {
		Plugin::$instance->experiments->add_feature( self::get_angie_in_panels_experimental_data() );
	}

	public static function is_angie_in_panels_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::ANGIE_IN_PANELS_EXPERIMENT_NAME );
	}

	public function print_angie_config(): void {
		if ( ! self::is_angie_in_panels_active() ) {
			return;
		}

		Utils::print_js_config( 'elementor-v2-editor-angie', 'elementorEditorAngie', [
			'isAngiePluginActive' => Hints::is_plugin_active( 'angie' ),
		] );
	}

	private function add_packages( array $packages ): array {
		if ( self::can_create_widget() ) {
			$packages = array_merge( $packages, self::PACKAGES );
		}

		if ( self::is_angie_in_panels_active() ) {
			$packages[] = self::ANGIE_FLOATING_PANELS_PACKAGE;
			$packages[] = self::ANGIE_PACKAGE;
			$packages[] = self::ANGIE_PANEL_PACKAGE;
		}

		return array_values( array_unique( $packages ) );
	}

	private function add_localize_settings( array $settings ): array {
		$settings['widgetCreation'] = [
			'isAngiePluginActive' => self::is_angie_plugin_active(),
			'canCreateWidget' => self::can_create_widget(),
		];

		return $settings;
	}
}
