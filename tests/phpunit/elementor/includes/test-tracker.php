<?php
namespace Elementor\Testing\Includes;

use Elementor\Core\Files\Assets\Files_Upload_Handler;
use Elementor\Icons_Manager;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Tracker;
use Elementor\Utils;

class Test_Tracker extends Elementor_Test_Base {
	public function test_get_settings_general_usage() {
		// Arrange - Set page only.
		update_option( 'elementor_cpt_support', [ 'page' ] );

		// Set true.
		update_option( 'elementor_disable_color_schemes', true );

		// Set False.
		update_option( 'elementor_disable_typography_schemes', false );

		// Act.
		$actual = Tracker::get_settings_general_usage();

		// Assert.
		$this->assertEqualSets( [
			'post_types' => [
				'page' => true,
				'post' => false,
			],
			'disable_default_colors' => false,
			'disable_default_fonts' => true,
		], $actual );
	}

	public function test_get_settings_advanced_usage() {
		// Arrange.
		update_option( 'elementor_css_print_method', 'internal' );

		update_option( Utils::EDITOR_BREAK_LINES_OPTION_KEY, true );

		update_option( Files_Upload_Handler::OPTION_KEY, true );

		update_option( Icons_Manager::LOAD_FA4_SHIM_OPTION_KEY, true );

		// Act.
		$actual = Tracker::get_settings_advanced_usage();

		$this->assertEqualSets( [
			'css_print_method' => 'internal',
			'switch_editor_loader_method' => true,
			'enable_unfiltered_file_uploads' => true,
			'font_awesome_support' => true,
		], $actual );
	}

	public function test_get_settings_experiments_usage() {
		$this->assertEquals( [], Tracker::get_settings_experiments_usage() );
	}

	public function test_get_tools_general_usage() {
		// Arrange.
		update_option( 'elementor_safe_mode', 'enabled' );
		update_option( 'elementor_enable_inspector', 'enabled' );

		// Act
		$actual = Tracker::get_tools_general_usage();

		$this->assertEqualSets( [
			'safe_mode' => 'enabled',
			'debug_bar' => 'enabled',
		], $actual );
	}

	public function test_get_tools_version_control_usage() {
		// Arrange.
		update_option( 'elementor_beta', 'yes' );

		// Act.
		$actual = Tracker::get_tools_version_control_usage();

		$this->assertEqualSets( [
			'beta_tester' => 'yes',
		], $actual );
	}

	public function test_get_tools_maintenance_usage() {
		// Arrange.
		update_option( 'elementor_maintenance_mode_mode', 'coming_soon' );
		update_option( 'elementor_maintenance_mode_exclude_mode', 'logged_in' );
		update_option( 'elementor_maintenance_mode_template_id', '1' );

		// Act
		$actual = Tracker::get_tools_maintenance_usage();

		$this->assertEqualSets( [
			'mode' => 'coming_soon',
			'exclude' => 'logged_in',
			'template_id' => '1',
		], $actual );
	}
}
