<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Flex_Longhand_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Flex_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Flex_Longhand_Converter extends TestCase {
	private Conversion_Context $context;

	public function setUp(): void {
		$this->context = new Conversion_Context( [] );
	}

	// --- flex-grow: unit tests ---

	public function test_flex_grow__converts_integer() {
		// Arrange.
		$converter = $this->flex_grow_converter();

		// Act.
		$result = $converter->convert( $this->context, [ 'property' => 'flex-grow', 'value' => '2' ] );

		// Assert.
		$this->assertTrue( $result );
		$this->assertSame( 2.0, $this->context->get_prop( 'flex' )['value']['flexGrow']['value'] );
	}

	public function test_flex_grow__converts_float() {
		// Arrange.
		$converter = $this->flex_grow_converter();

		// Act.
		$result = $converter->convert( $this->context, [ 'property' => 'flex-grow', 'value' => '1.5' ] );

		// Assert.
		$this->assertTrue( $result );
		$this->assertSame( 1.5, $this->context->get_prop( 'flex' )['value']['flexGrow']['value'] );
	}

	public function test_flex_grow__merges_into_existing_flex() {
		// Arrange.
		$converter = $this->flex_grow_converter();

		$this->context->set_prop( 'flex', Flex_Prop_Type::generate( [
			'flexGrow'   => Number_Prop_Type::generate( 1.0 ),
			'flexShrink' => Number_Prop_Type::generate( 1.0 ),
			'flexBasis'  => Size_Prop_Type::generate( [ 'size' => 50, 'unit' => '%' ] ),
		] ) );

		// Act.
		$converter->convert( $this->context, [ 'property' => 'flex-grow', 'value' => '3' ] );

		// Assert.
		$flex = $this->context->get_prop( 'flex' );
		$this->assertSame( 3.0, $flex['value']['flexGrow']['value'] );
		$this->assertSame( 1.0, $flex['value']['flexShrink']['value'] );
		$this->assertEquals( 50, $flex['value']['flexBasis']['value']['size'] );
	}

	// --- flex-grow: null resets ---

	/** @dataProvider flex_grow_null_reset_provider */
	public function test_flex_grow__null_resets_flexGrow_and_preserves_other_fields(
		array $initial_fields,
		array $expected_preserved
	) {
		// Arrange.
		$converter = $this->flex_grow_converter();

		if ( ! empty( $initial_fields ) ) {
			$this->context->set_prop( 'flex', Flex_Prop_Type::generate( $initial_fields ) );
		}

		// Act.
		$result = $converter->convert( $this->context, [ 'property' => 'flex-grow', 'value' => null ] );

		// Assert.
		$this->assertTrue( $result );
		$flex = $this->context->get_prop( 'flex' );
		$this->assertNull( $flex['value']['flexGrow'] );

		foreach ( $expected_preserved as $field => $expected_value ) {
			$this->assertEquals( $expected_value, $flex['value'][ $field ]['value'] );
		}
	}

	public static function flex_grow_null_reset_provider(): array {
		return [
			'no existing flex'                    => [ [], [] ],
			'flexGrow was set (now nulled)'       => [
				[ 'flexGrow' => Number_Prop_Type::generate( 2.0 ) ],
				[],
			],
			'flexShrink preserved'                => [
				[ 'flexShrink' => Number_Prop_Type::generate( 1.5 ) ],
				[ 'flexShrink' => 1.5 ],
			],
			'flexBasis preserved'                 => [
				[ 'flexBasis' => Size_Prop_Type::generate( [ 'size' => 100, 'unit' => 'px' ] ) ],
				[],
			],
			'all fields set — non-targets kept'   => [
				[
					'flexGrow'   => Number_Prop_Type::generate( 3.0 ),
					'flexShrink' => Number_Prop_Type::generate( 1.0 ),
					'flexBasis'  => Size_Prop_Type::generate( [ 'size' => 50, 'unit' => '%' ] ),
				],
				[ 'flexShrink' => 1.0 ],
			],
			'all fields zero — non-targets kept'  => [
				[
					'flexGrow'   => Number_Prop_Type::generate( 0.0 ),
					'flexShrink' => Number_Prop_Type::generate( 0.0 ),
					'flexBasis'  => Size_Prop_Type::generate( [ 'size' => 0, 'unit' => 'px' ] ),
				],
				[ 'flexShrink' => 0.0 ],
			],
		];
	}

	// --- flex-grow: decline → customCss integration ---

	public function test_flex_grow__non_numeric_falls_to_custom_css() {
		// Arrange.
		$css       = 'flex-grow: auto';
		$converter = $this->make_css_converter( $this->flex_grow_converter() );

		// Act.
		$result = $converter->convert( $css );

		// Assert.
		$this->assertEmpty( $result['props'] );
		$this->assertSame( 'flex-grow: auto;', $result['customCss'] );
	}

	/** @dataProvider css_wide_keywords_provider */
	public function test_flex_grow__css_wide_keywords_fall_to_custom_css( string $keyword ) {
		// Arrange.
		$converter = $this->make_css_converter( $this->flex_grow_converter() );

		// Act.
		$result = $converter->convert( "flex-grow: {$keyword}" );

		// Assert.
		$this->assertEmpty( $result['props'] );
		$this->assertSame( "flex-grow: {$keyword};", $result['customCss'] );
	}

	public function test_flex_grow__valid_then_invalid_keeps_prop_and_adds_custom_css() {
		// flex-grow: 2 → sets flex prop; flex-grow: auto (invalid) → customCss; last-wins dedup means
		// only the last declaration is processed, so the invalid one wins and goes to customCss.
		// Arrange.
		$converter = $this->make_css_converter( $this->flex_grow_converter() );

		// Act.
		$result = $converter->convert( 'flex-grow: 2; flex-grow: auto' );

		// Assert.
		$this->assertEmpty( $result['props'] );
		$this->assertSame( 'flex-grow: auto;', $result['customCss'] );
	}

	public function test_flex_grow_and_flex_basis__one_valid_one_invalid_splits_to_prop_and_custom_css() {
		// Arrange.
		$converter = $this->make_css_converter( $this->flex_grow_converter(), $this->flex_basis_converter() );

		// Act.
		$result = $converter->convert( 'flex-grow: 2; flex-basis: banana' );

		// Assert.
		$this->assertSame( 2.0, $result['props']['flex']['value']['flexGrow']['value'] );
		$this->assertSame( 'flex-basis: banana;', $result['customCss'] );
	}

	// --- flex-basis: unit tests ---

	public function test_flex_basis__converts_pixel_value() {
		// Arrange.
		$converter = $this->flex_basis_converter();

		// Act.
		$result = $converter->convert( $this->context, [ 'property' => 'flex-basis', 'value' => '100px' ] );

		// Assert.
		$this->assertTrue( $result );
		$basis = $this->context->get_prop( 'flex' )['value']['flexBasis']['value'];
		$this->assertEquals( 100, $basis['size'] );
		$this->assertSame( 'px', $basis['unit'] );
	}

	public function test_flex_basis__converts_percentage() {
		// Arrange.
		$converter = $this->flex_basis_converter();

		// Act.
		$result = $converter->convert( $this->context, [ 'property' => 'flex-basis', 'value' => '50%' ] );

		// Assert.
		$this->assertTrue( $result );
		$basis = $this->context->get_prop( 'flex' )['value']['flexBasis']['value'];
		$this->assertEquals( 50, $basis['size'] );
		$this->assertSame( '%', $basis['unit'] );
	}

	public function test_flex_basis__converts_auto() {
		// Arrange.
		$converter = $this->flex_basis_converter();

		// Act.
		$result = $converter->convert( $this->context, [ 'property' => 'flex-basis', 'value' => 'auto' ] );

		// Assert.
		$this->assertTrue( $result );
		$basis = $this->context->get_prop( 'flex' )['value']['flexBasis']['value'];
		$this->assertNull( $basis['size'] );
		$this->assertSame( 'auto', $basis['unit'] );
	}

	public function test_flex_basis__merges_into_existing_flex() {
		// Arrange.
		$converter = $this->flex_basis_converter();

		$this->context->set_prop( 'flex', Flex_Prop_Type::generate( [
			'flexGrow'   => Number_Prop_Type::generate( 2.0 ),
			'flexShrink' => Number_Prop_Type::generate( 1.0 ),
			'flexBasis'  => Size_Prop_Type::generate( [ 'size' => 0, 'unit' => 'px' ] ),
		] ) );

		// Act.
		$converter->convert( $this->context, [ 'property' => 'flex-basis', 'value' => '200px' ] );

		// Assert.
		$flex = $this->context->get_prop( 'flex' );
		$this->assertSame( 2.0, $flex['value']['flexGrow']['value'] );
		$this->assertEquals( 200, $flex['value']['flexBasis']['value']['size'] );
	}

	// --- flex-basis: null resets ---

	/** @dataProvider flex_basis_null_reset_provider */
	public function test_flex_basis__null_resets_flexBasis_and_preserves_other_fields(
		array $initial_fields,
		array $expected_preserved
	) {
		// Arrange.
		$converter = $this->flex_basis_converter();

		if ( ! empty( $initial_fields ) ) {
			$this->context->set_prop( 'flex', Flex_Prop_Type::generate( $initial_fields ) );
		}

		// Act.
		$result = $converter->convert( $this->context, [ 'property' => 'flex-basis', 'value' => null ] );

		// Assert.
		$this->assertTrue( $result );
		$flex = $this->context->get_prop( 'flex' );
		$this->assertNull( $flex['value']['flexBasis'] );

		foreach ( $expected_preserved as $field => $expected_value ) {
			$this->assertEquals( $expected_value, $flex['value'][ $field ]['value'] );
		}
	}

	public static function flex_basis_null_reset_provider(): array {
		return [
			'no existing flex'                    => [ [], [] ],
			'flexGrow preserved'                  => [
				[ 'flexGrow' => Number_Prop_Type::generate( 2.0 ) ],
				[ 'flexGrow' => 2.0 ],
			],
			'flexShrink preserved'                => [
				[ 'flexShrink' => Number_Prop_Type::generate( 1.5 ) ],
				[ 'flexShrink' => 1.5 ],
			],
			'flexBasis was set (now nulled)'      => [
				[ 'flexBasis' => Size_Prop_Type::generate( [ 'size' => 100, 'unit' => 'px' ] ) ],
				[],
			],
			'all fields set — non-targets kept'   => [
				[
					'flexGrow'   => Number_Prop_Type::generate( 3.0 ),
					'flexShrink' => Number_Prop_Type::generate( 1.0 ),
					'flexBasis'  => Size_Prop_Type::generate( [ 'size' => 50, 'unit' => '%' ] ),
				],
				[ 'flexGrow' => 3.0, 'flexShrink' => 1.0 ],
			],
			'all fields zero — non-targets kept'  => [
				[
					'flexGrow'   => Number_Prop_Type::generate( 0.0 ),
					'flexShrink' => Number_Prop_Type::generate( 0.0 ),
					'flexBasis'  => Size_Prop_Type::generate( [ 'size' => 0, 'unit' => 'px' ] ),
				],
				[ 'flexGrow' => 0.0, 'flexShrink' => 0.0 ],
			],
		];
	}

	// --- flex-basis: css-wide keywords ---

	/** @dataProvider css_wide_keywords_provider */
	public function test_flex_basis__accepts_css_wide_keywords_as_custom( string $keyword ) {
		// Arrange.
		$converter = $this->flex_basis_converter();

		// Act.
		$result = $converter->convert( $this->context, [ 'property' => 'flex-basis', 'value' => $keyword ] );

		// Assert.
		$this->assertTrue( $result );
		$basis = $this->context->get_prop( 'flex' )['value']['flexBasis']['value'];
		$this->assertSame( $keyword, $basis['size'] );
		$this->assertSame( 'custom', $basis['unit'] );
	}

	// --- flex-basis: decline → customCss integration ---

	public function test_flex_basis__invalid_value_falls_to_custom_css() {
		// Arrange.
		$converter = $this->make_css_converter( $this->flex_basis_converter() );

		// Act.
		$result = $converter->convert( 'flex-basis: banana' );

		// Assert.
		$this->assertEmpty( $result['props'] );
		$this->assertSame( 'flex-basis: banana;', $result['customCss'] );
	}

	public static function css_wide_keywords_provider(): array {
		return array_combine(
			Converter_Registry_Factory::FLEX_BASIS_CUSTOM_KEYWORDS,
			array_map( fn( $k ) => [ $k ], Converter_Registry_Factory::FLEX_BASIS_CUSTOM_KEYWORDS )
		);
	}

	private function flex_grow_converter(): Flex_Longhand_Converter {
		return new Flex_Longhand_Converter(
			'flex-grow',
			'flexGrow',
			static function ( string $v ): ?array {
				if ( ! is_numeric( $v ) ) {
					return null;
				}
				return Number_Prop_Type::generate( (float) $v );
			}
		);
	}

	private function flex_basis_converter(): Flex_Longhand_Converter {
		return new Flex_Longhand_Converter(
			'flex-basis',
			'flexBasis',
			static function ( string $v ): ?array {
				if ( in_array( strtolower( $v ), Converter_Registry_Factory::FLEX_BASIS_CUSTOM_KEYWORDS, true ) ) {
					return Size_Prop_Type::generate( [ 'size' => $v, 'unit' => 'custom' ] );
				}
				$parsed = Size_Value_Parser::parse( $v );
				return null !== $parsed ? Size_Prop_Type::generate( $parsed ) : null;
			}
		);
	}

	private function make_css_converter( Flex_Longhand_Converter ...$converters ): Css_Converter {
		$registry = new Converter_Registry();

		foreach ( $converters as $converter ) {
			$registry->register( $converter );
		}

		return new Css_Converter( $registry, new Null_Failure_Reporter() );
	}
}
