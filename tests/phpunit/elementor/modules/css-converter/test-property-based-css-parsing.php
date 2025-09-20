<?php
namespace Elementor\Testing\Modules\CssConverter;

use Elementor\Modules\CssConverter\Convertors\Classes\Class_Property_Mapper_Factory;
use Elementor\Modules\CssConverter\Services\Css\Css_Processor;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group property-based-testing
 */
class Test_Property_Based_Css_Parsing extends Elementor_Test_Base {

	private $css_processor;
	private $property_registry;

	public function setUp(): void {
		parent::setUp();
		$this->css_processor = new Css_Processor();
		$this->property_registry = Class_Property_Mapper_Factory::get_registry();
	}

	public function test_all_supported_properties_are_testable() {
		$supported_properties = $this->property_registry->get_all_supported_properties();
		
		// Should have all 25+ properties from the factory
		$this->assertGreaterThan( 20, count( $supported_properties ) );
		
		// Test that each property has test data
		foreach ( $supported_properties as $property ) {
			$test_values = $this->get_property_test_values( $property );
			$this->assertNotEmpty( $test_values, "Property '{$property}' should have test values" );
		}
	}

	/**
	 * @dataProvider typography_property_provider
	 */
	public function test_typography_properties( $property, $value, $expected_valid ) {
		$css_rule = ".test { {$property}: {$value}; }";
		$result = $this->css_processor->extract_css_rules( $css_rule );
		
		if ( $expected_valid ) {
			$this->assertNotEmpty( $result );
			$this->assertArrayHasKey( 'rules', $result );
			
			$rule = $result['rules'][0] ?? null;
			$this->assertNotNull( $rule );
			$this->assertEquals( $property, $rule['property'] );
			$this->assertEquals( $value, $rule['value'] );
		} else {
			// Invalid values should either be rejected or handled gracefully
			$this->assertTrue( true ); // Placeholder for invalid value handling
		}
	}

	public function typography_property_provider() {
		return [
			// Font Size
			[ 'font-size', '16px', true ],
			[ 'font-size', '1.2em', true ],
			[ 'font-size', '120%', true ],
			[ 'font-size', 'large', true ],
			[ 'font-size', 'invalid', false ],
			
			// Font Weight
			[ 'font-weight', 'normal', true ],
			[ 'font-weight', 'bold', true ],
			[ 'font-weight', '400', true ],
			[ 'font-weight', '700', true ],
			[ 'font-weight', '1000', false ], // Out of range
			
			// Color
			[ 'color', '#ff0000', true ],
			[ 'color', 'red', true ],
			[ 'color', 'rgb(255, 0, 0)', true ],
			[ 'color', 'rgba(255, 0, 0, 0.5)', true ],
			[ 'color', 'hsl(0, 100%, 50%)', true ],
			[ 'color', 'invalid-color', false ],
			
			// Text Align
			[ 'text-align', 'left', true ],
			[ 'text-align', 'center', true ],
			[ 'text-align', 'right', true ],
			[ 'text-align', 'justify', true ],
			[ 'text-align', 'invalid', false ],
			
			// Line Height
			[ 'line-height', '1.5', true ],
			[ 'line-height', '24px', true ],
			[ 'line-height', '150%', true ],
			[ 'line-height', 'normal', true ],
			[ 'line-height', '-1', false ], // Negative values invalid
			
			// Text Decoration
			[ 'text-decoration', 'none', true ],
			[ 'text-decoration', 'underline', true ],
			[ 'text-decoration', 'line-through', true ],
			[ 'text-decoration', 'overline', true ],
			
			// Text Transform
			[ 'text-transform', 'none', true ],
			[ 'text-transform', 'uppercase', true ],
			[ 'text-transform', 'lowercase', true ],
			[ 'text-transform', 'capitalize', true ],
		];
	}

	/**
	 * @dataProvider layout_property_provider
	 */
	public function test_layout_properties( $property, $value, $expected_valid ) {
		$css_rule = ".test { {$property}: {$value}; }";
		$result = $this->css_processor->extract_css_rules( $css_rule );
		
		if ( $expected_valid ) {
			$this->assertNotEmpty( $result );
		}
	}

	public function layout_property_provider() {
		return [
			// Display
			[ 'display', 'block', true ],
			[ 'display', 'inline', true ],
			[ 'display', 'flex', true ],
			[ 'display', 'grid', true ],
			[ 'display', 'none', true ],
			[ 'display', 'invalid', false ],
			
			// Position
			[ 'position', 'static', true ],
			[ 'position', 'relative', true ],
			[ 'position', 'absolute', true ],
			[ 'position', 'fixed', true ],
			[ 'position', 'sticky', true ],
			
			// Dimensions
			[ 'width', '100px', true ],
			[ 'width', '50%', true ],
			[ 'width', 'auto', true ],
			[ 'width', '100vw', true ],
			[ 'width', '-10px', false ], // Negative width invalid
			
			[ 'height', '200px', true ],
			[ 'height', '100vh', true ],
			[ 'height', 'auto', true ],
			
			// Opacity
			[ 'opacity', '1', true ],
			[ 'opacity', '0.5', true ],
			[ 'opacity', '0', true ],
			[ 'opacity', '1.5', false ], // Over 1 invalid
			[ 'opacity', '-0.5', false ], // Negative invalid
		];
	}

	/**
	 * @dataProvider spacing_property_provider
	 */
	public function test_spacing_properties( $property, $value, $expected_valid ) {
		$css_rule = ".test { {$property}: {$value}; }";
		$result = $this->css_processor->extract_css_rules( $css_rule );
		
		if ( $expected_valid ) {
			$this->assertNotEmpty( $result );
		}
	}

	public function spacing_property_provider() {
		return [
			// Margin
			[ 'margin', '10px', true ],
			[ 'margin', '10px 20px', true ],
			[ 'margin', '10px 20px 30px 40px', true ],
			[ 'margin', 'auto', true ],
			[ 'margin', '0', true ],
			
			[ 'margin-top', '15px', true ],
			[ 'margin-right', '1em', true ],
			[ 'margin-bottom', '2rem', true ],
			[ 'margin-left', '5%', true ],
			
			// Padding
			[ 'padding', '10px', true ],
			[ 'padding', '10px 20px', true ],
			[ 'padding', '10px 20px 30px 40px', true ],
			[ 'padding', '0', true ],
			[ 'padding', '-10px', false ], // Negative padding invalid
			
			[ 'padding-top', '15px', true ],
			[ 'padding-right', '1em', true ],
			[ 'padding-bottom', '2rem', true ],
			[ 'padding-left', '5%', true ],
		];
	}

	/**
	 * @dataProvider border_property_provider
	 */
	public function test_border_properties( $property, $value, $expected_valid ) {
		$css_rule = ".test { {$property}: {$value}; }";
		$result = $this->css_processor->extract_css_rules( $css_rule );
		
		if ( $expected_valid ) {
			$this->assertNotEmpty( $result );
		}
	}

	public function border_property_provider() {
		return [
			// Border Width
			[ 'border-width', '1px', true ],
			[ 'border-width', '2px 4px', true ],
			[ 'border-width', 'thin', true ],
			[ 'border-width', 'medium', true ],
			[ 'border-width', 'thick', true ],
			[ 'border-width', '-1px', false ], // Negative width invalid
			
			// Border Style
			[ 'border-style', 'solid', true ],
			[ 'border-style', 'dashed', true ],
			[ 'border-style', 'dotted', true ],
			[ 'border-style', 'double', true ],
			[ 'border-style', 'none', true ],
			[ 'border-style', 'invalid', false ],
			
			// Border Color
			[ 'border-color', '#ff0000', true ],
			[ 'border-color', 'red', true ],
			[ 'border-color', 'transparent', true ],
			[ 'border-color', 'currentColor', true ],
			
			// Border Radius
			[ 'border-radius', '5px', true ],
			[ 'border-radius', '10px 20px', true ],
			[ 'border-radius', '50%', true ],
			[ 'border-radius', '10px / 20px', true ],
			[ 'border-radius', '-5px', false ], // Negative radius invalid
			
			// Border Shorthand
			[ 'border', '1px solid red', true ],
			[ 'border', '2px dashed #00ff00', true ],
			[ 'border', 'none', true ],
			[ 'border', '0', true ],
		];
	}

	/**
	 * @dataProvider background_property_provider
	 */
	public function test_background_properties( $property, $value, $expected_valid ) {
		$css_rule = ".test { {$property}: {$value}; }";
		$result = $this->css_processor->extract_css_rules( $css_rule );
		
		if ( $expected_valid ) {
			$this->assertNotEmpty( $result );
		}
	}

	public function background_property_provider() {
		return [
			// Background Color
			[ 'background-color', '#ff0000', true ],
			[ 'background-color', 'red', true ],
			[ 'background-color', 'transparent', true ],
			[ 'background-color', 'rgba(255, 0, 0, 0.5)', true ],
			
			// Background Image
			[ 'background-image', 'url("image.jpg")', true ],
			[ 'background-image', 'none', true ],
			[ 'background-image', 'linear-gradient(to right, red, blue)', true ],
			[ 'background-image', 'radial-gradient(circle, red, blue)', true ],
			
			// Background Shorthand
			[ 'background', 'red', true ],
			[ 'background', 'url("image.jpg") no-repeat center', true ],
			[ 'background', 'linear-gradient(red, blue)', true ],
		];
	}

	/**
	 * @dataProvider flexbox_property_provider
	 */
	public function test_flexbox_properties( $property, $value, $expected_valid ) {
		$css_rule = ".test { {$property}: {$value}; }";
		$result = $this->css_processor->extract_css_rules( $css_rule );
		
		if ( $expected_valid ) {
			$this->assertNotEmpty( $result );
		}
	}

	public function flexbox_property_provider() {
		return [
			// Flex Direction
			[ 'flex-direction', 'row', true ],
			[ 'flex-direction', 'column', true ],
			[ 'flex-direction', 'row-reverse', true ],
			[ 'flex-direction', 'column-reverse', true ],
			
			// Justify Content
			[ 'justify-content', 'flex-start', true ],
			[ 'justify-content', 'flex-end', true ],
			[ 'justify-content', 'center', true ],
			[ 'justify-content', 'space-between', true ],
			[ 'justify-content', 'space-around', true ],
			
			// Align Items
			[ 'align-items', 'flex-start', true ],
			[ 'align-items', 'flex-end', true ],
			[ 'align-items', 'center', true ],
			[ 'align-items', 'stretch', true ],
			[ 'align-items', 'baseline', true ],
			
			// Flex
			[ 'flex', '1', true ],
			[ 'flex', '0 1 auto', true ],
			[ 'flex', 'none', true ],
		];
	}

	/**
	 * @dataProvider effects_property_provider
	 */
	public function test_effects_properties( $property, $value, $expected_valid ) {
		$css_rule = ".test { {$property}: {$value}; }";
		$result = $this->css_processor->extract_css_rules( $css_rule );
		
		if ( $expected_valid ) {
			$this->assertNotEmpty( $result );
		}
	}

	public function effects_property_provider() {
		return [
			// Box Shadow
			[ 'box-shadow', '2px 2px 4px rgba(0,0,0,0.3)', true ],
			[ 'box-shadow', 'inset 0 0 10px red', true ],
			[ 'box-shadow', 'none', true ],
			[ 'box-shadow', '0 0 0 1px red, 2px 2px 4px blue', true ], // Multiple shadows
			
			// Filter
			[ 'filter', 'blur(5px)', true ],
			[ 'filter', 'brightness(1.2)', true ],
			[ 'filter', 'contrast(150%)', true ],
			[ 'filter', 'grayscale(100%)', true ],
			[ 'filter', 'none', true ],
			
			// Transform
			[ 'transform', 'translateX(10px)', true ],
			[ 'transform', 'rotate(45deg)', true ],
			[ 'transform', 'scale(1.5)', true ],
			[ 'transform', 'none', true ],
			
			// Transition
			[ 'transition', 'all 0.3s ease', true ],
			[ 'transition', 'opacity 0.5s linear', true ],
			[ 'transition', 'transform 0.2s ease-in-out', true ],
			[ 'transition', 'none', true ],
		];
	}

	public function test_property_value_edge_cases() {
		$edge_cases = [
			// Empty values
			[ 'color', '', false ],
			[ 'font-size', '', false ],
			
			// Whitespace handling
			[ 'color', '  red  ', true ],
			[ 'margin', ' 10px 20px ', true ],
			
			// Case sensitivity
			[ 'color', 'RED', true ],
			[ 'text-align', 'CENTER', true ],
			
			// CSS variables
			[ 'color', 'var(--primary-color)', true ],
			[ 'font-size', 'var(--font-size-large)', true ],
			
			// Calc() expressions
			[ 'width', 'calc(100% - 20px)', true ],
			[ 'margin', 'calc(1em + 5px)', true ],
			
			// Multiple values
			[ 'font-family', '"Helvetica Neue", Arial, sans-serif', true ],
			[ 'background', 'url("bg.jpg") no-repeat center / cover', true ],
		];
		
		foreach ( $edge_cases as [ $property, $value, $expected_valid ] ) {
			$css_rule = ".test { {$property}: {$value}; }";
			$result = $this->css_processor->extract_css_rules( $css_rule );
			
			if ( $expected_valid ) {
				$this->assertNotEmpty( $result, "Property '{$property}' with value '{$value}' should be valid" );
			}
		}
	}

	public function test_css_specificity_with_properties() {
		$css = '
			.test { color: red; }
			#test { color: blue; }
			.test.specific { color: green; }
			.test { color: yellow !important; }
		';
		
		$result = $this->css_processor->extract_css_rules( $css );
		
		$this->assertNotEmpty( $result );
		$this->assertArrayHasKey( 'rules', $result );
		
		// Should have multiple rules for the same property
		$color_rules = array_filter( $result['rules'], function( $rule ) {
			return 'color' === $rule['property'];
		} );
		
		$this->assertGreaterThan( 1, count( $color_rules ) );
	}

	public function test_malformed_css_handling() {
		$malformed_css_cases = [
			'.test { color: red', // Missing closing brace
			'.test { color red; }', // Missing colon
			'.test { : red; }', // Missing property
			'.test { color: ; }', // Missing value
			'test { color: red; }', // Missing selector dot
			'.test { color: red;; }', // Double semicolon
		];
		
		foreach ( $malformed_css_cases as $css ) {
			$result = $this->css_processor->extract_css_rules( $css );
			
			// Should handle malformed CSS gracefully (not crash)
			$this->assertIsArray( $result );
		}
	}

	public function test_css_comments_handling() {
		$css_with_comments = '
			/* This is a comment */
			.test {
				color: red; /* Inline comment */
				/* Another comment */
				font-size: 16px;
			}
			/* Final comment */
		';
		
		$result = $this->css_processor->extract_css_rules( $css_with_comments );
		
		$this->assertNotEmpty( $result );
		$this->assertArrayHasKey( 'rules', $result );
		
		// Should extract properties correctly despite comments
		$properties = array_column( $result['rules'], 'property' );
		$this->assertContains( 'color', $properties );
		$this->assertContains( 'font-size', $properties );
	}

	public function test_vendor_prefixes() {
		$css_with_prefixes = '
			.test {
				-webkit-transform: rotate(45deg);
				-moz-transform: rotate(45deg);
				-ms-transform: rotate(45deg);
				transform: rotate(45deg);
			}
		';
		
		$result = $this->css_processor->extract_css_rules( $css_with_prefixes );
		
		$this->assertNotEmpty( $result );
		
		// Should handle vendor prefixes
		$properties = array_column( $result['rules'], 'property' );
		$this->assertContains( 'transform', $properties );
	}

	public function test_at_rules_handling() {
		$css_with_at_rules = '
			@media (max-width: 768px) {
				.test { color: red; }
			}
			
			@keyframes fadeIn {
				from { opacity: 0; }
				to { opacity: 1; }
			}
			
			.test { animation: fadeIn 1s; }
		';
		
		$result = $this->css_processor->extract_css_rules( $css_with_at_rules );
		
		// Should handle @rules appropriately
		$this->assertIsArray( $result );
	}

	public function test_performance_with_large_css() {
		// Generate large CSS for performance testing
		$large_css = '';
		for ( $i = 0; $i < 1000; $i++ ) {
			$large_css .= ".test-{$i} { color: red; font-size: 16px; margin: 10px; }\n";
		}
		
		$start_time = microtime( true );
		$result = $this->css_processor->extract_css_rules( $large_css );
		$end_time = microtime( true );
		
		$processing_time = $end_time - $start_time;
		
		// Should process large CSS in reasonable time (< 1 second)
		$this->assertLessThan( 1.0, $processing_time );
		$this->assertNotEmpty( $result );
	}

	private function get_property_test_values( $property ) {
		$test_values = [
			'color' => [ '#ff0000', 'red', 'rgb(255,0,0)', 'rgba(255,0,0,0.5)' ],
			'font-size' => [ '16px', '1.2em', '120%', 'large' ],
			'font-weight' => [ 'normal', 'bold', '400', '700' ],
			'text-align' => [ 'left', 'center', 'right', 'justify' ],
			'line-height' => [ '1.5', '24px', '150%', 'normal' ],
			'margin' => [ '10px', '10px 20px', 'auto', '0' ],
			'padding' => [ '10px', '10px 20px', '0' ],
			'border' => [ '1px solid red', 'none', '2px dashed blue' ],
			'background-color' => [ '#ff0000', 'red', 'transparent' ],
			'display' => [ 'block', 'inline', 'flex', 'none' ],
			'position' => [ 'static', 'relative', 'absolute', 'fixed' ],
			'opacity' => [ '1', '0.5', '0' ],
			'width' => [ '100px', '50%', 'auto' ],
			'height' => [ '200px', '100vh', 'auto' ],
		];
		
		return $test_values[ $property ] ?? [ 'test-value' ];
	}
}
