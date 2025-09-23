<?php

namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

use PHPUnit\Framework\TestCase;

abstract class AtomicWidgetTestCase extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		
		if ( ! defined( 'ABSPATH' ) ) {
			define( 'ABSPATH', '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/' );
		}
	}

	protected function get_sample_html_element(): array {
		return [
			'tag' => 'div',
			'text' => 'Sample text content',
			'attributes' => [
				'class' => 'test-class',
				'id' => 'test-id',
				'style' => 'color: red; font-size: 16px;',
			],
			'classes' => [ 'test-class' ],
			'inline_styles' => [
				'color' => 'red',
				'font-size' => '16px',
			],
			'children' => [],
			'widget_type' => 'e-flexbox',
		];
	}

	protected function get_sample_heading_element(): array {
		return [
			'tag' => 'h1',
			'text' => 'Sample Heading',
			'attributes' => [
				'style' => 'font-size: 32px; color: #333;',
			],
			'classes' => [],
			'inline_styles' => [
				'font-size' => '32px',
				'color' => '#333',
			],
			'children' => [],
			'widget_type' => 'e-heading',
		];
	}

	protected function get_sample_paragraph_element(): array {
		return [
			'tag' => 'p',
			'text' => 'This is a sample paragraph with some text content.',
			'attributes' => [
				'style' => 'line-height: 1.6; color: #666;',
			],
			'classes' => [],
			'inline_styles' => [
				'line-height' => '1.6',
				'color' => '#666',
			],
			'children' => [],
			'widget_type' => 'e-paragraph',
		];
	}

	protected function get_sample_button_element(): array {
		return [
			'tag' => 'button',
			'text' => 'Click Me',
			'attributes' => [
				'type' => 'button',
				'style' => 'background: #007cba; color: white; padding: 10px 20px;',
			],
			'classes' => [],
			'inline_styles' => [
				'background' => '#007cba',
				'color' => 'white',
				'padding' => '10px 20px',
			],
			'children' => [],
			'widget_type' => 'e-button',
		];
	}

	protected function get_complex_html_structure(): array {
		return [
			[
				'tag' => 'div',
				'text' => '',
				'attributes' => [
					'class' => 'container',
					'style' => 'max-width: 800px; margin: 0 auto;',
				],
				'classes' => [ 'container' ],
				'inline_styles' => [
					'max-width' => '800px',
					'margin' => '0 auto',
				],
				'children' => [
					[
						'tag' => 'h1',
						'text' => 'Main Title',
						'attributes' => [
							'style' => 'font-size: 36px; color: #222;',
						],
						'classes' => [],
						'inline_styles' => [
							'font-size' => '36px',
							'color' => '#222',
						],
						'children' => [],
						'widget_type' => 'e-heading',
					],
					[
						'tag' => 'p',
						'text' => 'Description paragraph',
						'attributes' => [
							'style' => 'font-size: 18px; line-height: 1.5;',
						],
						'classes' => [],
						'inline_styles' => [
							'font-size' => '18px',
							'line-height' => '1.5',
						],
						'children' => [],
						'widget_type' => 'e-paragraph',
					],
				],
				'widget_type' => 'e-flexbox',
			],
		];
	}

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

	protected function assertValidConversionResult( array $result ): void {
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		$this->assertArrayHasKey( 'widgets', $result );
		$this->assertArrayHasKey( 'stats', $result );
		$this->assertArrayHasKey( 'error', $result );

		$this->assertIsBool( $result['success'] );
		$this->assertIsArray( $result['widgets'] );
		$this->assertIsArray( $result['stats'] );
	}

	protected function assertValidConversionStats( array $stats ): void {
		$this->assertIsArray( $stats );
		$this->assertArrayHasKey( 'total_elements_parsed', $stats );
		$this->assertArrayHasKey( 'total_widgets_created', $stats );
		$this->assertArrayHasKey( 'widget_types_created', $stats );
		$this->assertArrayHasKey( 'supported_elements', $stats );
		$this->assertArrayHasKey( 'unsupported_elements', $stats );

		$this->assertIsInt( $stats['total_elements_parsed'] );
		$this->assertIsInt( $stats['total_widgets_created'] );
		$this->assertIsArray( $stats['widget_types_created'] );
		$this->assertIsInt( $stats['supported_elements'] );
		$this->assertIsInt( $stats['unsupported_elements'] );
	}

	protected function assertValidAtomicProp( array $prop, string $expected_type ): void {
		$this->assertIsArray( $prop );
		$this->assertArrayHasKey( '$$type', $prop );
		$this->assertArrayHasKey( 'value', $prop );
		$this->assertEquals( $expected_type, $prop['$$type'] );
	}

	protected function assertValidSizeProp( array $prop ): void {
		$this->assertValidAtomicProp( $prop, 'size' );
		$this->assertIsArray( $prop['value'] );
		$this->assertArrayHasKey( 'size', $prop['value'] );
		$this->assertArrayHasKey( 'unit', $prop['value'] );
		$this->assertIsNumeric( $prop['value']['size'] );
		$this->assertIsString( $prop['value']['unit'] );
	}

	protected function assertValidColorProp( array $prop ): void {
		$this->assertValidAtomicProp( $prop, 'color' );
		$this->assertIsString( $prop['value'] );
	}

	protected function assertValidStringProp( array $prop ): void {
		$this->assertValidAtomicProp( $prop, 'string' );
		$this->assertIsString( $prop['value'] );
	}
}
