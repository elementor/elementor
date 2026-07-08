<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Utils;

use Elementor\Modules\AtomicWidgets\Utils\Element_Position;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Element_Position extends TestCase {

	/**
	 * @dataProvider position_constructors_provider
	 */
	public function test_position_constructors( callable $factory, string $expected_kind, $expected_value ) {
		// Act.
		$position = $factory();

		// Assert.
		$this->assertSame( $expected_kind, $position->to_array()['kind'] );
		$this->assertSame( $expected_value, $position->to_array()['value'] );
	}

	public function position_constructors_provider(): array {
		return [
			'last' => [ fn() => Element_Position::last(), 'last', null ],
			'first' => [ fn() => Element_Position::first(), 'first', null ],
			'at_index' => [ fn() => Element_Position::at_index( 3 ), 'index', 3 ],
			'after_type' => [ fn() => Element_Position::after_type( 'e-layout' ), 'after_type', 'e-layout' ],
			'before_type' => [ fn() => Element_Position::before_type( 'e-layout' ), 'before_type', 'e-layout' ],
		];
	}

	public function test_at_index_rejects_negative_index() {
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessageMatches( '/index must be >= 0/' );

		Element_Position::at_index( -1 );
	}

	public function test_after_type_rejects_empty_element_type() {
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessageMatches( '/element_type must be a non-empty string/' );

		Element_Position::after_type( '   ' );
	}

	public function test_before_type_rejects_empty_element_type() {
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessageMatches( '/element_type must be a non-empty string/' );

		Element_Position::before_type( '' );
	}
}
