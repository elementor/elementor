<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Number_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Number_Type extends Elementor_Test_Base {

	public function test_validate__throws_when_passing_non_number() {
		// Arrange.
		$prop_type = new Number_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must be a number, string given.' );

		// Act.
		$prop_type->validate( 'string' );
	}
}
