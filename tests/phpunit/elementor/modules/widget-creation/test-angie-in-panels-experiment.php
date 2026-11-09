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

	const ANGIE_SCRIPT_HANDLE = 'elementor-v2-editor-angie';

	private $original_experiment_default_state;

	public function set_up() {
		parent::set_up();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::ANGIE_IN_PANELS_EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->remove_feature( Module::ANGIE_IN_PANELS_EXPERIMENT_NAME );
		delete_option( Experiments_Manager::OPTION_PREFIX . Module::ANGIE_IN_PANELS_EXPERIMENT_NAME );
		Plugin::$instance->experiments->add_feature( Module::get_angie_in_panels_experimental_data() );

		// The tests bootstrap activates every registered experiment, so restore the real default.
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);
	}

	public function tear_down() {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		delete_option( Experiments_Manager::OPTION_PREFIX . Module::ANGIE_IN_PANELS_EXPERIMENT_NAME );
		remove_all_filters( 'pre_option_active_plugins' );
		wp_deregister_script( self::ANGIE_SCRIPT_HANDLE );

		parent::tear_down();
	}

	public function test_experiment_is_registered_as_default_inactive() {
		// Arrange
		$data = Module::get_angie_in_panels_experimental_data();

		// Act & Assert
		$this->assertSame( Module::ANGIE_IN_PANELS_EXPERIMENT_NAME, $data['name'] );
		$this->assertTrue( $data['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $data['default'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $data['release_status'] );
	}

	public function test_editor_angie_package_is_registered_only_when_experiment_is_active() {
		// Arrange.
		delete_option( Experiments_Manager::OPTION_PREFIX . Module::ANGIE_IN_PANELS_EXPERIMENT_NAME );
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act.
		$inactive_packages = apply_filters( 'elementor/editor/v2/packages', [] );

		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
		$active_packages = apply_filters( 'elementor/editor/v2/packages', [] );

		// Assert.
		$this->assertNotContains( Module::ANGIE_PACKAGE, $inactive_packages );
		$this->assertContains( Module::ANGIE_PACKAGE, $active_packages );
	}

	public function test_floating_panels_package_is_registered_with_angie_when_page_audit_is_inactive() {
		// Arrange.
		$audit_experiment = 'e_page_audit';
		$original_audit_default = Plugin::$instance->experiments->get_features( $audit_experiment )['default'] ?? null;

		delete_option( Experiments_Manager::OPTION_PREFIX . $audit_experiment );
		Plugin::$instance->experiments->set_feature_default_state(
			$audit_experiment,
			Experiments_Manager::STATE_INACTIVE
		);
		delete_option( Experiments_Manager::OPTION_PREFIX . Module::ANGIE_IN_PANELS_EXPERIMENT_NAME );
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act.
		$inactive_packages = apply_filters( 'elementor/editor/v2/packages', [] );

		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
		$active_packages = apply_filters( 'elementor/editor/v2/packages', [] );

		if ( null !== $original_audit_default ) {
			Plugin::$instance->experiments->set_feature_default_state( $audit_experiment, $original_audit_default );
		}

		// Assert.
		$this->assertNotContains( Module::ANGIE_FLOATING_PANELS_PACKAGE, $inactive_packages );
		$this->assertNotContains( Module::ANGIE_PANEL_PACKAGE, $inactive_packages );
		$this->assertContains( Module::ANGIE_FLOATING_PANELS_PACKAGE, $active_packages );
		$this->assertContains( Module::ANGIE_PANEL_PACKAGE, $active_packages );
		$this->assertContains( Module::ANGIE_PACKAGE, $active_packages );
	}

	public function test_print_angie_config_prints_nothing_when_experiment_is_inactive() {
		// Arrange.
		$this->register_angie_script();

		// Act.
		$this->get_widget_creation_module()->print_angie_config();

		// Assert.
		$this->assertFalse( wp_scripts()->get_data( self::ANGIE_SCRIPT_HANDLE, 'before' ) );
	}

	/**
	 * @dataProvider angie_plugin_active_provider
	 */
	public function test_print_angie_config_prints_angie_plugin_state( array $active_plugins, string $expected_config ) {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
		add_filter( 'pre_option_active_plugins', static fn() => $active_plugins );
		$this->register_angie_script();

		// Act.
		$this->get_widget_creation_module()->print_angie_config();

		// Assert.
		$this->assertSame(
			[ 'var elementorEditorAngie = ' . $expected_config . ';' ],
			array_values( array_filter( wp_scripts()->get_data( self::ANGIE_SCRIPT_HANDLE, 'before' ) ) )
		);
	}

	public function angie_plugin_active_provider(): array {
		return [
			'angie plugin active' => [ [ 'angie/angie.php' ], '{"isAngiePluginActive":true}' ],
			'angie plugin inactive' => [ [], '{"isAngiePluginActive":false}' ],
		];
	}

	public function test_experiment_can_be_activated() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act
		$is_active = Module::is_angie_in_panels_active();

		// Assert
		$this->assertTrue( $is_active );
	}

	public function test_is_angie_in_panels_active_is_false_by_default() {
		// Act & Assert
		$this->assertFalse( Module::is_angie_in_panels_active() );
	}

	private function register_angie_script(): void {
		wp_register_script( self::ANGIE_SCRIPT_HANDLE, 'angie.js', [], '1.0.0', true );
	}

	private function get_widget_creation_module(): Module {
		return Plugin::$instance->modules_manager->get_modules( Module::MODULE_NAME );
	}
}
