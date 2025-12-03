<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_String_Prop_Type extends TestCase {

	public function test_enum__throws_when_not_all_values_are_strings() {
		// Arrange.
		$prop_type = String_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'All values in an enum must be strings.' );

		// Act.
		$prop_type->enum( [ 'string', 123 ] );
	}

	public function test_validate() {
		// Arrange.
		$prop_type = String_Prop_Type::make()->enum( [ 'a', 'b', 'c' ] );

		// Act.
		$result = $prop_type->validate( [ '$$type' => 'string', 'value' => 'a' ] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__fail_when_value_is_not_a_string() {
		// Arrange.
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [ '$$type' => 'string', 'value' => 123 ] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fail_when_value_is_not_in_allowed_values() {
		// Arrange.
		$prop_type = String_Prop_Type::make()
			->enum( [ 'a', 'b', 'c' ] );

		// Act.
		$result = $prop_type->validate( [ '$$type' => 'string', 'value' => 'd' ] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_sanitize__sanitizes_html() {
		// Arrange.
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [ '$$type' => 'string', 'value' => '<script>alert("XSS")</script>' ] );

		// Assert.
		$this->assertEquals( '', $result['value'] );
	}

	public function test_sanitize_sanitizes_url_encoded_string() {
		// Arrange.
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [ '$$type' => 'string', 'value' => '%3Cscript%3Ealert%28%22XSS%22%29%3C%2Fscript%3E' ] );

		// Assert.
		$this->assertEquals( 'scriptalertXSSscript', $result['value'] );
	}

	public function test_sanitize__sanitizes_string_and_keeps_whitespaces() {
		// Arrange.
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [ '$$type' => 'string', 'value' => '   sani<script>test</script>   ' ] );

		// Assert.
		$this->assertEquals( '   sani   ', $result['value'] );
	}

	public function test_initial_value_with_string_prop_type() {
		// Arrange.
		$prop_type = String_Prop_Type::make()->initial_value( 'default text' );

		// Act.
		$result = $prop_type->get_initial_value();

		$expected = [
			'$$type' => 'string',
			'value' => 'default text',
		];

		// Assert.
		$this->assertEquals( $expected, $result );
	}

	public function test_initial_value_is_included_in_json_serialization() {
		// Arrange.
		$prop_type = String_Prop_Type::make()->initial_value( 'This is my initial text' );

		// Act.
		$serialized = $prop_type->jsonSerialize();

		$expected = [
			'$$type' => 'string',
			'value' => 'This is my initial text',
		];

		// Assert.
		$this->assertSame( $expected, $serialized['initial_value'] );
	}
}
