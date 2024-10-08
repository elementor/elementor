<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Size_Prop_Type extends Elementor_Test_Base {
	public function test_validate_value__throws_when_passing_non_array() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate_value( 'not-an-array' );
	}

	public function test_validate_value__throws_when_size_not_set() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate_value( ['unit' => 'px'] );
	}

	public function test_validate_value__throws_when_unit_not_set() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate_value( ['size' => 10] );
	}

	public function test_validate_value__throws_when_unit_is_not_allowed() {
		// Arrange.
		$prop_type = Size_Prop_Type::make()->units( ['px'] );

		// Expect.
		$this->expectException( \Exception::class );

		// Act.
		$prop_type->validate_value( ['size' => 10, 'unit' => 'not-allowed'] );
	}
}
