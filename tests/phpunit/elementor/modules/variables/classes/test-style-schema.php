<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use \PHPUnit\Framework\TestCase;

/**
 * @gorup Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Style_Schema extends TestCase {
	private function style_schema() {
		return new Style_Schema();
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
			'width' => Size_Prop_Type::make(),
			'height' => Size_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$this->assertSchemaIsEqual( $schema, $style_def );
	}

	public function test_augment__will_convert_color_prop_type() {
		// Arrange.
		$style_def = [
			'color' => Color_Prop_Type::make(),
			'width' => Size_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'width' => Size_Prop_Type::make(),
			'color' => Union_Prop_Type::make()
				->add_prop_type( Color_Prop_Type::make() )
				->add_prop_type( Color_Variable_Prop_Type::make() ),
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

	public function test_augment__will_convert_item_of_array_prop_type() {
		// Arrange.
		$style_def = [
			'color-gradient' => $this->stub_array_prop_type()
				->set_item_type( Color_Prop_Type::make() ),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'color-gradient' => $this->stub_array_prop_type()
				->set_item_type(
					Union_Prop_Type::make()
						->add_prop_type( Color_Variable_Prop_Type::make() )
						->add_prop_type( Color_Prop_Type::make() )
				)
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__will_update_background_prop_type() {
		// Arrange.
		$style_def = [
			'bg' => Background_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'bg' => $this->stub_background_prop_type(),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	private function stub_background_prop_type() {
		return new class() extends Object_Prop_Type {
			public static function get_key(): string {
				return 'background';
			}

			protected function define_shape(): array {
				return [
					'color' => Union_Prop_Type::make()
						->add_prop_type( Color_Prop_Type::make() )
						->add_prop_type( Color_Variable_Prop_Type::make() ),

					'background-overlay' => new class() extends Array_Prop_Type {
						public static function get_key(): string {
							return 'background-overlay';
						}

						public function define_item_type(): Prop_Type {
							return Union_Prop_Type::make()
								->add_prop_type( Background_Image_Overlay_Prop_Type::make() )
								->add_prop_type( new class() extends Object_Prop_Type {
									public static function get_key(): string {
										return 'background-color-overlay';
									}

									public function define_shape(): array {
										return [
											'color' => Union_Prop_Type::make()
												->add_prop_type( Color_Prop_Type::make() )
												->add_prop_type( Color_Variable_Prop_Type::make() ),
										];
									}
								} );
						}
					},
				];
			}
		};
	}
}
