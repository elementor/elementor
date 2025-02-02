<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Classes_Prop_Type extends Elementor_Test_Base {

	public function test_validate__fail_when_passing_non_array() {
		// Arrange.
		$prop_type = Classes_Prop_Type::make();

		// Act.
		$this->assertFalse( $prop_type->validate( [
			'$$type' => 'classes',
			'value' => 'string',
		] ) );
	}

	/**
	 * @dataProvider invalid_classes_data_provider
	 */
	public function test_validate__fail_when_passing_class_with_invalid_chars( $classes ) {
		// Arrange.
		$prop_type = Classes_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'classes',
			'value' => $classes,
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate() {
		// Arrange.
		$prop_type = Classes_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'classes',
			'value' => [ 'a', 'b-123', 'c_123' ],
		] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function invalid_classes_data_provider() {
		return [
			[ [ 'a', 'b', 3 ] ],
			[ [ 'a', 'b', '3' ] ],
			[ [ 'a', '2-b' ] ],
			[ [ 'a', '-b' ] ],
			[ [ 'a', '_b' ] ],
			[ [ 'a', 'אבג' ] ],
		];
	}
}
