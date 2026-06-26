<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Object_Field_Merge_Converter;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * DB-less: asserts the raw PropValue structure only. Background_Prop_Type::make()/validate() build the
 * image-overlay shape which calls WordPress (Image_Sizes), so schema validation lives in the REST suite.
 */
class Test_Object_Field_Merge_Converter extends TestCase {
	const CLIP_ENUM = [ 'border-box', 'padding-box', 'content-box', 'text' ];

	public function test_convert__first_time_creates_partial_background_object() {
		// Arrange.
		$converter = $this->color_converter();
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'background-color', 'value' => 'red' ] );

		// Assert.
		$this->assertTrue( $converted );
		$this->assertSame(
			[ '$$type' => 'background', 'value' => [ 'color' => $this->color( 'red' ) ] ],
			$context->get_prop( 'background' )
		);
	}

	public function test_convert__merges_sibling_fields_into_one_object() {
		// Arrange.
		$context = new Conversion_Context();

		// Act: color + clip accumulate into the same background object.
		$this->color_converter()->convert( $context, [ 'property' => 'background-color', 'value' => 'red' ] );
		$this->clip_converter()->convert( $context, [ 'property' => 'background-clip', 'value' => 'text' ] );

		// Assert.
		$this->assertSame(
			[
				'$$type' => 'background',
				'value' => [
					'color' => $this->color( 'red' ),
					'clip' => $this->string( 'text' ),
				],
			],
			$context->get_prop( 'background' )
		);
	}

	public function test_convert__declines_multi_token_color_and_leaves_target_untouched() {
		// Arrange.
		$context = new Conversion_Context();
		$this->color_converter()->convert( $context, [ 'property' => 'background-color', 'value' => 'red' ] );

		// Act: a two-token color has no faithful single-Color representation.
		$converted = $this->color_converter()->convert( $context, [ 'property' => 'background-color', 'value' => 'red blue' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertSame(
			[ '$$type' => 'background', 'value' => [ 'color' => $this->color( 'red' ) ] ],
			$context->get_prop( 'background' )
		);
	}

	public function test_convert__keeps_functional_color_with_internal_spaces_as_one_token() {
		// Arrange.
		$converter = $this->color_converter();
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'background-color', 'value' => 'rgb(255 0 0)' ] );

		// Assert.
		$this->assertTrue( $converted );
		$this->assertSame(
			[ '$$type' => 'background', 'value' => [ 'color' => $this->color( 'rgb(255 0 0)' ) ] ],
			$context->get_prop( 'background' )
		);
	}

	public function test_convert__declines_out_of_enum_clip() {
		// Arrange.
		$converter = $this->clip_converter();
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'background-clip', 'value' => 'banana' ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertNull( $context->get_prop( 'background' ) );
	}

	private function color_converter(): Object_Field_Merge_Converter {
		return new Object_Field_Merge_Converter(
			'background-color',
			'background',
			'background',
			'color',
			Color_Prop_Type::class,
			\Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type::class,
			null,
			true
		);
	}

	private function clip_converter(): Object_Field_Merge_Converter {
		return new Object_Field_Merge_Converter(
			'background-clip',
			'background',
			'background',
			'clip',
			String_Prop_Type::class,
			\Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type::class,
			self::CLIP_ENUM
		);
	}

	private function color( string $value ): array {
		return [ '$$type' => 'color', 'value' => $value ];
	}

	private function string( string $value ): array {
		return [ '$$type' => 'string', 'value' => $value ];
	}
}
