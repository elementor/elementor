<?php

namespace Elementor\Modules\DesignSystemSync;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\Variables\Module as VariablesModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
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

		( new Hooks() )->register();
	}

	private function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME )
			&& Plugin::$instance->experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME )
			&& Plugin::$instance->experiments->is_feature_active( VariablesModule::EXPERIMENT_MANAGER_NAME );
	}
}
