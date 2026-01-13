<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type_Migrator;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Prop_Type_Migrator extends TestCase {

	public function test_migrate__migrates_string_to_html() {
		// Arrange.
		$value = [
			'$$type' => 'string',
			'value' => 'Test content',
		];
		$prop_type = Html_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( 'html', $result['$$type'] );
		$this->assertEquals( 'Test content', $result['value'] );
	}

	public function test_migrate__migrates_html_to_string() {
		// Arrange.
		$value = [
			'$$type' => 'html',
			'value' => 'Test content',
		];
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertEquals( 'Test content', $result['value'] );
	}

	public function test_migrate__returns_value_as_is_when_already_matches() {
		// Arrange.
		$value = [
			'$$type' => 'html',
			'value' => 'Test content',
		];
		$prop_type = Html_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( 'html', $result['$$type'] );
		$this->assertEquals( 'Test content', $result['value'] );
	}

	public function test_migrate__returns_non_transformable_value_as_is() {
		// Arrange.
		$value = 'plain string';
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( 'plain string', $result );
	}

	public function test_migrate__returns_value_as_is_when_not_array() {
		// Arrange.
		$value = 123;
		$prop_type = Number_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( 123, $result );
	}

	public function test_migrate__returns_value_as_is_when_missing_type_key() {
		// Arrange.
		$value = [
			'value' => 'Test content',
		];
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( $value, $result );
	}

	public function test_migrate__returns_value_as_is_when_missing_value_key() {
		// Arrange.
		$value = [
			'$$type' => 'string',
		];
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( $value, $result );
	}

	public function test_migrate__returns_value_as_is_when_not_compatible() {
		// Arrange.
		$value = [
			'$$type' => 'number',
			'value' => 123,
		];
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( 'number', $result['$$type'] );
		$this->assertEquals( 123, $result['value'] );
	}

	public function test_migrate__returns_value_as_is_for_non_migratable_prop_type() {
		// Arrange.
		$value = [
			'$$type' => 'string',
			'value' => 'Test content',
		];
		$prop_type = Number_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertEquals( 'Test content', $result['value'] );
	}

	public function test_migrate__migrates_for_union_type_with_matching_sub_type() {
		// Arrange.
		$value = [
			'$$type' => 'string',
			'value' => 'Test content',
		];
		$union_prop_type = Union_Prop_Type::make()
			->add_prop_type( Html_Prop_Type::make() )
			->add_prop_type( String_Prop_Type::make() );

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $union_prop_type );

		// Assert.
		$this->assertEquals( 'html', $result['$$type'] );
		$this->assertEquals( 'Test content', $result['value'] );
	}

	public function test_migrate__returns_value_as_is_for_union_type_when_already_matches() {
		// Arrange.
		$value = [
			'$$type' => 'html',
			'value' => 'Test content',
		];
		$union_prop_type = Union_Prop_Type::make()
			->add_prop_type( Html_Prop_Type::make() )
			->add_prop_type( String_Prop_Type::make() );

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $union_prop_type );

		// Assert.
		$this->assertEquals( 'html', $result['$$type'] );
		$this->assertEquals( 'Test content', $result['value'] );
	}

	public function test_migrate__returns_value_as_is_for_union_type_when_not_compatible() {
		// Arrange.
		$value = [
			'$$type' => 'number',
			'value' => 123,
		];
		$union_prop_type = Union_Prop_Type::make()
			->add_prop_type( Html_Prop_Type::make() )
			->add_prop_type( String_Prop_Type::make() );

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $union_prop_type );

		// Assert.
		$this->assertEquals( 'number', $result['$$type'] );
		$this->assertEquals( 123, $result['value'] );
	}

	public function test_migrate__handles_union_type_with_non_migratable_sub_types() {
		// Arrange.
		$value = [
			'$$type' => 'string',
			'value' => 'Test content',
		];
		$union_prop_type = Union_Prop_Type::make()
			->add_prop_type( Number_Prop_Type::make() )
			->add_prop_type( String_Prop_Type::make() );

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $union_prop_type );

		// Assert.
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertEquals( 'Test content', $result['value'] );
	}

	public function test_migrate__preserves_disabled_flag() {
		// Arrange.
		$value = [
			'$$type' => 'string',
			'value' => 'Test content',
			'disabled' => true,
		];
		$prop_type = Html_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( 'html', $result['$$type'] );
		$this->assertEquals( 'Test content', $result['value'] );
		$this->assertTrue( $result['disabled'] );
	}

	public function test_migrate__handles_empty_string_value() {
		// Arrange.
		$value = [
			'$$type' => 'string',
			'value' => '',
		];
		$prop_type = Html_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertEquals( 'html', $result['$$type'] );
		$this->assertEquals( '', $result['value'] );
	}

	public function test_migrate__handles_null_value() {
		// Arrange.
		$value = null;
		$prop_type = String_Prop_Type::make();

		// Act.
		$result = Prop_Type_Migrator::migrate( $value, $prop_type );

		// Assert.
		$this->assertNull( $result );
	}
}

