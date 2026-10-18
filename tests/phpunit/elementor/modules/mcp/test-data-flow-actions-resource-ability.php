<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\DataFlow\Actions_Registry;
use Elementor\Modules\DataFlow\Custom_Actions;
use Elementor\Modules\Mcp\Abilities\Data_Flow_Actions_Resource_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Data_Flow_Actions_Resource_Ability extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		Custom_Actions::register_post_type();
		Custom_Actions::reset();
		Actions_Registry::reset();
	}

	public function tearDown(): void {
		$this->act_as_admin();
		Custom_Actions::instance()->delete( 'acme/ping' );
		Actions_Registry::reset();

		parent::tearDown();
	}

	public function test_execute__lists_built_in_actions_with_plain_arg_schemas() {
		// Act
		$actions = $this->execute_by_name();

		// Assert
		foreach ( array_keys( Actions_Registry::instance()->all() ) as $name ) {
			$this->assertArrayHasKey( $name, $actions );
		}

		$this->assertSame( Actions_Registry::SOURCE_BUILT_IN, $actions['state/set']['source'] );
		$this->assertSame( 'string', $actions['state/set']['args']['key']['type'] );
		$this->assertArrayNotHasKey( 'code', $actions['state/set'] );
	}

	public function test_execute__includes_custom_action_code_for_administrators() {
		// Arrange
		$this->act_as_admin();
		$this->save_custom_action();

		// Act
		$actions = $this->execute_by_name();

		// Assert
		$this->assertSame( Actions_Registry::SOURCE_CUSTOM, $actions['acme/ping']['source'] );
		$this->assertSame( 'number', $actions['acme/ping']['args']['times']['type'] );
		$this->assertSame( '() => {}', $actions['acme/ping']['code'] );
	}

	public function test_execute__hides_custom_action_code_from_editors() {
		// Arrange
		$this->act_as_admin();
		$this->save_custom_action();
		$this->act_as_editor();

		// Act
		$actions = $this->execute_by_name();

		// Assert
		$this->assertArrayHasKey( 'acme/ping', $actions );
		$this->assertArrayNotHasKey( 'code', $actions['acme/ping'] );
	}

	private function save_custom_action(): void {
		$result = Custom_Actions::instance()->save( [
			'name' => 'acme/ping',
			'args' => [ 'times' => [ 'type' => 'number' ] ],
			'code' => '() => {}',
		] );

		$this->assertNotInstanceOf( \WP_Error::class, $result );
		Actions_Registry::reset();
	}

	private function execute_by_name(): array {
		$content = ( new Data_Flow_Actions_Resource_Ability() )->execute();

		$this->assertIsString( $content );

		return array_column( json_decode( $content, true )['actions'], null, 'name' );
	}
}
