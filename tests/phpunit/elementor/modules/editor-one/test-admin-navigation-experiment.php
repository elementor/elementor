<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorOne\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Admin_Navigation_Experiment extends Elementor_Test_Base {

	private $original_experiment_default_state;

	public function set_up() {
		parent::set_up();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::ADMIN_NAVIGATION_EXPERIMENT_NAME )['default'];

		set_current_screen( 'dashboard' );
	}

	public function tear_down() {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ADMIN_NAVIGATION_EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		delete_option( Experiments_Manager::OPTION_PREFIX . Module::ADMIN_NAVIGATION_EXPERIMENT_NAME );

		set_current_screen( 'front' );

		parent::tear_down();
	}

	public function test_experiment_is_registered_as_hidden_and_default_inactive() {
		// Arrange
		$data = Module::get_admin_navigation_experimental_data();

		// Act & Assert
		$this->assertSame( Module::ADMIN_NAVIGATION_EXPERIMENT_NAME, $data['name'] );
		$this->assertTrue( $data['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $data['default'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $data['release_status'] );
	}

	public function test_sidebar_navigation_handler_is_loaded_when_experiment_is_inactive() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ADMIN_NAVIGATION_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act
		$module = new Module();

		// Assert
		$this->assertFalse( Module::is_admin_navigation_active() );
		$this->assertNotFalse( $module->get_component( 'sidebar-navigation-handler' ) );
	}

	public function test_sidebar_navigation_handler_is_not_loaded_when_experiment_is_active() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ADMIN_NAVIGATION_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act
		$module = new Module();

		// Assert
		$this->assertTrue( Module::is_admin_navigation_active() );
		$this->assertFalse( $module->get_component( 'sidebar-navigation-handler' ) );
		$this->assertNotFalse( $module->get_component( 'top-bar-handler' ) );
	}
}
