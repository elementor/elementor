<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Appliers;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\DataFlow\Actions_Registry;
use Elementor\Modules\DataFlow\Custom_Actions;
use Elementor\Modules\DataFlow\Module as Data_Flow_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\Custom_Actions_Applier;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Custom_Actions_Applier extends Elementor_Test_Base {

	const DEFINITION = [
		'name' => 'acme/add-one',
		'args' => [ 'key' => [ 'type' => 'string' ] ],
		'code' => '( { args, store } ) => { store.setState( args.key, ( v ) => v + 1 ); }',
	];

	private string $original_experiment_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_experiment_state = Plugin::$instance->experiments->get_features( Data_Flow_Module::EXPERIMENT_NAME )['default'];
		$this->set_data_flow_state( Experiments_Manager::STATE_ACTIVE );
		Custom_Actions::register_post_type();
		Custom_Actions::reset();
		Actions_Registry::reset();
	}

	public function tearDown(): void {
		$this->act_as_admin();
		Custom_Actions::instance()->delete( self::DEFINITION['name'] );
		Custom_Actions::reset();
		Actions_Registry::reset();
		$this->set_data_flow_state( $this->original_experiment_state );

		parent::tearDown();
	}

	public function test_apply__saves_custom_actions() {
		// Arrange
		$this->act_as_admin();

		// Act
		$warnings = ( new Custom_Actions_Applier() )->apply( [ self::DEFINITION ] );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertSame( self::DEFINITION['code'], Custom_Actions::instance()->get( 'acme/add-one' )['code'] );
	}

	public function test_apply__dry_run_registers_without_saving() {
		// Arrange
		$this->act_as_admin();

		// Act
		$warnings = ( new Custom_Actions_Applier() )->apply( [ self::DEFINITION ], false );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertTrue( Actions_Registry::instance()->has( 'acme/add-one' ) );
		$this->assertNull( Custom_Actions::instance()->get( 'acme/add-one' ) );
	}

	public function test_apply__deletes_custom_actions() {
		// Arrange
		$this->act_as_admin();
		Custom_Actions::instance()->save( self::DEFINITION );

		// Act
		$warnings = ( new Custom_Actions_Applier() )->apply( [ [ 'name' => 'acme/add-one', 'delete' => true ] ] );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertNull( Custom_Actions::instance()->get( 'acme/add-one' ) );
	}

	public function test_apply__warns_per_invalid_definition_and_saves_the_rest() {
		// Arrange
		$this->act_as_admin();

		// Act
		$warnings = ( new Custom_Actions_Applier() )->apply( [
			[ 'name' => 'state/mine' ] + self::DEFINITION,
			self::DEFINITION,
		] );

		// Assert
		$this->assertSame( [ 'custom_action_invalid' ], $warnings->codes() );
		$this->assertSame( 'state/mine', $warnings->all()[0]['config_id'] );
		$this->assertNotNull( Custom_Actions::instance()->get( 'acme/add-one' ) );
	}

	public function test_apply__skips_with_a_warning_for_non_administrators() {
		// Arrange
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'editor' ] ) );

		// Act
		$warnings = ( new Custom_Actions_Applier() )->apply( [ self::DEFINITION ] );

		// Assert
		$this->assertSame( [ 'custom_actions_forbidden' ], $warnings->codes() );
		$this->assertFalse( Actions_Registry::instance()->has( 'acme/add-one' ) );
	}

	public function test_apply__skips_with_a_warning_when_data_flow_is_inactive() {
		// Arrange
		$this->act_as_admin();
		$this->set_data_flow_state( Experiments_Manager::STATE_INACTIVE );

		// Act
		$warnings = ( new Custom_Actions_Applier() )->apply( [ self::DEFINITION ] );

		// Assert
		$this->assertSame( [ 'custom_actions_experiment_off' ], $warnings->codes() );
	}

	private function set_data_flow_state( string $state ): void {
		Plugin::$instance->experiments->set_feature_default_state( Data_Flow_Module::EXPERIMENT_NAME, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . Data_Flow_Module::EXPERIMENT_NAME );
	}
}
