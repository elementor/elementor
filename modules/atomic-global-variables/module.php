<?php

namespace Elementor\Modules\AtomicGlobalVariables;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Modules\AtomicGlobalVariables\Classes\Hooks;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const MODULE_NAME     = 'atomic-global-variables';
	const EXPERIMENT_NAME = 'atomic_global_variables';

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Variables', 'elementor' ),
			'description' => esc_html__( 'Enable variables. (For this feature to work - Atomic Widgets must be active)', 'elementor' ),
			'hidden' => true,
			'default' => ExperimentsManager::STATE_INACTIVE,
			'release_status' => ExperimentsManager::RELEASE_STATUS_ALPHA,
		];
	}

	public function __construct() {
		parent::__construct();

		if ( $this->is_experiment_active() ) {
			( new Hooks( new Wordpress_Adapter() ) )->register();
		}
	}

	private function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME )
			&& Plugin::$instance->experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}
}
