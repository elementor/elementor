<?php

namespace Elementor\Modules\AtomicOptIn;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\AtomicWidgets\OptIn\Opt_In as Atomic_Widgets_Opt_In;
use Elementor\Plugin;

class Module extends BaseModule {
	const MODULE_NAME = 'editor-v4-opt-in';
	const WELCOME_POPOVER_DISPLAYED_OPTION = '_e_welcome_popover_displayed';

	public function get_name() {
		return 'atomic-opt-in';
	}

	public function get_opt_in_css_assets_url( string $path ) {
		return $this->get_css_assets_url( $path );
	}

	public function __construct() {
		( new PanelChip() )->init();

		( new Atomic_Widgets_Opt_In() )->init();
		( new OptInPage( $this ) )->init();

		if ( ! $this->is_atomic_experiment_active() ) {
			return;
		}

		( new WelcomeScreen() )->init();
	}

	public function is_atomic_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Opt_In::EXPERIMENT_NAME );
	}
}
