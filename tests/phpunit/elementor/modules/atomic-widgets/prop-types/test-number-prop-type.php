<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Number_Prop_Type extends Elementor_Test_Base {
	public function test_validate() {
		// Arrange.
		$prop_type = Number_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [ '$$type' => 'number', 'value' => 1 ] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__fail_when_passing_non_number() {
		// Arrange.
		$prop_type = Number_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [ '$$type' => 'number', 'value' => 'string' ] );

		// Assert.
		$this->assertFalse( $result );
	}
}
