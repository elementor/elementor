<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Transformable_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Transformable_Type extends Elementor_Test_Base {

	public function test_validate__throws_when_value_doesnt_have_type_key() {
		// Arrange.
		$prop_type = new class extends Transformable_Type {
			public function get_type(): string {
				return 'transformable';
			}

			protected function validate_value( $value ): void {}
		};

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must have a `$$type` key.' );

		// Act.
		$prop_type->validate( [
			'value' => 'string',
		] );
	}

	public function test_validate__throws_when_type_is_not_string() {
		// Arrange.
		$prop_type = new class extends Transformable_Type {
			public function get_type(): string {
				return 'transformable';
			}

			protected function validate_value( $value ): void {}
		};

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Key `$$type` must be a string, integer given.' );

		// Act.
		$prop_type->validate( [
			'$$type' => 123,
		] );
	}

	public function test_validate__throws_when_type_is_not_the_expected_type() {
		// Arrange.
		$prop_type = new class extends Transformable_Type {
			public function get_type(): string {
				return 'transformable';
			}

			protected function validate_value( $value ): void {}
		};

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( '`$$type` must be `transformable`, `not-transformable` given.' );

		// Act.
		$prop_type->validate( [
			'$$type' => 'not-transformable',
		] );
	}

	public function test_validate__throws_when_value_doesnt_have_value_key() {
		// Arrange.
		$prop_type = new class extends Transformable_Type {
			public function get_type(): string {
				return 'transformable';
			}

			protected function validate_value( $value ): void {}
		};

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must have a `value` key.' );

		// Act.
		$prop_type->validate( [
			'$$type' => 'transformable',
		] );
	}
}
