<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\OptIn\Opt_In;
use Elementor\Modules\Mcp\Abilities\Manage_Experiments_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Experiments_Ability extends Elementor_Test_Base {

	private const TEST_FEATURES = [ 'test_mcp_toggle', 'test_mcp_dependency', 'test_mcp_dependant' ];

	private Manage_Experiments_Ability $ability;

	private array $original_states = [];

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Manage_Experiments_Ability();
		$this->original_states = array_column( Plugin::$instance->experiments->get_features(), 'state', 'name' );
		$this->act_as_admin();
	}

	public function tearDown(): void {
		$experiments = Plugin::$instance->experiments;

		foreach ( self::TEST_FEATURES as $name ) {
			$experiments->remove_feature( $name );
		}

		foreach ( $this->original_states as $name => $state ) {
			if ( $experiments->get_features( $name )['state'] !== $state ) {
				$experiments->set_feature_state( $name, $state );
			}
		}

		parent::tearDown();
	}

	public function test_execute__activate_and_deactivate_change_the_experiment_state() {
		// Arrange
		$this->add_feature( 'test_mcp_toggle' );

		// Act
		$activated = $this->ability->execute( [ 'action' => 'activate', 'name' => 'test_mcp_toggle' ] );
		$deactivated = $this->ability->execute( [ 'action' => 'deactivate', 'name' => 'test_mcp_toggle' ] );

		// Assert
		$this->assertTrue( $activated['success'] );
		$this->assertSame( Experiments_Manager::STATE_ACTIVE, $activated['experiment']['state'] );
		$this->assertTrue( $activated['experiment']['active'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $deactivated['experiment']['state'] );
		$this->assertFalse( $deactivated['experiment']['active'] );
	}

	public function test_execute__reset_returns_the_experiment_to_its_default_state() {
		// Arrange
		$this->add_feature( 'test_mcp_toggle', [ 'default' => Experiments_Manager::STATE_ACTIVE ] );
		$this->ability->execute( [ 'action' => 'deactivate', 'name' => 'test_mcp_toggle' ] );

		// Act
		$result = $this->ability->execute( [ 'action' => 'reset', 'name' => 'test_mcp_toggle' ] );

		// Assert
		$this->assertSame( Experiments_Manager::STATE_DEFAULT, $result['experiment']['state'] );
		$this->assertTrue( $result['experiment']['active'] );
	}

	public function test_execute__hidden_experiment_is_not_toggleable() {
		// Act
		$result = $this->ability->execute( [ 'action' => 'activate', 'name' => Atomic_Widgets_Module::EXPERIMENT_NAME ] );

		// Assert
		$this->assert_error( $result, 'experiment_not_toggleable', \WP_Http::BAD_REQUEST );
	}

	public function test_execute__unknown_experiment_returns_not_found() {
		// Act
		$result = $this->ability->execute( [ 'action' => 'activate', 'name' => 'test_mcp_unknown' ] );

		// Assert
		$this->assert_error( $result, 'experiment_not_found', \WP_Http::NOT_FOUND );
	}

	public function test_execute__unknown_action_returns_bad_request() {
		// Act
		$result = $this->ability->execute( [ 'action' => 'toggle', 'name' => 'test_mcp_toggle' ] );

		// Assert
		$this->assert_error( $result, 'invalid_input', \WP_Http::BAD_REQUEST );
	}

	public function test_execute__missing_name_returns_bad_request() {
		// Act
		$result = $this->ability->execute( [ 'action' => 'activate' ] );

		// Assert
		$this->assert_error( $result, 'invalid_input', \WP_Http::BAD_REQUEST );
	}

	public function test_execute__activating_with_an_inactive_dependency_returns_conflict() {
		// Arrange
		$this->add_feature( 'test_mcp_dependency' );
		Plugin::$instance->experiments->set_feature_default_state( 'test_mcp_dependency', Experiments_Manager::STATE_INACTIVE );
		$this->add_feature( 'test_mcp_dependant', [ 'dependencies' => [ 'test_mcp_dependency' ] ] );

		// Act
		$result = $this->ability->execute( [ 'action' => 'activate', 'name' => 'test_mcp_dependant' ] );

		// Assert
		$this->assert_error( $result, 'experiment_dependency_inactive', \WP_Http::CONFLICT );
		$this->assertFalse( get_option( Plugin::$instance->experiments->get_feature_option_key( 'test_mcp_dependant' ) ) );
	}

	public function test_execute__enable_atomic_editor_activates_the_whole_opt_in_bundle() {
		// Act
		$result = $this->ability->execute( [ 'action' => 'enable_atomic_editor' ] );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertTrue( $result['atomic_editor']['active'] );
		$this->assertNotEmpty( $result['llm_instructions'] );

		foreach ( Opt_In::OPT_IN_FEATURES as $name ) {
			$this->assertTrue( Plugin::$instance->experiments->is_feature_active( $name ), $name );
		}
	}

	public function test_execute__disable_atomic_editor_deactivates_the_opt_out_bundle() {
		// Arrange
		$this->ability->execute( [ 'action' => 'enable_atomic_editor' ] );

		// Act
		$result = $this->ability->execute( [ 'action' => 'disable_atomic_editor' ] );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertFalse( $result['atomic_editor']['active'] );

		foreach ( Opt_In::OPT_OUT_FEATURES as $name ) {
			$this->assertFalse( Plugin::$instance->experiments->is_feature_active( $name ), $name );
		}
	}

	public function test_check_permission__rejects_non_admin() {
		// Arrange
		$this->act_as_editor();

		// Act & Assert
		$this->assertFalse( $this->ability->check_permission() );
	}

	private function add_feature( string $name, array $args = [] ): void {
		Plugin::$instance->experiments->add_feature( array_merge( [
			'name' => $name,
			'title' => $name,
		], $args ) );
	}

	private function assert_error( $result, string $code, int $status ): void {
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( $code, $result->get_error_code() );
		$this->assertSame( $status, $result->get_error_data()['status'] );
	}
}
