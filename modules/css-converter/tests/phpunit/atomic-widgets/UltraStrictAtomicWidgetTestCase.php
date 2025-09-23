<?php

namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

use PHPUnit\Framework\TestCase;

/**
 * Ultra-strict test base class that validates EVERYTHING against actual atomic widgets
 */
abstract class UltraStrictAtomicWidgetTestCase extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		
		if ( ! defined( 'ABSPATH' ) ) {
			define( 'ABSPATH', '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/' );
		}
	}

	/**
	 * ULTRA-STRICT: Validate widget against ACTUAL atomic widget class
	 */
	protected function assertUltraStrictWidgetCompliance( array $widget, string $expected_widget_type ): void {
		// 1. Basic structure validation
		$this->assertValidWidgetStructure( $widget );
		
		// 2. Widget type validation
		$this->assertEquals( $expected_widget_type, $widget['widgetType'] );
		
		// 3. Get ACTUAL atomic widget class
		$atomic_class = $this->getAtomicWidgetClass( $expected_widget_type );
		$this->assertNotNull( $atomic_class, "Atomic widget class not found for: {$expected_widget_type}" );
		
		// 4. Validate against REAL atomic widget schema
		$this->assertWidgetMatchesAtomicSchema( $widget, $atomic_class );
		
		// 5. Validate all props against REAL prop types
		$this->assertAllPropsMatchAtomicPropTypes( $widget, $atomic_class );
		
		// 6. Validate styles against atomic widget expectations
		if ( isset( $widget['styles'] ) ) {
			$this->assertStylesMatchAtomicWidgetExpectations( $widget['styles'], $atomic_class );
		}
	}

	/**
	 * ULTRA-STRICT: Validate widget settings against actual atomic widget prop schema
	 */
	private function assertWidgetMatchesAtomicSchema( array $widget, string $atomic_class ): void {
		if ( ! class_exists( $atomic_class ) ) {
			$this->fail( "Atomic widget class does not exist: {$atomic_class}" );
		}
		
		if ( ! method_exists( $atomic_class, 'define_props_schema' ) ) {
			$this->fail( "Atomic widget class missing define_props_schema: {$atomic_class}" );
		}
		
		$schema = $atomic_class::define_props_schema();
		$this->assertIsArray( $schema, "Schema must be array for: {$atomic_class}" );
		$this->assertNotEmpty( $schema, "Schema cannot be empty for: {$atomic_class}" );
		
		$settings = $widget['settings'] ?? [];
		
		// Validate each schema property
		foreach ( $schema as $prop_name => $prop_type ) {
			if ( ! is_object( $prop_type ) ) {
				continue;
			}
			
			// Check if prop type has validate method
			if ( ! method_exists( $prop_type, 'validate' ) ) {
				$this->fail( "Prop type missing validate method: {$prop_name}" );
			}
			
			// Get the value from settings
			$value = $settings[ $prop_name ] ?? $prop_type->get_default();
			
			// ULTRA-STRICT: Validate using ACTUAL prop type
			$is_valid = $prop_type->validate( $value );
			$this->assertTrue( 
				$is_valid, 
				"Property '{$prop_name}' failed atomic widget validation. Value: " . json_encode( $value )
			);
		}
	}

	/**
	 * ULTRA-STRICT: Validate ALL props use correct atomic prop types
	 */
	private function assertAllPropsMatchAtomicPropTypes( array $widget, string $atomic_class ): void {
		$settings = $widget['settings'] ?? [];
		$schema = $atomic_class::define_props_schema();
		
		foreach ( $settings as $prop_name => $prop_value ) {
			// Skip non-atomic props
			if ( in_array( $prop_name, [ 'attributes', '_cssid' ], true ) ) {
				continue;
			}
			
			// Must have corresponding schema entry
			$this->assertArrayHasKey( 
				$prop_name, 
				$schema, 
				"Property '{$prop_name}' not found in atomic widget schema for {$atomic_class}"
			);
			
			// Validate prop structure if it's atomic format
			if ( is_array( $prop_value ) && isset( $prop_value['$$type'] ) ) {
				$this->assertValidAtomicPropStructure( $prop_value, $prop_name );
			}
		}
	}

	/**
	 * ULTRA-STRICT: Validate atomic prop structure is EXACTLY correct
	 */
	protected function assertValidAtomicPropStructure( array $prop, string $context = '' ): void {
		$this->assertIsArray( $prop, "Atomic prop must be array: {$context}" );
		$this->assertArrayHasKey( '$$type', $prop, "Missing $$type in atomic prop: {$context}" );
		$this->assertArrayHasKey( 'value', $prop, "Missing value in atomic prop: {$context}" );
		$this->assertIsString( $prop['$$type'], "$$type must be string: {$context}" );
		$this->assertNotEmpty( $prop['$$type'], "$$type cannot be empty: {$context}" );
		
		// Validate specific prop types
		switch ( $prop['$$type'] ) {
			case 'size':
				$this->assertUltraStrictSizeProp( $prop, $context );
				break;
			case 'color':
				$this->assertUltraStrictColorProp( $prop, $context );
				break;
			case 'dimensions':
				$this->assertUltraStrictDimensionsProp( $prop, $context );
				break;
			case 'string':
				$this->assertUltraStrictStringProp( $prop, $context );
				break;
			case 'background':
				$this->assertUltraStrictBackgroundProp( $prop, $context );
				break;
			case 'box-shadow':
				$this->assertUltraStrictBoxShadowProp( $prop, $context );
				break;
			case 'border-radius':
				$this->assertUltraStrictBorderRadiusProp( $prop, $context );
				break;
			default:
				$this->fail( "Unknown atomic prop type: {$prop['$$type']} in {$context}" );
		}
	}

	/**
	 * ULTRA-STRICT: Size prop validation (numeric size, valid unit)
	 */
	protected function assertUltraStrictSizeProp( array $prop, string $context ): void {
		$this->assertEquals( 'size', $prop['$$type'], "Size prop $$type mismatch: {$context}" );
		$this->assertIsArray( $prop['value'], "Size prop value must be array: {$context}" );
		
		$value = $prop['value'];
		$this->assertArrayHasKey( 'size', $value, "Size prop missing size field: {$context}" );
		$this->assertArrayHasKey( 'unit', $value, "Size prop missing unit field: {$context}" );
		
		// CRITICAL: Size must be numeric, not string
		$this->assertIsNumeric( $value['size'], "Size must be numeric, got: " . gettype( $value['size'] ) . " in {$context}" );
		$this->assertIsString( $value['unit'], "Unit must be string: {$context}" );
		
		// Validate allowed units
		$valid_units = [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'auto', 'custom' ];
		$this->assertContains( $value['unit'], $valid_units, "Invalid unit '{$value['unit']}' in {$context}" );
		
		// Special validation for auto/custom
		if ( $value['unit'] === 'auto' ) {
			$this->assertEmpty( $value['size'], "Auto unit must have empty size: {$context}" );
		} elseif ( $value['unit'] !== 'custom' ) {
			$this->assertGreaterThanOrEqual( 0, $value['size'], "Size cannot be negative: {$context}" );
		}
	}

	/**
	 * ULTRA-STRICT: Color prop validation (valid hex/color format)
	 */
	protected function assertUltraStrictColorProp( array $prop, string $context ): void {
		$this->assertEquals( 'color', $prop['$$type'], "Color prop $$type mismatch: {$context}" );
		$this->assertIsString( $prop['value'], "Color prop value must be string: {$context}" );
		
		$color = $prop['value'];
		$this->assertNotEmpty( $color, "Color cannot be empty: {$context}" );
		
		// Validate color format (hex, rgb, rgba, named colors)
		$valid_color = preg_match( '/^#[0-9a-f]{3,6}$/i', $color ) ||
					   preg_match( '/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i', $color ) ||
					   preg_match( '/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i', $color ) ||
					   in_array( strtolower( $color ), [ 'red', 'blue', 'green', 'white', 'black', 'transparent' ], true );
		
		$this->assertTrue( $valid_color, "Invalid color format '{$color}' in {$context}" );
	}

	/**
	 * ULTRA-STRICT: Dimensions prop validation (logical properties with Size_Prop_Type)
	 */
	protected function assertUltraStrictDimensionsProp( array $prop, string $context ): void {
		$this->assertEquals( 'dimensions', $prop['$$type'], "Dimensions prop $$type mismatch: {$context}" );
		$this->assertIsArray( $prop['value'], "Dimensions prop value must be array: {$context}" );
		
		$value = $prop['value'];
		$logical_properties = [ 'block-start', 'inline-end', 'block-end', 'inline-start' ];
		
		foreach ( $logical_properties as $logical_prop ) {
			if ( isset( $value[ $logical_prop ] ) ) {
				$this->assertIsArray( $value[ $logical_prop ], "Dimension {$logical_prop} must be array: {$context}" );
				$this->assertArrayHasKey( '$$type', $value[ $logical_prop ], "Dimension {$logical_prop} missing $$type: {$context}" );
				$this->assertEquals( 'size', $value[ $logical_prop ]['$$type'], "Dimension {$logical_prop} must be Size_Prop_Type: {$context}" );
				
				// Recursively validate the size prop
				$this->assertUltraStrictSizeProp( $value[ $logical_prop ], "{$context} -> {$logical_prop}" );
			}
		}
	}

	/**
	 * ULTRA-STRICT: String prop validation
	 */
	protected function assertUltraStrictStringProp( array $prop, string $context ): void {
		$this->assertEquals( 'string', $prop['$$type'], "String prop $$type mismatch: {$context}" );
		$this->assertIsString( $prop['value'], "String prop value must be string: {$context}" );
	}

	/**
	 * ULTRA-STRICT: Background prop validation (complex nested structure)
	 */
	protected function assertUltraStrictBackgroundProp( array $prop, string $context ): void {
		$this->assertEquals( 'background', $prop['$$type'], "Background prop $$type mismatch: {$context}" );
		$this->assertIsArray( $prop['value'], "Background prop value must be array: {$context}" );
		
		$value = $prop['value'];
		
		// Must have at least one background property
		$valid_keys = [ 'color', 'image', 'background-overlay', 'clip' ];
		$has_valid_key = false;
		
		foreach ( $valid_keys as $key ) {
			if ( isset( $value[ $key ] ) ) {
				$has_valid_key = true;
				break;
			}
		}
		
		$this->assertTrue( $has_valid_key, "Background must have at least one valid property: {$context}" );
		
		// Validate color if present
		if ( isset( $value['color'] ) ) {
			$this->assertUltraStrictColorProp( $value['color'], "{$context} -> color" );
		}
		
		// Validate background-overlay if present
		if ( isset( $value['background-overlay'] ) ) {
			$this->assertUltraStrictBackgroundOverlayProp( $value['background-overlay'], "{$context} -> background-overlay" );
		}
	}

	/**
	 * ULTRA-STRICT: Background overlay prop validation
	 */
	protected function assertUltraStrictBackgroundOverlayProp( array $prop, string $context ): void {
		$this->assertIsArray( $prop, "Background overlay must be array: {$context}" );
		$this->assertArrayHasKey( '$$type', $prop, "Background overlay missing $$type: {$context}" );
		$this->assertEquals( 'background-overlay', $prop['$$type'], "Background overlay $$type mismatch: {$context}" );
		$this->assertArrayHasKey( 'value', $prop, "Background overlay missing value: {$context}" );
		$this->assertIsArray( $prop['value'], "Background overlay value must be array: {$context}" );
		$this->assertNotEmpty( $prop['value'], "Background overlay cannot be empty: {$context}" );
		
		// Validate each overlay item
		foreach ( $prop['value'] as $index => $overlay_item ) {
			$this->assertIsArray( $overlay_item, "Overlay item {$index} must be array: {$context}" );
			$this->assertArrayHasKey( '$$type', $overlay_item, "Overlay item {$index} missing $$type: {$context}" );
			$this->assertArrayHasKey( 'value', $overlay_item, "Overlay item {$index} missing value: {$context}" );
			
			$valid_overlay_types = [ 'background-gradient-overlay', 'background-image-overlay' ];
			$this->assertContains( 
				$overlay_item['$$type'], 
				$valid_overlay_types, 
				"Invalid overlay type '{$overlay_item['$$type']}' in {$context}"
			);
		}
	}

	/**
	 * ULTRA-STRICT: Box shadow prop validation
	 */
	protected function assertUltraStrictBoxShadowProp( array $prop, string $context ): void {
		$this->assertEquals( 'box-shadow', $prop['$$type'], "Box shadow prop $$type mismatch: {$context}" );
		$this->assertIsArray( $prop['value'], "Box shadow prop value must be array: {$context}" );
		
		$shadows = $prop['value'];
		$this->assertNotEmpty( $shadows, "Box shadow cannot be empty: {$context}" );
		
		foreach ( $shadows as $index => $shadow ) {
			$this->assertIsArray( $shadow, "Shadow {$index} must be array: {$context}" );
			$this->assertArrayHasKey( '$$type', $shadow, "Shadow {$index} missing $$type: {$context}" );
			$this->assertEquals( 'shadow', $shadow['$$type'], "Shadow {$index} must be Shadow_Prop_Type: {$context}" );
			
			$shadow_value = $shadow['value'];
			$required_fields = [ 'hOffset', 'vOffset', 'blur', 'spread', 'color', 'position' ];
			
			foreach ( $required_fields as $field ) {
				$this->assertArrayHasKey( $field, $shadow_value, "Shadow {$index} missing {$field}: {$context}" );
				
				if ( in_array( $field, [ 'hOffset', 'vOffset', 'blur', 'spread' ], true ) ) {
					$this->assertUltraStrictSizeProp( $shadow_value[ $field ], "{$context} -> shadow {$index} -> {$field}" );
				} elseif ( $field === 'color' ) {
					$this->assertUltraStrictColorProp( $shadow_value[ $field ], "{$context} -> shadow {$index} -> {$field}" );
				} elseif ( $field === 'position' ) {
					$position = $shadow_value[ $field ];
					$this->assertTrue( 
						$position === null || ( is_array( $position ) && $position['value'] === 'inset' ),
						"Invalid shadow position in {$context}"
					);
				}
			}
		}
	}

	/**
	 * ULTRA-STRICT: Border radius prop validation
	 */
	protected function assertUltraStrictBorderRadiusProp( array $prop, string $context ): void {
		$this->assertEquals( 'border-radius', $prop['$$type'], "Border radius prop $$type mismatch: {$context}" );
		$this->assertIsArray( $prop['value'], "Border radius prop value must be array: {$context}" );
		
		$value = $prop['value'];
		$logical_corners = [ 'start-start', 'start-end', 'end-start', 'end-end' ];
		
		foreach ( $logical_corners as $corner ) {
			$this->assertArrayHasKey( $corner, $value, "Border radius missing corner {$corner}: {$context}" );
			$this->assertUltraStrictSizeProp( $value[ $corner ], "{$context} -> {$corner}" );
		}
	}

	/**
	 * ULTRA-STRICT: Validate styles match atomic widget expectations
	 */
	private function assertStylesMatchAtomicWidgetExpectations( array $styles, string $atomic_class ): void {
		foreach ( $styles as $class_id => $style_definition ) {
			$this->assertIsArray( $style_definition, "Style definition must be array for: {$class_id}" );
			$this->assertArrayHasKey( 'variants', $style_definition, "Style missing variants: {$class_id}" );
			$this->assertIsArray( $style_definition['variants'], "Variants must be array: {$class_id}" );
			
			foreach ( $style_definition['variants'] as $variant_index => $variant ) {
				$this->assertArrayHasKey( 'props', $variant, "Variant {$variant_index} missing props: {$class_id}" );
				$this->assertIsArray( $variant['props'], "Variant props must be array: {$class_id}" );
				
				// Validate each prop in the variant
				foreach ( $variant['props'] as $prop_name => $prop_value ) {
					if ( is_array( $prop_value ) && isset( $prop_value['$$type'] ) ) {
						$this->assertValidAtomicPropStructure( $prop_value, "{$class_id} -> {$prop_name}" );
					}
				}
			}
		}
	}

	/**
	 * Get atomic widget class name from widget type
	 */
	private function getAtomicWidgetClass( string $widget_type ): ?string {
		$class_map = [
			'e-heading' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Heading\\Atomic_Heading',
			'e-paragraph' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Paragraph\\Atomic_Paragraph',
			'e-button' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Button\\Atomic_Button',
			'e-image' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Image\\Atomic_Image',
			'e-flexbox' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Flexbox\\Flexbox',
		];
		
		return $class_map[ $widget_type ] ?? null;
	}

	/**
	 * Basic widget structure validation (from original test case)
	 */
	protected function assertValidWidgetStructure( array $widget ): void {
		$this->assertIsArray( $widget );
		$this->assertArrayHasKey( 'id', $widget );
		$this->assertArrayHasKey( 'elType', $widget );
		$this->assertArrayHasKey( 'widgetType', $widget );
		$this->assertArrayHasKey( 'settings', $widget );
		$this->assertArrayHasKey( 'isInner', $widget );
		$this->assertArrayHasKey( 'elements', $widget );
		$this->assertArrayHasKey( 'version', $widget );

		$this->assertIsString( $widget['id'] );
		$this->assertIsString( $widget['elType'] );
		$this->assertIsString( $widget['widgetType'] );
		$this->assertIsArray( $widget['settings'] );
		$this->assertIsBool( $widget['isInner'] );
		$this->assertIsArray( $widget['elements'] );
		$this->assertIsString( $widget['version'] );
	}
}
