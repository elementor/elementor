<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Classes_Type extends Elementor_Test_Base {

	public function test_validate_value__throws_when_passing_non_array() {
		// Arrange.
		$prop_type = new Classes_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must be an array, string given.' );

		// Act.
		$prop_type->validate_value( 'string' );
	}

	public function test_validate_value__throws_when_passing_non_strings_in_the_array() {
		// Arrange.
		$prop_type = new Classes_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'All classes must be strings.' );

		// Act.
		$prop_type->validate_value( [ 'a', 'b', 3 ] );
	}
}
