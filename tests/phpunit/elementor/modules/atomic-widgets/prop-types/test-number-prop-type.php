<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Number_Prop_Type extends Elementor_Test_Base {

	public function test_validate__throws_when_passing_non_number() {
		// Arrange.
		$prop_type = Number_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must be a number, string given.' );

		// Act.
		$prop_type->validate( 'string' );
	}

	public function test_enum__throws_when_not_all_values_are_numbers() {
		// Arrange.
		$prop_type = Number_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'All values in an enum must be numbers.' );

		// Act.
		$prop_type->enum( [ 123, 'string' ] );
	}

	public function test_validate__throws_when_value_is_not_in_allowed_values() {
		// Arrange.
		$prop_type = Number_Prop_Type::make()
			->enum( [ 1, 2, 3 ] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( '`4` is not in the list of allowed values (`1`, `2`, `3`).' );

		// Act.
		$prop_type->validate( 4 );
	}
}
