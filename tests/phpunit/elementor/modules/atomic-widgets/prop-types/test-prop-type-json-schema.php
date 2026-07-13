<?php

namespace Elementor\Tests\Phpunit\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Unknown_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\AtomicWidgets\PropTypes
 */
class Test_Prop_Type_Json_Schema extends TestCase {

	public function test_to_json_schema__string_prop_type() {
		// Arrange
		$prop_type = String_Prop_Type::make()->meta( 'description', 'A string property' );

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( 'A string property', $result['description'] );
		$this->assertSame( 'object', $result['type'] );
		$this->assertSame( [ '$$type', 'value' ], $result['required'] );
		$this->assertSame( [ 'type' => 'string', 'const' => 'string' ], $result['properties']['$$type'] );
		$this->assertSame( [ 'type' => 'string' ], $result['properties']['value'] );
	}

	public function test_to_json_schema__number_prop_type() {
		// Arrange
		$prop_type = Number_Prop_Type::make()->meta( 'description', 'A number property' );

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( 'A number property', $result['description'] );
		$this->assertSame( [ 'type' => 'string', 'const' => 'number' ], $result['properties']['$$type'] );
		$this->assertSame( [ 'type' => 'number' ], $result['properties']['value'] );
	}

	public function test_to_json_schema__boolean_prop_type() {
		// Arrange
		$prop_type = Boolean_Prop_Type::make()->meta( 'description', 'A boolean property' );

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( 'A boolean property', $result['description'] );
		$this->assertSame( [ 'type' => 'string', 'const' => 'boolean' ], $result['properties']['$$type'] );
		$this->assertSame( [ 'type' => 'boolean' ], $result['properties']['value'] );
	}

	public function test_to_json_schema__string_prop_type_with_enum() {
		// Arrange
		$prop_type = String_Prop_Type::make()->enum( [ 'start', 'center', 'end' ] );

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( [ 'start', 'center', 'end' ], $result['properties']['value']['enum'] );
	}

	public function test_to_json_schema__unknown_prop_type_returns_empty_object() {
		// Arrange
		$prop_type = Unknown_Prop_Type::make();

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( [], $result );
	}

	public function test_to_json_schema__union_prop_type() {
		// Arrange
		$prop_type = Union_Prop_Type::make()
			->add_prop_type( String_Prop_Type::make() )
			->add_prop_type( Number_Prop_Type::make() )
			->meta( 'description', 'A union of string and number' );

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( 'A union of string and number', $result['description'] );
		$this->assertArrayHasKey( 'anyOf', $result );
		$this->assertCount( 2, $result['anyOf'] );
	}

	public function test_to_json_schema__object_prop_type() {
		// Arrange
		$prop_type = $this->create_simple_object_prop_type();

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( 'object', $result['type'] );
		$this->assertSame( [ 'type' => 'string', 'const' => 'test-object' ], $result['properties']['$$type'] );
		$this->assertSame( 'object', $result['properties']['value']['type'] );
		$this->assertArrayHasKey( 'name', $result['properties']['value']['properties'] );
	}

	public function test_to_json_schema__object_prop_type_with_required_field() {
		// Arrange
		$prop_type = $this->create_object_with_required_field();

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertContains( 'required_field', $result['properties']['value']['required'] );
	}

	public function test_to_json_schema__array_prop_type() {
		// Arrange
		$prop_type = $this->create_simple_array_prop_type();

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( 'object', $result['type'] );
		$this->assertSame( [ 'type' => 'string', 'const' => 'test-array' ], $result['properties']['$$type'] );
		$this->assertSame( 'array', $result['properties']['value']['type'] );
		$this->assertArrayHasKey( 'items', $result['properties']['value'] );
	}

	public function test_to_json_schema__classes_prop_type() {
		// Arrange
		$prop_type = Classes_Prop_Type::make();

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( 'object', $result['type'] );
		$this->assertSame( [ 'type' => 'string', 'const' => 'classes' ], $result['properties']['$$type'] );
		$this->assertSame(
			[ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
			$result['properties']['value']
		);
	}

	public function test_to_json_schema__overridable_prop_type_wraps_origin_schema() {
		// Arrange
		$prop_type = Overridable_Prop_Type::make()->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( [ 'type' => 'string', 'const' => 'overridable' ], $result['properties']['$$type'] );

		$value = $result['properties']['value'];
		$this->assertSame( 'object', $value['type'] );
		$this->assertSame( [ 'override_key', 'origin_value' ], $value['required'] );
		$this->assertSame( [ 'type' => 'string' ], $value['properties']['override_key'] );
		$this->assertSame(
			[ 'type' => 'string', 'const' => 'string' ],
			$value['properties']['origin_value']['properties']['$$type']
		);
	}

	public function test_to_json_schema__plain_prop_type_without_override_uses_envelope() {
		// Arrange
		$prop_type = $this->create_plain_prop_type_without_override();

		// Act
		$result = $prop_type->to_json_schema();

		// Assert
		$this->assertSame( 'object', $result['type'] );
		$this->assertSame( [ '$$type', 'value' ], $result['required'] );
		$this->assertSame( [ 'type' => 'string', 'const' => 'plain-test' ], $result['properties']['$$type'] );
		$this->assertSame( [ 'type' => 'object' ], $result['properties']['value'] );
	}

	private function create_plain_prop_type_without_override(): Prop_Type {
		return new class extends \Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type {
			public static function get_key(): string {
				return 'plain-test';
			}

			protected function validate_value( $value ): bool {
				return true;
			}

			protected function sanitize_value( $value ) {
				return $value;
			}
		};
	}

	private function create_simple_object_prop_type(): Object_Prop_Type {
		return new class extends Object_Prop_Type {
			public static function get_key(): string {
				return 'test-object';
			}

			protected function define_shape(): array {
				return [
					'name' => String_Prop_Type::make(),
				];
			}
		};
	}

	private function create_object_with_required_field(): Object_Prop_Type {
		return new class extends Object_Prop_Type {
			public static function get_key(): string {
				return 'test-object-required';
			}

			protected function define_shape(): array {
				return [
					'required_field' => String_Prop_Type::make()->required(),
					'optional_field' => String_Prop_Type::make(),
				];
			}
		};
	}

	private function create_simple_array_prop_type(): Array_Prop_Type {
		return new class extends Array_Prop_Type {
			public static function get_key(): string {
				return 'test-array';
			}

			protected function define_item_type(): Prop_Type {
				return String_Prop_Type::make();
			}
		};
	}
}
