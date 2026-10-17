<?php

use Elementor\Modules\DataFlow\State_CSS;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_State_CSS extends TestCase {
	/**
	 * @dataProvider value_provider
	 */
	public function test_value( $value, string $prop_type, ?string $expected ) {
		// Act
		$result = State_CSS::value( $value, $prop_type );

		// Assert
		$this->assertSame( $expected, $result );
	}

	public function value_provider(): array {
		return [
			'number' => [ 12.5, 'number', '12.5' ],
			'non finite number' => [ INF, 'number', null ],
			'size' => [ [ '$$type' => 'size', 'value' => [ 'size' => 40, 'unit' => 'px' ] ], 'size', '40px' ],
			'size with unknown unit' => [ [ 'size' => 4, 'unit' => 'custom' ], 'size', null ],
			'color hex' => [ [ '$$type' => 'color', 'value' => '#aabbcc' ], 'color', '#aabbcc' ],
			'color injection' => [ 'red;}</style>', 'color', null ],
			'enum' => [ 'dark-mode', 'enum', 'dark-mode' ],
			'enum with spaces' => [ 'a b', 'enum', null ],
			'safe string' => [ 'Hello world', 'string', 'Hello world' ],
			'unsafe string' => [ 'a;b{c}', 'string', null ],
			'boolean' => [ true, 'boolean', null ],
			'json' => [ [ 'a' => 1 ], 'json', null ],
		];
	}

	public function test_variables__uses_the_declared_type_and_infers_it_when_undeclared() {
		// Arrange
		$state = [ 'width' => [ 'size' => 3, 'unit' => 'rem' ], 'count' => 4, 'open' => true ];
		$schema = [ 'width' => [ 'prop_type' => 'size' ] ];

		// Act
		$result = State_CSS::variables( $state, $schema );

		// Assert
		$this->assertSame( [ '--e-state-width' => '3rem', '--e-state-count' => '4' ], $result );
	}

	public function test_classes__lists_only_true_booleans() {
		// Act
		$result = State_CSS::classes( [ 'open' => true, 'closed' => false, 'count' => 1 ] );

		// Assert
		$this->assertSame( [ 'e--state-open' ], $result );
	}

	public function test_merge_style__appends_to_existing_declarations() {
		// Act
		$result = State_CSS::merge_style( 'color:red', [ '--e-state-a' => '1' ] );

		// Assert
		$this->assertSame( 'color:red;--e-state-a:1;', $result );
	}
}
