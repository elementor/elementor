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
		$result = $converter->convert( 'transform: rotate(45deg); box-shadow: 0 2px 4px black;' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'transform: rotate(45deg); box-shadow: 0 2px 4px black;', $result['customCss'] );
	}
}
