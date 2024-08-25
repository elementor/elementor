<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Boolean_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Boolean_Type extends Elementor_Test_Base {

	public function test_validate__throws_when_passing_non_boolean() {
		// Arrange.
		$prop_type = new Boolean_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must be a boolean, string given.' );

		// Act.
		$prop_type->validate( 'string' );
	}
}
