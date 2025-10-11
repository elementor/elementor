<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Widget\Widget_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Html_Parser;
use Elementor\Modules\CssConverter\Services\Css\Css_Processor;
use Elementor\Modules\CssConverter\Services\Widget\Widget_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-nested-styles
 */
class Test_Nested_Styles_Fix extends Elementor_Test_Base {

	public function test_recursive_css_application_to_nested_widgets() {
		// Test that CSS styles are applied recursively to nested children
		$service = new Widget_Conversion_Service();
		$reflection = new \ReflectionClass( $service );
		$method = $reflection->getMethod( 'apply_css_to_widgets' );
		$method->setAccessible( true );

		// Mock nested widget structure with inline styles
		$widgets = [
			[
				'widget_type' => 'e-flexbox',
				'inline_css' => [
					'color' => [ 'value' => '#ff6b6b', 'important' => false ],
					'padding' => [ 'value' => '20px', 'important' => false ],
				],
				'children' => [
					[
						'widget_type' => 'e-heading',
						'inline_css' => [
							'color' => [ 'value' => '#2c3e50', 'important' => false ],
							'font-weight' => [ 'value' => 'bold', 'important' => false ],
						],
						'children' => [],
					],
					[
						'widget_type' => 'e-text',
						'inline_css' => [
							'font-size' => [ 'value' => '16px', 'important' => false ],
							'line-height' => [ 'value' => '1.6', 'important' => false ],
						],
						'children' => [],
					],
				],
			],
		];

		$css_processing_result = [
			'widget_styles' => [],
			'element_styles' => [],
			'global_classes' => [],
		];

		// Mock CSS processor
		$css_processor = $this->createMock( Css_Processor::class );
		$css_processor->method( 'apply_styles_to_widget' )
			->willReturnCallback( function( $widget ) {
				// Simulate applying inline styles
				return [
					'computed_styles' => $widget['inline_css'] ?? [],
				];
			});

		// Inject mock CSS processor
		$css_processor_property = $reflection->getProperty( 'css_processor' );
		$css_processor_property->setAccessible( true );
		$css_processor_property->setValue( $service, $css_processor );

		// Apply CSS to widgets
		$styled_widgets = $method->invoke( $service, $widgets, $css_processing_result );

		// Test that parent widget has applied styles
		$this->assertArrayHasKey( 'applied_styles', $styled_widgets[0] );
		$this->assertArrayHasKey( 'computed_styles', $styled_widgets[0]['applied_styles'] );
		$this->assertArrayHasKey( 'color', $styled_widgets[0]['applied_styles']['computed_styles'] );

		// Test that first child (heading) has applied styles
		$this->assertArrayHasKey( 'children', $styled_widgets[0] );
		$this->assertNotEmpty( $styled_widgets[0]['children'] );
		
		$first_child = $styled_widgets[0]['children'][0];
		$this->assertArrayHasKey( 'applied_styles', $first_child );
		$this->assertArrayHasKey( 'computed_styles', $first_child['applied_styles'] );
		$this->assertArrayHasKey( 'color', $first_child['applied_styles']['computed_styles'] );
		$this->assertArrayHasKey( 'font-weight', $first_child['applied_styles']['computed_styles'] );

		// Test that second child (paragraph) has applied styles
		$second_child = $styled_widgets[0]['children'][1];
		$this->assertArrayHasKey( 'applied_styles', $second_child );
		$this->assertArrayHasKey( 'computed_styles', $second_child['applied_styles'] );
		$this->assertArrayHasKey( 'font-size', $second_child['applied_styles']['computed_styles'] );
		$this->assertArrayHasKey( 'line-height', $second_child['applied_styles']['computed_styles'] );
	}

	public function test_html_parser_extracts_inline_css_for_nested_elements() {
		$html_parser = new Html_Parser();
		
		$html = '<div style="color: #ff6b6b; padding: 20px;">
			<h1 style="color: #2c3e50; font-weight: bold;">Heading</h1>
			<p style="font-size: 16px; line-height: 1.6;">Paragraph</p>
		</div>';

		$elements = $html_parser->parse( $html );

		// Test that parent div has inline CSS
		$this->assertNotEmpty( $elements );
		$parent = $elements[0];
		$this->assertArrayHasKey( 'inline_css', $parent );
		$this->assertArrayHasKey( 'color', $parent['inline_css'] );
		$this->assertArrayHasKey( 'padding', $parent['inline_css'] );

		// Test that children have inline CSS
		$this->assertArrayHasKey( 'children', $parent );
		$this->assertNotEmpty( $parent['children'] );

		$heading = $parent['children'][0];
		$this->assertArrayHasKey( 'inline_css', $heading );
		$this->assertArrayHasKey( 'color', $heading['inline_css'] );
		$this->assertArrayHasKey( 'font-weight', $heading['inline_css'] );

		$paragraph = $parent['children'][1];
		$this->assertArrayHasKey( 'inline_css', $paragraph );
		$this->assertArrayHasKey( 'font-size', $paragraph['inline_css'] );
		$this->assertArrayHasKey( 'line-height', $paragraph['inline_css'] );
	}

	public function test_widget_mapper_preserves_nested_structure() {
		$widget_mapper = new Widget_Mapper();

		// Mock parsed elements with nested structure
		$elements = [
			[
				'tag' => 'div',
				'inline_css' => [
					'color' => [ 'value' => '#ff6b6b', 'important' => false ],
				],
				'children' => [
					[
						'tag' => 'h1',
						'content' => 'Heading',
						'inline_css' => [
							'color' => [ 'value' => '#2c3e50', 'important' => false ],
						],
						'children' => [],
					],
					[
						'tag' => 'p',
						'content' => 'Paragraph',
						'inline_css' => [
							'font-size' => [ 'value' => '16px', 'important' => false ],
						],
						'children' => [],
					],
				],
			],
		];

		$mapped_widgets = $widget_mapper->map_elements( $elements );

		// Test that nested structure is preserved
		$this->assertNotEmpty( $mapped_widgets );
		$parent_widget = $mapped_widgets[0];
		
		$this->assertArrayHasKey( 'children', $parent_widget );
		$this->assertCount( 2, $parent_widget['children'] );

		// Test that inline CSS is preserved
		$this->assertArrayHasKey( 'inline_css', $parent_widget );
		$this->assertArrayHasKey( 'inline_css', $parent_widget['children'][0] );
		$this->assertArrayHasKey( 'inline_css', $parent_widget['children'][1] );
	}

	public function test_deep_nesting_css_application() {
		// Test CSS application with deeper nesting levels
		$service = new Widget_Conversion_Service();
		$reflection = new \ReflectionClass( $service );
		$method = $reflection->getMethod( 'apply_css_to_widgets' );
		$method->setAccessible( true );

		// Create deeply nested structure
		$widgets = [
			[
				'widget_type' => 'e-flexbox',
				'inline_css' => [ 'color' => [ 'value' => 'red', 'important' => false ] ],
				'children' => [
					[
						'widget_type' => 'e-flexbox',
						'inline_css' => [ 'padding' => [ 'value' => '10px', 'important' => false ] ],
						'children' => [
							[
								'widget_type' => 'e-heading',
								'inline_css' => [ 'font-size' => [ 'value' => '24px', 'important' => false ] ],
								'children' => [],
							],
						],
					],
				],
			],
		];

		$css_processing_result = [
			'widget_styles' => [],
			'element_styles' => [],
			'global_classes' => [],
		];

		// Mock CSS processor
		$css_processor = $this->createMock( Css_Processor::class );
		$css_processor->method( 'apply_styles_to_widget' )
			->willReturnCallback( function( $widget ) {
				return [
					'computed_styles' => $widget['inline_css'] ?? [],
				];
			});

		// Inject mock CSS processor
		$css_processor_property = $reflection->getProperty( 'css_processor' );
		$css_processor_property->setAccessible( true );
		$css_processor_property->setValue( $service, $css_processor );

		// Apply CSS to widgets
		$styled_widgets = $method->invoke( $service, $widgets, $css_processing_result );

		// Test level 1 (root)
		$this->assertArrayHasKey( 'applied_styles', $styled_widgets[0] );

		// Test level 2 (first child)
		$level2 = $styled_widgets[0]['children'][0];
		$this->assertArrayHasKey( 'applied_styles', $level2 );

		// Test level 3 (grandchild)
		$level3 = $level2['children'][0];
		$this->assertArrayHasKey( 'applied_styles', $level3 );
		$this->assertArrayHasKey( 'computed_styles', $level3['applied_styles'] );
		$this->assertArrayHasKey( 'font-size', $level3['applied_styles']['computed_styles'] );
	}

	public function test_empty_children_array_handling() {
		// Test that widgets without children are handled correctly
		$service = new Widget_Conversion_Service();
		$reflection = new \ReflectionClass( $service );
		$method = $reflection->getMethod( 'apply_css_to_widgets' );
		$method->setAccessible( true );

		$widgets = [
			[
				'widget_type' => 'e-heading',
				'inline_css' => [ 'color' => [ 'value' => 'blue', 'important' => false ] ],
				'children' => [], // Empty children array
			],
			[
				'widget_type' => 'e-text',
				'inline_css' => [ 'font-size' => [ 'value' => '14px', 'important' => false ] ],
				// No children property
			],
		];

		$css_processing_result = [
			'widget_styles' => [],
			'element_styles' => [],
			'global_classes' => [],
		];

		// Mock CSS processor
		$css_processor = $this->createMock( Css_Processor::class );
		$css_processor->method( 'apply_styles_to_widget' )
			->willReturnCallback( function( $widget ) {
				return [
					'computed_styles' => $widget['inline_css'] ?? [],
				];
			});

		// Inject mock CSS processor
		$css_processor_property = $reflection->getProperty( 'css_processor' );
		$css_processor_property->setAccessible( true );
		$css_processor_property->setValue( $service, $css_processor );

		// Should not throw errors
		$styled_widgets = $method->invoke( $service, $widgets, $css_processing_result );

		// Both widgets should have applied styles
		$this->assertArrayHasKey( 'applied_styles', $styled_widgets[0] );
		$this->assertArrayHasKey( 'applied_styles', $styled_widgets[1] );
	}
}
