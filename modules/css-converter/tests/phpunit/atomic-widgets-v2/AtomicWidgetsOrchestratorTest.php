<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgetsV2;

use Elementor\Modules\CssConverter\Services\AtomicWidgetsV2\Atomic_Widgets_Orchestrator;

class AtomicWidgetsOrchestratorTest extends AtomicWidgetV2TestCase {

	private Atomic_Widgets_Orchestrator $orchestrator;

	protected function setUp(): void {
		parent::setUp();
		$this->orchestrator = new Atomic_Widgets_Orchestrator();
	}

	public function test_convert_simple_heading_html(): void {
		$html = '<h1 style="font-size: 32px; color: #333333;">Test Heading</h1>';
		
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['widgets'] );
		
		$widget = $result['widgets'][0];
		$this->assertValidWidgetStructure( $widget, 'e-heading' );
		$this->assertEquals( 'Test Heading', $widget['settings']['title'] );
		
		// Verify styles were integrated
		$this->assertArrayHasKey( 'styles', $widget );
		$this->assertNotEmpty( $widget['styles'] );
		
		// Verify class reference was added
		$this->assertArrayHasKey( 'classes', $widget['settings'] );
		$this->assertNotEmpty( $widget['settings']['classes']['value'] );
		
		// Verify stats
		$this->assertArrayHasKey( 'stats', $result );
		$this->assertEquals( 1, $result['stats']['total_elements_parsed'] );
		$this->assertEquals( 1, $result['stats']['total_widgets_created'] );
		$this->assertGreaterThan( 0, $result['stats']['atomic_props_converted'] );
	}

	public function test_convert_nested_container_html(): void {
		$html = '<div style="display: flex; flex-direction: column; padding: 20px;">
					<h1 style="font-size: 32px;">Heading</h1>
					<p style="font-size: 16px;">Paragraph</p>
				  </div>';
		
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['widgets'] );
		
		$container = $result['widgets'][0];
		$this->assertValidElementStructure( $container, 'e-flexbox' );
		$this->assertEquals( 'column', $container['settings']['direction'] );
		$this->assertCount( 2, $container['elements'] );
		
		// Verify children
		$heading = $container['elements'][0];
		$paragraph = $container['elements'][1];
		
		$this->assertValidWidgetStructure( $heading, 'e-heading' );
		$this->assertValidWidgetStructure( $paragraph, 'e-paragraph' );
		
		$this->assertEquals( 'Heading', $heading['settings']['title'] );
		$this->assertEquals( 'Paragraph', $paragraph['settings']['text'] );
		
		// Verify all widgets have styles
		$this->assertArrayHasKey( 'styles', $container );
		$this->assertArrayHasKey( 'styles', $heading );
		$this->assertArrayHasKey( 'styles', $paragraph );
		
		// Verify stats
		$this->assertEquals( 3, $result['stats']['total_elements_parsed'] );
		$this->assertEquals( 3, $result['stats']['total_widgets_created'] );
	}

	public function test_convert_complex_html_structure(): void {
		$html = '<section style="padding: 40px; background-color: #f5f5f5;">
					<div style="max-width: 800px; margin: 0 auto;">
						<h1 style="font-size: 48px; text-align: center; margin-bottom: 20px;">Main Title</h1>
						<div style="display: flex; gap: 30px;">
							<div style="background: white; padding: 20px; border-radius: 8px;">
								<h2 style="color: #0073aa;">Feature One</h2>
								<p>Description of feature one.</p>
							</div>
							<div style="background: white; padding: 20px; border-radius: 8px;">
								<h2 style="color: #0073aa;">Feature Two</h2>
								<p>Description of feature two.</p>
							</div>
						</div>
					</div>
				  </section>';
		
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertTrue( $result['success'] );
		$this->assertNotEmpty( $result['widgets'] );
		
		// Verify stats show complex structure
		$this->assertGreaterThan( 5, $result['stats']['total_elements_parsed'] );
		$this->assertGreaterThan( 5, $result['stats']['total_widgets_created'] );
		$this->assertGreaterThan( 0, $result['stats']['atomic_props_converted'] );
		$this->assertGreaterThan( 0, $result['stats']['styles_created'] );
		
		// Verify widget types
		$widget_types = $result['stats']['widget_types_created'];
		$this->assertArrayHasKey( 'e-flexbox', $widget_types );
		$this->assertArrayHasKey( 'e-heading', $widget_types );
		$this->assertArrayHasKey( 'e-paragraph', $widget_types );
	}

	public function test_convert_html_to_global_classes(): void {
		$html = '<h1 style="font-size: 32px; color: #333;">Heading</h1>
				  <p style="font-size: 16px; margin-bottom: 20px;">Paragraph</p>';
		
		$result = $this->orchestrator->convert_html_to_global_classes( $html );
		
		$this->assertTrue( $result['success'] );
		$this->assertArrayHasKey( 'global_classes', $result );
		
		$global_classes = $result['global_classes'];
		$this->assertArrayHasKey( 'items', $global_classes );
		$this->assertArrayHasKey( 'order', $global_classes );
		$this->assertNotEmpty( $global_classes['items'] );
		$this->assertNotEmpty( $global_classes['order'] );
		
		// Verify each global class has proper structure
		foreach ( $global_classes['items'] as $class_id => $class_definition ) {
			$this->assertEquals( $class_id, $class_definition['id'] );
			$this->assertEquals( 'local', $class_definition['label'] );
			$this->assertEquals( 'class', $class_definition['type'] );
			$this->assertArrayHasKey( 'variants', $class_definition );
			$this->assertNotEmpty( $class_definition['variants'] );
			
			// Verify variant structure
			$variant = $class_definition['variants'][0];
			$this->assertArrayHasKey( 'meta', $variant );
			$this->assertArrayHasKey( 'props', $variant );
			$this->assertEquals( 'desktop', $variant['meta']['breakpoint'] );
			$this->assertIsArray( $variant['props'] );
		}
	}

	public function test_convert_empty_html(): void {
		$result = $this->orchestrator->convert_html_to_atomic_widgets( '' );
		
		$this->assertFalse( $result['success'] );
		$this->assertEquals( 'HTML content is empty.', $result['error'] );
		$this->assertEmpty( $result['widgets'] );
		
		$stats = $result['stats'];
		$this->assertEquals( 0, $stats['total_elements_parsed'] );
		$this->assertEquals( 0, $stats['total_widgets_created'] );
	}

	public function test_convert_unsupported_html(): void {
		$html = '<custom-element>Unsupported content</custom-element>';
		
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertFalse( $result['success'] );
		$this->assertStringContains( 'parsing failed', $result['error'] );
		$this->assertEmpty( $result['widgets'] );
	}

	public function test_conversion_with_mixed_supported_unsupported_elements(): void {
		$html = '<div>
					<h1>Supported Heading</h1>
					<custom-element>Unsupported Element</custom-element>
					<p>Supported Paragraph</p>
				  </div>';
		
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertTrue( $result['success'] );
		$this->assertNotEmpty( $result['widgets'] );
		
		// Should create container with only supported children
		$container = $result['widgets'][0];
		$this->assertValidElementStructure( $container, 'e-flexbox' );
		$this->assertCount( 2, $container['elements'] ); // Only supported elements
		
		$this->assertEquals( 'e-heading', $container['elements'][0]['widgetType'] );
		$this->assertEquals( 'e-paragraph', $container['elements'][1]['widgetType'] );
	}

	public function test_validate_conversion_result(): void {
		$valid_success_result = [
			'success' => true,
			'widgets' => [],
			'stats' => [],
		];
		
		$valid_error_result = [
			'success' => false,
			'error' => 'Test error',
		];
		
		$invalid_result = [
			'success' => true,
			// Missing widgets and stats
		];
		
		$this->assertTrue( $this->orchestrator->validate_conversion_result( $valid_success_result ) );
		$this->assertTrue( $this->orchestrator->validate_conversion_result( $valid_error_result ) );
		$this->assertFalse( $this->orchestrator->validate_conversion_result( $invalid_result ) );
	}

	public function test_get_conversion_capabilities(): void {
		$capabilities = $this->orchestrator->get_conversion_capabilities();
		
		$this->assertIsArray( $capabilities );
		$this->assertArrayHasKey( 'atomic_widgets_available', $capabilities );
		$this->assertArrayHasKey( 'supported_html_tags', $capabilities );
		$this->assertArrayHasKey( 'supported_widget_types', $capabilities );
		$this->assertArrayHasKey( 'supported_css_properties', $capabilities );
		
		$this->assertIsBool( $capabilities['atomic_widgets_available'] );
		$this->assertIsArray( $capabilities['supported_html_tags'] );
		$this->assertIsArray( $capabilities['supported_widget_types'] );
		$this->assertIsArray( $capabilities['supported_css_properties'] );
	}

	public function test_get_supported_html_tags(): void {
		$tags = $this->orchestrator->get_supported_html_tags();
		
		$this->assertIsArray( $tags );
		$this->assertContains( 'h1', $tags );
		$this->assertContains( 'p', $tags );
		$this->assertContains( 'div', $tags );
		$this->assertContains( 'button', $tags );
	}

	public function test_get_supported_widget_types(): void {
		$types = $this->orchestrator->get_supported_widget_types();
		
		$this->assertIsArray( $types );
		$this->assertContains( 'e-heading', $types );
		$this->assertContains( 'e-paragraph', $types );
		$this->assertContains( 'e-button', $types );
		$this->assertContains( 'e-flexbox', $types );
	}

	public function test_is_atomic_widgets_available(): void {
		$is_available = $this->orchestrator->is_atomic_widgets_available();
		$this->assertIsBool( $is_available );
		
		// If atomic widgets are available, we should be able to run full tests
		if ( $is_available ) {
			$this->assertTrue( class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Widget_Builder' ) );
			$this->assertTrue( class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Element_Builder' ) );
		}
	}

	public function test_service_dependency_injection(): void {
		// Test that we can inject custom services
		$original_parser = $this->orchestrator->get_data_parser();
		$original_creator = $this->orchestrator->get_json_creator();
		$original_integrator = $this->orchestrator->get_styles_integrator();
		
		$this->assertNotNull( $original_parser );
		$this->assertNotNull( $original_creator );
		$this->assertNotNull( $original_integrator );
		
		// Test setters work
		$this->orchestrator->set_data_parser( $original_parser );
		$this->orchestrator->set_json_creator( $original_creator );
		$this->orchestrator->set_styles_integrator( $original_integrator );
		
		$this->assertSame( $original_parser, $this->orchestrator->get_data_parser() );
		$this->assertSame( $original_creator, $this->orchestrator->get_json_creator() );
		$this->assertSame( $original_integrator, $this->orchestrator->get_styles_integrator() );
	}
}
