<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\DataFlow\Handlers_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\Handlers_Applier;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Handlers_Applier extends Elementor_Test_Base {

	const CLICK_HANDLER = [
		'event' => 'click',
		'code' => 'setState( "count", ( count ) => count + 1 );',
	];

	public function test_apply__writes_sanitized_handlers_to_indexed_node() {
		// Arrange
		$this->act_as_admin();
		$node = [ 'id' => 'abc' ];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Handlers_Applier() )->apply( $index, [ 'button' => [ self::CLICK_HANDLER ] ] );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertSame( [ self::CLICK_HANDLER ], $node[ Handlers_Parser::DATA_KEY ] );
	}

	public function test_apply__empty_list_clears_handlers() {
		// Arrange
		$this->act_as_admin();
		$node = [
			'id' => 'abc',
			Handlers_Parser::DATA_KEY => [ self::CLICK_HANDLER ],
		];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Handlers_Applier() )->apply( $index, [ 'button' => [] ] );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertSame( [], $node[ Handlers_Parser::DATA_KEY ] );
	}

	public function test_apply__warns_on_unknown_configuration_id() {
		// Arrange
		$this->act_as_admin();
		$index = [];

		// Act
		$warnings = ( new Handlers_Applier() )->apply( $index, [ 'ghost' => [ self::CLICK_HANDLER ] ] );

		// Assert
		$this->assertSame( [ 'handlers_unknown_configuration_id' ], $warnings->codes() );
		$this->assertSame( 'ghost', $warnings->all()[0]['config_id'] );
	}

	public function test_apply__drops_invalid_handlers_and_warns() {
		// Arrange
		$this->act_as_admin();
		$node = [ 'id' => 'abc' ];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Handlers_Applier() )->apply( $index, [
			'button' => [
				self::CLICK_HANDLER,
				[
					'event' => 'scroll',
					'code' => 'noop();',
				],
			],
		] );

		// Assert
		$this->assertSame( [ self::CLICK_HANDLER ], $node[ Handlers_Parser::DATA_KEY ] );
		$this->assertSame( [ 'handler_invalid' ], $warnings->codes() );
		$this->assertStringContainsString( 'elementor://data-flow/guide', $warnings->messages()[0] );
	}

	public function test_apply__warns_when_current_user_cannot_save_handlers() {
		// Arrange
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'author' ] ) );
		$node = [ 'id' => 'abc' ];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Handlers_Applier() )->apply( $index, [ 'button' => [ self::CLICK_HANDLER ] ] );

		// Assert
		$this->assertSame( [ 'handlers_stripped_on_save' ], $warnings->codes() );
	}
}
