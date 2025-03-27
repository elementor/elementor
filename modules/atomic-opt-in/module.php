<?php

namespace Elementor\Modules\AtomicOptIn;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\AtomicWidgets\Opt_In as AtomicWidgetsOptIn;
use Elementor\Plugin;

class Module extends BaseModule {
	const MODULE_NAME = 'editor-v4-opt-in';
	const WELCOME_POPOVER_DISPLAYED_OPTION = '_e_welcome_popover_displayed';

	public function get_name() {
		return 'atomic-opt-in';
	}

	public function __construct() {
		( new OptInPage( $this ) )->init();

		if ( ! $this->is_atomic_experiment_active() ) {
			return;
		}

		( new WelcomeScreen() )->init();
	}

	public function is_atomic_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( AtomicWidgetsOptIn::EXPERIMENT_NAME );
	}
}
