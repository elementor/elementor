<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Linked_Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Linked_Dimensions_Prop_Type extends Elementor_Test_Base {
	public function test_validate_value__throws_when_passing_non_array() {
		// Arrange.
		$prop_type = Linked_Dimensions_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate_value( 'not-an-array' );
	}
}
