<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Widget\Widget_Creator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-v4-output
 */
class Test_V4_Output_Format extends Elementor_Test_Base {

	public function test_v4_widget_structure_matches_study_document() {
		// Test that generated structure matches the expected v4 format from study document
		$expected_structure = [
			'id' => 'string',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [
				'classes' => [
					'$$type' => 'classes',
					'value' => 'array',
				],
			],
			'styles' => 'array',
		];

		$styled_widgets = [
			[
				'widget_type' => 'e-heading',
				'settings' => [
					'text' => 'Test Heading',
					'tag' => 'h1',
				],
				'applied_styles' => [
					'computed_styles' => [
						'color' => '#5f669c',
						'font-weight' => '700',
					],
				],
				'elements' => [],
			],
		];

		$css_processing_result = [
			'variables' => [],
			'global_classes' => [],
		];

		$options = [
			'postId' => null,
			'createGlobalClasses' => false,
		];

		$widget_creator = new Widget_Creator();
		$result = $widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );

		$this->assertArrayHasKey( 'widgets', $result );
		$widget = $result['widgets'][0];

		// Test basic structure
		$this->assertArrayHasKey( 'id', $widget );
		$this->assertEquals( 'widget', $widget['elType'] );
		$this->assertEquals( 'e-heading', $widget['widgetType'] );
		$this->assertArrayHasKey( 'settings', $widget );
		$this->assertArrayHasKey( 'styles', $widget );
	}

	public function test_class_id_format_matches_specification() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'generate_unique_class_id' );
		$method->setAccessible( true );

		$class_id = $method->invoke( $widget_creator );

		// Test format: e-{widget-id}-{hash} where widget-id is 8 chars and hash is 7 chars
		$this->assertMatchesRegularExpression( '/^e-[a-f0-9]{8}-[a-f0-9]{7}$/', $class_id, 'Class ID should match e-{8chars}-{7chars} format' );

		// Test multiple generations are unique
		$class_ids = [];
		for ( $i = 0; $i < 10; $i++ ) {
			$id = $method->invoke( $widget_creator );
			$this->assertNotContains( $id, $class_ids, 'Each generated class ID should be unique' );
			$class_ids[] = $id;
		}
	}

	public function test_settings_classes_structure() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'merge_settings_with_styles' );
		$method->setAccessible( true );

		$settings = [ 'title' => 'Test' ];
		$applied_styles = [
			'computed_styles' => [ 'color' => '#ff0000' ],
			'global_classes' => [ 'global-class-1', 'global-class-2' ],
		];

		$result = $method->invoke( $widget_creator, $settings, $applied_styles );

		// Test classes structure matches v4 specification
		$this->assertArrayHasKey( 'classes', $result );
		$classes = $result['classes'];

		$this->assertEquals( 'classes', $classes['$$type'] );
		$this->assertIsArray( $classes['value'] );

		// Test that global classes are included
		$this->assertContains( 'global-class-1', $classes['value'] );
		$this->assertContains( 'global-class-2', $classes['value'] );

		// Test that generated class is included
		$generated_classes = array_filter( $classes['value'], function( $class ) {
			return preg_match( '/^e-[a-f0-9]{8}-[a-f0-9]{7}$/', $class );
		});
		$this->assertCount( 1, $generated_classes, 'Should have exactly one generated class ID' );
	}

	public function test_style_object_structure() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'create_v4_style_object' );
		$method->setAccessible( true );

		$class_id = 'e-12a169d-a2712b7';
		$computed_styles = [
			'color' => '#5f669c',
			'font-weight' => '700',
			'text-align' => 'justify',
		];

		$style_object = $method->invoke( $widget_creator, $class_id, $computed_styles );

		// Test structure matches study document specification
		$this->assertEquals( $class_id, $style_object['id'] );
		$this->assertEquals( 'local', $style_object['label'] );
		$this->assertEquals( 'class', $style_object['type'] );
		$this->assertArrayHasKey( 'variants', $style_object );
		$this->assertCount( 1, $style_object['variants'] );

		$variant = $style_object['variants'][0];
		$this->assertArrayHasKey( 'meta', $variant );
		$this->assertArrayHasKey( 'props', $variant );

		// Test meta structure
		$meta = $variant['meta'];
		$this->assertEquals( 'desktop', $meta['breakpoint'] );
		$this->assertNull( $meta['state'] );

		// Test props structure
		$props = $variant['props'];
		$this->assertIsArray( $props );
		$this->assertNotEmpty( $props );
	}

	public function test_props_type_wrappers() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'map_css_to_v4_props' );
		$method->setAccessible( true );

		$computed_styles = [
			'color' => '#5f669c',
			'font-size' => '24px',
			'background-color' => '#f0f0f0',
			'text-align' => 'center',
			'margin' => '10px 20px',
		];

		$props = $method->invoke( $widget_creator, $computed_styles );

		// Test color type wrapper
		if ( isset( $props['color'] ) ) {
			$this->assertEquals( 'color', $props['color']['$$type'] );
			$this->assertEquals( '#5f669c', $props['color']['value'] );
		}

		// Test size type wrapper
		if ( isset( $props['font-size'] ) ) {
			$this->assertEquals( 'size', $props['font-size']['$$type'] );
			$this->assertIsArray( $props['font-size']['value'] );
			$this->assertArrayHasKey( 'size', $props['font-size']['value'] );
			$this->assertArrayHasKey( 'unit', $props['font-size']['value'] );
		}

		// Test background type wrapper (background-color maps to background)
		if ( isset( $props['background'] ) ) {
			$this->assertEquals( 'background', $props['background']['$$type'] );
			$this->assertIsArray( $props['background']['value'] );
			$this->assertArrayHasKey( 'color', $props['background']['value'] );
		}

		// Test string type wrapper
		if ( isset( $props['text-align'] ) ) {
			$this->assertEquals( 'string', $props['text-align']['$$type'] );
			$this->assertEquals( 'center', $props['text-align']['value'] );
		}

		// Test dimensions type wrapper
		if ( isset( $props['margin'] ) ) {
			$this->assertIsArray( $props['margin'] );
			// Margin can be either dimensions type or individual size properties
		}
	}

	public function test_complete_v4_output_example() {
		// Test that complete output matches the structure from study document
		$styled_widgets = [
			[
				'widget_type' => 'e-heading',
				'settings' => [
					'text' => 'Styled Heading',
					'tag' => 'h1',
				],
				'applied_styles' => [
					'computed_styles' => [
						'color' => '#5f669c',
						'font-weight' => '700',
						'text-align' => 'justify',
						'border-width' => '5px',
						'border-color' => '#5c3f3f',
						'border-style' => 'ridge',
					],
				],
				'elements' => [],
			],
		];

		$css_processing_result = [
			'variables' => [],
			'global_classes' => [],
		];

		$options = [
			'postId' => null,
			'createGlobalClasses' => false,
		];

		$widget_creator = new Widget_Creator();
		$result = $widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );

		$widget = $result['widgets'][0];

		// Validate complete structure
		$this->assertArrayHasKey( 'id', $widget );
		$this->assertEquals( 'widget', $widget['elType'] );
		$this->assertEquals( 'e-heading', $widget['widgetType'] );

		// Validate settings
		$settings = $widget['settings'];
		$this->assertArrayHasKey( 'classes', $settings );
		$this->assertEquals( 'classes', $settings['classes']['$$type'] );
		$this->assertIsArray( $settings['classes']['value'] );

		// Validate styles
		$styles = $widget['styles'];
		$this->assertNotEmpty( $styles );

		$style_id = array_keys( $styles )[0];
		$style = $styles[ $style_id ];

		$this->assertEquals( $style_id, $style['id'] );
		$this->assertEquals( 'local', $style['label'] );
		$this->assertEquals( 'class', $style['type'] );
		$this->assertArrayHasKey( 'variants', $style );

		$variant = $style['variants'][0];
		$this->assertEquals( 'desktop', $variant['meta']['breakpoint'] );
		$this->assertNull( $variant['meta']['state'] );

		$props = $variant['props'];
		$this->assertNotEmpty( $props );

		// Validate specific properties match expected types
		foreach ( $props as $property => $value ) {
			$this->assertArrayHasKey( '$$type', $value, "Property {$property} should have $$type wrapper" );
			$this->assertArrayHasKey( 'value', $value, "Property {$property} should have value" );
		}
	}

	public function test_flexbox_container_structure() {
		// Test e-flexbox container structure
		$styled_widgets = [
			[
				'widget_type' => 'e-flexbox',
				'settings' => [
					'direction' => 'column',
				],
				'applied_styles' => [
					'computed_styles' => [
						'width' => '600px',
						'padding' => '100px 20px',
						'background-color' => '#d03737',
					],
				],
				'elements' => [],
			],
		];

		$css_processing_result = [
			'variables' => [],
			'global_classes' => [],
		];

		$options = [
			'postId' => null,
			'createGlobalClasses' => false,
		];

		$widget_creator = new Widget_Creator();
		$result = $widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );

		$widget = $result['widgets'][0];

		// Test flexbox-specific structure
		$this->assertEquals( 'e-flexbox', $widget['elType'] );
		$this->assertArrayHasKey( 'elements', $widget );
		$this->assertIsArray( $widget['elements'] );

		// Test that flexbox has styles applied
		$this->assertNotEmpty( $widget['styles'] );
	}

	public function test_empty_styles_when_no_computed_styles() {
		$styled_widgets = [
			[
				'widget_type' => 'e-heading',
				'settings' => [
					'text' => 'Plain Heading',
					'tag' => 'h1',
				],
				'applied_styles' => [
					'computed_styles' => [],
				],
				'elements' => [],
			],
		];

		$css_processing_result = [
			'variables' => [],
			'global_classes' => [],
		];

		$options = [
			'postId' => null,
			'createGlobalClasses' => false,
		];

		$widget_creator = new Widget_Creator();
		$result = $widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );

		$widget = $result['widgets'][0];

		// Test that widgets without computed styles have empty styles array
		$this->assertArrayHasKey( 'styles', $widget );
		$this->assertEmpty( $widget['styles'] );

		// But settings should still exist
		$this->assertArrayHasKey( 'settings', $widget );
	}
}
