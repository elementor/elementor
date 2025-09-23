<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgetsV2;

use PHPUnit\Framework\TestCase;

abstract class AtomicWidgetV2TestCase extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		
		// Ensure atomic widgets module is available
		if ( ! $this->is_atomic_widgets_available() ) {
			$this->markTestSkipped( 'Atomic Widgets Module not available' );
		}
	}

	protected function is_atomic_widgets_available(): bool {
		return class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Widget_Builder' ) &&
			   class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Element_Builder' );
	}

	protected function assertValidAtomicProp( array $atomic_prop, string $expected_type ): void {
		$this->assertIsArray( $atomic_prop );
		$this->assertArrayHasKey( '$$type', $atomic_prop );
		$this->assertEquals( $expected_type, $atomic_prop['$$type'] );
		$this->assertArrayHasKey( 'value', $atomic_prop );
	}

	protected function assertValidSizeProp( array $size_prop ): void {
		$this->assertValidAtomicProp( $size_prop, 'size' );
		$this->assertIsArray( $size_prop['value'] );
		$this->assertArrayHasKey( 'size', $size_prop['value'] );
		$this->assertArrayHasKey( 'unit', $size_prop['value'] );
		$this->assertIsNumeric( $size_prop['value']['size'] );
		$this->assertIsString( $size_prop['value']['unit'] );
	}

	protected function assertValidColorProp( array $color_prop ): void {
		$this->assertValidAtomicProp( $color_prop, 'color' );
		$this->assertIsString( $color_prop['value'] );
		$this->assertMatchesRegularExpression( '/^#[0-9a-fA-F]{6}$/', $color_prop['value'] );
	}

	protected function assertValidDimensionsProp( array $dimensions_prop ): void {
		$this->assertValidAtomicProp( $dimensions_prop, 'dimensions' );
		$this->assertIsArray( $dimensions_prop['value'] );
		
		$logical_properties = ['block-start', 'inline-end', 'block-end', 'inline-start'];
		foreach ( $logical_properties as $logical_prop ) {
			if ( isset( $dimensions_prop['value'][ $logical_prop ] ) ) {
				$this->assertValidSizeProp( $dimensions_prop['value'][ $logical_prop ] );
			}
		}
	}

	protected function assertValidWidgetStructure( array $widget, string $expected_widget_type ): void {
		$this->assertIsArray( $widget );
		$this->assertArrayHasKey( 'elType', $widget );
		$this->assertArrayHasKey( 'widgetType', $widget );
		$this->assertArrayHasKey( 'settings', $widget );
		$this->assertEquals( 'widget', $widget['elType'] );
		$this->assertEquals( $expected_widget_type, $widget['widgetType'] );
	}

	protected function assertValidElementStructure( array $element, string $expected_element_type ): void {
		$this->assertIsArray( $element );
		$this->assertArrayHasKey( 'elType', $element );
		$this->assertArrayHasKey( 'settings', $element );
		$this->assertArrayHasKey( 'elements', $element );
		$this->assertEquals( $expected_element_type, $element['elType'] );
		$this->assertIsArray( $element['elements'] );
	}

	protected function createTestSizeProp( float $size, string $unit ): array {
		return [
			'$$type' => 'size',
			'value' => [
				'size' => $size,
				'unit' => $unit,
			],
		];
	}

	protected function createTestColorProp( string $color ): array {
		return [
			'$$type' => 'color',
			'value' => $color,
		];
	}

	protected function createTestStringProp( string $value ): array {
		return [
			'$$type' => 'string',
			'value' => $value,
		];
	}

	protected function createTestDimensionsProp( array $dimensions ): array {
		$value = [];
		
		if ( isset( $dimensions['top'] ) ) {
			$value['block-start'] = $this->createTestSizeProp( $dimensions['top'], 'px' );
		}
		if ( isset( $dimensions['right'] ) ) {
			$value['inline-end'] = $this->createTestSizeProp( $dimensions['right'], 'px' );
		}
		if ( isset( $dimensions['bottom'] ) ) {
			$value['block-end'] = $this->createTestSizeProp( $dimensions['bottom'], 'px' );
		}
		if ( isset( $dimensions['left'] ) ) {
			$value['inline-start'] = $this->createTestSizeProp( $dimensions['left'], 'px' );
		}

		return [
			'$$type' => 'dimensions',
			'value' => $value,
		];
	}

	protected function getAtomicWidgetClass( string $widget_type ): ?string {
		$class_map = [
			'e-heading' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Heading\\Atomic_Heading',
			'e-paragraph' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Paragraph\\Atomic_Paragraph',
			'e-button' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Button\\Atomic_Button',
		];

		return $class_map[ $widget_type ] ?? null;
	}

	protected function getAtomicWidgetSchema( string $widget_class ): ?array {
		if ( ! class_exists( $widget_class ) ) {
			return null;
		}
		
		if ( ! method_exists( $widget_class, 'define_props_schema' ) ) {
			return null;
		}

		return $widget_class::define_props_schema();
	}
}
