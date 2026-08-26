<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WidgetCreation;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\WidgetCreation\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Angie_In_Panels_Experiment extends Elementor_Test_Base {

	private $original_experiment_default_state;

	public function set_up() {
		parent::set_up();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::ANGIE_IN_PANELS_EXPERIMENT )['default'];

		Plugin::$instance->experiments->remove_feature( Module::ANGIE_IN_PANELS_EXPERIMENT );
		delete_option( Experiments_Manager::OPTION_PREFIX . Module::ANGIE_IN_PANELS_EXPERIMENT );
		Plugin::$instance->experiments->add_feature( Module::get_experimental_data() );
	}

	public function tear_down() {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT,
			$this->original_experiment_default_state
		);

		delete_option( Experiments_Manager::OPTION_PREFIX . Module::ANGIE_IN_PANELS_EXPERIMENT );

		parent::tear_down();
	}

	public function test_experiment_is_registered_as_default_inactive() {
		// Arrange
		$data = Module::get_experimental_data();

		// Act & Assert
		$this->assertSame( Module::ANGIE_IN_PANELS_EXPERIMENT, $data['name'] );
		$this->assertTrue( $data['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $data['default'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $data['release_status'] );
	}

	public function test_experiment_is_inactive_by_default() {
		// Act
		$is_active = Plugin::$instance->experiments->is_feature_active( Module::ANGIE_IN_PANELS_EXPERIMENT );

		// Assert
		$this->assertFalse( $is_active );
	}

	public function test_experiment_can_be_activated() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act
		$is_active = Plugin::$instance->experiments->is_feature_active( Module::ANGIE_IN_PANELS_EXPERIMENT );

		// Assert
		$this->assertTrue( $is_active );
	}
}
