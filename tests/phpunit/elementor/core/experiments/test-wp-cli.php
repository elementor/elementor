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
		$experiment = 'container';
		$experiments_manager = Plugin::instance()->experiments;
		$option = $experiments_manager->get_feature_option_key( $experiment );
		update_option( $option, Experiments_Manager::STATE_INACTIVE );

		// Act
		$wp_cli->activate( array( $experiment ), array() );
		$option_state = $experiments_manager->get_feature_actual_state( $experiment );

		// Assert
		$this->assertEquals( Experiments_Manager::STATE_ACTIVE, $option_state );

		// Cleanups
	}

	public function test_activate_multiple_experiments() {
		// Arrange
		$experiment1 = 'container';
		$experiment2 = 'admin_menu_rearrangement';
		$experiments_manager = Plugin::instance()->experiments;
		$option1 = $experiments_manager->get_feature_option_key( $experiment1 );
		update_option( $option1, Experiments_Manager::STATE_INACTIVE );
		$option2 = $experiments_manager->get_feature_option_key( $experiment2 );
		update_option( $option2, Experiments_Manager::STATE_INACTIVE );

		// Act
		$wp_cli->activate( array( $experiment1, $experiment2 ), array() );
		$option1_state = $experiments_manager->get_feature_actual_state( $experiment1 );
		$option2_state = $experiments_manager->get_feature_actual_state( $experiment2 );

		// Assert
		$this->assertEquals( Experiments_Manager::STATE_ACTIVE, $option1_state );
		$this->assertEquals( Experiments_Manager::STATE_ACTIVE, $option2_state );

		// Cleanups
	}

	public function test_deactivate_single_experiment() {
		// Arrange
		$experiment = 'container';
		$experiments_manager = Plugin::instance()->experiments;
		$option = $experiments_manager->get_feature_option_key( $experiment );
		update_option( $option, Experiments_Manager::STATE_ACTIVE );

		// Act
		$wp_cli->deactivate( array( $experiment ), array() );
		$option_state = $experiments_manager->get_feature_actual_state( $experiment );

		// Assert
		$this->assertEquals( Experiments_Manager::STATE_INACTIVE, $option_state );

		// Cleanups
	}

	public function test_deactivate_multiple_experiments() {
		// Arrange
		$experiment1 = 'container';
		$experiment2 = 'admin_menu_rearrangement';
		$experiments_manager = Plugin::instance()->experiments;
		$option1 = $experiments_manager->get_feature_option_key( $experiment1 );
		update_option( $option1, Experiments_Manager::STATE_ACTIVE );
		$option2 = $experiments_manager->get_feature_option_key( $experiment2 );
		update_option( $option2, Experiments_Manager::STATE_ACTIVE );

		// Act
		$wp_cli->activate( array( $experiment1, $experiment2 ), array() );
		$option1_state = $experiments_manager->get_feature_actual_state( $experiment1 );
		$option2_state = $experiments_manager->get_feature_actual_state( $experiment2 );

		// Assert
		$this->assertEquals( Experiments_Manager::STATE_INACTIVE, $option1_state );
		$this->assertEquals( Experiments_Manager::STATE_INACTIVE, $option2_state );

		// Cleanups
	}
}
