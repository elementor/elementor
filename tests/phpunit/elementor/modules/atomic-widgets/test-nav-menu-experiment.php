<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Nav_Menu_Experiment extends Elementor_Test_Base {

	private $original_experiment_default_state;

	private $registered_data;

	public function set_up() {
		parent::set_up();

		$experiments = Plugin::$instance->experiments;

		$this->original_experiment_default_state = $experiments->get_features( Module::EXPERIMENT_NAV_MENU )['default'] ?? null;

		$experiments->remove_feature( Module::EXPERIMENT_NAV_MENU );
		delete_option( Experiments_Manager::OPTION_PREFIX . Module::EXPERIMENT_NAV_MENU );

		$capture = function ( $manager, array $data ) {
			if ( Module::EXPERIMENT_NAV_MENU === $data['name'] ) {
				$this->registered_data = $data;
			}
		};

		add_action( 'elementor/experiments/feature-registered', $capture, 1, 2 );

		$register = new \ReflectionMethod( Module::class, 'register_nav_menu_experiment' );
		$register->setAccessible( true );
		$register->invoke( Plugin::$instance->modules_manager->get_modules( 'atomic-widgets' ) );

		remove_action( 'elementor/experiments/feature-registered', $capture, 1 );
	}

	public function tear_down() {
		if ( null !== $this->original_experiment_default_state ) {
			Plugin::$instance->experiments->set_feature_default_state(
				Module::EXPERIMENT_NAV_MENU,
				$this->original_experiment_default_state
			);
		}

		delete_option( Experiments_Manager::OPTION_PREFIX . Module::EXPERIMENT_NAV_MENU );

		parent::tear_down();
	}

	public function test_experiment_name__is_exposed_as_a_constant() {
		// Assert
		$this->assertSame( 'e_nav_menu', Module::EXPERIMENT_NAV_MENU );
	}

	public function test_experiment__is_registered_as_hidden_dev_feature() {
		// Act
		$feature = Plugin::$instance->experiments->get_features( Module::EXPERIMENT_NAV_MENU );

		// Assert
		$this->assertIsArray( $feature );
		$this->assertSame( Module::EXPERIMENT_NAV_MENU, $feature['name'] );
		$this->assertTrue( $feature['hidden'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $feature['release_status'] );
	}

	public function test_experiment__is_inactive_by_default() {
		// Assert
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $this->registered_data['default'] );
	}

	public function test_experiment__can_be_activated() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAV_MENU,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act
		$is_active = Plugin::$instance->experiments->is_feature_active( Module::EXPERIMENT_NAV_MENU );

		// Assert
		$this->assertTrue( $is_active );
	}
}
