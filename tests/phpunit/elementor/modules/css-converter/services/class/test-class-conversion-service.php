<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Class\Class_Conversion_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-service
 */
class Test_Class_Conversion_Service extends Elementor_Test_Base {
	private $service;

	public function setUp(): void {
		parent::setUp();
		$this->service = new Class_Conversion_Service();
	}

	public function test_converts_simple_class_with_supported_properties() {
		$css = '.test-class { color: #ff0000; font-size: 16px; }';
		$result = $this->service->convert_css_to_global_classes( $css );

		$this->assertEquals( 1, $result['stats']['total_classes_found'] );
		$this->assertEquals( 1, $result['stats']['classes_converted'] );
		$this->assertEquals( 0, $result['stats']['classes_skipped'] );
		$this->assertEquals( 2, $result['stats']['properties_converted'] );
		$this->assertEquals( 0, $result['stats']['properties_skipped'] );

		$this->assertCount( 1, $result['converted_classes'] );
		$class = $result['converted_classes'][0];
		$this->assertEquals( 'test-class', $class['id'] );
		$this->assertEquals( 'Test Class', $class['label'] );
		$this->assertEquals( 'class', $class['type'] );

		$desktop_props = $class['variants']['desktop'];
		$this->assertEquals( '#ff0000', $desktop_props['color'] );
		$this->assertEquals( '16px', $desktop_props['font-size'] );
	}

	public function test_skips_unsupported_properties() {
		$css = '.test-class { color: #ff0000; background-color: #ffffff; margin: 10px; }';
		$result = $this->service->convert_css_to_global_classes( $css );

		$this->assertEquals( 1, $result['stats']['classes_converted'] );
		$this->assertEquals( 1, $result['stats']['properties_converted'] );
		$this->assertEquals( 2, $result['stats']['properties_skipped'] );

		$this->assertCount( 2, $result['warnings'] );
		$this->assertStringContainsString( 'background-color', $result['warnings'][0] );
		$this->assertStringContainsString( 'margin', $result['warnings'][1] );
	}

	public function test_skips_complex_selectors() {
		$css = '
			.simple-class { color: red; }
			.parent .child { color: blue; }
			.button:hover { color: green; }
			#main .content { color: black; }
		';
		$result = $this->service->convert_css_to_global_classes( $css );

		$this->assertEquals( 1, $result['stats']['total_classes_found'] );
		$this->assertEquals( 1, $result['stats']['classes_converted'] );
		$this->assertEquals( 0, $result['stats']['classes_skipped'] );
	}

	public function test_handles_css_variables() {
		$css = '.variable-class { --primary: #007cba; color: var(--primary); font-size: 16px; }';
		$result = $this->service->convert_css_to_global_classes( $css );

		$this->assertEquals( 1, $result['stats']['classes_converted'] );
		$this->assertEquals( 1, $result['stats']['variables_converted'] );

		$class = $result['converted_classes'][0];
		$desktop_props = $class['variants']['desktop'];
		$this->assertEquals( '#007cba', $desktop_props['color'] );
		$this->assertEquals( '16px', $desktop_props['font-size'] );
	}

	public function test_skips_classes_with_no_supported_properties() {
		$css = '.empty-class { background-color: #ffffff; margin: 10px; }';
		$result = $this->service->convert_css_to_global_classes( $css );

		$this->assertEquals( 1, $result['stats']['total_classes_found'] );
		$this->assertEquals( 0, $result['stats']['classes_converted'] );
		$this->assertEquals( 1, $result['stats']['classes_skipped'] );

		$skipped = $result['skipped_classes'][0];
		$this->assertEquals( '.empty-class', $skipped['selector'] );
		$this->assertEquals( 'no_supported_properties', $skipped['reason'] );
	}

	public function test_generates_proper_class_ids_and_labels() {
		$css = '.my-awesome-class { color: red; }';
		$result = $this->service->convert_css_to_global_classes( $css );

		$class = $result['converted_classes'][0];
		$this->assertEquals( 'my-awesome-class', $class['id'] );
		$this->assertEquals( 'My Awesome Class', $class['label'] );
	}

	public function test_handles_multiple_classes() {
		$css = '
			.red-text { color: red; }
			.large-text { font-size: 24px; }
			.blue-small { color: blue; font-size: 12px; }
		';
		$result = $this->service->convert_css_to_global_classes( $css );

		$this->assertEquals( 3, $result['stats']['total_classes_found'] );
		$this->assertEquals( 3, $result['stats']['classes_converted'] );
		$this->assertEquals( 4, $result['stats']['properties_converted'] );

		$this->assertCount( 3, $result['converted_classes'] );
	}

	public function test_warning_system() {
		$css = '.test-class { color: invalid-color; font-size: 16px; }';
		$result = $this->service->convert_css_to_global_classes( $css );

		$this->assertNotEmpty( $result['warnings'] );
		$this->assertStringContainsString( 'Failed to map property', $result['warnings'][0] );
	}
}
