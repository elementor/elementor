<?php

namespace Elementor\Testing\Modules\GlobalClasses\ImportExport;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExport\Export_Runner;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Export_Runner extends Elementor_Test_Base {

	public function test_export() {
		// Arrange.
		$items = [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'Test',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => '<script>alert(1)</script>',
							],
							'padding' => [
								'$$type' => 'size',
								'value' => [
									'size' => 10,
									'unit' => 'px',
								],
							],
						],
					],
				],
			],
			'g-456' => [
				'id' => 'g-456',
				'type' => 'class',
				'label' => 'test-2',
				'variants' => [],
			],
		];

		$order = [ 'g-123', 'g-456', 123, null, 'g-123' ];

		Global_Classes_Repository::make()->put( $items, $order );

		// Act.
		$result = ( new Export_Runner() )->export( [] );

		// Assert.
		$sanitized_items = [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'Test',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => '',
							],
							'padding' => [
								'$$type' => 'size',
								'value' => [
									'size' => 10,
									'unit' => 'px',
								],
							],
						],
						'custom_css' => null,
					],
				],
			],
			'g-456' => [
				'id' => 'g-456',
				'type' => 'class',
				'label' => 'test-2',
				'variants' => [],
			],
		];

		$sanitized_order = [ 'g-123', 'g-456' ];

		$this->assertSame( [
			'files' => [
				'path' => 'global-classes',
				'data' => [
					'items' => $sanitized_items,
					'order' => $sanitized_order,
				],
			],
		], $result );
	}

	public function test_export__invalid_style() {
		// Arrange.
		$items = [
			'g-123' => [
				'id' => 'g-123',
			],
		];

		$order = [ 'g-123' ];

		Global_Classes_Repository::make()->put( $items, $order );

		// Act.
		$result = ( new Export_Runner() )->export( [] );

		// Assert.
		$this->assertSame( [
			'manifest' => [],
			'files' => [],
		], $result );
	}
}
