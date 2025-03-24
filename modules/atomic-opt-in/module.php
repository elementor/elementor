<?php

namespace Elementor\Modules\AtomicOptIn;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Isolation\Elementor_Adapter;
use Elementor\Core\Isolation\Elementor_Adapter_Interface;
use Elementor\Core\Utils\Isolation_Manager;
use Elementor\Plugin;

class Module extends BaseModule {
	const MODULE_NAME = 'editor-v4-opt-in';
	const WELCOME_POPOVER_DISPLAYED_OPTION = '_e_welcome_popover_displayed';

	private ?Elementor_Adapter_Interface $elementor_adapter = null;

	public function get_name() {
		return 'atomic-opt-in';
	}

	public function __construct( ?Elementor_Adapter_Interface $elementor_adapter = null ) {
		if ( ! is_admin() ) {
			return;
		}

		( new OptInPage( $this ) )->init();

    	if ( ! $this->is_atomic_experiment_active() ) {
        	return;
    	}

		$this->elementor_adapter = $elementor_adapter ?? Isolation_Manager::get_adapter( Elementor_Adapter::class );

		if ( ! $this->elementor_adapter ) {
			return;
		}

		( new WelcomeScreen( $this->elementor_adapter ) )->init();
	}

	public function is_atomic_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( 'editor_v4' );
	}
}
