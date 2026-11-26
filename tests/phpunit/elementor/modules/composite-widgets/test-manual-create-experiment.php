<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\CompositeWidgets\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Manual_Create_Experiment extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->experiments->remove_feature( Module::MANUAL_CREATE_EXPERIMENT_NAME );
		delete_option( Experiments_Manager::OPTION_PREFIX . Module::MANUAL_CREATE_EXPERIMENT_NAME );
	}

	public function tearDown(): void {
		delete_option( Experiments_Manager::OPTION_PREFIX . Module::MANUAL_CREATE_EXPERIMENT_NAME );

		parent::tearDown();
	}

	public function test_construct__registers_a_hidden_inactive_dev_experiment() {
		// Arrange.
		$feature = null;
		$capture = function ( $manager, array $data ) use ( &$feature ) {
			if ( Module::MANUAL_CREATE_EXPERIMENT_NAME === $data['name'] ) {
				$feature = $data;
			}
		};

		// The test bootstrap activates every registered experiment at priority 10; capture before it.
		add_action( 'elementor/experiments/feature-registered', $capture, 1, 2 );

		// Act.
		new Module();

		remove_action( 'elementor/experiments/feature-registered', $capture, 1 );

		// Assert.
		$this->assertTrue( $feature['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $feature['default'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $feature['release_status'] );
	}

	public function test_is_manual_create_active__is_false_while_the_module_is_not_loaded() {
		// Act & Assert.
		$this->assertFalse( Module::is_manual_create_active() );
	}

	public function test_is_manual_create_active__follows_the_experiment_state() {
		// Arrange.
		new Module();

		// Act.
		Plugin::$instance->experiments->set_feature_default_state( Module::MANUAL_CREATE_EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
		$inactive = Module::is_manual_create_active();

		Plugin::$instance->experiments->set_feature_default_state( Module::MANUAL_CREATE_EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		$active = Module::is_manual_create_active();

		// Assert.
		$this->assertFalse( $inactive );
		$this->assertTrue( $active );
	}
}
