<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Converter_Registry_Factory extends TestCase {

	public function test_create__registers_one_converter_per_covered_property() {
		// Act.
		$registry = Converter_Registry_Factory::create();

		// Assert.
		$this->assertCount( count( Converter_Registry_Factory::covered_properties() ), $registry->all() );
	}

	public function test_create__every_covered_property_is_claimed_by_exactly_one_converter() {
		// Arrange.
		$registry = Converter_Registry_Factory::create();

		// Act & Assert.
		foreach ( Converter_Registry_Factory::covered_properties() as $property ) {
			$claims = array_filter(
				$registry->all(),
				fn( $converter ) => $converter->is_supported( [ 'property' => $property, 'value' => 'x' ] )
			);

			$this->assertCount( 1, $claims, "Property {$property} must be claimed by exactly one converter." );
		}
	}

	public function test_covered_properties__has_no_duplicates() {
		// Act.
		$properties = Converter_Registry_Factory::covered_properties();

		// Assert.
		$this->assertSame( array_values( array_unique( $properties ) ), $properties );
	}

	public function test_noop_property__routes_its_declaration_to_custom_css() {
		// Arrange.
		$converter = new Css_Converter( Converter_Registry_Factory::create(), new Null_Failure_Reporter() );

		// Act.
		$result = $converter->convert( 'transform: matrix(1,0,0,1,0,0); stroke-width: 2px;' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'transform: matrix(1,0,0,1,0,0); stroke-width: 2px;', $result['customCss'] );
	}

	/**
	 * @dataProvider stroke_family_provider
	 *
	 * Guards the by-design decision documented in Converter_Registry_Factory::NOOP_PROPERTIES:
	 * SVG stroke-* longhands are intentionally preserved verbatim in customCss because the editor
	 * UI does not expose stroke controls. If someone later wires a real converter for any of these,
	 * this test will fail and force the author to remove the entry from the provider AND from the
	 * NOOP_PROPERTIES list, ensuring the documented intent stays in sync with behaviour.
	 */
	public function test_stroke_family_falls_to_custom_css_by_design( string $property, string $value ) {
		// Arrange.
		$converter = new Css_Converter( Converter_Registry_Factory::create(), new Null_Failure_Reporter() );
		$declaration = "{$property}: {$value};";

		// Act.
		$result = $converter->convert( $declaration );

		// Assert.
		$this->assertSame( [], $result['props'], "{$property} unexpectedly produced a converted prop." );
		$this->assertSame( $declaration, $result['customCss'], "{$property} did not fall through to customCss verbatim." );
		$this->assertSame( [], $result['rejected'] );
	}

	public static function stroke_family_provider(): array {
		return [
			'stroke'            => [ 'stroke', 'red' ],
			'stroke-width'      => [ 'stroke-width', '2px' ],
			'stroke-opacity'    => [ 'stroke-opacity', '0.5' ],
			'stroke-dasharray'  => [ 'stroke-dasharray', '5 3' ],
			'stroke-dashoffset' => [ 'stroke-dashoffset', '4px' ],
			'stroke-linecap'    => [ 'stroke-linecap', 'round' ],
			'stroke-linejoin'   => [ 'stroke-linejoin', 'miter' ],
			'stroke-miterlimit' => [ 'stroke-miterlimit', '10' ],
		];
	}
}
