<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Widget\Widget_Creator;
use Elementor\Modules\CssConverter\Services\Widget\Widget_Hierarchy_Processor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-v4-styling
 */
class Test_V4_Styling_Implementation extends Elementor_Test_Base {

	public function test_widget_creator_has_v4_methods() {
		$widget_creator = new Widget_Creator();
		
		// Test that all required v4 methods exist
		$this->assertTrue( method_exists( $widget_creator, 'create_widgets' ), 'Widget Creator should have create_widgets method' );
		
		// Use reflection to test private methods exist
		$reflection = new \ReflectionClass( $widget_creator );
		
		$required_methods = [
			'convert_styles_to_v4_format',
			'generate_unique_class_id',
			'create_v4_style_object',
			'map_css_to_v4_props',
			'merge_settings_with_styles',
		];
		
		foreach ( $required_methods as $method ) {
			$this->assertTrue( $reflection->hasMethod( $method ), "Widget Creator should have {$method} method" );
		}
	}

	public function test_v4_class_id_generation() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'generate_unique_class_id' );
		$method->setAccessible( true );
		
		$class_id = $method->invoke( $widget_creator );
		
		// Test class ID format: e-{widget-id}-{hash}
		$this->assertMatchesRegularExpression( '/^e-[a-f0-9]{8}-[a-f0-9]{7}$/', $class_id, 'Class ID should match e-{id}-{hash} format' );
		
		// Test uniqueness
		$class_id2 = $method->invoke( $widget_creator );
		$this->assertNotEquals( $class_id, $class_id2, 'Generated class IDs should be unique' );
	}

	public function test_v4_style_object_creation() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'create_v4_style_object' );
		$method->setAccessible( true );
		
		$class_id = 'e-test123-abc1234';
		$computed_styles = [
			'color' => '#ff0000',
			'font-size' => '16px',
		];
		
		$style_object = $method->invoke( $widget_creator, $class_id, $computed_styles );
		
		// Test v4 style object structure
		$this->assertEquals( $class_id, $style_object['id'] );
		$this->assertEquals( 'local', $style_object['label'] );
		$this->assertEquals( 'class', $style_object['type'] );
		$this->assertArrayHasKey( 'variants', $style_object );
		$this->assertCount( 1, $style_object['variants'] );
		
		$variant = $style_object['variants'][0];
		$this->assertEquals( 'desktop', $variant['meta']['breakpoint'] );
		$this->assertNull( $variant['meta']['state'] );
		$this->assertArrayHasKey( 'props', $variant );
	}

	public function test_css_to_v4_props_mapping() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'map_css_to_v4_props' );
		$method->setAccessible( true );
		
		$computed_styles = [
			'color' => '#ff0000',
			'font-size' => '16px',
			'background-color' => '#00ff00',
		];
		
		$v4_props = $method->invoke( $widget_creator, $computed_styles );
		
		// Test that CSS properties are mapped to v4 format
		$this->assertArrayHasKey( 'color', $v4_props );
		$this->assertArrayHasKey( 'font-size', $v4_props );
		$this->assertArrayHasKey( 'background', $v4_props ); // background-color maps to background
		
		// Test v4 type wrappers
		$this->assertEquals( 'color', $v4_props['color']['$$type'] );
		$this->assertEquals( '#ff0000', $v4_props['color']['value'] );
		
		$this->assertEquals( 'size', $v4_props['font-size']['$$type'] );
		$this->assertArrayHasKey( 'size', $v4_props['font-size']['value'] );
		$this->assertArrayHasKey( 'unit', $v4_props['font-size']['value'] );
		
		$this->assertEquals( 'background', $v4_props['background']['$$type'] );
		$this->assertArrayHasKey( 'color', $v4_props['background']['value'] );
	}

	public function test_settings_with_classes_array() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'merge_settings_with_styles' );
		$method->setAccessible( true );
		
		$settings = [
			'title' => 'Test Title',
		];
		
		$applied_styles = [
			'computed_styles' => [
				'color' => '#ff0000',
			],
			'global_classes' => [ 'global-class-1' ],
		];
		
		$merged_settings = $method->invoke( $widget_creator, $settings, $applied_styles );
		
		// Test that settings include classes array
		$this->assertArrayHasKey( 'classes', $merged_settings );
		$this->assertEquals( 'classes', $merged_settings['classes']['$$type'] );
		$this->assertIsArray( $merged_settings['classes']['value'] );
		
		// Test that global classes are included
		$this->assertContains( 'global-class-1', $merged_settings['classes']['value'] );
		
		// Test that generated class ID is included
		$class_values = $merged_settings['classes']['value'];
		$has_generated_class = false;
		foreach ( $class_values as $class ) {
			if ( preg_match( '/^e-[a-f0-9]{8}-[a-f0-9]{7}$/', $class ) ) {
				$has_generated_class = true;
				break;
			}
		}
		$this->assertTrue( $has_generated_class, 'Settings should include generated class ID' );
	}

	public function test_v3_style_mappings_removed() {
		$hierarchy_processor = new Widget_Hierarchy_Processor();
		$reflection = new \ReflectionClass( $hierarchy_processor );
		
		// Test that v3 style mapping methods are removed
		$this->assertFalse( $reflection->hasMethod( 'apply_parent_styles' ), 'apply_parent_styles method should be removed' );
		$this->assertFalse( $reflection->hasMethod( 'apply_child_styles' ), 'apply_child_styles method should be removed' );
		$this->assertFalse( $reflection->hasMethod( 'map_css_justify_content' ), 'map_css_justify_content method should be removed' );
		$this->assertFalse( $reflection->hasMethod( 'map_css_align_items' ), 'map_css_align_items method should be removed' );
	}

	public function test_unified_property_mapper_integration() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		
		// Test that property mapper registry is integrated
		$this->assertTrue( $reflection->hasProperty( 'property_mapper_registry' ), 'Widget Creator should have property_mapper_registry property' );
		
		// Test convert_css_property_to_v4 method uses unified mappers
		$method = $reflection->getMethod( 'convert_css_property_to_v4' );
		$method->setAccessible( true );
		
		$result = $method->invoke( $widget_creator, 'color', '#ff0000' );
		
		$this->assertNotNull( $result, 'Unified mapper should convert color property' );
		$this->assertEquals( 'color', $result['property'] );
		$this->assertEquals( 'color', $result['value']['$$type'] );
		$this->assertEquals( '#ff0000', $result['value']['value'] );
	}

	public function test_complete_v4_widget_structure() {
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
						'text-align' => 'center',
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

		// Test complete v4 structure
		$this->assertArrayHasKey( 'widgets', $result );
		$this->assertNotEmpty( $result['widgets'] );

		$widget = $result['widgets'][0];

		// Test widget structure
		$this->assertEquals( 'widget', $widget['elType'] );
		$this->assertEquals( 'e-heading', $widget['widgetType'] );
		$this->assertArrayHasKey( 'settings', $widget );
		$this->assertArrayHasKey( 'styles', $widget );

		// Test settings have classes
		$this->assertArrayHasKey( 'classes', $widget['settings'] );
		$this->assertEquals( 'classes', $widget['settings']['classes']['$$type'] );

		// Test styles array is populated
		$this->assertNotEmpty( $widget['styles'] );
		$style_keys = array_keys( $widget['styles'] );
		$style_id = $style_keys[0];
		$style = $widget['styles'][ $style_id ];

		// Test style object structure
		$this->assertEquals( $style_id, $style['id'] );
		$this->assertEquals( 'local', $style['label'] );
		$this->assertEquals( 'class', $style['type'] );
		$this->assertArrayHasKey( 'variants', $style );

		$variant = $style['variants'][0];
		$this->assertEquals( 'desktop', $variant['meta']['breakpoint'] );
		$this->assertNull( $variant['meta']['state'] );
		$this->assertArrayHasKey( 'props', $variant );

		// Test CSS properties converted to v4 format
		$props = $variant['props'];
		if ( isset( $props['color'] ) ) {
			$this->assertEquals( 'color', $props['color']['$$type'] );
			$this->assertEquals( '#5f669c', $props['color']['value'] );
		}

		if ( isset( $props['font-weight'] ) ) {
			$this->assertEquals( 'string', $props['font-weight']['$$type'] );
			$this->assertEquals( '700', $props['font-weight']['value'] );
		}

		if ( isset( $props['text-align'] ) ) {
			$this->assertEquals( 'string', $props['text-align']['$$type'] );
			$this->assertEquals( 'center', $props['text-align']['value'] );
		}
	}

	public function test_background_color_maps_to_background() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'convert_css_property_to_v4' );
		$method->setAccessible( true );
		
		$result = $method->invoke( $widget_creator, 'background-color', '#0066cc' );
		
		// Test that background-color maps to background in v4
		$this->assertEquals( 'background', $result['property'] );
		$this->assertEquals( 'background', $result['value']['$$type'] );
		$this->assertArrayHasKey( 'color', $result['value']['value'] );
		$this->assertEquals( 'color', $result['value']['value']['color']['$$type'] );
		$this->assertEquals( '#0066cc', $result['value']['value']['color']['value'] );
	}

	public function test_unsupported_properties_ignored() {
		$widget_creator = new Widget_Creator();
		$reflection = new \ReflectionClass( $widget_creator );
		$method = $reflection->getMethod( 'convert_css_property_to_v4' );
		$method->setAccessible( true );
		
		$result = $method->invoke( $widget_creator, 'unsupported-property', 'some-value' );
		
		// Test that unsupported properties return null
		$this->assertNull( $result, 'Unsupported CSS properties should return null' );
	}
}
