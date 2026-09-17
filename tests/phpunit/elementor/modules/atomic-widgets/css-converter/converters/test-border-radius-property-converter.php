<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Border_Radius_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Border_Radius_Property_Converter extends TestCase {

	public function test_convert__single_value_emits_a_size_member() {
		// Arrange.
		$converter = new Border_Radius_Property_Converter( 'border-radius' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'border-radius', 'value' => '8px' ] );

		// Assert.
		$prop_value = $context->get_prop( 'border-radius' );

		$this->assertTrue( $converted );
		$this->assertSame( [ '$$type' => 'size', 'value' => [ 'size' => 8, 'unit' => 'px' ] ], $prop_value );
		$this->assertTrue( Size_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__four_values_map_corners_physical_to_logical() {
		// Arrange.
		$converter = new Border_Radius_Property_Converter( 'border-radius' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'border-radius', 'value' => '1px 2px 3px 4px' ] );

		// Assert: TL->start-start, TR->start-end, BR->end-end, BL->end-start.
		$prop_value = $context->get_prop( 'border-radius' );

		$this->assertTrue( $converted );
		$this->assertSame(
			$this->radius( '1px', '2px', '3px', '4px' ),
			$prop_value
		);
		$this->assertTrue( Border_Radius_Prop_Type::make()->validate( $prop_value ) );
	}

	public function test_convert__two_values_expand_to_diagonal_corners() {
		// Arrange.
		$converter = new Border_Radius_Property_Converter( 'border-radius' );
		$context = new Conversion_Context();

		// Act.
		$converter->convert( $context, [ 'property' => 'border-radius', 'value' => '10px 20px' ] );

		// Assert: TL=BR=10, TR=BL=20.
		$this->assertSame(
			$this->radius( '10px', '20px', '10px', '20px' ),
			$context->get_prop( 'border-radius' )
		);
	}

	public function test_convert__keeps_calc_division_as_a_single_size() {
		// Arrange.
		$converter = new Border_Radius_Property_Converter( 'border-radius' );
		$context = new Conversion_Context();

		// Act: calc() division must convert, not be mistaken for an elliptical separator.
		$converted = $converter->convert( $context, [ 'property' => 'border-radius', 'value' => 'calc(100% / 4)' ] );

		// Assert.
		$this->assertTrue( $converted );
		$this->assertSame(
			[ '$$type' => 'size', 'value' => [ 'size' => 'calc(100% / 4)', 'unit' => 'custom' ] ],
			$context->get_prop( 'border-radius' )
		);
	}

	/**
	 * @dataProvider declined_values
	 */
	public function test_convert__declines_unrepresentable_value( string $value ) {
		// Arrange.
		$converter = new Border_Radius_Property_Converter( 'border-radius' );
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'border-radius', 'value' => $value ] );

		// Assert.
		$this->assertFalse( $converted );
		$this->assertFalse( $context->has_prop( 'border-radius' ) );
	}

	public function declined_values(): array {
		return [
			'elliptical' => [ '10px / 20px' ],
			'too many values' => [ '1px 2px 3px 4px 5px' ],
			'non-size token' => [ 'banana' ],
		];
	}

	public function test_dispatcher__declined_elliptical_is_delegated_to_custom_css() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'border-radius: 10px / 20px;' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'border-radius: 10px / 20px;', $result['customCss'] );
	}

	private function make_dispatcher(): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new Border_Radius_Property_Converter( 'border-radius' ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter() );
	}

	private function radius( string $start_start, string $start_end, string $end_end, string $end_start ): array {
		return [
			'$$type' => 'border-radius-v2',
			'value' => [
				'start-start' => $this->px( $start_start ),
				'start-end' => $this->px( $start_end ),
				'end-end' => $this->px( $end_end ),
				'end-start' => $this->px( $end_start ),
			],
		];
	}

	private function px( string $value ): array {
		return [ '$$type' => 'size', 'value' => [ 'size' => (int) $value, 'unit' => 'px' ] ];
	}
}
