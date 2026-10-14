<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Dimensions_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Dimensions_Property_Converter extends TestCase {

	public function test_convert__single_value_emits_a_size_member() {
		// Arrange.
		$converter = new Dimensions_Property_Converter( 'padding' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'padding', 'value' => '10px' ] );

		// Assert.
		$prop_value = $context->get_prop( 'padding' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ], $prop_value );
		$this->assertTrue( Size_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__two_values_expand_to_logical_dimensions() {
		// Arrange.
		$converter = new Dimensions_Property_Converter( 'padding' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'padding', 'value' => '10px 20px' ] );

		// Assert.
		$prop_value = $context->get_prop( 'padding' );

		$this->assertTrue( $converted );
		$this->assertSame(
			$this->dimensions( '10px', '20px', '10px', '20px' ),
			$prop_value
		);
		$this->assertTrue( Dimensions_Prop_Type::make_with_units()->validate( $prop_value ) );
	}

	public function test_convert__three_values_expand_to_logical_dimensions() {
		// Arrange.
		$converter = new Dimensions_Property_Converter( 'margin' );
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'margin', 'value' => '1px 2px 3px' ] );

		// Assert: top=1, right=2, bottom=3, left=2.
		$this->assertSame(
			$this->dimensions( '1px', '2px', '3px', '2px' ),
			$context->get_prop( 'margin' )
		);
	}

	public function test_convert__four_values_map_physical_to_logical_sides() {
		// Arrange.
		$converter = new Dimensions_Property_Converter( 'padding' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'padding', 'value' => '1px 2px 3px 4px' ] );

		// Assert: top->block-start, right->inline-end, bottom->block-end, left->inline-start.
		$prop_value = $context->get_prop( 'padding' );

		$this->assertTrue( $converted );
		$this->assertSame(
			$this->dimensions( '1px', '2px', '3px', '4px' ),
			$prop_value
		);
		$this->assertTrue( Dimensions_Prop_Type::make_with_units()->validate( $prop_value ) );
	}

	public function test_convert__keeps_function_values_intact_while_splitting() {
		// Arrange.
		$converter = new Dimensions_Property_Converter( 'padding' );
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'padding', 'value' => 'calc(50% - 10px) 20px' ] );

		// Assert.
		$this->assertSame(
			[
				'$$type' => 'dimensions',
				'value' => [
					'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 'calc(50% - 10px)', 'unit' => 'custom' ] ],
					'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
					'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 'calc(50% - 10px)', 'unit' => 'custom' ] ],
					'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
				],
			],
			$context->get_prop( 'padding' )
		);
	}

	public function test_convert__injected_wrapper_emits_border_width_object() {
		// Arrange.
		$converter = new Dimensions_Property_Converter( 'border-width', Border_Width_Prop_Type::class );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'border-width', 'value' => '1px 2px 3px 4px' ] );

		// Assert: same side mapping as Dimensions, wrapped as border-width.
		$prop_value = $context->get_prop( 'border-width' );

		$this->assertTrue( $converted );
		$this->assertSame(
			[
				'$$type' => 'border-width-v2',
				'value' => [
					'block-start' => $this->px( '1px' ),
					'inline-end' => $this->px( '2px' ),
					'block-end' => $this->px( '3px' ),
					'inline-start' => $this->px( '4px' ),
				],
			],
			$prop_value
		);
		$this->assertTrue( Border_Width_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__injected_wrapper_single_value_still_emits_a_size() {
		// Arrange.
		$converter = new Dimensions_Property_Converter( 'border-width', Border_Width_Prop_Type::class );
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'border-width', 'value' => '2px' ] );

		// Assert.
		$this->assertSame(
			[ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
			$context->get_prop( 'border-width' )
		);
	}

	/**
	 * @dataProvider declined_values
	 */
	public function test_convert__declines_unrepresentable_value( string $value ) {
		// Arrange.
		$converter = new Dimensions_Property_Converter( 'padding' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'padding', 'value' => $value ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'padding' ) );
	}

	public function declined_values(): array {
		return [
			'non-size token' => [ 'banana' ],
			'one bad token among good' => [ '10px banana' ],
			'too many values' => [ '1px 2px 3px 4px 5px' ],
			'empty' => [ '   ' ],
		];
	}

	public function test_dispatcher__valid_value_lands_in_props() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'padding: 10px 20px;' );

		// Assert.
		$this->assertSame( [ 'padding' => $this->dimensions( '10px', '20px', '10px', '20px' ) ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_dispatcher__declined_value_is_delegated_to_custom_css() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'padding: 1px 2px 3px 4px 5px;' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'padding: 1px 2px 3px 4px 5px;', $result['customCss'] );
	}

	private function make_dispatcher(): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new Dimensions_Property_Converter( 'padding' ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter() );
	}

	private function dimensions( string $top, string $right, string $bottom, string $left ): array {
		return [
			'$$type' => 'dimensions',
			'value' => [
				'block-start' => $this->px( $top ),
				'inline-end' => $this->px( $right ),
				'block-end' => $this->px( $bottom ),
				'inline-start' => $this->px( $left ),
			],
		];
	}

	private function px( string $value ): array {
		return [ '$$type' => 'size', 'value' => [ 'size' => (int) $value, 'unit' => 'px' ] ];
	}
}
