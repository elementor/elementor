<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Experiments;

use Elementor\Core\Experiments\Wp_Cli;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

// Mock WP_CLI classes because they are not available in the test environment.
require_once __DIR__ . '/../../mock/wp-cli-command.php';
require_once __DIR__ . '/../../mock/wp-cli.php';

class Test_Wp_Cli extends Elementor_Test_Base {

	public function test_activate_single_experiment() {
		// Arrange
		$wp_cli = new Wp_Cli();
		$experiment = 'experiment_to_activate';
		$test_experiment = [
			'name' => $experiment,
			'state' => Experiments_Manager::STATE_INACTIVE,
		];
		$experiments_manager = Plugin::instance()->experiments;
		$experiments_manager->add_feature( $test_experiment );

		// Act
		$wp_cli->activate( [ $experiment ], [] );
		$is_option_active = $experiments_manager->is_feature_active( $experiment );

		// Assert
		$this->assertEquals( true, $is_option_active );
	}

	public function test_activate_multiple_experiments() {
		// Arrange
		$wp_cli = new Wp_Cli();
		$experiment1 = 'experiment_to_activate_1';
		$test_experiment1 = [
			'name' => $experiment1,
			'state' => Experiments_Manager::STATE_INACTIVE,
		];
		$experiment2 = 'experiment_to_activate_2';
		$test_experiment2 = [
			'name' => $experiment2,
			'state' => Experiments_Manager::STATE_INACTIVE,
		];
		$experiments_manager = Plugin::instance()->experiments;
		$experiments_manager->add_feature( $test_experiment1 );
		$experiments_manager->add_feature( $test_experiment2 );

		// Act
		$wp_cli->activate( [ $experiment1 . ',' . $experiment2 ], [] );
		$is_option1_active = $experiments_manager->is_feature_active( $experiment1 );
		$is_option2_active = $experiments_manager->is_feature_active( $experiment2 );

		// Assert
		$this->assertEquals( true, $is_option1_active, $experiment1 );
		$this->assertEquals( true, $is_option2_active, $experiment2 );
	}

	public function test_deactivate_single_experiment() {
		// Arrange
		$wp_cli = new Wp_Cli();
		$experiment = 'experiment_to_deactivate';
		$test_experiment = [
			'name' => $experiment,
			'state' => Experiments_Manager::STATE_ACTIVE,
		];
		$experiments_manager = Plugin::instance()->experiments;
		$experiments_manager->add_feature( $test_experiment );

		// Act
		$wp_cli->deactivate( [ $experiment ], [] );
		$is_option_active = $experiments_manager->is_feature_active( $experiment );

		// Assert
		$this->assertEquals( false, $is_option_active );
	}

	public function test_deactivate_multiple_experiments() {
		// Arrange
		$wp_cli = new Wp_Cli();
		$experiment1 = 'experiment_to_deactivate_1';
		$test_experiment1 = [
			'name' => $experiment1,
			'state' => Experiments_Manager::STATE_ACTIVE,
		];
		$experiment2 = 'experiment_to_deactivate_2';
		$test_experiment2 = [
			'name' => $experiment2,
			'state' => Experiments_Manager::STATE_ACTIVE,
		];
		$experiments_manager = Plugin::instance()->experiments;
		$experiments_manager->add_feature( $test_experiment1 );
		$experiments_manager->add_feature( $test_experiment2 );

		// Act
		$wp_cli->deactivate( [ $experiment1 . ',' . $experiment2 ], [] );
		$is_option1_active = $experiments_manager->is_feature_active( $experiment1 );
		$is_option2_active = $experiments_manager->is_feature_active( $experiment2 );

		// Assert
		$this->assertEquals( false, $is_option1_active, $experiment1 );
		$this->assertEquals( false, $is_option2_active, $experiment2 );
	}
}
