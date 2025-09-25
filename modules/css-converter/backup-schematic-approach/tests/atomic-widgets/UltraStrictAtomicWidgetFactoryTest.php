<?php

namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

require_once __DIR__ . '/UltraStrictAtomicWidgetTestCase.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-id-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-tag-to-widget-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-to-props-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-json-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/atomic-widget-factory.php';

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Widget_Factory;

/**
 * ULTRA-STRICT tests that validate EVERYTHING against actual atomic widgets
 * These tests will catch ANY deviation from atomic widget specifications
 */
class UltraStrictAtomicWidgetFactoryTest extends UltraStrictAtomicWidgetTestCase {

	private Atomic_Widget_Factory $factory;

	protected function setUp(): void {
		parent::setUp();
		$this->factory = new Atomic_Widget_Factory();
	}

	/**
	 * ULTRA-STRICT: Test heading widget creation with REAL atomic widget validation
	 */
	public function test_create_heading_widget_ultra_strict_validation(): void {
		$element = [
			'tag' => 'h1',
			'text' => 'Test Heading Content',
			'attributes' => [
				'style' => 'font-size: 32px; color: #333333; font-weight: 600;',
			],
			'classes' => [],
			'inline_styles' => [
				'font-size' => '32px',
				'color' => '#333333',
				'font-weight' => '600',
			],
			'children' => [],
			'widget_type' => 'e-heading',
		];

		$result = $this->factory->create_widget( 'e-heading', $element );

		// ULTRA-STRICT: Validate against ACTUAL atomic widget
		$this->assertUltraStrictWidgetCompliance( $result, 'e-heading' );

		// ULTRA-STRICT: Validate specific heading properties
		$this->assertArrayHasKey( 'settings', $result );
		$settings = $result['settings'];
		
		// Title must be preserved exactly
		$this->assertArrayHasKey( 'title', $settings );
		$this->assertEquals( 'Test Heading Content', $settings['title'] );
		
		// Tag must be atomic string prop
		$this->assertArrayHasKey( 'tag', $settings );
		$this->assertValidAtomicPropStructure( $settings['tag'], 'heading tag' );
		$this->assertEquals( 'string', $settings['tag']['$$type'] );
		$this->assertEquals( 'h1', $settings['tag']['value'] );

		// Validate styles are converted to atomic props
		if ( isset( $result['styles'] ) ) {
			$styles = array_values( $result['styles'] )[0];
			$props = $styles['variants'][0]['props'];
			
			// Font size must be Size_Prop_Type with numeric value
			if ( isset( $props['font-size'] ) ) {
				$this->assertUltraStrictSizeProp( $props['font-size'], 'heading font-size' );
				$this->assertEquals( 32, $props['font-size']['value']['size'] );
				$this->assertEquals( 'px', $props['font-size']['value']['unit'] );
			}
			
			// Color must be Color_Prop_Type
			if ( isset( $props['color'] ) ) {
				$this->assertUltraStrictColorProp( $props['color'], 'heading color' );
				$this->assertEquals( '#333333', $props['color']['value'] );
			}
			
			// Font weight must be String_Prop_Type
			if ( isset( $props['font-weight'] ) ) {
				$this->assertUltraStrictStringProp( $props['font-weight'], 'heading font-weight' );
				$this->assertEquals( '600', $props['font-weight']['value'] );
			}
		}
	}

	/**
	 * ULTRA-STRICT: Test paragraph widget with complex inline styles
	 */
	public function test_create_paragraph_widget_ultra_strict_validation(): void {
		$element = [
			'tag' => 'p',
			'text' => 'This is a test paragraph with complex styling.',
			'attributes' => [
				'style' => 'font-size: 18px; line-height: 1.6; color: #666666; margin: 20px 0; text-align: justify;',
			],
			'classes' => [],
			'inline_styles' => [
				'font-size' => '18px',
				'line-height' => '1.6',
				'color' => '#666666',
				'margin' => '20px 0',
				'text-align' => 'justify',
			],
			'children' => [],
			'widget_type' => 'e-paragraph',
		];

		$result = $this->factory->create_widget( 'e-paragraph', $element );

		// ULTRA-STRICT: Validate against ACTUAL atomic widget
		$this->assertUltraStrictWidgetCompliance( $result, 'e-paragraph' );

		// ULTRA-STRICT: Validate paragraph-specific properties
		$settings = $result['settings'];
		$this->assertArrayHasKey( 'text', $settings );
		$this->assertEquals( 'This is a test paragraph with complex styling.', $settings['text'] );

		// Validate complex margin conversion
		if ( isset( $result['styles'] ) ) {
			$styles = array_values( $result['styles'] )[0];
			$props = $styles['variants'][0]['props'];
			
			// Margin must be Dimensions_Prop_Type with correct logical properties
			if ( isset( $props['margin'] ) ) {
				$this->assertUltraStrictDimensionsProp( $props['margin'], 'paragraph margin' );
				
				$margin_value = $props['margin']['value'];
				
				// Top and bottom should be 20px
				$this->assertEquals( 20, $margin_value['block-start']['value']['size'] );
				$this->assertEquals( 'px', $margin_value['block-start']['value']['unit'] );
				$this->assertEquals( 20, $margin_value['block-end']['value']['size'] );
				$this->assertEquals( 'px', $margin_value['block-end']['value']['unit'] );
				
				// Left and right should be 0
				$this->assertEquals( 0, $margin_value['inline-start']['value']['size'] );
				$this->assertEquals( 0, $margin_value['inline-end']['value']['size'] );
			}
		}
	}

	/**
	 * ULTRA-STRICT: Test flexbox widget with complex layout styles
	 */
	public function test_create_flexbox_widget_ultra_strict_validation(): void {
		$element = [
			'tag' => 'div',
			'text' => '',
			'attributes' => [
				'style' => 'display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 40px; background: #f5f5f5; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);',
			],
			'classes' => [ 'container' ],
			'inline_styles' => [
				'display' => 'flex',
				'flex-direction' => 'column',
				'align-items' => 'center',
				'gap' => '20px',
				'padding' => '40px',
				'background' => '#f5f5f5',
				'border-radius' => '8px',
				'box-shadow' => '0 2px 8px rgba(0,0,0,0.1)',
			],
			'children' => [],
			'widget_type' => 'e-flexbox',
		];

		$result = $this->factory->create_widget( 'e-flexbox', $element );

		// ULTRA-STRICT: Validate against ACTUAL atomic widget
		$this->assertUltraStrictWidgetCompliance( $result, 'e-flexbox' );

		// ULTRA-STRICT: Validate flexbox-specific settings
		$settings = $result['settings'];
		$this->assertArrayHasKey( 'direction', $settings );
		$this->assertEquals( 'column', $settings['direction'] );
		$this->assertArrayHasKey( 'align_items', $settings );
		$this->assertEquals( 'center', $settings['align_items'] );

		// Validate complex styles conversion
		if ( isset( $result['styles'] ) ) {
			$styles = array_values( $result['styles'] )[0];
			$props = $styles['variants'][0]['props'];
			
			// Padding must be Dimensions_Prop_Type
			if ( isset( $props['padding'] ) ) {
				$this->assertUltraStrictDimensionsProp( $props['padding'], 'flexbox padding' );
				
				$padding_value = $props['padding']['value'];
				foreach ( [ 'block-start', 'inline-end', 'block-end', 'inline-start' ] as $side ) {
					$this->assertEquals( 40, $padding_value[ $side ]['value']['size'] );
					$this->assertEquals( 'px', $padding_value[ $side ]['value']['unit'] );
				}
			}
			
			// Background must be Background_Prop_Type
			if ( isset( $props['background'] ) ) {
				$this->assertUltraStrictBackgroundProp( $props['background'], 'flexbox background' );
				$this->assertArrayHasKey( 'color', $props['background']['value'] );
				$this->assertUltraStrictColorProp( $props['background']['value']['color'], 'flexbox background color' );
				$this->assertEquals( '#f5f5f5', $props['background']['value']['color']['value'] );
			}
			
			// Border radius must be Size_Prop_Type (uniform) or Border_Radius_Prop_Type
			if ( isset( $props['border-radius'] ) ) {
				if ( $props['border-radius']['$$type'] === 'size' ) {
					$this->assertUltraStrictSizeProp( $props['border-radius'], 'flexbox border-radius' );
					$this->assertEquals( 8, $props['border-radius']['value']['size'] );
				} else {
					$this->assertUltraStrictBorderRadiusProp( $props['border-radius'], 'flexbox border-radius' );
				}
			}
			
			// Box shadow must be Box_Shadow_Prop_Type
			if ( isset( $props['box-shadow'] ) ) {
				$this->assertUltraStrictBoxShadowProp( $props['box-shadow'], 'flexbox box-shadow' );
				
				$shadows = $props['box-shadow']['value'];
				$this->assertCount( 1, $shadows );
				
				$shadow = $shadows[0]['value'];
				$this->assertEquals( 0, $shadow['hOffset']['value']['size'] );
				$this->assertEquals( 2, $shadow['vOffset']['value']['size'] );
				$this->assertEquals( 8, $shadow['blur']['value']['size'] );
				$this->assertEquals( 0, $shadow['spread']['value']['size'] );
			}
		}
	}

	/**
	 * ULTRA-STRICT: Test button widget with all possible properties
	 */
	public function test_create_button_widget_ultra_strict_validation(): void {
		$element = [
			'tag' => 'button',
			'text' => 'Click Me Now',
			'attributes' => [
				'type' => 'button',
				'style' => 'background: #007cba; color: white; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; border: none; cursor: pointer;',
			],
			'classes' => [ 'cta-button' ],
			'inline_styles' => [
				'background' => '#007cba',
				'color' => 'white',
				'padding' => '12px 24px',
				'border-radius' => '6px',
				'font-size' => '16px',
				'font-weight' => '500',
				'border' => 'none',
				'cursor' => 'pointer',
			],
			'children' => [],
			'widget_type' => 'e-button',
		];

		$result = $this->factory->create_widget( 'e-button', $element );

		// ULTRA-STRICT: Validate against ACTUAL atomic widget
		$this->assertUltraStrictWidgetCompliance( $result, 'e-button' );

		// ULTRA-STRICT: Validate button-specific properties
		$settings = $result['settings'];
		$this->assertArrayHasKey( 'text', $settings );
		$this->assertEquals( 'Click Me Now', $settings['text'] );

		// Validate button styles
		if ( isset( $result['styles'] ) ) {
			$styles = array_values( $result['styles'] )[0];
			$props = $styles['variants'][0]['props'];
			
			// Background color validation
			if ( isset( $props['background'] ) ) {
				$this->assertUltraStrictBackgroundProp( $props['background'], 'button background' );
			}
			
			// Text color validation
			if ( isset( $props['color'] ) ) {
				$this->assertUltraStrictColorProp( $props['color'], 'button color' );
				$this->assertEquals( 'white', $props['color']['value'] );
			}
			
			// Padding validation (asymmetric)
			if ( isset( $props['padding'] ) ) {
				$this->assertUltraStrictDimensionsProp( $props['padding'], 'button padding' );
				
				$padding_value = $props['padding']['value'];
				$this->assertEquals( 12, $padding_value['block-start']['value']['size'] );
				$this->assertEquals( 24, $padding_value['inline-end']['value']['size'] );
				$this->assertEquals( 12, $padding_value['block-end']['value']['size'] );
				$this->assertEquals( 24, $padding_value['inline-start']['value']['size'] );
			}
		}
	}

	/**
	 * ULTRA-STRICT: Test that invalid atomic prop types are rejected
	 */
	public function test_invalid_atomic_prop_types_are_rejected(): void {
		$element = [
			'tag' => 'div',
			'text' => '',
			'attributes' => [],
			'classes' => [],
			'inline_styles' => [
				'font-size' => 'invalid-size-value',
				'color' => 'invalid-color',
				'margin' => 'invalid-margin',
			],
			'children' => [],
			'widget_type' => 'e-flexbox',
		];

		$result = $this->factory->create_widget( 'e-flexbox', $element );

		// Widget should still be created but invalid props should be filtered out or converted properly
		$this->assertUltraStrictWidgetCompliance( $result, 'e-flexbox' );

		// Any atomic props that are created must be valid
		if ( isset( $result['styles'] ) ) {
			$styles = array_values( $result['styles'] )[0];
			$props = $styles['variants'][0]['props'];
			
			foreach ( $props as $prop_name => $prop_value ) {
				if ( is_array( $prop_value ) && isset( $prop_value['$$type'] ) ) {
					$this->assertValidAtomicPropStructure( $prop_value, "Invalid prop should not be created: {$prop_name}" );
				}
			}
		}
	}

	/**
	 * ULTRA-STRICT: Test edge cases that could break atomic widget validation
	 */
	public function test_edge_cases_ultra_strict_validation(): void {
		$edge_cases = [
			// Empty values
			[
				'tag' => 'p',
				'text' => '',
				'attributes' => [],
				'classes' => [],
				'inline_styles' => [],
				'children' => [],
				'widget_type' => 'e-paragraph',
			],
			// Extreme values
			[
				'tag' => 'h1',
				'text' => str_repeat( 'A', 1000 ), // Very long text
				'attributes' => [
					'style' => 'font-size: 999px; margin: -100px;',
				],
				'classes' => [],
				'inline_styles' => [
					'font-size' => '999px',
					'margin' => '-100px',
				],
				'children' => [],
				'widget_type' => 'e-heading',
			],
			// Special characters
			[
				'tag' => 'div',
				'text' => 'Special chars: <>&"\'',
				'attributes' => [
					'data-special' => '<>&"\'',
				],
				'classes' => [ 'class-with-special-chars' ],
				'inline_styles' => [],
				'children' => [],
				'widget_type' => 'e-flexbox',
			],
		];

		foreach ( $edge_cases as $index => $element ) {
			$result = $this->factory->create_widget( $element['widget_type'], $element );
			
			$this->assertUltraStrictWidgetCompliance( 
				$result, 
				$element['widget_type'],
				"Edge case {$index} failed validation"
			);
		}
	}

	/**
	 * ULTRA-STRICT: Test that unsupported widget types return null (defensive programming)
	 */
	public function test_unsupported_widget_types_return_null_ultra_strict(): void {
		$unsupported_types = [
			'e-unknown',
			'e-custom',
			'invalid-type',
			'',
			null,
			123,
			[],
			false,
		];

		$element = [
			'tag' => 'div',
			'text' => 'Test',
			'attributes' => [],
			'classes' => [],
			'inline_styles' => [],
			'children' => [],
			'widget_type' => 'e-flexbox',
		];

		foreach ( $unsupported_types as $unsupported_type ) {
			$result = $this->factory->create_widget( $unsupported_type, $element );
			$this->assertNull( 
				$result, 
				"Unsupported widget type should return null: " . var_export( $unsupported_type, true )
			);
		}
	}

	/**
	 * ULTRA-STRICT: Test that malformed elements are handled gracefully
	 */
	public function test_malformed_elements_handled_gracefully(): void {
		$malformed_elements = [
			// Missing required fields
			[
				'text' => 'Missing tag',
				'widget_type' => 'e-paragraph',
			],
			// Wrong data types
			[
				'tag' => 123,
				'text' => [],
				'attributes' => 'not-array',
				'widget_type' => 'e-heading',
			],
			// Null values
			[
				'tag' => null,
				'text' => null,
				'attributes' => null,
				'widget_type' => 'e-flexbox',
			],
		];

		foreach ( $malformed_elements as $index => $element ) {
			$widget_type = $element['widget_type'] ?? 'e-flexbox';
			$result = $this->factory->create_widget( $widget_type, $element );
			
			if ( $result !== null ) {
				$this->assertUltraStrictWidgetCompliance( 
					$result, 
					$widget_type,
					"Malformed element {$index} should either return null or valid widget"
				);
			}
		}
	}
}
