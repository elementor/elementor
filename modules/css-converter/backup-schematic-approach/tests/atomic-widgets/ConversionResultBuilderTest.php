<?php

namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

require_once __DIR__ . '/AtomicWidgetTestCase.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-id-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-tag-to-widget-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-to-props-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-json-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/atomic-widget-factory.php';
require_once __DIR__ . '/../../../services/atomic-widgets/conversion-stats-calculator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/conversion-result-builder.php';

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Conversion_Result_Builder;

class ConversionResultBuilderTest extends AtomicWidgetTestCase {

	private Conversion_Result_Builder $builder;

	protected function setUp(): void {
		parent::setUp();
		$this->builder = new Conversion_Result_Builder();
	}

	public function test_build_success_result_returns_valid_structure(): void {
		$widgets = [ $this->get_sample_widget() ];
		$parsed_elements = [ $this->get_sample_html_element() ];

		$result = $this->builder->build_success_result( $widgets, $parsed_elements );

		$this->assertValidConversionResult( $result );
		$this->assertTrue( $result['success'] );
		$this->assertNull( $result['error'] );
		$this->assertEquals( $widgets, $result['widgets'] );
		$this->assertValidConversionStats( $result['stats'] );
	}

	public function test_build_empty_result_returns_failure_structure(): void {
		$result = $this->builder->build_empty_result();

		$this->assertValidConversionResult( $result );
		$this->assertFalse( $result['success'] );
		$this->assertEquals( 'Empty HTML provided', $result['error'] );
		$this->assertEmpty( $result['widgets'] );
		$this->assertValidConversionStats( $result['stats'] );
		$this->assertEquals( 0, $result['stats']['total_elements_parsed'] );
	}

	public function test_build_parsing_failed_result_returns_failure_structure(): void {
		$result = $this->builder->build_parsing_failed_result();

		$this->assertValidConversionResult( $result );
		$this->assertFalse( $result['success'] );
		$this->assertEquals( 'HTML parsing failed', $result['error'] );
		$this->assertEmpty( $result['widgets'] );
		$this->assertValidConversionStats( $result['stats'] );
		$this->assertEquals( 0, $result['stats']['total_elements_parsed'] );
	}

	public function test_build_widget_creation_failed_result_returns_failure_structure(): void {
		$result = $this->builder->build_widget_creation_failed_result();

		$this->assertValidConversionResult( $result );
		$this->assertFalse( $result['success'] );
		$this->assertEquals( 'Widget creation failed', $result['error'] );
		$this->assertEmpty( $result['widgets'] );
		$this->assertValidConversionStats( $result['stats'] );
		$this->assertEquals( 0, $result['stats']['total_elements_parsed'] );
	}

	public function test_all_results_have_consistent_structure(): void {
		$widgets = [ $this->get_sample_widget() ];
		$parsed_elements = [ $this->get_sample_html_element() ];

		$success_result = $this->builder->build_success_result( $widgets, $parsed_elements );
		$empty_result = $this->builder->build_empty_result();
		$parsing_failed_result = $this->builder->build_parsing_failed_result();
		$creation_failed_result = $this->builder->build_widget_creation_failed_result();

		$results = [ $success_result, $empty_result, $parsing_failed_result, $creation_failed_result ];

		foreach ( $results as $result ) {
			$this->assertArrayHasKey( 'success', $result );
			$this->assertArrayHasKey( 'widgets', $result );
			$this->assertArrayHasKey( 'stats', $result );
			$this->assertArrayHasKey( 'error', $result );

			$this->assertIsBool( $result['success'] );
			$this->assertIsArray( $result['widgets'] );
			$this->assertIsArray( $result['stats'] );
		}
	}

	public function test_success_result_includes_calculated_stats(): void {
		$widgets = [
			$this->get_sample_widget( 'e-heading' ),
			$this->get_sample_widget( 'e-paragraph' ),
		];
		$parsed_elements = [
			$this->get_sample_heading_element(),
			$this->get_sample_paragraph_element(),
		];

		$result = $this->builder->build_success_result( $widgets, $parsed_elements );

		$this->assertTrue( $result['success'] );
		$this->assertValidConversionStats( $result['stats'] );
		
		$stats = $result['stats'];
		$this->assertGreaterThan( 0, $stats['total_elements_parsed'] );
		$this->assertGreaterThan( 0, $stats['total_widgets_created'] );
		$this->assertNotEmpty( $stats['widget_types_created'] );
	}

	public function test_failure_results_have_empty_stats(): void {
		$empty_result = $this->builder->build_empty_result();
		$parsing_failed_result = $this->builder->build_parsing_failed_result();
		$creation_failed_result = $this->builder->build_widget_creation_failed_result();

		$failure_results = [ $empty_result, $parsing_failed_result, $creation_failed_result ];

		foreach ( $failure_results as $result ) {
			$this->assertFalse( $result['success'] );
			$this->assertEmpty( $result['widgets'] );
			
			$stats = $result['stats'];
			$this->assertEquals( 0, $stats['total_elements_parsed'] );
			$this->assertEquals( 0, $stats['total_widgets_created'] );
			$this->assertEquals( 0, $stats['supported_elements'] );
			$this->assertEquals( 0, $stats['unsupported_elements'] );
			$this->assertEmpty( $stats['widget_types_created'] );
		}
	}

	public function test_success_result_with_empty_widgets_array(): void {
		$widgets = [];
		$parsed_elements = [];

		$result = $this->builder->build_success_result( $widgets, $parsed_elements );

		$this->assertTrue( $result['success'] );
		$this->assertNull( $result['error'] );
		$this->assertEmpty( $result['widgets'] );
		$this->assertValidConversionStats( $result['stats'] );
	}

	public function test_success_result_with_complex_widget_hierarchy(): void {
		$child_widget = $this->get_sample_widget( 'e-heading' );
		$parent_widget = $this->get_sample_widget( 'e-flexbox' );
		$parent_widget['elements'] = [ $child_widget ];

		$widgets = [ $parent_widget ];
		$parsed_elements = $this->get_complex_html_structure();

		$result = $this->builder->build_success_result( $widgets, $parsed_elements );

		$this->assertTrue( $result['success'] );
		$this->assertNull( $result['error'] );
		$this->assertEquals( $widgets, $result['widgets'] );
		$this->assertValidConversionStats( $result['stats'] );
		
		$stats = $result['stats'];
		$this->assertGreaterThan( 1, $stats['total_widgets_created'] );
	}

	private function get_sample_widget( string $widget_type = 'e-flexbox' ): array {
		return [
			'id' => 'test-widget-id',
			'elType' => $widget_type === 'e-flexbox' ? 'e-flexbox' : 'widget',
			'widgetType' => $widget_type,
			'settings' => [
				'classes' => [
					'$$type' => 'classes',
					'value' => [],
				],
			],
			'isInner' => false,
			'elements' => [],
			'version' => '0.0',
		];
	}
}
