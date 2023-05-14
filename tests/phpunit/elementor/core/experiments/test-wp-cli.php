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
		$experiment = 'container';
		$experiments_manager = Plugin::instance()->experiments;
		$option = $experiments_manager->get_feature_option_key( $experiment );
		update_option( $option, Experiments_Manager::STATE_INACTIVE );

		// Act
		$wp_cli->activate( array( $experiment ), array() );
		$is_option_active = $experiments_manager->is_feature_active( $experiment );

		// Assert
		$this->assertEquals( true, $is_option_active );
	}

	public function test_activate_multiple_experiments() {
		// Arrange
		$wp_cli = new Wp_Cli();
		$experiment1 = 'container';
		$experiment2 = 'admin_menu_rearrangement';
		$experiments_manager = Plugin::instance()->experiments;
		$option1 = $experiments_manager->get_feature_option_key( $experiment1 );
		update_option( $option1, Experiments_Manager::STATE_INACTIVE );
		$option2 = $experiments_manager->get_feature_option_key( $experiment2 );
		update_option( $option2, Experiments_Manager::STATE_INACTIVE );

		// Act
		$wp_cli->activate( array( $experiment1, $experiment2 ), array() );
		$is_option1_active = $experiments_manager->is_feature_active( $experiment1 );
		$is_option2_active = $experiments_manager->is_feature_active( $experiment2 );

		// Assert
		$this->assertEquals( true, $is_option1_active, $experiment1 );
		$this->assertEquals( true, $is_option2_active, $experiment2 );
	}

	public function test_deactivate_single_experiment() {
		// Arrange
		$wp_cli = new Wp_Cli();
		$experiment = 'container';
		$experiments_manager = Plugin::instance()->experiments;
		$option = $experiments_manager->get_feature_option_key( $experiment );
		update_option( $option, Experiments_Manager::STATE_ACTIVE );

		// Act
		$wp_cli->deactivate( array( $experiment ), array() );
		$is_option_active = $experiments_manager->is_feature_active( $experiment );

		// Assert
		$this->assertEquals( false, $is_option_active );
	}

	public function test_deactivate_multiple_experiments() {
		// Arrange
		$wp_cli = new Wp_Cli();
		$experiment1 = 'container';
		$experiment2 = 'admin_menu_rearrangement';
		$experiments_manager = Plugin::instance()->experiments;
		$option1 = $experiments_manager->get_feature_option_key( $experiment1 );
		update_option( $option1, Experiments_Manager::STATE_ACTIVE );
		$option2 = $experiments_manager->get_feature_option_key( $experiment2 );
		update_option( $option2, Experiments_Manager::STATE_ACTIVE );

		// Act
		$wp_cli->activate( array( $experiment1, $experiment2 ), array() );
		$is_option1_active = $experiments_manager->is_feature_active( $experiment1 );
		$is_option2_active = $experiments_manager->is_feature_active( $experiment2 );

		// Assert
		$this->assertEquals( false, $is_option1_active, $experiment1 );
		$this->assertEquals( false, $is_option2_active, $experiment2 );
	}
}
