<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Object_Side_Merge_Converter;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Object_Side_Merge_Converter extends TestCase {
	const WIDTH_KEYS = [ 'block-start', 'inline-end', 'block-end', 'inline-start' ];
	const RADIUS_KEYS = [ 'start-start', 'start-end', 'end-end', 'end-start' ];

	public function test_convert__first_time_creates_partial_object() {
		// Arrange.
		$converter = $this->width_converter( 'border-top-width', 'block-start' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'border-top-width', 'value' => '2px' ] );

		// Assert: only the named side is set; the partial object still validates.
		$prop_value = $context->get_prop( 'border-width' );

		$this->assertTrue( $converted );
		$this->assertSame(
			[ '$$type' => 'border-width-v2', 'value' => [ 'block-start' => $this->size( 2 ) ] ],
			$prop_value
		);
		$this->assertTrue( Border_Width_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__merges_sibling_sides_into_one_object() {
		// Arrange.
		$context = new Conversion_Context();

		// Act: two side declarations accumulate into the same border-width object.
		$this->width_converter( 'border-top-width', 'block-start' )
			->convert( $context, [ 'property' => 'border-top-width', 'value' => '2px' ] );
		$this->width_converter( 'border-right-width', 'inline-end' )
			->convert( $context, [ 'property' => 'border-right-width', 'value' => '3px' ] );

		// Assert.
		$this->assertSame(
			[
				'$$type' => 'border-width-v2',
				'value' => [
					'block-start' => $this->size( 2 ),
					'inline-end' => $this->size( 3 ),
				],
			],
			$context->get_prop( 'border-width' )
		);
	}

	public function test_convert__seeds_all_sides_from_a_prior_single_size() {
		// Arrange: a prior `border-width: 1px` left the single Size member in context.
		$context = new Conversion_Context();
		$context->set_prop( 'border-width', $this->size( 1 ) );

		// Act.
		$this->width_converter( 'border-top-width', 'block-start' )
			->convert( $context, [ 'property' => 'border-top-width', 'value' => '2px' ] );

		// Assert: every side seeded from 1px, the named side overridden to 2px (faithful cascade).
		$this->assertSame(
			[
				'$$type' => 'border-width-v2',
				'value' => [
					'block-start' => $this->size( 2 ),
					'inline-end' => $this->size( 1 ),
					'block-end' => $this->size( 1 ),
					'inline-start' => $this->size( 1 ),
				],
			],
			$context->get_prop( 'border-width' )
		);
	}

	public function test_convert__radius_corner_merges_into_border_radius() {
		// Arrange.
		$converter = new Object_Side_Merge_Converter(
			'border-top-left-radius',
			'border-radius',
			Border_Radius_Prop_Type::get_key(),
			'start-start',
			self::RADIUS_KEYS,
			Border_Radius_Prop_Type::class
		);
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'border-top-left-radius', 'value' => '10px' ] );

		// Assert.
		$prop_value = $context->get_prop( 'border-radius' );

		$this->assertSame(
			[ '$$type' => 'border-radius-v2', 'value' => [ 'start-start' => $this->size( 10 ) ] ],
			$prop_value
		);
		$this->assertTrue( Border_Radius_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__declines_unparsable_value_and_leaves_target_untouched() {
		// Arrange.
		$context = new Conversion_Context();
		$context->set_prop( 'border-width', $this->size( 1 ) );

		// Act.
		$converted = $this->width_converter( 'border-top-width', 'block-start' )
			->convert( $context, [ 'property' => 'border-top-width', 'value' => 'banana' ] );

		// Assert: declared, target object is unchanged.
		$this->assertFalse( $converted );
		$this->assertSame( $this->size( 1 ), $context->get_prop( 'border-width' ) );
	}

	private function width_converter( string $property, string $side_key ): Object_Side_Merge_Converter {
		return new Object_Side_Merge_Converter(
			$property,
			'border-width',
			Border_Width_Prop_Type::get_key(),
			$side_key,
			self::WIDTH_KEYS,
			Border_Width_Prop_Type::class
		);
	}

	private function size( int $value ): array {
		return [ '$$type' => 'size', 'value' => [ 'size' => $value, 'unit' => 'px' ] ];
	}
}
