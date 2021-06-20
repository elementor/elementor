<?php
namespace Elementor\Testing\Includes;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Files\Assets\Files_Upload_Handler;
use Elementor\Icons_Manager;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Tracker;
use Elementor\Utils;

class Test_Tracker extends Elementor_Test_Base {
	public function test_get_settings_general_usage() {
		// Arrange - Set page only.
		update_option( 'elementor_cpt_support', [ 'page' ] );

		// Set true.
		update_option( 'elementor_disable_color_schemes', true );

		// Set false.
		update_option( 'elementor_disable_typography_schemes', '' );

		// Act.
		$actual = Tracker::get_settings_general_usage();

		// Assert.
		$this->assertEqualSets( [
			'cpt_support' => [
				'page',
			],
			'disable_color_schemes' => true,
			'disable_typography_schemes' => false,
			'allow_tracking' => 'yes', // TODO: Probably should be excluded, but settings page should not know about tracker existance.
		], $actual );
	}

	public function test_get_settings_advanced_usage() {
		// Arrange.

		// Load font_awesome_support settings.
		Plugin::$instance->icons_manager->register_admin_settings( Plugin::$instance->settings );

		update_option( 'elementor_css_print_method', 'internal' );

		update_option( Utils::EDITOR_BREAK_LINES_OPTION_KEY, false );

		update_option( Files_Upload_Handler::OPTION_KEY, true );

		update_option( 'elementor_font_display', 'block' );

		update_option( Icons_Manager::LOAD_FA4_SHIM_OPTION_KEY, true );

		// Act.
		$actual = Tracker::get_settings_advanced_usage();

		// Assert.
		$this->assertEqualSets( [
			'css_print_method' => 'internal',
			'switch_editor_loader_method' => false,
			'enable_unfiltered_file_uploads' => true,
			'font_display' => 'block',
			'font_awesome_support' => true,
		], $actual );
	}

	public function test_get_settings_experiments_usage() {
		// Arrange.
		$original_experiments_manager = Plugin::$instance->experiments;

		// Mock experiments manager.
		Plugin::$instance->experiments = $this->getMockBuilder( Experiments_Manager::class )
		     ->setMethods( [ 'get_features' ] )
		     ->getMock();

		// Set mock data.
		Plugin::$instance->experiments
			->method( 'get_features' )
			->willReturn( [
				'e_dom_optimization' => [
					'default' => 'active',
					'name' => 'e_dom_optimization',
					'state' => 'default',
				],
			] );

		// Assert.
		$this->assertEquals( [
			'e_dom_optimization' => [
				'default' => 'active',
				'state' => 'default',
			]
		], Tracker::get_settings_experiments_usage() );

		// Cleanup.
		Plugin::$instance->experiments = $original_experiments_manager;
	}

	public function test_get_tools_general_usage() {
		// Arrange.
		update_option( 'elementor_safe_mode', 'enabled' );
		update_option( 'elementor_enable_inspector', 'enabled' );

		// Act.
		$actual = Tracker::get_tools_general_usage();

		// Assert.
		$this->assertEqualSets( [
			'safe_mode' => true,
			'debug_bar' => true,
		], $actual );
	}

	public function test_get_tools_version_control_usage() {
		// Arrange.
		update_option( 'elementor_beta', 'yes' );

		// Act.
		$actual = Tracker::get_tools_version_control_usage();

		// Assert.
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

		// Assert.
		$this->assertEqualSets( [
			'mode' => 'coming_soon',
			'exclude' => 'logged_in',
			'template_id' => '1',
		], $actual );
	}
}
