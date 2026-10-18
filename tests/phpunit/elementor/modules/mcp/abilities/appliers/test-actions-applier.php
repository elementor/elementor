<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\DataFlow\Actions_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\Actions_Applier;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Actions_Applier extends Elementor_Test_Base {

	const INCREMENT = [
		'on' => 'click',
		'do' => 'state/increment',
		'args' => [ 'key' => 'count' ],
	];

	public function test_apply__writes_actions_as_props_to_indexed_node() {
		// Arrange
		$node = [ 'id' => 'abc' ];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Actions_Applier() )->apply( $index, [ 'button' => [ self::INCREMENT ] ] );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertSame( Actions_Parser::VERSION, $node[ Actions_Parser::DATA_KEY ]['version'] );
		$this->assertSame( 'event-action', $node[ Actions_Parser::DATA_KEY ]['items'][0]['$$type'] );
		$this->assertSame(
			wp_json_encode( [ self::INCREMENT ] ),
			wp_json_encode( Actions_Parser::to_runtime( $node[ Actions_Parser::DATA_KEY ] ) )
		);
	}

	public function test_apply__empty_list_clears_actions() {
		// Arrange
		$node = [
			'id' => 'abc',
			Actions_Parser::DATA_KEY => [ 'items' => [] ],
		];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Actions_Applier() )->apply( $index, [ 'button' => [] ] );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertArrayNotHasKey( Actions_Parser::DATA_KEY, $node );
	}

	public function test_apply__warns_on_unknown_configuration_id() {
		// Arrange
		$index = [];

		// Act
		$warnings = ( new Actions_Applier() )->apply( $index, [ 'ghost' => [ self::INCREMENT ] ] );

		// Assert
		$this->assertSame( [ 'actions_unknown_configuration_id' ], $warnings->codes() );
		$this->assertSame( 'ghost', $warnings->all()[0]['config_id'] );
	}

	public function test_apply__drops_invalid_actions_and_warns() {
		// Arrange
		$node = [ 'id' => 'abc' ];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Actions_Applier() )->apply( $index, [
			'button' => [
				self::INCREMENT,
				[ 'on' => 'click', 'do' => 'acme/missing' ],
				[ 'on' => 'click', 'do' => 'state/set', 'args' => [ 'key' => 'count', 'unknown' => 1 ] ],
			],
		] );

		// Assert
		$this->assertCount( 1, $node[ Actions_Parser::DATA_KEY ]['items'] );
		$this->assertSame( [ 'action_invalid', 'action_invalid' ], array_column( $warnings->all(), 'code' ) );
		$this->assertStringContainsString( 'unknown action "acme/missing"', $warnings->messages()[0] );
		$this->assertStringContainsString( 'elementor://data-flow/guide', $warnings->messages()[1] );
	}
}
