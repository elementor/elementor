<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgetsV2;

use Elementor\Modules\CssConverter\Services\AtomicWidgetsV2\Atomic_Widget_JSON_Creator;

class AtomicWidgetJSONCreatorTest extends AtomicWidgetV2TestCase {

	private Atomic_Widget_JSON_Creator $json_creator;

	protected function setUp(): void {
		parent::setUp();
		$this->json_creator = new Atomic_Widget_JSON_Creator();
	}

	public function test_create_heading_widget_with_atomic_widgets(): void {
		if ( ! class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Widget_Builder' ) ) {
			$this->markTestSkipped( 'Widget_Builder not available' );
		}

		$widget_data = [
			'widget_type' => 'e-heading',
			'content' => 'Test Heading',
			'atomic_props' => [
				'font-size' => $this->createTestSizeProp( 32, 'px' ),
				'color' => $this->createTestColorProp( '#333333' ),
			],
			'attributes' => ['original_tag' => 'h1'],
			'children' => [],
		];

		$widget = $this->json_creator->create_widget_json( $widget_data );

		$this->assertNotNull( $widget );
		$this->assertValidWidgetStructure( $widget, 'e-heading' );
		$this->assertEquals( 'Test Heading', $widget['settings']['title'] );
		$this->assertEquals( 'h1', $widget['settings']['tag']['value'] );
		$this->assertEquals( 1, $widget['settings']['level'] );

		// Verify atomic props are in settings
		$this->assertArrayHasKey( 'font-size', $widget['settings'] );
		$this->assertArrayHasKey( 'color', $widget['settings'] );
		$this->assertValidSizeProp( $widget['settings']['font-size'] );
		$this->assertValidColorProp( $widget['settings']['color'] );
	}

	public function test_create_paragraph_widget_with_atomic_widgets(): void {
		if ( ! class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Widget_Builder' ) ) {
			$this->markTestSkipped( 'Widget_Builder not available' );
		}

		$widget_data = [
			'widget_type' => 'e-paragraph',
			'content' => 'Test paragraph content',
			'atomic_props' => [
				'font-size' => $this->createTestSizeProp( 16, 'px' ),
				'line-height' => $this->createTestStringProp( '1.5' ),
			],
			'attributes' => [],
			'children' => [],
		];

		$widget = $this->json_creator->create_widget_json( $widget_data );

		$this->assertNotNull( $widget );
		$this->assertValidWidgetStructure( $widget, 'e-paragraph' );
		$this->assertEquals( 'Test paragraph content', $widget['settings']['text'] );

		// Verify atomic props
		$this->assertArrayHasKey( 'font-size', $widget['settings'] );
		$this->assertArrayHasKey( 'line-height', $widget['settings'] );
	}

	public function test_create_button_widget_with_link(): void {
		if ( ! class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Widget_Builder' ) ) {
			$this->markTestSkipped( 'Widget_Builder not available' );
		}

		$widget_data = [
			'widget_type' => 'e-button',
			'content' => 'Click Me',
			'atomic_props' => [
				'background-color' => $this->createTestColorProp( '#0073aa' ),
				'padding' => $this->createTestDimensionsProp( ['top' => 10, 'right' => 20, 'bottom' => 10, 'left' => 20] ),
			],
			'attributes' => [
				'href' => 'https://example.com',
				'target' => '_blank',
			],
			'children' => [],
		];

		$widget = $this->json_creator->create_widget_json( $widget_data );

		$this->assertNotNull( $widget );
		$this->assertValidWidgetStructure( $widget, 'e-button' );
		$this->assertEquals( 'Click Me', $widget['settings']['text'] );

		// Verify link prop
		$this->assertArrayHasKey( 'link', $widget['settings'] );
		$this->assertEquals( 'link', $widget['settings']['link']['$$type'] );
		$this->assertEquals( 'https://example.com', $widget['settings']['link']['value']['url'] );
		$this->assertTrue( $widget['settings']['link']['value']['is_external'] );
	}

	public function test_create_flexbox_container_with_children(): void {
		if ( ! class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Element_Builder' ) ) {
			$this->markTestSkipped( 'Element_Builder not available' );
		}

		$child_widget_data = [
			'widget_type' => 'e-paragraph',
			'content' => 'Child content',
			'atomic_props' => [],
			'attributes' => [],
			'children' => [],
		];

		$container_data = [
			'widget_type' => 'e-flexbox',
			'content' => '',
			'atomic_props' => [
				'padding' => $this->createTestDimensionsProp( ['top' => 20, 'right' => 20, 'bottom' => 20, 'left' => 20] ),
			],
			'attributes' => [],
			'children' => [$child_widget_data],
		];

		$container = $this->json_creator->create_widget_json( $container_data );

		$this->assertNotNull( $container );
		$this->assertValidElementStructure( $container, 'e-flexbox' );
		$this->assertCount( 1, $container['elements'] );

		// Verify default flexbox settings
		$this->assertEquals( 'column', $container['settings']['direction'] );
		$this->assertEquals( 'nowrap', $container['settings']['wrap'] );

		// Verify child widget
		$child = $container['elements'][0];
		$this->assertValidWidgetStructure( $child, 'e-paragraph' );
		$this->assertEquals( 'Child content', $child['settings']['text'] );
	}

	public function test_create_multiple_widgets(): void {
		$widgets_data = [
			[
				'widget_type' => 'e-heading',
				'content' => 'Heading 1',
				'atomic_props' => ['font-size' => $this->createTestSizeProp( 32, 'px' )],
				'attributes' => [],
				'children' => [],
			],
			[
				'widget_type' => 'e-paragraph',
				'content' => 'Paragraph 1',
				'atomic_props' => ['font-size' => $this->createTestSizeProp( 16, 'px' )],
				'attributes' => [],
				'children' => [],
			],
		];

		$widgets = $this->json_creator->create_multiple_widgets( $widgets_data );

		$this->assertCount( 2, $widgets );
		$this->assertValidWidgetStructure( $widgets[0], 'e-heading' );
		$this->assertValidWidgetStructure( $widgets[1], 'e-paragraph' );
	}

	public function test_widget_validation_against_schema(): void {
		$widget_data = [
			'widget_type' => 'e-heading',
			'content' => 'Test Heading',
			'atomic_props' => [
				'font-size' => $this->createTestSizeProp( 32, 'px' ),
			],
			'attributes' => [],
			'children' => [],
		];

		$widget = $this->json_creator->create_widget_json( $widget_data );
		$this->assertNotNull( $widget );

		// Test validation (will skip if schema not available)
		$is_valid = $this->json_creator->validate_widget_against_schema( $widget, 'e-heading' );
		$this->assertTrue( $is_valid );
	}

	public function test_unsupported_widget_type_returns_null(): void {
		$widget_data = [
			'widget_type' => 'unsupported-widget',
			'content' => 'Test',
			'atomic_props' => [],
			'attributes' => [],
			'children' => [],
		];

		$widget = $this->json_creator->create_widget_json( $widget_data );
		$this->assertNull( $widget );
	}

	public function test_empty_widget_data_returns_null(): void {
		$widget_data = [];

		$widget = $this->json_creator->create_widget_json( $widget_data );
		$this->assertNull( $widget );
	}

	public function test_get_supported_widget_types(): void {
		$supported_types = $this->json_creator->get_supported_widget_types();
		
		$this->assertIsArray( $supported_types );
		$this->assertContains( 'e-heading', $supported_types );
		$this->assertContains( 'e-paragraph', $supported_types );
		$this->assertContains( 'e-button', $supported_types );
		$this->assertContains( 'e-flexbox', $supported_types );
	}

	public function test_is_widget_type_supported(): void {
		$this->assertTrue( $this->json_creator->is_widget_type_supported( 'e-heading' ) );
		$this->assertTrue( $this->json_creator->is_widget_type_supported( 'e-paragraph' ) );
		$this->assertFalse( $this->json_creator->is_widget_type_supported( 'unsupported-widget' ) );
	}

	public function test_nested_container_creation(): void {
		if ( ! class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Element_Builder' ) ) {
			$this->markTestSkipped( 'Element_Builder not available' );
		}

		$inner_widget_data = [
			'widget_type' => 'e-heading',
			'content' => 'Nested Heading',
			'atomic_props' => [],
			'attributes' => [],
			'children' => [],
		];

		$inner_container_data = [
			'widget_type' => 'e-flexbox',
			'content' => '',
			'atomic_props' => [],
			'attributes' => [],
			'children' => [$inner_widget_data],
		];

		$outer_container_data = [
			'widget_type' => 'e-flexbox',
			'content' => '',
			'atomic_props' => [],
			'attributes' => [],
			'children' => [$inner_container_data],
		];

		$outer_container = $this->json_creator->create_widget_json( $outer_container_data );

		$this->assertNotNull( $outer_container );
		$this->assertValidElementStructure( $outer_container, 'e-flexbox' );
		$this->assertCount( 1, $outer_container['elements'] );

		$inner_container = $outer_container['elements'][0];
		$this->assertValidElementStructure( $inner_container, 'e-flexbox' );
		$this->assertCount( 1, $inner_container['elements'] );

		$nested_widget = $inner_container['elements'][0];
		$this->assertValidWidgetStructure( $nested_widget, 'e-heading' );
		$this->assertEquals( 'Nested Heading', $nested_widget['settings']['title'] );
	}
}
