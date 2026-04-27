<?php

namespace Elementor\Modules\Variables\Classes;

use \PHPUnit\Framework\TestCase;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;

/**
 * @gorup Elementor\Modules
 * @group Elementor\Modules\Variables
 * @group Elementor\Modules\Variables\Classes
 * @group Elementor\Modules\Variables\Classes\Size_Style_Schema
 */
class Test_Size_Style_Schema extends TestCase {
	private function style_schema() {
		return new Size_Style_Schema();
	}

	private function assertSchemaIsEqual( $expected, $actual ) {
		$this->assertEquals(
			json_decode( json_encode( $expected ), true ),
			json_decode( json_encode( $actual ), true ),
			'The expected schema and augmented (actual) schema do not match.'
		);
	}

	public function test_augment__will_skip_regular_style_definitions() {
		// Arrange.
		$style_def = [
			'font' => String_Prop_Type::make(),
			'background' => Color_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'font' => String_Prop_Type::make(),
			'background' => Color_Prop_Type::make(),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__will_convert_size_prop_type() {
		// Arrange.
		$style_def = [
			'color' => Color_Prop_Type::make(),
			'width' => Size_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'color' => Color_Prop_Type::make(),
			'width' => Union_Prop_Type::create_from( Size_Prop_Type::make() )
				->add_prop_type( Size_Variable_Prop_Type::make() ),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__does_not_change_size_with_time_units() {
		// Arrange.
		$style_def = [
			'duration' => Size_Prop_Type::make()->units( Size_Constants::transition() ),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'duration' => Size_Prop_Type::make()->units( Size_Constants::transition() ),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__does_not_change_size_with_angle_units() {
		// Arrange.
		$style_def = [
			'rotate' => Size_Prop_Type::make()->units( Size_Constants::rotate() ),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'rotate' => Size_Prop_Type::make()->units( Size_Constants::rotate() ),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__does_not_change_size_when_angle_unit_is_mixed_with_length_units() {
		// Arrange.
		$style_def = [
			'offset' => Size_Prop_Type::make()->units( [
				Size_Constants::UNIT_PX,
				Size_Constants::UNIT_DEG,
			] ),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'offset' => Size_Prop_Type::make()->units( [
				Size_Constants::UNIT_PX,
				Size_Constants::UNIT_DEG,
			] ),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__will_convert_item_of_array_prop_type() {
		// Arrange.
		$style_def = [
			'array' => $this->stub_array_prop_type()
				->set_item_type( Size_Prop_Type::make() ),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'array' => $this->stub_array_prop_type()
				->set_item_type(
					Union_Prop_Type::create_from( Size_Prop_Type::make() )
						->add_prop_type( Size_Variable_Prop_Type::make() )
				),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__will_update_the_union_prop_type() {
		// Arrange.
		$style_def = [
			'union' => Union_Prop_Type::make()
				->add_prop_type( Size_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make() ),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'union' => Union_Prop_Type::make()
				->add_prop_type( Size_Variable_Prop_Type::make() )
				->add_prop_type( Size_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make() ),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__multiple_times() {
		// Arrange.
		$style_def = [
			'size' => Size_Prop_Type::make()->required(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );
		$schema = $this->style_schema()->augment( $schema );
		$schema = $this->style_schema()->augment( $schema );

		// Assert.
		$expected = [
			'size' => Union_Prop_Type::make()->required()
				->add_prop_type( Size_Variable_Prop_Type::make() )
				->add_prop_type( Size_Prop_Type::make()->required() ),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	private function stub_array_prop_type() {
		return new class() extends Array_Prop_Type {
			protected function define_item_type(): Prop_Type {
				return String_Prop_Type::make();
			}

			public static function get_key(): string {
				return 'stub-array-prop-type';
			}
		};
	}
}
