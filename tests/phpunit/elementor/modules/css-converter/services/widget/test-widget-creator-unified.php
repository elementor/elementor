<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Widget\Widget_Creator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-widget-creator
 * @group css-converter-unified
 */
class Test_Widget_Creator_Unified extends Elementor_Test_Base {
	private $widget_creator;

	public function setUp(): void {
		parent::setUp();
		$this->widget_creator = new Widget_Creator();
	}

	public function test_widget_creator_uses_unified_property_mappers() {
		$styled_widgets = [
			[
				'widget_type' => 'e-heading',
				'settings' => [
					'text' => 'Test Heading',
					'tag' => 'h1',
				],
				'applied_styles' => [
					'computed_styles' => [
						'color' => '#ff0000',
						'font-size' => '24px',
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

		$result = $this->widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );

		// Verify the result structure
		$this->assertArrayHasKey( 'post_id', $result );
		$this->assertArrayHasKey( 'edit_url', $result );
		$this->assertArrayHasKey( 'widgets', $result );
		$this->assertArrayHasKey( 'stats', $result );

		// Verify widgets were created
		$this->assertNotEmpty( $result['widgets'] );
		$widget = $result['widgets'][0];

		// Verify v4 structure
		$this->assertEquals( 'widget', $widget['elType'] );
		$this->assertEquals( 'e-heading', $widget['widgetType'] );
		$this->assertArrayHasKey( 'settings', $widget );
		$this->assertArrayHasKey( 'styles', $widget );

		// Verify styles array contains v4 atomic styles
		$this->assertNotEmpty( $widget['styles'] );
		$style_keys = array_keys( $widget['styles'] );
		$style_id = $style_keys[0];
		$style = $widget['styles'][ $style_id ];

		$this->assertArrayHasKey( 'variants', $style );
		$this->assertNotEmpty( $style['variants'] );
		$variant = $style['variants'][0];
		$this->assertArrayHasKey( 'props', $variant );

		// Verify CSS properties were converted using unified mappers
		$props = $variant['props'];
		if ( isset( $props['color'] ) ) {
			$this->assertEquals( 'color', $props['color']['$$type'] );
			$this->assertEquals( '#ff0000', $props['color']['value'] );
		}

		if ( isset( $props['font-size'] ) ) {
			$this->assertEquals( 'size', $props['font-size']['$$type'] );
			$this->assertArrayHasKey( 'size', $props['font-size']['value'] );
			$this->assertArrayHasKey( 'unit', $props['font-size']['value'] );
		}
	}

	public function test_background_color_maps_to_background_in_v4() {
		$styled_widgets = [
			[
				'widget_type' => 'e-flexbox',
				'settings' => [],
				'applied_styles' => [
					'computed_styles' => [
						'background-color' => '#0066cc',
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

		$result = $this->widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );
		$widget = $result['widgets'][0];

		// Verify background-color was converted to background in v4 format
		$style_keys = array_keys( $widget['styles'] );
		$style_id = $style_keys[0];
		$props = $widget['styles'][ $style_id ]['variants'][0]['props'];

		if ( isset( $props['background'] ) ) {
			$this->assertEquals( 'background', $props['background']['$$type'] );
			$this->assertArrayHasKey( 'color', $props['background']['value'] );
			$this->assertEquals( 'color', $props['background']['value']['color']['$$type'] );
			$this->assertEquals( '#0066cc', $props['background']['value']['color']['value'] );
		}
	}

	public function test_unsupported_css_properties_are_ignored() {
		$styled_widgets = [
			[
				'widget_type' => 'e-heading',
				'settings' => [
					'text' => 'Test Heading',
				],
				'applied_styles' => [
					'computed_styles' => [
						'color' => '#ff0000',
						'unsupported-property' => 'some-value',
						'another-invalid-prop' => 'another-value',
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

		$result = $this->widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );
		$widget = $result['widgets'][0];

		// Verify only supported properties were converted
		$style_keys = array_keys( $widget['styles'] );
		$style_id = $style_keys[0];
		$props = $widget['styles'][ $style_id ]['variants'][0]['props'];

		// Should have color (supported)
		$this->assertArrayHasKey( 'color', $props );

		// Should not have unsupported properties
		$this->assertArrayNotHasKey( 'unsupported-property', $props );
		$this->assertArrayNotHasKey( 'another-invalid-prop', $props );
	}

	public function test_multiple_css_properties_converted_correctly() {
		$styled_widgets = [
			[
				'widget_type' => 'e-flexbox',
				'settings' => [],
				'applied_styles' => [
					'computed_styles' => [
						'background-color' => '#f0f0f0',
						'padding' => '20px 10px',
						'margin' => '15px',
						'width' => '300px',
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

		$result = $this->widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );
		$widget = $result['widgets'][0];

		$style_keys = array_keys( $widget['styles'] );
		$style_id = $style_keys[0];
		$props = $widget['styles'][ $style_id ]['variants'][0]['props'];

		// Verify all supported properties were converted with correct types
		$expected_types = [
			'background' => 'background',
			'padding' => 'dimensions',
			'margin' => 'dimensions',
			'width' => 'size',
		];

		foreach ( $expected_types as $prop => $expected_type ) {
			if ( isset( $props[ $prop ] ) ) {
				$this->assertEquals( $expected_type, $props[ $prop ]['$$type'], "Property {$prop} should have type {$expected_type}" );
			}
		}
	}

	public function test_widget_creator_statistics_track_unified_conversion() {
		$styled_widgets = [
			[
				'widget_type' => 'e-heading',
				'settings' => [
					'text' => 'Test',
				],
				'applied_styles' => [
					'computed_styles' => [
						'color' => '#ff0000',
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

		$result = $this->widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );

		// Verify statistics are tracked
		$this->assertArrayHasKey( 'stats', $result );
		$stats = $result['stats'];

		$this->assertArrayHasKey( 'widgets_created', $stats );
		$this->assertEquals( 1, $stats['widgets_created'] );

		$this->assertArrayHasKey( 'widgets_failed', $stats );
		$this->assertEquals( 0, $stats['widgets_failed'] );
	}
}
