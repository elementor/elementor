<?php

namespace Elementor\Modules\ImportExportDesignSystem;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\GlobalClasses\Module as Global_Classes_Module;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const MODULE_NAME = 'import-export-design-system';

	public function get_name() {
		return self::MODULE_NAME;
	}

	public function __construct() {
		parent::__construct();

		if ( ! $this->are_dependencies_active() ) {
			return;
		}

		( new Import_Export_Design_System_REST_API() )->register_hooks();
	}

	private function are_dependencies_active(): bool {
		$experiments = Plugin::$instance->experiments;

		return $experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME )
			&& $experiments->is_feature_active( Global_Classes_Module::NAME )
			&& $experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME );
	}
}
