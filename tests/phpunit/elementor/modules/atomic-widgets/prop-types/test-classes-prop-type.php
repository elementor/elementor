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
			'value' => [ [ '$$type' => 'string', 'value' => 'a' ], [ '$$type' => 'string', 'value' => 'b-123' ], [ '$$type' => 'string', 'value' => 'c_123' ] ],
		] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function invalid_classes_data_provider() {
		return [
			[ [
				[ '$$type' => 'string', 'value' => 'a'],
				[ '$$type' => 'string', 'value' => 'b'],
				[ '$$type' => 'number', 'value' => 3 ],
			] ],
			[ [
				[ '$$type' => 'string', 'value' => 'a'],
				[ '$$type' => 'string', 'value' => 'b'],
				[ '$$type' => 'string', 'value' => '3'] 
			] ],
			[ [
				[ '$$type' => 'string', 'value' => 'a'],
				[ '$$type' => 'string', 'value' => '2-b']
			] ],
			[ [
				[ '$$type' => 'string', 'value' => 'a'],
				[ '$$type' => 'string', 'value' => '-b' ]
			] ],
			[ [
				[ '$$type' => 'string', 'value' => 'a'],
				[ '$$type' => 'string', 'value' => '_b' ]
			] ],
			[ [
				[ '$$type' => 'string', 'value' => 'a'],
				[ '$$type' => 'string', 'value' => 'אבג']
			] ],
		];
	}
}
