<?php

namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

require_once __DIR__ . '/AtomicWidgetTestCase.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-id-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-tag-to-widget-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-to-props-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-json-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/atomic-widget-factory.php';
require_once __DIR__ . '/../../../services/atomic-widgets/conversion-stats-calculator.php';

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Conversion_Stats_Calculator;

class ConversionStatsCalculatorTest extends AtomicWidgetTestCase {

	private Conversion_Stats_Calculator $calculator;

	protected function setUp(): void {
		parent::setUp();
		$this->calculator = new Conversion_Stats_Calculator();
	}

	public function test_calculate_stats_returns_valid_structure(): void {
		$parsed_elements = [ $this->get_sample_html_element() ];
		$processed_widgets = [ $this->get_sample_widget() ];

		$stats = $this->calculator->calculate_stats( $parsed_elements, $processed_widgets );

		$this->assertValidConversionStats( $stats );
	}

	public function test_calculate_stats_with_empty_arrays(): void {
		$stats = $this->calculator->calculate_stats( [], [] );

		$this->assertValidConversionStats( $stats );
		$this->assertEquals( 0, $stats['total_elements_parsed'] );
		$this->assertEquals( 0, $stats['total_widgets_created'] );
		$this->assertEquals( 0, $stats['supported_elements'] );
		$this->assertEquals( 0, $stats['unsupported_elements'] );
		$this->assertEmpty( $stats['widget_types_created'] );
	}

	public function test_calculate_stats_counts_elements_correctly(): void {
		$parsed_elements = [
			$this->get_sample_heading_element(),
			$this->get_sample_paragraph_element(),
			$this->get_sample_button_element(),
		];
		$processed_widgets = [
			$this->get_sample_widget( 'e-heading' ),
			$this->get_sample_widget( 'e-paragraph' ),
			$this->get_sample_widget( 'e-button' ),
		];

		$stats = $this->calculator->calculate_stats( $parsed_elements, $processed_widgets );

		$this->assertEquals( 3, $stats['total_elements_parsed'] );
		$this->assertEquals( 3, $stats['total_widgets_created'] );
		$this->assertEquals( 3, $stats['supported_elements'] );
		$this->assertEquals( 0, $stats['unsupported_elements'] );
	}

	public function test_calculate_stats_counts_nested_elements(): void {
		$nested_elements = [
			[
				'tag' => 'div',
				'text' => '',
				'attributes' => [],
				'classes' => [],
				'inline_styles' => [],
				'children' => [
					$this->get_sample_heading_element(),
					$this->get_sample_paragraph_element(),
				],
				'widget_type' => 'e-flexbox',
			],
		];

		$nested_widgets = [
			[
				'id' => 'container-id',
				'elType' => 'e-flexbox',
				'widgetType' => 'e-flexbox',
				'settings' => [],
				'isInner' => false,
				'elements' => [
					$this->get_sample_widget( 'e-heading' ),
					$this->get_sample_widget( 'e-paragraph' ),
				],
				'version' => '0.0',
			],
		];

		$stats = $this->calculator->calculate_stats( $nested_elements, $nested_widgets );

		$this->assertEquals( 3, $stats['total_elements_parsed'] );
		$this->assertEquals( 3, $stats['total_widgets_created'] );
		$this->assertEquals( 3, $stats['supported_elements'] );
		$this->assertEquals( 0, $stats['unsupported_elements'] );
	}

	public function test_calculate_stats_tracks_widget_types(): void {
		$parsed_elements = [
			$this->get_sample_heading_element(),
			$this->get_sample_paragraph_element(),
			$this->get_sample_heading_element(),
		];
		$processed_widgets = [
			$this->get_sample_widget( 'e-heading' ),
			$this->get_sample_widget( 'e-paragraph' ),
			$this->get_sample_widget( 'e-heading' ),
		];

		$stats = $this->calculator->calculate_stats( $parsed_elements, $processed_widgets );

		$widget_types = $stats['widget_types_created'];
		$this->assertArrayHasKey( 'e-heading', $widget_types );
		$this->assertArrayHasKey( 'e-paragraph', $widget_types );
		$this->assertEquals( 2, $widget_types['e-heading'] );
		$this->assertEquals( 1, $widget_types['e-paragraph'] );
	}

	public function test_calculate_stats_handles_unsupported_elements(): void {
		$parsed_elements = [
			$this->get_sample_heading_element(),
			[
				'tag' => 'unsupported',
				'text' => 'Unsupported content',
				'attributes' => [],
				'classes' => [],
				'inline_styles' => [],
				'children' => [],
				'widget_type' => 'unsupported-type',
			],
		];
		$processed_widgets = [
			$this->get_sample_widget( 'e-heading' ),
		];

		$stats = $this->calculator->calculate_stats( $parsed_elements, $processed_widgets );

		$this->assertEquals( 2, $stats['total_elements_parsed'] );
		$this->assertEquals( 1, $stats['total_widgets_created'] );
		$this->assertEquals( 1, $stats['supported_elements'] );
		$this->assertEquals( 1, $stats['unsupported_elements'] );
	}

	public function test_calculate_stats_handles_deeply_nested_structure(): void {
		$deeply_nested_elements = [
			[
				'tag' => 'div',
				'text' => '',
				'attributes' => [],
				'classes' => [],
				'inline_styles' => [],
				'children' => [
					[
						'tag' => 'div',
						'text' => '',
						'attributes' => [],
						'classes' => [],
						'inline_styles' => [],
						'children' => [
							$this->get_sample_heading_element(),
							$this->get_sample_paragraph_element(),
						],
						'widget_type' => 'e-flexbox',
					],
				],
				'widget_type' => 'e-flexbox',
			],
		];

		$deeply_nested_widgets = [
			[
				'id' => 'outer-container',
				'elType' => 'e-flexbox',
				'widgetType' => 'e-flexbox',
				'settings' => [],
				'isInner' => false,
				'elements' => [
					[
						'id' => 'inner-container',
						'elType' => 'e-flexbox',
						'widgetType' => 'e-flexbox',
						'settings' => [],
						'isInner' => false,
						'elements' => [
							$this->get_sample_widget( 'e-heading' ),
							$this->get_sample_widget( 'e-paragraph' ),
						],
						'version' => '0.0',
					],
				],
				'version' => '0.0',
			],
		];

		$stats = $this->calculator->calculate_stats( $deeply_nested_elements, $deeply_nested_widgets );

		$this->assertEquals( 4, $stats['total_elements_parsed'] );
		$this->assertEquals( 4, $stats['total_widgets_created'] );
		$this->assertEquals( 4, $stats['supported_elements'] );
		$this->assertEquals( 0, $stats['unsupported_elements'] );

		$widget_types = $stats['widget_types_created'];
		$this->assertEquals( 2, $widget_types['e-flexbox'] );
		$this->assertEquals( 1, $widget_types['e-heading'] );
		$this->assertEquals( 1, $widget_types['e-paragraph'] );
	}

	public function test_calculate_stats_handles_malformed_elements(): void {
		$malformed_elements = [
			[
				'tag' => 'div',
				'widget_type' => 'e-flexbox',
			],
			[
				'text' => 'Missing tag',
				'widget_type' => 'e-paragraph',
			],
		];

		$widgets = [
			$this->get_sample_widget( 'e-flexbox' ),
		];

		$stats = $this->calculator->calculate_stats( $malformed_elements, $widgets );

		$this->assertValidConversionStats( $stats );
		$this->assertEquals( 2, $stats['total_elements_parsed'] );
		$this->assertEquals( 1, $stats['total_widgets_created'] );
	}

	public function test_calculate_stats_handles_widgets_without_type(): void {
		$parsed_elements = [ $this->get_sample_html_element() ];
		$malformed_widgets = [
			[
				'id' => 'test-id',
				'elType' => 'widget',
				'settings' => [],
				'isInner' => false,
				'elements' => [],
				'version' => '0.0',
			],
		];

		$stats = $this->calculator->calculate_stats( $parsed_elements, $malformed_widgets );

		$this->assertValidConversionStats( $stats );
		$this->assertEquals( 1, $stats['total_widgets_created'] );
		$this->assertArrayHasKey( 'unknown', $stats['widget_types_created'] );
		$this->assertEquals( 1, $stats['widget_types_created']['unknown'] );
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
