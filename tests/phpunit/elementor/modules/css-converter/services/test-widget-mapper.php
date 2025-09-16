<?php
namespace Elementor\Testing\Modules\CssConverter\Services;

use Elementor\Modules\CssConverter\Services\Widget\Widget_Mapper;
use Elementor\Modules\CssConverter\Services\Css\Html_Parser;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group widget-mapper
 */
class Test_Widget_Mapper extends Elementor_Test_Base {

	private $widget_mapper;
	private $html_parser;

	public function setUp(): void {
		parent::setUp();
		$this->widget_mapper = new Widget_Mapper();
		$this->html_parser = new Html_Parser();
	}

	public function test_returns_supported_html_tags() {
		$supported_tags = $this->widget_mapper->get_supported_tags();
		
		$this->assertIsArray( $supported_tags );
		$this->assertContains( 'h1', $supported_tags );
		$this->assertContains( 'h2', $supported_tags );
		$this->assertContains( 'h3', $supported_tags );
		$this->assertContains( 'h4', $supported_tags );
		$this->assertContains( 'h5', $supported_tags );
		$this->assertContains( 'h6', $supported_tags );
		$this->assertContains( 'p', $supported_tags );
		$this->assertContains( 'div', $supported_tags );
		$this->assertContains( 'img', $supported_tags );
		$this->assertContains( 'a', $supported_tags );
		$this->assertContains( 'button', $supported_tags );
	}

	public function test_resolves_correct_widget_types() {
		// HVV Decision: All heading tags map to e-heading
		$this->assertEquals( 'e-heading', $this->widget_mapper->resolve_widget_type( 'h1' ) );
		$this->assertEquals( 'e-heading', $this->widget_mapper->resolve_widget_type( 'h2' ) );
		$this->assertEquals( 'e-heading', $this->widget_mapper->resolve_widget_type( 'h3' ) );
		$this->assertEquals( 'e-heading', $this->widget_mapper->resolve_widget_type( 'h4' ) );
		$this->assertEquals( 'e-heading', $this->widget_mapper->resolve_widget_type( 'h5' ) );
		$this->assertEquals( 'e-heading', $this->widget_mapper->resolve_widget_type( 'h6' ) );
		
		// Other mappings
		$this->assertEquals( 'e-text', $this->widget_mapper->resolve_widget_type( 'p' ) );
		$this->assertEquals( 'e-flexbox', $this->widget_mapper->resolve_widget_type( 'div' ) ); // HVV Decision: div always maps to flexbox
		$this->assertEquals( 'e-image', $this->widget_mapper->resolve_widget_type( 'img' ) );
		$this->assertEquals( 'e-link', $this->widget_mapper->resolve_widget_type( 'a' ) );
		$this->assertEquals( 'e-button', $this->widget_mapper->resolve_widget_type( 'button' ) );
	}

	public function test_maps_html_elements_to_widgets() {
		$html = '<div class="container"><h1 id="title">Hello</h1><p class="text">World</p></div>';
		$parsed = $this->html_parser->parse( $html );
		
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$this->assertIsArray( $mapped );
		$this->assertNotEmpty( $mapped );
		
		foreach ( $mapped as $widget ) {
			$this->assertArrayHasKey( 'widget_type', $widget );
			$this->assertArrayHasKey( 'element_data', $widget );
			$this->assertContains( $widget['widget_type'], [ 'e-flexbox', 'e-heading', 'e-text' ] );
		}
	}

	public function test_provides_accurate_mapping_statistics() {
		$html = '<div><h1>Title</h1><h2>Subtitle</h2><p>Text</p><img src="test.jpg" alt="Test"></div>';
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$stats = $this->widget_mapper->get_mapping_stats( $mapped );
		
		$this->assertIsArray( $stats );
		$this->assertArrayHasKey( 'total_elements', $stats );
		$this->assertArrayHasKey( 'mapped_elements', $stats );
		$this->assertArrayHasKey( 'widget_types', $stats );
		$this->assertGreaterThan( 0, $stats['total_elements'] );
		$this->assertEquals( $stats['total_elements'], $stats['mapped_elements'] );
	}

	public function test_handles_unsupported_html_tags() {
		$html = '<div><video src="test.mp4"></video><canvas></canvas><h1>Supported</h1></div>';
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$stats = $this->widget_mapper->get_mapping_stats( $mapped );
		
		// Should have some mapped and some unmapped elements
		$this->assertGreaterThan( 0, $stats['total_elements'] );
		$this->assertGreaterThan( 0, $stats['mapped_elements'] );
		
		// Check that unsupported elements are reported
		if ( isset( $stats['unsupported_elements'] ) ) {
			$this->assertIsArray( $stats['unsupported_elements'] );
		}
	}

	public function test_preserves_element_hierarchy() {
		$html = '<div class="parent"><div class="child"><h1>Nested Title</h1></div></div>';
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$this->assertNotEmpty( $mapped );
		
		// Find parent div
		$parent_widget = null;
		foreach ( $mapped as $widget ) {
			if ( 'e-flexbox' === $widget['widget_type'] && 
				 isset( $widget['element_data']['attributes']['class'] ) &&
				 'parent' === $widget['element_data']['attributes']['class'] ) {
				$parent_widget = $widget;
				break;
			}
		}
		
		$this->assertNotNull( $parent_widget );
		$this->assertArrayHasKey( 'children', $parent_widget );
	}

	public function test_handles_complex_nested_structure() {
		$html = '
			<div class="container">
				<header>
					<h1>Main Title</h1>
					<nav>
						<a href="/home">Home</a>
						<a href="/about">About</a>
					</nav>
				</header>
				<main>
					<section>
						<h2>Section Title</h2>
						<p>Section content</p>
						<button>Action Button</button>
					</section>
				</main>
			</div>
		';
		
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$this->assertNotEmpty( $mapped );
		
		$widget_types = array_column( $mapped, 'widget_type' );
		$this->assertContains( 'e-flexbox', $widget_types ); // div, header, nav, main, section
		$this->assertContains( 'e-heading', $widget_types ); // h1, h2
		$this->assertContains( 'e-text', $widget_types ); // p
		$this->assertContains( 'e-link', $widget_types ); // a
		$this->assertContains( 'e-button', $widget_types ); // button
	}

	public function test_extracts_widget_properties_from_html() {
		$html = '<h1 class="title" id="main-title" style="color: red;">Hello World</h1>';
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$this->assertNotEmpty( $mapped );
		$heading_widget = $mapped[0];
		
		$this->assertEquals( 'e-heading', $heading_widget['widget_type'] );
		$this->assertArrayHasKey( 'element_data', $heading_widget );
		
		$element_data = $heading_widget['element_data'];
		$this->assertEquals( 'Hello World', $element_data['content'] );
		$this->assertEquals( 'title', $element_data['attributes']['class'] );
		$this->assertEquals( 'main-title', $element_data['attributes']['id'] );
		$this->assertEquals( 'color: red;', $element_data['attributes']['style'] );
	}

	public function test_handles_image_elements_with_attributes() {
		$html = '<img src="test.jpg" alt="Test Image" class="responsive" width="300" height="200">';
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$this->assertNotEmpty( $mapped );
		$image_widget = $mapped[0];
		
		$this->assertEquals( 'e-image', $image_widget['widget_type'] );
		
		$element_data = $image_widget['element_data'];
		$this->assertEquals( 'test.jpg', $element_data['attributes']['src'] );
		$this->assertEquals( 'Test Image', $element_data['attributes']['alt'] );
		$this->assertEquals( 'responsive', $element_data['attributes']['class'] );
		$this->assertEquals( '300', $element_data['attributes']['width'] );
		$this->assertEquals( '200', $element_data['attributes']['height'] );
	}

	public function test_handles_link_elements_with_href() {
		$html = '<a href="https://example.com" class="external-link" target="_blank">Visit Example</a>';
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$this->assertNotEmpty( $mapped );
		$link_widget = $mapped[0];
		
		$this->assertEquals( 'e-link', $link_widget['widget_type'] );
		
		$element_data = $link_widget['element_data'];
		$this->assertEquals( 'Visit Example', $element_data['content'] );
		$this->assertEquals( 'https://example.com', $element_data['attributes']['href'] );
		$this->assertEquals( 'external-link', $element_data['attributes']['class'] );
		$this->assertEquals( '_blank', $element_data['attributes']['target'] );
	}
}
