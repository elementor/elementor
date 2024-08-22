<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Image_Type extends Elementor_Test_Base {

	public function test_validate_value__throws_when_passing_null() {
		// Arrange.
		$prop_type = new Image_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must have an `attachment_id` or a `url` key.' );

		// Act.
		$prop_type->validate_value( null );
	}

	public function test_validate_value__throws_when_passing_array_without_id_and_url() {
		// Arrange.
		$prop_type = new Image_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must have an `attachment_id` or a `url` key.' );

		// Act.
		$prop_type->validate_value( [ 'key' => 'test' ] );
	}

	public function test_validate_value__throws_when_passing_array_with_both_id_and_url() {
		// Arrange.
		$prop_type = new Image_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Value must have either an `attachment_id` or a `url` key, not both.' );

		// Act.
		$prop_type->validate_value( [
			'attachment_id' => 123,
			'url' => 'https://example.com/image.jpg',
		] );
	}

	public function test_validate_value__throws_when_passing_array_with_non_numeric_attachment_id() {
		// Arrange.
		$prop_type = new Image_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Attachment id must be numeric, string given.' );

		// Act.
		$prop_type->validate_value( [ 'attachment_id' => 'not-number' ] );
	}

	public function test_validate_value__throws_when_passing_array_with_non_string_url() {
		// Arrange.
		$prop_type = new Image_Type();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'URL must be a string, integer given.' );

		// Act.
		$prop_type->validate_value( [ 'url' => 123 ] );
	}
}
