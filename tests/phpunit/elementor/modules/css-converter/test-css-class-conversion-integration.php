<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Class_Conversion_Service;
use Elementor\Modules\CssConverter\Parsers\CssParser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-integration
 */
class Test_CSS_Class_Conversion_Integration extends Elementor_Test_Base {
	private $service;
	private $parser;

	public function setUp(): void {
		parent::setUp();
		$this->service = new Class_Conversion_Service();
		$this->parser = new CssParser();
	}

	public function test_end_to_end_conversion_flow() {
		$css = '
			/* Simple classes with supported properties */
			.primary-button {
				color: #ffffff;
				font-size: 16px;
			}
			
			.secondary-text {
				color: rgb(108, 117, 125);
				font-size: 14px;
			}
			
			/* Class with CSS variables */
			.branded-element {
				--brand-color: #007cba;
				--brand-size: 18px;
				color: var(--brand-color);
				font-size: var(--brand-size);
			}
			
			/* Class with unsupported properties */
			.mixed-properties {
				color: #333333;
				font-size: 15px;
				background-color: #f8f9fa;
				margin: 20px;
				padding: 10px;
			}
			
			/* Complex selectors that should be ignored */
			.parent .child { color: red; }
			.button:hover { color: blue; }
			#header .nav { color: green; }
		';

		$result = $this->service->convert_css_to_global_classes( $css );

		// Verify overall statistics
		$this->assertEquals( 4, $result['stats']['total_classes_found'] );
		$this->assertEquals( 4, $result['stats']['classes_converted'] );
		$this->assertEquals( 0, $result['stats']['classes_skipped'] );
		$this->assertEquals( 8, $result['stats']['properties_converted'] );
		$this->assertEquals( 3, $result['stats']['properties_skipped'] );
		$this->assertEquals( 2, $result['stats']['variables_converted'] );

		// Verify converted classes
		$this->assertCount( 4, $result['converted_classes'] );

		// Test primary button class
		$primary_button = $this->find_class_by_id( $result['converted_classes'], 'primary-button' );
		$this->assertNotNull( $primary_button );
		$this->assertEquals( 'Primary Button', $primary_button['label'] );
		$this->assertEquals( '#ffffff', $primary_button['variants']['desktop']['color'] );
		$this->assertEquals( '16px', $primary_button['variants']['desktop']['font-size'] );

		// Test secondary text class
		$secondary_text = $this->find_class_by_id( $result['converted_classes'], 'secondary-text' );
		$this->assertNotNull( $secondary_text );
		$this->assertEquals( '#6c757d', $secondary_text['variants']['desktop']['color'] );

		// Test branded element with variables
		$branded_element = $this->find_class_by_id( $result['converted_classes'], 'branded-element' );
		$this->assertNotNull( $branded_element );
		$this->assertEquals( '#007cba', $branded_element['variants']['desktop']['color'] );
		$this->assertEquals( '18px', $branded_element['variants']['desktop']['font-size'] );

		// Test mixed properties class
		$mixed_properties = $this->find_class_by_id( $result['converted_classes'], 'mixed-properties' );
		$this->assertNotNull( $mixed_properties );
		$this->assertEquals( '#333333', $mixed_properties['variants']['desktop']['color'] );
		$this->assertEquals( '15px', $mixed_properties['variants']['desktop']['font-size'] );
		$this->assertArrayNotHasKey( 'background-color', $mixed_properties['variants']['desktop'] );
		$this->assertArrayNotHasKey( 'margin', $mixed_properties['variants']['desktop'] );

		// Verify warnings for unsupported properties
		$this->assertGreaterThan( 0, count( $result['warnings'] ) );
		$warning_text = implode( ' ', $result['warnings'] );
		$this->assertStringContainsString( 'background-color', $warning_text );
		$this->assertStringContainsString( 'margin', $warning_text );
		$this->assertStringContainsString( 'padding', $warning_text );
	}

	public function test_parser_integration() {
		$css = '.test { color: #ff0000; font-size: 16px; }';
		
		$parsed = $this->parser->parse( $css );
		$classes = $this->parser->extract_classes( $parsed );
		
		$this->assertCount( 1, $classes );
		$this->assertEquals( '.test', $classes[0]['selector'] );
		$this->assertArrayHasKey( 'color', $classes[0]['properties'] );
		$this->assertArrayHasKey( 'font-size', $classes[0]['properties'] );
	}

	public function test_color_format_conversions() {
		$css = '
			.hex-color { color: #ff0000; }
			.short-hex { color: #f00; }
			.rgb-color { color: rgb(255, 0, 0); }
			.rgba-color { color: rgba(255, 0, 0, 1); }
			.named-color { color: red; }
		';

		$result = $this->service->convert_css_to_global_classes( $css );

		$hex_class = $this->find_class_by_id( $result['converted_classes'], 'hex-color' );
		$this->assertEquals( '#ff0000', $hex_class['variants']['desktop']['color'] );

		$short_hex_class = $this->find_class_by_id( $result['converted_classes'], 'short-hex' );
		$this->assertEquals( '#ff0000', $short_hex_class['variants']['desktop']['color'] );

		$rgb_class = $this->find_class_by_id( $result['converted_classes'], 'rgb-color' );
		$this->assertEquals( '#ff0000', $rgb_class['variants']['desktop']['color'] );

		$rgba_class = $this->find_class_by_id( $result['converted_classes'], 'rgba-color' );
		$this->assertEquals( '#ff0000', $rgba_class['variants']['desktop']['color'] );

		$named_class = $this->find_class_by_id( $result['converted_classes'], 'named-color' );
		$this->assertEquals( 'red', $named_class['variants']['desktop']['color'] );
	}

	public function test_font_size_unit_handling() {
		$css = '
			.px-size { font-size: 16px; }
			.em-size { font-size: 1.2em; }
			.rem-size { font-size: 1.5rem; }
			.percent-size { font-size: 120%; }
			.pt-size { font-size: 12pt; }
		';

		$result = $this->service->convert_css_to_global_classes( $css );

		$px_class = $this->find_class_by_id( $result['converted_classes'], 'px-size' );
		$this->assertEquals( '16px', $px_class['variants']['desktop']['font-size'] );

		$em_class = $this->find_class_by_id( $result['converted_classes'], 'em-size' );
		$this->assertEquals( '1.2em', $em_class['variants']['desktop']['font-size'] );

		$rem_class = $this->find_class_by_id( $result['converted_classes'], 'rem-size' );
		$this->assertEquals( '1.5rem', $rem_class['variants']['desktop']['font-size'] );

		$percent_class = $this->find_class_by_id( $result['converted_classes'], 'percent-size' );
		$this->assertEquals( '120%', $percent_class['variants']['desktop']['font-size'] );

		$pt_class = $this->find_class_by_id( $result['converted_classes'], 'pt-size' );
		$this->assertEquals( '12pt', $pt_class['variants']['desktop']['font-size'] );
	}

	private function find_class_by_id( array $classes, string $id ): ?array {
		foreach ( $classes as $class ) {
			if ( $class['id'] === $id ) {
				return $class;
			}
		}
		return null;
	}
}
