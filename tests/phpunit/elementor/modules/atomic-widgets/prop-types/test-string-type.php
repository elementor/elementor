<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\String_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_String_Type extends Elementor_Test_Base {

	public function test_validate__throws_when_passing_non_string() {
		// Arrange.
		$prop_type = new String_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must be a string, integer given.' );

		// Act.
		$prop_type->validate( 123 );
	}
}
