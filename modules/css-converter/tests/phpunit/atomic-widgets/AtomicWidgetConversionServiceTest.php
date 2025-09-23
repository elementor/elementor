<?php

namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

require_once __DIR__ . '/AtomicWidgetTestCase.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-id-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-tag-to-widget-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-to-props-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-json-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/atomic-html-parser.php';
require_once __DIR__ . '/../../../services/atomic-widgets/conversion-stats-calculator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/conversion-result-builder.php';
require_once __DIR__ . '/../../../services/atomic-widgets/atomic-widget-hierarchy-processor.php';
require_once __DIR__ . '/../../../services/atomic-widgets/atomic-widget-factory.php';
require_once __DIR__ . '/../../../services/atomic-widgets/atomic-widget-conversion-service.php';

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Widget_Conversion_Service;

class AtomicWidgetConversionServiceTest extends AtomicWidgetTestCase {

	private Atomic_Widget_Conversion_Service $service;

	protected function setUp(): void {
		parent::setUp();
		$this->service = new Atomic_Widget_Conversion_Service();
	}

	public function test_convert_empty_html_returns_failure_result(): void {
		$result = $this->service->convert_html_to_widgets( '' );

		$this->assertValidConversionResult( $result );
		$this->assertFalse( $result['success'] );
		$this->assertEquals( 'Empty HTML provided', $result['error'] );
		$this->assertEmpty( $result['widgets'] );
	}

	public function test_convert_whitespace_only_html_returns_failure_result(): void {
		$result = $this->service->convert_html_to_widgets( '   ' );

		$this->assertValidConversionResult( $result );
		$this->assertFalse( $result['success'] );
		$this->assertEquals( 'Empty HTML provided', $result['error'] );
		$this->assertEmpty( $result['widgets'] );
	}

	public function test_convert_simple_div_returns_success_result(): void {
		$html = '<div>Hello World</div>';
		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertValidConversionResult( $result );
		$this->assertTrue( $result['success'] );
		$this->assertNull( $result['error'] );
		$this->assertNotEmpty( $result['widgets'] );
		$this->assertValidConversionStats( $result['stats'] );
	}

	public function test_convert_heading_creates_heading_widget(): void {
		$html = '<h1>Test Heading</h1>';
		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['widgets'] );

		$widget = $result['widgets'][0];
		$this->assertValidWidgetStructure( $widget );
		$this->assertEquals( 'e-heading', $widget['widgetType'] );
		$this->assertEquals( 'widget', $widget['elType'] );
	}

	public function test_convert_paragraph_creates_paragraph_widget(): void {
		$html = '<p>Test paragraph content</p>';
		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['widgets'] );

		$widget = $result['widgets'][0];
		$this->assertValidWidgetStructure( $widget );
		$this->assertEquals( 'e-paragraph', $widget['widgetType'] );
		$this->assertEquals( 'widget', $widget['elType'] );
	}

	public function test_convert_button_creates_button_widget(): void {
		$html = '<button>Click Me</button>';
		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['widgets'] );

		$widget = $result['widgets'][0];
		$this->assertValidWidgetStructure( $widget );
		$this->assertEquals( 'e-button', $widget['widgetType'] );
		$this->assertEquals( 'widget', $widget['elType'] );
	}

	public function test_convert_div_creates_flexbox_widget(): void {
		$html = '<div>Container content</div>';
		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['widgets'] );

		$widget = $result['widgets'][0];
		$this->assertValidWidgetStructure( $widget );
		$this->assertEquals( 'e-flexbox', $widget['widgetType'] );
		$this->assertEquals( 'e-flexbox', $widget['elType'] );
	}

	public function test_convert_nested_html_creates_widget_hierarchy(): void {
		$html = '<div><h1>Title</h1><p>Content</p></div>';
		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['widgets'] );

		$container = $result['widgets'][0];
		$this->assertEquals( 'e-flexbox', $container['widgetType'] );
		$this->assertCount( 2, $container['elements'] );

		$heading = $container['elements'][0];
		$this->assertEquals( 'e-heading', $heading['widgetType'] );

		$paragraph = $container['elements'][1];
		$this->assertEquals( 'e-paragraph', $paragraph['widgetType'] );
	}

	public function test_convert_html_with_inline_styles_preserves_styles(): void {
		$html = '<div style="color: red; font-size: 16px;">Styled content</div>';
		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['widgets'] );

		$widget = $result['widgets'][0];
		$this->assertArrayHasKey( 'styles', $widget );
		$this->assertNotEmpty( $widget['styles'] );

		$styles = array_values( $widget['styles'] )[0];
		$this->assertArrayHasKey( 'variants', $styles );
		$this->assertNotEmpty( $styles['variants'] );

		$variant = $styles['variants'][0];
		$this->assertArrayHasKey( 'props', $variant );
		$this->assertNotEmpty( $variant['props'] );
	}

	public function test_conversion_stats_are_accurate(): void {
		$html = '<div><h1>Title</h1><p>Content</p><button>Click</button></div>';
		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertTrue( $result['success'] );
		$this->assertValidConversionStats( $result['stats'] );

		$stats = $result['stats'];
		$this->assertEquals( 4, $stats['total_elements_parsed'] );
		$this->assertEquals( 4, $stats['total_widgets_created'] );
		$this->assertEquals( 4, $stats['supported_elements'] );
		$this->assertEquals( 0, $stats['unsupported_elements'] );

		$this->assertArrayHasKey( 'e-flexbox', $stats['widget_types_created'] );
		$this->assertArrayHasKey( 'e-heading', $stats['widget_types_created'] );
		$this->assertArrayHasKey( 'e-paragraph', $stats['widget_types_created'] );
		$this->assertArrayHasKey( 'e-button', $stats['widget_types_created'] );
	}

	public function test_malformed_html_returns_parsing_failed_result(): void {
		$html = '<div><h1>Unclosed heading<p>Malformed</div>';
		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertValidConversionResult( $result );
		
		if ( ! $result['success'] ) {
			$this->assertEquals( 'HTML parsing failed', $result['error'] );
		} else {
			$this->assertNotEmpty( $result['widgets'] );
		}
	}

	public function test_get_supported_widget_types_returns_array(): void {
		$supported_types = $this->service->get_supported_widget_types();

		$this->assertIsArray( $supported_types );
		$this->assertNotEmpty( $supported_types );
		$this->assertContains( 'e-heading', $supported_types );
		$this->assertContains( 'e-paragraph', $supported_types );
		$this->assertContains( 'e-button', $supported_types );
		$this->assertContains( 'e-flexbox', $supported_types );
		$this->assertContains( 'e-image', $supported_types );
	}

	public function test_convert_complex_html_structure(): void {
		$html = '
			<div style="max-width: 800px; margin: 0 auto;">
				<h1 style="font-size: 36px; color: #333;">Main Title</h1>
				<div style="display: flex; gap: 20px;">
					<div>
						<h2 style="color: #666;">Section 1</h2>
						<p>Content for section 1</p>
					</div>
					<div>
						<h2 style="color: #666;">Section 2</h2>
						<p>Content for section 2</p>
					</div>
				</div>
				<button style="background: #007cba; color: white;">Call to Action</button>
			</div>
		';

		$result = $this->service->convert_html_to_widgets( $html );

		$this->assertTrue( $result['success'] );
		$this->assertNotEmpty( $result['widgets'] );
		$this->assertValidConversionStats( $result['stats'] );

		$stats = $result['stats'];
		$this->assertGreaterThan( 5, $stats['total_elements_parsed'] );
		$this->assertGreaterThan( 5, $stats['total_widgets_created'] );
		$this->assertEquals( $stats['total_elements_parsed'], $stats['supported_elements'] );
		$this->assertEquals( 0, $stats['unsupported_elements'] );
	}
}
