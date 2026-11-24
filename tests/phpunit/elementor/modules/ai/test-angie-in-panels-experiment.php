<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Ai;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Ai\Module;
use Elementor\Modules\Ai\Preferences;
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
		delete_option( Module::ANGIE_CONSENT_OPTION );
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
		$this->assertSame(
			'Angie in the Editor: load Angie from Elementor Core in a docked panel, with Angie entry points across the Editor.',
			$data['description']
		);
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
		$this->assertNotContains( Module::ANGIE_ENTRY_POINTS_PACKAGE, $inactive_packages );
		$this->assertContains( Module::ANGIE_ENTRY_POINTS_PACKAGE, $active_packages );
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

	public function test_angie_packages_load_when_show_ai_is_disabled() {
		// Arrange.
		$this->act_as_admin();
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
		update_user_option( get_current_user_id(), Preferences::ENABLE_AI, '0' );

		// Act.
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );

		// Assert.
		$this->assertContains( Module::ANGIE_PACKAGE, $packages );
		$this->assertContains( Module::ANGIE_PANEL_PACKAGE, $packages );
		$this->assertContains( Module::ANGIE_FLOATING_PANELS_PACKAGE, $packages );
		$this->assertContains( Module::ANGIE_ENTRY_POINTS_PACKAGE, $packages );
	}

	public function test_print_angie_config_prints_nothing_when_experiment_is_inactive() {
		// Arrange.
		$this->register_angie_script();

		// Act.
		$this->get_ai_module()->print_angie_config();

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
		Plugin::$instance->experiments->set_feature_default_state(
			'container',
			Experiments_Manager::STATE_ACTIVE
		);
		add_filter( 'pre_option_active_plugins', static fn() => $active_plugins );
		$this->register_angie_script();

		// Act.
		$this->get_ai_module()->print_angie_config();

		// Assert.
		$this->assertSame(
			[ 'var elementorEditorAngie = ' . $expected_config . ';' ],
			array_values( array_filter( wp_scripts()->get_data( self::ANGIE_SCRIPT_HANDLE, 'before' ) ) )
		);
	}

	public function angie_plugin_active_provider(): array {
		return [
			'angie plugin active' => [ [ 'angie/angie.php' ], '{"isAngiePluginActive":true,"showEntryPoints":true}' ],
			'angie plugin inactive' => [ [], '{"isAngiePluginActive":false,"showEntryPoints":true}' ],
		];
	}

	public function test_print_angie_config_hides_entry_points_when_show_ai_is_disabled() {
		// Arrange.
		$this->act_as_admin();
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
		Plugin::$instance->experiments->set_feature_default_state(
			'container',
			Experiments_Manager::STATE_ACTIVE
		);
		update_user_option( get_current_user_id(), Preferences::ENABLE_AI, '0' );
		add_filter( 'pre_option_active_plugins', static fn() => [] );
		$this->register_angie_script();

		// Act.
		$this->get_ai_module()->print_angie_config();

		// Assert.
		$this->assertSame(
			[ 'var elementorEditorAngie = {"isAngiePluginActive":false,"showEntryPoints":false};' ],
			array_values( array_filter( wp_scripts()->get_data( self::ANGIE_SCRIPT_HANDLE, 'before' ) ) )
		);
	}

	public function test_print_angie_config_hides_entry_points_when_container_experiment_is_inactive() {
		// Arrange.
		$original_container_default = Plugin::$instance->experiments->get_features( 'container' )['default'] ?? null;
		$this->act_as_admin();
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
		delete_option( Experiments_Manager::OPTION_PREFIX . 'container' );
		Plugin::$instance->experiments->set_feature_default_state(
			'container',
			Experiments_Manager::STATE_INACTIVE
		);
		add_filter( 'pre_option_active_plugins', static fn() => [] );
		$this->register_angie_script();

		// Act.
		$this->get_ai_module()->print_angie_config();

		// Assert.
		$this->assertSame(
			[ 'var elementorEditorAngie = {"isAngiePluginActive":false,"showEntryPoints":false};' ],
			array_values( array_filter( wp_scripts()->get_data( self::ANGIE_SCRIPT_HANDLE, 'before' ) ) )
		);

		if ( null !== $original_container_default ) {
			Plugin::$instance->experiments->set_feature_default_state( 'container', $original_container_default );
		}
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

	public function test_consent_route_saves_option_for_admin() {
		// Arrange.
		$this->act_as_admin();
		delete_option( Module::ANGIE_CONSENT_OPTION );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/angie/consent' );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( [ 'success' => true ], $response->get_data() );
		$this->assertSame( 'yes', get_option( Module::ANGIE_CONSENT_OPTION ) );
	}

	public function test_consent_route_requires_manage_options() {
		// Arrange.
		$this->act_as_editor();
		delete_option( Module::ANGIE_CONSENT_OPTION );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/angie/consent' );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertFalse( get_option( Module::ANGIE_CONSENT_OPTION ) );
	}

	private function register_angie_script(): void {
		wp_register_script( self::ANGIE_SCRIPT_HANDLE, 'angie.js', [], '1.0.0', true );
	}

	private function get_ai_module(): Module {
		return Plugin::$instance->modules_manager->get_modules( 'ai' );
	}
}
