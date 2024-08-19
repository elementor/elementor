<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Schema\Constraints;

use Elementor\Modules\AtomicWidgets\Schema\Constraints\Enum;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Enum extends Elementor_Test_Base {

	public function test_construct__throws_when_not_all_values_are_strings() {
		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'All values in an enum must be strings.' );

		// Act.
		Enum::make( [ 'string', 1 ] );
	}

	public function test_validate__throws_when_value_is_not_a_string() {
		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Expected value to be of type `string`, but got `integer`.' );

		// Act.
		Enum::make( [ 'a', 'b', 'c' ] )->validate( 1 );
	}

	public function test_validate__throws_when_value_is_not_in_allowed_values() {
		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( '`d` is not in the list of allowed values (`a`, `b`, `c`).' );

		// Act.
		Enum::make( [ 'a', 'b', 'c' ] )->validate( 'd' );
	}
}
