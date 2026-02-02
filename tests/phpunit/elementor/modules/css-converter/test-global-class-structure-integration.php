<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Widget\Widget_Creator;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Processor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group global-classes
 * @group integration-tests
 */
class Test_Global_Class_Structure_Integration extends Elementor_Test_Base {

	private $widget_creator;
	private $css_processor;

	public function setUp(): void {
		parent::setUp();
		$this->widget_creator = new Widget_Creator();
		$this->css_processor = new Css_Processor();
	}

	public function test_global_class_structure_has_correct_variant_format() {
		$class_data = [
			'selector' => '.hero-section',
			'name' => 'hero-section',
			'properties' => [
				[
					'property' => 'background',
					'value' => '#1a1a2e',
					'converted_property' => [
						'property' => 'background',
						'value' => [
							'$$type' => 'background',
							'value' => [
								'color' => [
									'$$type' => 'color',
									'value' => '#1a1a2e',
								],
							],
						],
					],
				],
				[
					'property' => 'padding',
					'value' => '60px 30px',
					'converted_property' => [
						'property' => 'padding',
						'value' => [
							'$$type' => 'dimensions',
							'value' => [
								'block-start' => ['$$type' => 'size', 'value' => ['size' => 60, 'unit' => 'px']],
								'inline-end' => ['$$type' => 'size', 'value' => ['size' => 30, 'unit' => 'px']],
								'block-end' => ['$$type' => 'size', 'value' => ['size' => 60, 'unit' => 'px']],
								'inline-start' => ['$$type' => 'size', 'value' => ['size' => 30, 'unit' => 'px']],
							],
						],
					],
				],
			],
		];

		$result = $this->widget_creator->create_single_global_class( $class_data );

		// Verify the overall structure
		$this->assertArrayHasKey( 'id', $result );
		$this->assertArrayHasKey( 'label', $result );
		$this->assertArrayHasKey( 'type', $result );
		$this->assertArrayHasKey( 'variants', $result );

		$this->assertEquals( 'hero-section', $result['id'] );
		$this->assertEquals( 'hero-section', $result['label'] );
		$this->assertEquals( 'class', $result['type'] );

		// Verify variant structure
		$this->assertIsArray( $result['variants'] );
		$this->assertCount( 1, $result['variants'] );

		$variant = $result['variants'][0];
		$this->assertArrayHasKey( 'meta', $variant );
		$this->assertArrayHasKey( 'props', $variant );
		$this->assertArrayHasKey( 'custom_css', $variant );

		// Verify meta structure
		$this->assertEquals( 'desktop', $variant['meta']['breakpoint'] );
		$this->assertNull( $variant['meta']['state'] );

		// Verify props structure - should be direct property mappings
		$this->assertArrayHasKey( 'background', $variant['props'] );
		$this->assertArrayHasKey( 'padding', $variant['props'] );

		// Verify background property
		$background = $variant['props']['background'];
		$this->assertEquals( 'background', $background['$$type'] );
		$this->assertArrayHasKey( 'color', $background['value'] );
		$this->assertEquals( 'color', $background['value']['color']['$$type'] );
		$this->assertEquals( '#1a1a2e', $background['value']['color']['value'] );

		// Verify padding property
		$padding = $variant['props']['padding'];
		$this->assertEquals( 'dimensions', $padding['$$type'] );
		$this->assertArrayHasKey( 'block-start', $padding['value'] );
		$this->assertEquals( 60, $padding['value']['block-start']['value']['size'] );
		$this->assertEquals( 'px', $padding['value']['block-start']['value']['unit'] );
	}

	public function test_css_processor_creates_correct_global_class_structure() {
		$css_classes = [
			[
				'selector' => '.cta-button',
				'name' => 'cta-button',
				'properties' => [
					[
						'property' => 'border-radius',
						'value' => '8px',
						'converted_property' => [
							'property' => 'border-radius',
							'value' => [
								'$$type' => 'size',
								'value' => [
									'size' => 8,
									'unit' => 'px',
								],
							],
						],
					],
					[
						'property' => 'background',
						'value' => '#0f3460',
						'converted_property' => [
							'property' => 'background',
							'value' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => '#0f3460',
									],
								],
							],
						],
					],
				],
			],
		];

		$result = $this->css_processor->create_global_classes( $css_classes );

		$this->assertArrayHasKey( 'items', $result );
		$this->assertArrayHasKey( 'order', $result );

		$items = $result['items'];
		$this->assertArrayHasKey( 'cta-button', $items );

		$cta_button = $items['cta-button'];
		$variant = $cta_button['variants'][0];

		// Verify both properties are correctly mapped in props
		$this->assertArrayHasKey( 'border-radius', $variant['props'] );
		$this->assertArrayHasKey( 'background', $variant['props'] );

		// Verify border-radius structure
		$border_radius = $variant['props']['border-radius'];
		$this->assertEquals( 'size', $border_radius['$$type'] );
		$this->assertEquals( 8, $border_radius['value']['size'] );
		$this->assertEquals( 'px', $border_radius['value']['unit'] );

		// Verify background structure
		$background = $variant['props']['background'];
		$this->assertEquals( 'background', $background['$$type'] );
		$this->assertEquals( '#0f3460', $background['value']['color']['value'] );
	}

	public function test_flexbox_properties_in_global_classes() {
		$class_data = [
			'selector' => '.flex-container',
			'name' => 'flex-container',
			'properties' => [
				[
					'property' => 'display',
					'value' => 'flex',
					'converted_property' => [
						'property' => 'display',
						'value' => [
							'$$type' => 'string',
							'value' => 'flex',
						],
					],
				],
				[
					'property' => 'flex-direction',
					'value' => 'column',
					'converted_property' => [
						'property' => 'flex-direction',
						'value' => [
							'$$type' => 'string',
							'value' => 'column',
						],
					],
				],
				[
					'property' => 'align-items',
					'value' => 'center',
					'converted_property' => [
						'property' => 'align-items',
						'value' => [
							'$$type' => 'string',
							'value' => 'center',
						],
					],
				],
				[
					'property' => 'gap',
					'value' => '20px',
					'converted_property' => [
						'property' => 'gap',
						'value' => [
							'$$type' => 'size',
							'value' => [
								'size' => 20,
								'unit' => 'px',
							],
						],
					],
				],
			],
		];

		$result = $this->widget_creator->create_single_global_class( $class_data );
		$variant = $result['variants'][0];
		$props = $variant['props'];

		// Verify all flexbox properties are present
		$this->assertArrayHasKey( 'display', $props );
		$this->assertArrayHasKey( 'flex-direction', $props );
		$this->assertArrayHasKey( 'align-items', $props );
		$this->assertArrayHasKey( 'gap', $props );

		// Verify display property
		$this->assertEquals( 'string', $props['display']['$$type'] );
		$this->assertEquals( 'flex', $props['display']['value'] );

		// Verify flex-direction property
		$this->assertEquals( 'string', $props['flex-direction']['$$type'] );
		$this->assertEquals( 'column', $props['flex-direction']['value'] );

		// Verify align-items property
		$this->assertEquals( 'string', $props['align-items']['$$type'] );
		$this->assertEquals( 'center', $props['align-items']['value'] );

		// Verify gap property
		$this->assertEquals( 'size', $props['gap']['$$type'] );
		$this->assertEquals( 20, $props['gap']['value']['size'] );
		$this->assertEquals( 'px', $props['gap']['value']['unit'] );
	}

	public function test_border_radius_individual_corners_structure() {
		$class_data = [
			'selector' => '.rounded-card',
			'name' => 'rounded-card',
			'properties' => [
				[
					'property' => 'border-radius',
					'value' => '0 8px 8px 8px',
					'converted_property' => [
						'property' => 'border-radius',
						'value' => [
							'$$type' => 'border-radius',
							'value' => [
								'start-start' => ['$$type' => 'size', 'value' => ['size' => 0, 'unit' => 'px']],
								'start-end' => ['$$type' => 'size', 'value' => ['size' => 8, 'unit' => 'px']],
								'end-start' => ['$$type' => 'size', 'value' => ['size' => 8, 'unit' => 'px']],
								'end-end' => ['$$type' => 'size', 'value' => ['size' => 8, 'unit' => 'px']],
							],
						],
					],
				],
			],
		];

		$result = $this->widget_creator->create_single_global_class( $class_data );
		$variant = $result['variants'][0];
		$border_radius = $variant['props']['border-radius'];

		// Verify border-radius type for individual corners
		$this->assertEquals( 'border-radius', $border_radius['$$type'] );
		$this->assertArrayHasKey( 'start-start', $border_radius['value'] );
		$this->assertArrayHasKey( 'start-end', $border_radius['value'] );
		$this->assertArrayHasKey( 'end-start', $border_radius['value'] );
		$this->assertArrayHasKey( 'end-end', $border_radius['value'] );

		// Verify individual corner values
		$this->assertEquals( 0, $border_radius['value']['start-start']['value']['size'] );
		$this->assertEquals( 8, $border_radius['value']['start-end']['value']['size'] );
		$this->assertEquals( 8, $border_radius['value']['end-start']['value']['size'] );
		$this->assertEquals( 8, $border_radius['value']['end-end']['value']['size'] );
	}

	public function test_malformed_structure_does_not_occur() {
		$class_data = [
			'selector' => '.test-class',
			'name' => 'test-class',
			'properties' => [
				[
					'property' => 'color',
					'value' => '#ff0000',
					'converted_property' => [
						'property' => 'color',
						'value' => [
							'$$type' => 'color',
							'value' => '#ff0000',
						],
					],
				],
			],
		];

		$result = $this->widget_creator->create_single_global_class( $class_data );
		$variant = $result['variants'][0];

		// Ensure we never have the malformed structure like:
		// "props": {"property": "color", "value": {...}}
		// Instead we should have:
		// "props": {"color": {"$$type": "color", "value": "#ff0000"}}

		$this->assertArrayNotHasKey( 'property', $variant['props'] );
		$this->assertArrayHasKey( 'color', $variant['props'] );
		$this->assertEquals( 'color', $variant['props']['color']['$$type'] );
		$this->assertEquals( '#ff0000', $variant['props']['color']['value'] );
	}
}
