<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
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
			'width' => String_Prop_Type::make(),
			'height' => String_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'width' => String_Prop_Type::make(),
			'height' => String_Prop_Type::make(),
		];

		$this->assertSchemaIsEqual( $schema, $expected );
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
			'color' => Union_Prop_Type::make()
				->add_prop_type( Color_Prop_Type::make() )
				->add_prop_type( Color_Variable_Prop_Type::make() ),
			'width' => Size_Prop_Type::make(),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__will_convert_size_prop_type() {
		// Arrange.
		$style_def = [
			'width' => Size_Prop_Type::make(),
			'height' => Size_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'width' => Size_Prop_Type::make(),
			'height' => Size_Prop_Type::make(),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__will_convert_font_prop_type() {
		// Arrange.
		$style_def = [
			'font-family' => String_Prop_Type::make(),
			'some-type' => String_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'some-type' => String_Prop_Type::make(),
			'font-family' => Union_Prop_Type::make()
				->add_prop_type( Font_Variable_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make() ),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__will_convert_item_of_array_prop_type() {
		// Arrange.
		$style_def = [
			'array' => $this->stub_array_prop_type()
				->set_item_type( Color_Prop_Type::make() ),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'array' => $this->stub_array_prop_type()
				->set_item_type(
					Union_Prop_Type::make()
						->add_prop_type( Color_Variable_Prop_Type::make() )
						->add_prop_type( Color_Prop_Type::make() )
				),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__will_update_the_union_prop_type() {
		// Arrange.
		$style_def = [
			'union' => Union_Prop_Type::make()
				->add_prop_type( Color_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make() ),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'union' => Union_Prop_Type::make()
				->add_prop_type( Color_Variable_Prop_Type::make() )
				->add_prop_type( Color_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make() ),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	public function test_augment__multiple_times() {
		// Arrange.
		$style_def = [
			'color' => Color_Prop_Type::make()->required()
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );
		$schema = $this->style_schema()->augment( $schema );
		$schema = $this->style_schema()->augment( $schema );

		// Assert.
		$expected = [
			'color' => Union_Prop_Type::make()->required()
			  ->add_prop_type( Color_Variable_Prop_Type::make() )
			  ->add_prop_type( Color_Prop_Type::make()->required() ),
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
			'bg' => $this->expected_background_prop_type(),
		];

		$this->assertSchemaIsEqual( $expected, $schema );
	}

	private function expected_background_prop_type() {
		$bg_prop_type = Background_Prop_Type::make();

		$shape = $bg_prop_type->get_shape();

		$shape['color'] = Union_Prop_Type::make()
			->add_prop_type( Color_Prop_Type::make() )
			->add_prop_type( Color_Variable_Prop_Type::make() );

		$overlay_item = $shape['background-overlay']->get_item_type();

		foreach ( $overlay_item->get_prop_types() as $prop_type ) {
			if ( 'background-color-overlay' === $prop_type->get_key() ) {
				$bg_color_shape = $prop_type->get_shape();

				$bg_color_shape['color'] = Union_Prop_Type::make()
					->add_prop_type( Color_Prop_Type::make()->initial_value( '#00000033' ) )
					->add_prop_type( Color_Variable_Prop_Type::make() )
					->initial_value( [
							'$$type' => 'color',
							'value' => '#00000033'
					] );

				$prop_type->set_shape( $bg_color_shape );
			}

			if ( 'background-gradient-overlay' === $prop_type->get_key() ) {
				$bg_gradient_shape = $prop_type->get_shape();

				$gradient_stop_shape = $bg_gradient_shape['stops']->get_item_type()
					->get_shape();

				$gradient_stop_shape['color'] = Union_Prop_Type::make()
					->add_prop_type( Color_Prop_Type::make() )
					->add_prop_type( Color_Variable_Prop_Type::make() );

				$bg_gradient_shape['stops']->get_item_type()
					->set_shape( $gradient_stop_shape );

				$prop_type->set_shape( $bg_gradient_shape );
			}

			if ( 'background-image-overlay' === $prop_type->get_key() ) {
				$bg_image_shape = $prop_type->get_shape();

				if ( isset( $bg_image_shape['size'] ) ) {
					foreach ( $bg_image_shape['size']->get_prop_types() as $size_prop_type ) {
						if ( $size_prop_type->get_key() === 'background-image-size-scale' ) {
							$size_scale_shape = $size_prop_type->get_shape();

							$size_prop_type->set_shape( $size_scale_shape );
						}
					}
				}

				if ( isset( $bg_image_shape['position'] ) ) {
					foreach ( $bg_image_shape['position']->get_prop_types() as $position_prop_type ) {
						if ( $position_prop_type->get_key() === 'background-image-position-offset' ) {
							$position_offset_shape = $position_prop_type->get_shape();

							$position_prop_type->set_shape( $position_offset_shape );
						}
					}
				}

				$prop_type->set_shape( $bg_image_shape );
			}
		}

		$shape['background-overlay']->set_item_type($overlay_item);

		return $bg_prop_type->set_shape( $shape );
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
