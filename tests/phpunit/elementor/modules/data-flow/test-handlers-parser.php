<?php

use Elementor\Modules\DataFlow\Handlers_Parser;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_Handlers_Parser extends TestCase {

	public function test_sanitize__keeps_only_valid_handlers() {
		// Arrange
		$handlers = [
			[ 'event' => 'click', 'code' => 'setState( "count", 1 );', 'extra' => 'dropped' ],
			[ 'event' => 'not-an-event', 'code' => 'alert( 1 );' ],
			[ 'event' => 'init', 'code' => '   ' ],
			[ 'event' => 'init' ],
			'not-an-array',
		];

		// Act
		$result = Handlers_Parser::sanitize( $handlers );

		// Assert
		$this->assertSame( [
			[ 'event' => 'click', 'code' => 'setState( "count", 1 );' ],
		], $result );
	}

	public function test_sanitize__decodes_json_strings() {
		// Arrange
		$handlers = json_encode( [ [ 'event' => 'init', 'code' => 'console.log( state );' ] ] );

		// Act
		$result = Handlers_Parser::sanitize( $handlers );

		// Assert
		$this->assertSame( [ [ 'event' => 'init', 'code' => 'console.log( state );' ] ], $result );
	}

	public function test_sanitize__limits_handlers_per_element() {
		// Arrange
		$handlers = array_fill( 0, Handlers_Parser::MAX_HANDLERS_PER_ELEMENT + 5, [ 'event' => 'click', 'code' => 'x();' ] );

		// Act
		$result = Handlers_Parser::sanitize( $handlers );

		// Assert
		$this->assertCount( Handlers_Parser::MAX_HANDLERS_PER_ELEMENT, $result );
	}

	public function test_collect__walks_nested_elements() {
		// Arrange
		$elements = [
			[
				'id' => 'parent',
				'handlers' => [ [ 'event' => 'init', 'code' => 'a();' ] ],
				'elements' => [
					[
						'id' => 'child',
						'handlers' => [ [ 'event' => 'click', 'code' => 'b();' ] ],
					],
					[ 'id' => 'no-handlers' ],
				],
			],
		];

		// Act
		$result = Handlers_Parser::collect( $elements );

		// Assert
		$this->assertSame( [
			[
				'elementId' => 'parent',
				'handlers' => [ [ 'event' => 'init', 'code' => 'a();' ] ],
			],
			[
				'elementId' => 'child',
				'handlers' => [ [ 'event' => 'click', 'code' => 'b();' ] ],
			],
		], $result );
	}

	public function test_strip__removes_handlers_recursively() {
		// Arrange
		$elements = [
			[
				'id' => 'parent',
				'handlers' => [ [ 'event' => 'init', 'code' => 'a();' ] ],
				'elements' => [
					[
						'id' => 'child',
						'handlers' => [ [ 'event' => 'click', 'code' => 'b();' ] ],
					],
				],
			],
		];

		// Act
		$result = Handlers_Parser::strip( $elements );

		// Assert
		$this->assertSame( [
			[
				'id' => 'parent',
				'elements' => [
					[ 'id' => 'child' ],
				],
			],
		], $result );
	}
}
