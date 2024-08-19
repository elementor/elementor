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
}
