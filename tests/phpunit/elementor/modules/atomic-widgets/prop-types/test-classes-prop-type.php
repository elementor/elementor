<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Classes_Prop_Type extends Elementor_Test_Base {

	public function test_validate__throws_when_passing_non_array() {
		// Arrange.
		$prop_type = Classes_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must be an array, string given.' );

		// Act.
		$prop_type->validate( [
			'$$type' => 'classes',
			'value' => 'string',
		] );
	}

	/**
	 * @dataProvider invalid_classes_data_provider
	 */
	public function test_validate__throws_when_passing_a_class_that_starts_with_number( $classes ) {
		// Arrange.
		$prop_type = Classes_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'All classes must start with an english letter, and contain only english letters, numbers, hyphens, and underscores.' );

		// Act.
		$prop_type->validate( [
			'$$type' => 'classes',
			'value' => $classes,
		] );
	}

	public function test_validate() {
		// Arrange.
		$prop_type = Classes_Prop_Type::make();

		// Expect - Make sure that the validation does not throw any exceptions.
		$this->expectNotToPerformAssertions();

		// Act.
		$prop_type->validate( [
			'$$type' => 'classes',
			'value' => [ 'a', 'b-123', 'c_123' ],
		] );
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
