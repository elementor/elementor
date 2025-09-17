<?php
namespace Elementor\Testing\Modules\CssConverter\Services;

use Elementor\Modules\CssConverter\Services\Css\Css_Processor;
use Elementor\Modules\CssConverter\Services\Css\Html_Parser;
use Elementor\Modules\CssConverter\Services\Widget\Widget_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group css-processor
 */
class Test_Css_Processor extends Elementor_Test_Base {

	private $css_processor;
	private $html_parser;
	private $widget_mapper;

	public function setUp(): void {
		parent::setUp();
		$this->css_processor = new Css_Processor();
		$this->html_parser = new Html_Parser();
		$this->widget_mapper = new Widget_Mapper();
	}

	public function test_processes_css_for_widgets() {
		$css = '.title { color: red; font-size: 24px; } #main { background: blue; } div { margin: 10px; }';
		$html = '<div id="main"><h1 class="title">Hello World</h1></div>';
		
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$result = $this->css_processor->process_css_for_widgets( $css, $mapped );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'global_classes', $result );
		$this->assertArrayHasKey( 'widget_styles', $result );
		$this->assertArrayHasKey( 'element_styles', $result );
		$this->assertArrayHasKey( 'stats', $result );
	}

	public function test_categorizes_styles_by_specificity() {
		$css = '
			.title { color: red; }
			#main-title { color: blue; }
			h1 { color: green; }
			h1.title { color: purple; }
		';
		
		$result = $this->css_processor->process_css_for_widgets( $css, [] );
		
		$this->assertArrayHasKey( 'global_classes', $result );
		$this->assertArrayHasKey( 'widget_styles', $result );
		$this->assertArrayHasKey( 'element_styles', $result );
		
		// Should have global classes for .title
		$this->assertNotEmpty( $result['global_classes'] );
		$this->assertArrayHasKey( 'title', $result['global_classes'] );
		
		// Should have widget styles for #main-title
		$this->assertNotEmpty( $result['widget_styles'] );
		
		// Should have element styles for h1
		$this->assertNotEmpty( $result['element_styles'] );
	}

	public function test_handles_important_declarations() {
		$css = '
			.title { color: red !important; }
			#main-title { color: blue; }
			h1 { color: green !important; }
		';
		
		$result = $this->css_processor->process_css_for_widgets( $css, [] );
		
		// Find the !important declarations
		$important_found = false;
		foreach ( $result['global_classes'] as $class_data ) {
			foreach ( $class_data['properties'] as $property ) {
				if ( $property['important'] ) {
					$important_found = true;
					break 2;
				}
			}
		}
		
		$this->assertTrue( $important_found, 'Should find !important declarations' );
	}

	public function test_creates_global_classes_with_threshold_one() {
		// HVV Decision: threshold = 1, create global class for every CSS class
		$css = '.single-use { color: red; } .another-class { font-size: 16px; }';
		
		$result = $this->css_processor->process_css_for_widgets( $css, [] );
		
		$this->assertArrayHasKey( 'global_classes', $result );
		$this->assertArrayHasKey( 'single-use', $result['global_classes'] );
		$this->assertArrayHasKey( 'another-class', $result['global_classes'] );
		
		// Check stats
		$this->assertArrayHasKey( 'stats', $result );
		$this->assertEquals( 2, $result['stats']['global_classes_created'] );
	}

	public function test_extracts_css_rules_correctly() {
		$css = '.class1 { color: red; font-size: 16px; } #id1 { background: blue; } div { margin: 10px; }';
		
		$rules = $this->css_processor->extract_css_rules( $css );
		
		$this->assertIsArray( $rules );
		$this->assertNotEmpty( $rules );
		
		// Should have at least 4 rules (3 selectors × properties)
		$this->assertGreaterThanOrEqual( 4, count( $rules ) );
		
		foreach ( $rules as $rule ) {
			$this->assertArrayHasKey( 'selector', $rule );
			$this->assertArrayHasKey( 'property', $rule );
			$this->assertArrayHasKey( 'value', $rule );
			$this->assertArrayHasKey( 'important', $rule );
		}
	}

	public function test_fetches_css_from_urls() {
		$urls = [ 'https://example.com/styles.css', 'https://example.com/theme.css' ];
		
		$result = $this->css_processor->fetch_css_from_urls( $urls );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'css', $result );
		$this->assertArrayHasKey( 'fetched_urls', $result );
		$this->assertArrayHasKey( 'errors', $result );
		
		// Since these are fake URLs, they should fail
		$this->assertNotEmpty( $result['errors'] );
	}

	public function test_applies_styles_to_widget() {
		$css = '.title { color: red; } #main { background: blue; } h1 { font-size: 24px; }';
		$widget = [
			'widget_type' => 'e-heading',
			'original_tag' => 'h1',
			'attributes' => [
				'class' => 'title',
				'id' => 'main',
			],
			'inline_css' => [
				'margin' => [ 'value' => '10px', 'important' => false ],
			],
		];
		
		$processing_result = $this->css_processor->process_css_for_widgets( $css, [] );
		$applied_styles = $this->css_processor->apply_styles_to_widget( $widget, $processing_result );
		
		$this->assertIsArray( $applied_styles );
		$this->assertArrayHasKey( 'widget_styles', $applied_styles );
		$this->assertArrayHasKey( 'global_classes', $applied_styles );
		$this->assertArrayHasKey( 'element_styles', $applied_styles );
		$this->assertArrayHasKey( 'computed_styles', $applied_styles );
		
		// Should apply the title class
		$this->assertContains( 'title', $applied_styles['global_classes'] );
	}

	public function test_computes_final_styles_with_cascade() {
		$widget = [
			'widget_type' => 'e-heading',
			'original_tag' => 'h1',
			'attributes' => [
				'class' => 'title',
				'id' => 'main',
				'style' => 'color: purple;',
			],
		];
		
		$css = '
			h1 { color: black; font-size: 16px; }
			.title { color: red; font-size: 18px; }
			#main { color: blue; font-size: 20px; }
		';
		
		$processing_result = $this->css_processor->process_css_for_widgets( $css, [] );
		$applied_styles = $this->css_processor->apply_styles_to_widget( $widget, $processing_result );
		
		$computed_styles = $applied_styles['computed_styles'];
		
		// Inline styles should win for color (purple)
		// ID selector should win for font-size (20px) over class and element
		$this->assertArrayHasKey( 'color', $computed_styles );
		$this->assertEquals( 'purple', $computed_styles['color']['value'] );
	}

	public function test_handles_malformed_css_gracefully() {
		$malformed_css = '
			.class { color: ; }
			broken-selector { font-size: invalid; }
			.valid { margin: 10px; }
		';
		
		$result = $this->css_processor->process_css_for_widgets( $malformed_css, [] );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'stats', $result );
		
		// Should have warnings about malformed CSS
		if ( isset( $result['stats']['warnings'] ) ) {
			$this->assertNotEmpty( $result['stats']['warnings'] );
		}
		
		// Should still process valid rules
		$this->assertArrayHasKey( 'global_classes', $result );
		$this->assertArrayHasKey( 'valid', $result['global_classes'] );
	}

	public function test_follows_css_imports() {
		$css_with_imports = '
			@import url("base.css");
			@import "theme.css";
			.local { color: red; }
		';
		
		// Test import URL extraction
		$import_urls = $this->css_processor->extract_import_urls( $css_with_imports, 'https://example.com/main.css' );
		
		$this->assertIsArray( $import_urls );
		$this->assertContains( 'https://example.com/base.css', $import_urls );
		$this->assertContains( 'https://example.com/theme.css', $import_urls );
	}

	public function test_resolves_relative_urls() {
		$base_url = 'https://example.com/css/main.css';
		
		// Test relative path resolution
		$relative_url = '../images/bg.jpg';
		$resolved = $this->css_processor->resolve_relative_url( $relative_url, $base_url );
		$this->assertEquals( 'https://example.com/images/bg.jpg', $resolved );
		
		// Test absolute path resolution
		$absolute_path = '/assets/style.css';
		$resolved_abs = $this->css_processor->resolve_relative_url( $absolute_path, $base_url );
		$this->assertEquals( 'https://example.com/assets/style.css', $resolved_abs );
	}

	public function test_converts_css_properties_using_existing_converters() {
		// Test that CSS properties are converted using the existing class conversion service
		$css = '.test { color: #ff0000; font-size: 16px; background-color: blue; }';
		
		$result = $this->css_processor->process_css_for_widgets( $css, [] );
		
		$this->assertArrayHasKey( 'global_classes', $result );
		$this->assertArrayHasKey( 'test', $result['global_classes'] );
		
		$test_class = $result['global_classes']['test'];
		$this->assertArrayHasKey( 'properties', $test_class );
		$this->assertNotEmpty( $test_class['properties'] );
		
		// Should have converted properties
		$converted_properties = array_column( $test_class['properties'], 'converted_property' );
		$this->assertNotEmpty( $converted_properties );
	}

	public function test_reports_unsupported_properties() {
		$css = '.test { color: red; unsupported-property: value; another-unsupported: test; }';
		
		$result = $this->css_processor->process_css_for_widgets( $css, [] );
		
		$this->assertArrayHasKey( 'stats', $result );
		$this->assertArrayHasKey( 'unsupported_properties', $result['stats'] );
		
		// Should report unsupported properties
		$unsupported = $result['stats']['unsupported_properties'];
		$this->assertNotEmpty( $unsupported );
		
		$unsupported_property_names = array_column( $unsupported, 'property' );
		$this->assertContains( 'unsupported-property', $unsupported_property_names );
		$this->assertContains( 'another-unsupported', $unsupported_property_names );
	}

	public function test_processes_complex_selectors() {
		$css = '
			.container .title { color: red; }
			#main > .content { background: blue; }
			h1 + p { margin-top: 0; }
			.btn:hover { background: green; }
			input[type="text"] { border: 1px solid gray; }
		';
		
		$result = $this->css_processor->process_css_for_widgets( $css, [] );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'global_classes', $result );
		$this->assertArrayHasKey( 'widget_styles', $result );
		$this->assertArrayHasKey( 'element_styles', $result );
		
		// Should categorize complex selectors appropriately
		$this->assertNotEmpty( $result['global_classes'] );
	}
}
